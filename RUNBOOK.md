# Event Scout — Runbook

Deploy + operate. Same clasp flow as MoM Workflow. Do these in order.
Live state lives at the bottom — update it as you go.

## 0. Prereqs
- `clasp` installed (`which clasp` → ok) and logged in: `clasp login`
  (run `! clasp login` in this terminal if not).
- Decide the runtime account. For a personal radar, your own Google account is
  fine. To mirror the MoM prod-bot pattern, use the dedicated bot account.

## 1. Create the spreadsheet + bound script
```
cd ~/event-scout
clasp create --type sheets --title "Event Scout" --rootDir ./src
```
This makes a new Google Sheet + bound Apps Script and writes `src/.clasp.json`.
Note the Sheet URL it prints (or `clasp open --addon`).

## 2. Push the code
```
clasp push
```
Confirm `Code.gs` + `appsscript.json` uploaded. Reload the Sheet → an
**Event Scout** menu appears (from `onOpen`). If not, reload once more.

## 3. Build the Registry tab
- Rename `Sheet1` → `Registry`.
- Import `seed/registry-seed.csv`: **File → Import → Upload → Replace current sheet**
  (keep header row; comma-separated).
- Verify column order matches `registry-schema.md` (A `id` … R `calendar_event_id`).
- The `ChangeLog` tab is created automatically on first check.

## 4. First watch + judge
1. **Event Scout → Check sources now.** First run just records baseline hashes
   (everything stays `NEW`; no `CHANGED` yet — that's expected).
2. Run the **Judge pass** (`judge/JUDGE_PROMPT.md`) over the `NEW` rows to seed
   tier/date/verdict. *(The deep-research run output drops straight into this —
   paste its verified rows in rather than re-researching from scratch.)*
3. Set the keepers to `status = CONFIRMED` with a real `confirmed_date`.

## 5. Calendar target
- Default: writes to the script owner's default calendar.
- To target NDS's calendar: set `CALENDAR_ID` in `Code.gs` to his calendar ID
  and have him share **"Make changes to events"** with the runtime account.
  Then `clasp push` again.
- **Event Scout → Sync confirmed → Calendar.** Check the events landed with the
  verdict in the description.

## 6. Schedule it
- **Event Scout → Install scheduled triggers** → monthly (1st @06:00 IST) +
  weekly (Mon @06:00 IST) source checks. Authorize scopes when prompted.
- Calendar sync stays **manual** on purpose — it runs after a human/Claude judge
  pass, so nothing unjudged ever hits the calendar.

## 7. Steady state (monthly)
1. Trigger fires → `CHANGED` rows + ChangeLog entries.
2. Run Judge pass → updates tier/date/verdict, flips status.
3. Sync → Calendar.
4. Read Claude's diff; action "decisions needed now".

---
# The local UI + 3-day refresh (active path — no Google needed)

This is the path in use now (Google Calendar parked). The calendar UI is a self-contained
file; a local launchd job runs Claude every 3 days to discover/verify events and rewrite the
UI's data.

```
keywords.md ─▶ run.sh (headless Claude) ─▶ web search + fetch ─▶ label tier/date-confidence
                                                                      │
                                              ui/events.js  ◀─────────┘  (UI reads this)
```

## Open the calendar
- Double-click `ui/index.html` (works offline, file://), or serve it:
  `cd ~/event-scout/ui && python3 -m http.server 8765` → http://localhost:8765/

## First refresh by hand (do this BEFORE scheduling)
Run it once interactively so you can authorize the tools and eyeball the output:
```
~/event-scout/pipeline/run.sh
```
Then reload the UI — the "Updated" stamp and any new/changed events should appear.
Tune discovery by editing `pipeline/keywords.md`.

## Schedule the 3-day refresh (launchd)
```
cp ~/event-scout/pipeline/com.eventscout.refresh.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.eventscout.refresh.plist     # start it
launchctl list | grep eventscout                                       # confirm loaded
```
- Runs every 3 days (`StartInterval` 259200s). If the Mac was asleep at the mark, it fires
  once on wake (the catch-up guard).
- Logs: `pipeline/refresh.log` (Claude's run) + `pipeline/launchd.{out,err}.log`.
- Pause / remove:
  `launchctl unload ~/Library/LaunchAgents/com.eventscout.refresh.plist`
- Force a run now: `launchctl start com.eventscout.refresh`

> Note: each scheduled run spends tokens and makes web requests unattended. Run it by hand
> first; only `launchctl load` when you're happy with what it does.

## What it can and can't source
- ✅ Open web + official event sites + **publicly-indexed** LinkedIn/X posts (via web search).
- ❌ Not logged-in LinkedIn/X feeds (blocked by their ToS / require paid API) — not scraped.

---
## Live state
- [x] 2026-06-22 — repo scaffolded; deep-research seeded 11 verified events.
- [x] 2026-06-22 — self-contained UI built (`ui/index.html`), data split to `ui/events.js`.
- [x] 2026-06-22 — 3-day refresh pipeline written (`pipeline/`): keywords, prompt, run.sh, launchd plist.
- [ ] First manual `pipeline/run.sh` — pending (do before scheduling).
- [ ] `launchctl load` the refresh agent — pending (after a clean manual run).
- [ ] Google Calendar sync — parked (Apps Script path above is intact for when you want it).

## Open decisions
- Whether/when to re-enable the Google Calendar sync alongside the UI.
