# Event Scout

A standing **Chief-of-Staff event radar** for NDS: it watches the ~30 source sites
for the events that matter (real estate/proptech, AI, high-growth tech, capital/
family offices, India–US diaspora), flags when a next-edition date or venue
changes, lets Claude apply the worth-it bar, and auto-syncs the keepers to Google
Calendar. Window: **Nov 2026 → Nov 2027**.

## Why it's built this way (the honest version)
- **No webhooks.** Conference sites don't emit change events. We poll + diff.
- **No event APIs for the tier that matters.** Eventbrite/Luma/10times feeds only
  carry the commodity tier. Allen & Co Sun Valley, Milken's invite tier, and
  family-office dinners will *never* be in any feed — so an aggregator catches the
  events NDS should skip and misses the ones he wants. We curate sources instead.
- **The hard part is judgment, not aggregation.** Tiering and "who's in the room"
  is the LLM's job; a scraper can't do it. So Claude stays in the loop.

## Architecture (hybrid: cheap watch + smart judge)
```
 ┌─────────────────────────────────────────────────────────────┐
 │ Google Sheet "Event Scout"                                   │
 │   Registry tab  ──  one row per source (schema below)        │
 │   ChangeLog tab ──  append-only diff history                 │
 └─────────────────────────────────────────────────────────────┘
        ▲                         │                      ▲
        │ writes hash/status      │ reads CHANGED rows   │ writes tier/date/verdict
        │                         ▼                      │
 ┌──────────────┐        ┌──────────────────┐    ┌──────────────┐
 │ WATCHER      │        │ JUDGE            │    │ (same Sheet) │
 │ Apps Script  │        │ Claude reads the │    │              │
 │ time trigger │        │ live pages, sets │    │              │
 │ fetch+diff   │        │ tier/verdict     │    │              │
 │ (free, dumb) │        │ (judgment.io)    │    │              │
 └──────────────┘        └──────────────────┘    └──────────────┘
        │                                                 │
        │                CONFIRMED + tier 1/2 + real date │
        ▼                                                 ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ SYNC (Apps Script) → Google Calendar (verdict in the notes)  │
 └─────────────────────────────────────────────────────────────┘
```

| Part | Runs on | Cost | Does |
|------|---------|------|------|
| Watcher | Apps Script time trigger (monthly + weekly) | free | fetch each source's date page, SHA-256 the text, flag `CHANGED` |
| Judge | Claude (terminal or Desktop), on flagged rows only | tokens, only on change | apply the bar, set tier/date/verdict, confidence-tag |
| Sync | Apps Script menu / trigger | free | push `CONFIRMED` tier-1/2 events to Calendar, idempotent |

## Files
- `src/Code.gs` — watcher + calendar sync + menu + triggers
- `src/appsscript.json` — manifest (scopes, timezone)
- `registry-schema.md` — the Registry tab columns + status lifecycle
- `seed/registry-seed.csv` — ~30 curated sources to import on first run
- `judge/JUDGE_PROMPT.md` — the reusable Claude judgment prompt
- `RUNBOOK.md` — deploy + operate, step by step

## Operate it
1. Watcher runs on schedule (or **Event Scout → Check sources now**).
2. When it reports `CHANGED` rows, run the **Judge pass** (`judge/JUDGE_PROMPT.md`).
3. Run **Event Scout → Sync confirmed → Calendar**.
4. Read the plain-language diff Claude gives you; action the "decisions needed now".
