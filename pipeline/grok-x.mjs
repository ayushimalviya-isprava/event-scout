#!/usr/bin/env node
/**
 * Event Scout — Grok (xAI) X/live-search pre-step.
 * --------------------------------------------------------------------------
 * Why Grok: it has native, real-time access to the X firehose, so it's the
 * clean way to use X as a source (scraping X is against ToS / needs paid API).
 * This runs BEFORE the Claude judge: Grok surfaces X (+ web) leads about
 * upcoming CEO/UHNW US events & curated dinners; we write them to
 * pipeline/grok-leads.json, and PIPELINE_PROMPT tells Claude to read + VERIFY
 * them on official sites before anything gets listed.
 *
 * Gated on XAI_API_KEY — if unset, it prints a note and exits 0 (pipeline
 * continues without X leads). Best-effort: any failure is non-fatal.
 *
 * Run by hand:  XAI_API_KEY=xai-... node pipeline/grok-x.mjs
 * Tunables (env): XAI_MODEL (default grok-4), EVENT_WINDOW.
 *
 * NOTE: verify the model id and the `search_parameters` shape against current
 * xAI docs (https://docs.x.ai) — the live-search API evolves.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.XAI_API_KEY;
const MODEL = process.env.XAI_MODEL || 'grok-4';
const WINDOW = process.env.EVENT_WINDOW || 'Nov 2026 to Nov 2027';

if (!KEY) {
  console.log('[grok-x] XAI_API_KEY not set — skipping X/Grok lead pull (pipeline continues).');
  process.exit(0);
}

const prompt = `Search X (and the web) for announcements of UPCOMING events and curated dinners/side-events
happening in the USA within the window ${WINDOW}, that are genuinely CEO / founder / millionaire-grade and
relevant to ANY of:
- real estate x AI / proptech (RE principals deploying AI)
- India-US diaspora founders & investors
- frontier-AI founder/investor rooms
- capital / family offices / UHNW (allocator-oriented)
- US-India corridor / NRI luxury real-estate buyers
Prefer invite-only summits, small dinners, and "applications open" calls that don't show up on normal event sites.
Public posts only. Return ONLY a JSON array (no prose) of objects:
{ "name": "", "date_or_month": "", "city": "", "url": "", "source_post": "", "why_relevant": "" }`;

try {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a precise research assistant. Return strictly valid JSON when asked.' },
        { role: 'user', content: prompt },
      ],
      // Live Search over X + web. Adjust per current xAI docs if the API changes.
      search_parameters: { mode: 'on', sources: [{ type: 'x' }, { type: 'web' }], max_search_results: 30 },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    console.log(`[grok-x] xAI API ${res.status} — skipping. ${(await res.text()).slice(0, 200)}`);
    process.exit(0);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  let leads = [];
  try {
    const m = content.match(/\[[\s\S]*\]/); // tolerate code fences / stray prose
    leads = JSON.parse(m ? m[0] : content);
  } catch {
    console.log('[grok-x] could not parse Grok JSON; writing raw content for the judge to read.');
  }

  writeFileSync(join(DIR, 'grok-leads.json'), JSON.stringify(Array.isArray(leads) ? leads : { raw: content }, null, 2));
  const md = ['# Grok/X leads (verify before listing)', '', `_model: ${MODEL} · window: ${WINDOW}_`, '']
    .concat(Array.isArray(leads) && leads.length
      ? leads.map(l => `- **${l.name || '?'}** — ${l.date_or_month || 'date?'} · ${l.city || '?'}\n  ${l.url || ''}\n  _${l.why_relevant || ''}_ (src: ${l.source_post || ''})`)
      : ['(no structured leads parsed — see grok-leads.json)'])
    .join('\n');
  writeFileSync(join(DIR, 'grok-leads.md'), md);
  console.log(`[grok-x] wrote ${Array.isArray(leads) ? leads.length : 0} leads → pipeline/grok-leads.json`);
} catch (e) {
  console.log(`[grok-x] error (non-fatal): ${e.message}`);
  process.exit(0);
}
