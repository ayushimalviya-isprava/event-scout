#!/usr/bin/env bash
# Event Scout — one refresh run. Invoked by the scheduler (launchd/cron) or by hand.
# It runs Claude headless against the pipeline prompt; Claude does the discover→fetch→
# label→write loop and rewrites ui/events.js, then commits.
set -euo pipefail
# Make the CLI findable under launchd's minimal environment.
export PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:$HOME/.npm-global/bin:$PATH"
cd "$(dirname "$0")/.."
mkdir -p pipeline
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
echo "=== refresh start $STAMP ===" >> pipeline/refresh.log

claude -p "$(cat pipeline/PIPELINE_PROMPT.md)" \
  --permission-mode acceptEdits \
  --allowedTools "WebSearch,WebFetch,Read,Edit,Write,Bash" \
  >> pipeline/refresh.log 2>&1

echo "=== refresh done $(date '+%Y-%m-%d %H:%M:%S') ===" >> pipeline/refresh.log
