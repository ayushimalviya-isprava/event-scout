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
## Live state
- [ ] 2026-06-22 — repo scaffolded locally (code, schema, seed, judge prompt). NOT yet pushed.
- [ ] `clasp create` — pending
- [ ] seed CSV imported — pending
- [ ] first watch baseline — pending
- [ ] first judge pass (seed from deep-research output) — pending (research run finishing)
- [ ] calendar target decided + sync tested — pending
- [ ] triggers installed — pending

## Open decisions
- Runtime account: personal vs MoM-style bot account.
- Calendar: NDS's calendar (needs share) vs a dedicated "NDS — Events" calendar he subscribes to.
