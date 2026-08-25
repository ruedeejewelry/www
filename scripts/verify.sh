#!/usr/bin/env bash
#
# Everything that must pass before pushing. Run: npm run verify
#
# `set -e` and no pipes: a build failure once slipped through because the check
# piped output into `grep | head`, and a pipeline reports the exit status of its
# last command — so a failed build looked like a pass and reached production.
# Read the output; do not filter it.

set -euo pipefail

echo "── typecheck ──"
npx tsc --noEmit

echo "── lint ──"
npx eslint app components lib types tests scripts proxy.ts next.config.ts

echo "── tests ──"
npx vitest run

# Two builds, because most of the code has two shapes. Without Supabase
# configured the data layer takes its seed fallback and whole code paths never
# run — which is exactly how three separate failures reached production.
echo "── build: no Supabase (seed fallback) ──"
npx next build

echo "── build: Supabase configured ──"
NEXT_PUBLIC_SUPABASE_URL="https://fake.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="fake-anon-key" \
  npx next build

echo
echo "ผ่านหมด พร้อม push"
