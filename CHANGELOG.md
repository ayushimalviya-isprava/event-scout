# Event Scout — Changelog

## Refresh — 2026-06-22 (3-day pipeline: date re-verification + 2 new events)
Window: Nov 2026 → Nov 2027. Ran the 5-cluster discovery+verify sweep against official sites.
Set grows 54 → **56**; verified (Confirmed/Likely from a primary source) 20 → **28**.

**New events added (2):**
- **Founders Forum North America** (`founders-forum-na-2026`) — **Confirmed Nov 4–5 2026, NYC**.
  Application-gated, curated founders + partner-level investors. rating 3.5. Near-term, actionable.
- **IMN AI in Real Estate Forum** (`imn-ai-in-real-estate-2027`) — Predicted ~June 2027, NYC.
  On the RE×AI bullseye theme; added as a tier-3 monitor pending seniority check. rating 3.0.

**Confidence upgrades (Unconfirmed/Predicted → Confirmed/Likely, with source):**
- `nar-nxt-27` Unconfirmed → **Confirmed**: Nov 10–15 2027, **San Diego** (was "TBA (US)").
- `inman-ny-27` Unconfirmed → **Confirmed**: Jan 26–28 2027, NY Hilton Midtown.
- `ces-27` Likely → **Confirmed** (CTA official); `sxsw-27` Unconfirmed → **Confirmed**: Mar 15–21 2027.
- `art-basel-miami-26` Likely → **Confirmed** (official site).
- `fortune-brainstorm-ai-26` Predicted → **Likely**: Dec 7–8 2026, SF (St. Regis).
- `money2020-27` Unconfirmed → **Likely** (2027 venue move to LVCC confirmed; exact days TBA).
- Recurring annuals Unconfirmed → **Predicted** (cadence-projected): `milken-27`, `tiecon-27`,
  `usispf-27`, `aspen-ideas-27`, `all-in-27`, `upfront-27`, `ai4-27`, `the-ai-conf-27`,
  `allen-co-27`, `cerebral-valley` (Likely → Predicted; no 2026 SF date posted yet).

**Dates / venues that moved:**
- `prea-annual-27` — **Oct 27–29 2027, Chicago** (Marriott Marquis); confidence → Confirmed (was ~Oct, rotates).
- `icsc-27` — corrected to **May 24–26 2027** (was May 18–20); → Confirmed.
- `fortune-bt-27` — **moved Jul → Jun 7–9 2027**, and **Aspen → Park City** (Montage Deer Valley); → Likely.
- `cretech-ny-27` — re-keyed to ~Oct 2027 (was Nov); Unconfirmed → Predicted.

**Flagged / downgraded:**
- `salt-ny-27` — **no SALT New York edition has run since 2024; likely discontinued.** tier 2 → 3,
  rating 3.5 → 2.5, conf Predicted → Unconfirmed, verdict now "Monitor — don't plan around it."
- `india-ideas-summit-27` (USIBC) — irregular cadence/venue, no forward date published; Predicted → Unconfirmed.

**Surfaced but screened OUT (kept the bar ruthless — set already saturated with capital/AI rooms):**
- Family-office forums: Family Wealth Report FO Summit (Nov 16 2026 NYC), MFO Summit (Jan 2027 Miami),
  multiple Markets Group forums — adviser-heavy / duplicative of PERE+iConnections+IMN×4+Opal+GEF.
- AI rooms: a16z American Dynamism (off-center/defense-policy), Madrona IA Summit, Imagination in Action.
- Inman Connect Las Vegas / Luxury Connect (residential brokerage, off-mandate); Future PropTech Miami (expo-scale).
- nasscom US CEO Forum, PanIIT USA (corridor, but no in-window date / overlaps USISPF).
- LinkedIn/X (cluster 10): no verifiable individual public-post event invite surfaced; the search tool
  doesn't honor `site:linkedin.com/posts` / `site:x.com` operators — channel unfulfilled this run.
  Side-event/dinner invites (Cerebral Valley, Milken-week, NY RE Tech Week) don't post until ~6–8 wks out.

## Pass 8 — 2026-06-22 (production redesign: video hero + premium theme)
Integrated the requested hero design language and shipped the prod calendar.
- **Full-screen hero**: looping CloudFront background video with a requestAnimationFrame fade loop
  (0.5s in/out, reset-and-replay on end), centered blur shape, navbar (logo, nav links, **Categories
  dropdown wired to the real filters**, Open-Calendar CTA), gradient **General Sans** headline
  *“The rooms that matter.”*, subtitle, glass CTA, and a **liquid-glass logo marquee**
  (Milken · Sequoia · TiEcon · iConnections · Cerebral Valley · FII · ULI · Nareit · Blueprint).
  Copy adapted from the source design to Event Scout.
- **Theme**: deep blue-purple `260 87% 3%` + off-white, **Geist Sans** body / **General Sans** display,
  amber (`#fcd34d`) accents, indigo→purple→amber gradient.
- **Calendar** restyled to match (glass cards, amber ★ ratings, violet Predicted dots) — all logic
  (ratings, filters, why, suggestion, plan, localStorage) preserved.
- **Robustness**: fonts + video are graceful enhancements; the calendar core remains self-contained
  vanilla JS + inline CSS, so a blocked CDN can never blank the page.

## Pass 7 — 2026-06-22 (context-grounded re-rating)
Re-scored every event independently on NDS's mandate (RE×AI center of gravity, India-US diaspora,
allocate/co-invest, Isprava US-expansion) **and** the access/peer bar — not the old tier conversion.
Spread now: **5.0 ×2 · 4.5 ×5 · 4.0 ×5 · 3.5 ×9 · 3.0 ×11 · 2.5 ×9 · 2.0 ×5 · 1.5 ×8** (was 22 piled at 3.5).
- **5.0** reserved for the two bullseyes: **AI in Real Estate Summit** (RE×AI) and **TiEcon** (diaspora).
- Notable moves: TED2027 4.5→3.0 (broad, not a domain-peer room); Aspen 3.5→2.5; LeadingRE 2.5→3.5
  (luxury-RE = Isprava-core); IMN Family Office West/East →4.0 (RE×family-office×UHNW intersection);
  Allen & Co →2.0 (can't book). GTC/SuperReturn/Sohn/Robin Hood →2.0 (ideas-stage / off-thesis).

## Pass 6 — 2026-06-22 (calendar UI: ★/5 ratings, suggestion-only)
Reworked the UI per request:
- **Tiers removed from the UI → ★/5 fit rating** per event (precise half-stars via an overlay meter).
  Rating derived from tier+shortlist+tone (5 = bullseye … ≤2 = skip); filters are now rating-based
  (All / 4.5★+ / 4★+ / 3★+ / Hide low). Hero shows avg ★ and count rated 4★+.
- **No verdict block** — replaced by ONE "Suggestion" line at the very end of each card.
- **Descriptions kept** — the Isprava / Isprava Tech / NDS "Why it matters" block stays in Details.
- Removed the personal favorite-star (the Add-to-plan status already tracks personal picks) to avoid
  two star metaphors. `rating` added to all 54 events and wired into `PIPELINE_PROMPT` for future refreshes.

## Pass 5 — 2026-06-22 (exhaustive workflow merge: 39 → 54)
Ran the multi-agent sweep (73 agents, ~1.4M tokens): **82 raw → 65 deduped → 56 verified-and-kept.**
Merged into the curated set with **token-overlap dedup + a region guard** (so IMN East/West survive but
re-discovered duplicates of curated events — CREFC, USISPF, PREA, RETCON, AI-in-RE variants — were dropped).
**+15 net-new, 54 total** (0 out of window; every event keeps its 3-lens `why`). Curated 39 + their ids preserved.

Notable adds:
- **Sequoia AI Ascent** (T1) — ~150 founders/researchers; highest-signal AI room (access is the game).
- **TED2027** (T1) — San Diego; first US TED edition in over a decade.
- **IMN Real Estate Family Office & Private Wealth (West + East)** + **Single Family Office Summit (NYC)** +
  **Opal Family Office (Newport)** — direct family-office/allocate fit.
- **LeadingRE / Luxury Portfolio Conference Week** — luxury-RE peers, Isprava-core.
- **Robin Hood Investors Conf · Forbes Iconoclast · SuperReturn NA · Future Proof (Miami) · Confluence ·
  Indiaspora US** — capital/diaspora breadth. Inaugural/unverified ones (Confluence, Indiaspora US edition)
  flagged in their verdicts; not over-sold.

Top 6 shortlist unchanged for now (9 Tier-1 events exist — re-rank on request).

## Pass 4 — 2026-06-22 (per-event 3-lens "Why it matters")
Added a `why: {isprava, tech, nds}` brief to **all 39 events** + a color-coded "Why it matters"
block in each card (Isprava=emerald, Isprava Tech=violet, NDS=gold). Honest "Low/N/A" where a lens
doesn't apply. Wired the `why` + `cadence` + `Predicted` fields into `PIPELINE_PROMPT.md` so every
future refresh keeps generating them. No date/tier changes this pass.

## Pass 3 — 2026-06-22 (Predictive layer + CEO/UHNW breadth)
Added a **`Predicted`** confidence level (violet) + a **cadence** field to the model — for
reliably-recurring annuals projected into the window from historical pattern, distinct from a
one-off `Unconfirmed` guess. UI updated (new dot color + Cadence line in details).

**+10 events → 39 total (0 out of window).** New, all CEO/UHNW-grade per the objective:
- **CREfC Miami** — Confirmed Jan 5–8 2027, Loews Miami Beach (CRE finance). Tier 2.
- **FII PRIORITY Miami** — Predicted ~late Feb 2027 (2026 was Feb 25–27, Faena); PIF/sovereign
  capital + CEOs + AI agenda. **Tier 1.**
- **SALT (SkyBridge) NY** — Predicted ~Sept 2027 (alts/UHNW, Scaramucci). Tier 2.
- **Sohn Investment Conference NY** — Predicted ~mid-May 2027 (2026 was May 12). Tier 3 (stage, not networking).
- **Greenwich Economic Forum** — Predicted ~early Oct 2027 (2026 was Oct 8–9; family offices). Tier 2.
- **AI Engineer World's Fair** — Predicted ~late June 2027 (2026 was Jun 29–Jul 2). Tier 2.
- **Fortune Brainstorm AI** — Predicted ~early Dec 2026. Tier 2.
- **India Ideas Summit (USIBC)** — Predicted ~2027 (corridor/diaspora). Tier 2.
- **PREA Institutional Investor Conference** — Predicted ~Oct 2027 (institutional RE allocators). Tier 2.
- **Art Basel Miami Beach** — Likely Dec 3–6 2026 (UHNW/collector gathering). Tier 3.

Verified this pass via official sites / press: CREfC, FII, Sohn, SALT, GEF (sources in commit).
Still pending: the exhaustive past-2-years all-source sweep (proposed as a workflow).

## Pass 2 — 2026-06-22 (RE×AI cluster · gated path-ins · LinkedIn/X)
**LinkedIn & X added as sources** — public-post discovery scoped to `linkedin.com` / `x.com`,
wired into `keywords.md` (cluster 10) and `PIPELINE_PROMPT.md`. Public posts only (no logged-in
scraping — ToS/paid-API forbid it); signal is noisy, used as leads then verified on official sites.

**Network-gated path-ins verified → `seed/network-gated.md`:**
- **TIGER 21** — actionable: ≥$20M investable, India groups now live (Mumbai/Bengaluru chairs named);
  path = membership inquiry → Dev Director → Chair meeting. The most reachable elite peer room for NDS.
- **R360** — ≥$100M net worth, ~$180k/3yr, **nomination-only**; target only with a warm referral.
- **Allen & Co Sun Valley** — no door to buy; long-game via banker/VC relationships.

**RE×AI cluster, no new dated US events to add (honest result):**
- MetaProp runs **NYC Real Estate Tech Week** ("the Davos of PropTech"); CREtech NY is its official
  flagship — same week, already tracked. No standalone 2027 date.
- **NAR iOi Summit** — no current 2026/27 date found (may be paused/folded). Left off until verifiable.
- Propy / Future PropTech surfaced but are low-signal or non-US (Dubai) — excluded.

No change to events.js this pass (discovery + intel only).

## Refresh 1 — 2026-06-22
First pipeline run, against the new objective (real estate × AI/tech + diaspora; allocate + US-expansion; not raising). 29 events; 10 now Confirmed/Likely from a primary source.

**New events discovered**
- **AI in Real Estate Summit** (US Proptech Council, NYC) — Tier 1, shortlisted. The bullseye: a curated ~4-hr exec forum, ~300 C-suite (REIT CEOs/CIOs/fund managers) all deploying AI in production. 2026 was June 4; 2027 dates TBA (~June, NY Tech Week). [summit.proptechcouncil.com]
- **Nareit REITworld** (Atlanta) — Tier 2. Confirmed **Nov 16–19, 2026**, Atlanta Marriott Marquis; REIT C-suite + investors in a 1:1 meeting format. [reit.com]

**Dates verified / corrected**
- **NAR NXT** — corrected to Confirmed **Nov 6–8, 2026, New Orleans** (was estimated Houston, Nov 13–15). Still Tier 3 (skip).
- **Cerebral Valley AI Summit** — flagship SF edition **~Nov 12, 2026** [Likely] (was a March estimate). Moves into the front of the window.
- **iConnections Global Alts Miami** — reconfirmed **Feb 22–25, 2027**; sized at 1,500+ LPs / 6,000+ attendees.
- **USISPF Leadership Summit** — corrected to **~late June** annual (2026 = June 29, DC); was a Sept estimate.
- **ULI Spring Meeting 2027** — location **Seattle** [Likely]; dates TBA.
- **TiEcon** — 2027 ~late Apr/early May TBA (2026 was Apr 29–May 1).

**Re-tiering (per the new objective)**
- **iConnections → Tier 1** kept and reframed: now a direct fit for the allocate/co-invest mandate (was hedged as allocator-only).
- **Shortlist (Top 6) rebuilt** around the objective → AI in Real Estate Summit, Blueprint, Cerebral Valley, TiEcon, iConnections, Milken. Dropped HumanX and Upfront from the Top 6 (still Tier 2).

**Still unverified (Unconfirmed, next pass)**
- 2027 dates for Milken, Blueprint, ULI Fall, CREtech NY, Upfront, All-In, Aspen, Fortune Brainstorm Tech, The AI Conference, SXSW, Money20/20, CES, Inman, ICSC, Ai4, NAR NXT '27.
- Network-gated tier (Allen & Co, R360, TIGER 21, YPO/EO) path-in detail.
- RE×AI cluster depth: NAR iOi Summit (no current date found), MetaProp, Future PropTech Miami.
