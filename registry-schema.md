# Registry tab — column schema

One row per event source. The `Registry` tab in the Event Scout spreadsheet.
Columns must stay in this order (the Apps Script `COLS` map is 0-based on this).

| # | Column | Who writes it | Notes |
|---|--------|---------------|-------|
| A | `id` | you (once) | stable slug, e.g. `milken-global`, `tiecon` |
| B | `name` | you / Claude | display name |
| C | `category` | you | `realestate` \| `ai` \| `tech` \| `capital` \| `diaspora` \| `gated` |
| D | `official_url` | you | event homepage |
| E | `date_page_url` | you | the page that states the next edition's date (watcher diffs THIS; falls back to `official_url` if blank) |
| F | `tier` | Claude judge | `1` \| `2` \| `3` — empty until judged |
| G | `status` | watcher / Claude | `NEW` → `CHANGED` (watcher) → `CONFIRMED` / `SKIP` / `WATCH` (Claude) |
| H | `confirmed_date` | Claude judge | start date; must be a real date for calendar sync |
| I | `end_date` | Claude judge | optional; blank = single day |
| J | `city` | Claude judge | e.g. `Las Vegas, NV` |
| K | `cost` | Claude judge | ticket + all-in note |
| L | `access` | Claude judge | `Ticketed` \| `Gated: <path in>` |
| M | `verdict` | Claude judge | one blunt go/skip sentence |
| N | `notes` | Claude judge | who's in the room / format / deadline |
| O | `last_snapshot_hash` | watcher | SHA-256 of page text; do not edit |
| P | `last_checked` | watcher | timestamp; do not edit |
| Q | `last_changed` | watcher | timestamp of last detected diff |
| R | `calendar_event_id` | sync | set on first calendar write; do not edit |

## Status lifecycle
```
NEW ──watcher first sees it──┐
                             ▼
        ┌────────────► CHANGED ◄──watcher detects a page diff──┐
        │                  │                                    │
   (Claude judge reads CHANGED rows + the live page)            │
        │                  │                                    │
        ▼                  ▼                                    │
   CONFIRMED          SKIP / WATCH ───────────────(stays watched)
   (tier 1/2 +        (doesn't sync to calendar)
    real date →
    calendar sync)
```
Only `CONFIRMED` + tier `1`/`2` + a parseable `confirmed_date` reaches the calendar.
