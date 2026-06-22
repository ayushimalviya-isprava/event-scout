/**
 * Event Scout — watcher + calendar sync (Apps Script, hybrid build)
 * --------------------------------------------------------------------------
 * Role in the system: the CHEAP, DURABLE half of the hybrid.
 *   - checkSources()   : fetch each source's date page, diff vs last snapshot,
 *                        flag rows that changed. NO judgment here.
 *   - syncToCalendar() : push CONFIRMED tier-1/2 rows into Google Calendar.
 * The expensive JUDGMENT half (tiering, "who's in the room", worth-it bar,
 * extracting the confirmed date/venue/cost) is done by Claude reading the
 * CHANGED rows — see ../judge/JUDGE_PROMPT.md. This script never guesses.
 *
 * Sheet tabs expected: "Registry", "ChangeLog" (auto-created if missing).
 * Registry columns are defined in ../registry-schema.md and COLS below.
 */

const TZ = 'Asia/Kolkata';
const REGISTRY = 'Registry';
const CHANGELOG = 'ChangeLog';

// 0-based column indexes for the Registry tab (keep in sync with registry-schema.md)
const COLS = {
  id: 0, name: 1, category: 2, official_url: 3, date_page_url: 4,
  tier: 5, status: 6, confirmed_date: 7, end_date: 8, city: 9,
  cost: 10, access: 11, verdict: 12, notes: 13,
  last_snapshot_hash: 14, last_checked: 15, last_changed: 16, calendar_event_id: 17
};

// Which calendar to write to. '' = the script owner's default calendar.
// To target NDS's calendar instead, put its calendar ID here (and share edit access).
const CALENDAR_ID = '';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Event Scout')
    .addItem('1. Check sources now', 'checkSources')
    .addItem('2. Sync confirmed → Calendar', 'syncToCalendar')
    .addSeparator()
    .addItem('Install scheduled triggers', 'setupTriggers')
    .addItem('Remove scheduled triggers', 'removeTriggers')
    .addToUi();
}

/** Fetch each source's date page, hash the text, flag changes. Cheap + dumb on purpose. */
function checkSources() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(REGISTRY);
  if (!sheet) throw new Error('No "' + REGISTRY + '" tab found.');
  const log = getOrCreateChangeLog(ss);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  let changed = 0, checked = 0, errors = 0;

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const url = (row[COLS.date_page_url] || row[COLS.official_url] || '').toString().trim();
    if (!url) continue;
    checked++;
    try {
      const res = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        validateHttpsCertificates: true,
        headers: { 'User-Agent': 'EventScout/1.0 (+founder-os; date-watch)' }
      });
      if (res.getResponseCode() >= 400) { errors++; continue; }
      const hash = hashText(stripHtml(res.getContentText()));
      const prev = (row[COLS.last_snapshot_hash] || '').toString();
      sheet.getRange(r + 1, COLS.last_checked + 1).setValue(now);
      if (prev && prev !== hash) {
        sheet.getRange(r + 1, COLS.status + 1).setValue('CHANGED');
        sheet.getRange(r + 1, COLS.last_changed + 1).setValue(now);
        log.appendRow([now, row[COLS.id], row[COLS.name], url, 'content changed — needs Claude judge pass']);
        changed++;
      }
      sheet.getRange(r + 1, COLS.last_snapshot_hash + 1).setValue(hash);
    } catch (e) {
      errors++;
      log.appendRow([now, row[COLS.id], row[COLS.name], url, 'fetch error: ' + e.message]);
    }
    Utilities.sleep(400); // be polite to source sites
  }
  notify_('Check complete', checked + ' checked · ' + changed + ' changed · ' + errors + ' errors. Run the Claude judge pass on CHANGED rows.');
}

/** Push CONFIRMED tier-1/2 events with a parseable date into Calendar. Idempotent via calendar_event_id. */
function syncToCalendar() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(REGISTRY);
  const cal = CALENDAR_ID ? CalendarApp.getCalendarById(CALENDAR_ID) : CalendarApp.getDefaultCalendar();
  if (!cal) throw new Error('Calendar not found / not shared with this account: ' + CALENDAR_ID);
  const data = sheet.getDataRange().getValues();
  let created = 0, updated = 0, skipped = 0;

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const status = (row[COLS.status] || '').toString().toUpperCase();
    const tier = (row[COLS.tier] || '').toString().replace(/\D/g, '');
    if (status !== 'CONFIRMED' || (tier !== '1' && tier !== '2')) { skipped++; continue; }
    const start = parseDate_(row[COLS.confirmed_date]);
    if (!start) { skipped++; continue; }
    let end = parseDate_(row[COLS.end_date]) || start;
    // CalendarApp all-day end is exclusive — bump one day so the last day shows.
    const endExclusive = new Date(end.getTime()); endExclusive.setDate(endExclusive.getDate() + 1);

    const title = '[T' + tier + '] ' + row[COLS.name] + (row[COLS.city] ? ' — ' + row[COLS.city] : '');
    const desc = [
      'Verdict: ' + (row[COLS.verdict] || ''),
      'Access: ' + (row[COLS.access] || ''),
      'Cost: ' + (row[COLS.cost] || ''),
      'Notes: ' + (row[COLS.notes] || ''),
      'Source: ' + (row[COLS.official_url] || ''),
      '— synced by Event Scout'
    ].join('\n');

    const existingId = (row[COLS.calendar_event_id] || '').toString();
    try {
      if (existingId) {
        const ev = cal.getEventById(existingId);
        if (ev) {
          ev.setTitle(title);
          ev.setAllDayDates(start, endExclusive);
          ev.setDescription(desc);
          if (row[COLS.city]) ev.setLocation(row[COLS.city].toString());
          updated++;
          continue;
        }
      }
      const ev = cal.createAllDayEvent(title, start, endExclusive, { description: desc, location: (row[COLS.city] || '').toString() });
      sheet.getRange(r + 1, COLS.calendar_event_id + 1).setValue(ev.getId());
      created++;
    } catch (e) {
      // leave the row; surface in the toast
    }
  }
  notify_('Calendar sync complete', created + ' created · ' + updated + ' updated · ' + skipped + ' skipped (not CONFIRMED tier-1/2 or no date).');
}

/** Monthly deep check + weekly near-term check. */
function setupTriggers() {
  removeTriggers();
  ScriptApp.newTrigger('checkSources').timeBased().onMonthDay(1).atHour(6).inTimezone(TZ).create();
  ScriptApp.newTrigger('checkSources').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(6).inTimezone(TZ).create();
  notify_('Triggers installed', 'Monthly (1st @06:00) + weekly (Mon @06:00) source checks. Calendar sync stays manual — run it after the Claude judge pass.');
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkSources') ScriptApp.deleteTrigger(t);
  });
}

// ---------- helpers ----------
function getOrCreateChangeLog(ss) {
  let log = ss.getSheetByName(CHANGELOG);
  if (!log) {
    log = ss.insertSheet(CHANGELOG);
    log.appendRow(['timestamp', 'id', 'name', 'url', 'note']);
    log.setFrozenRows(1);
  }
  return log;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashText(s) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function parseDate_(v) {
  if (!v) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') return v;
  const d = new Date(v.toString());
  return isNaN(d.getTime()) ? null : d;
}

function notify_(title, msg) {
  try { SpreadsheetApp.getActive().toast(msg, title, 8); } catch (e) { Logger.log(title + ': ' + msg); }
}
