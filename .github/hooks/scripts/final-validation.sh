#!/usr/bin/env bash

set -euo pipefail

payload_file="${TMPDIR:-/tmp}/copilot-hook-payload-$$.json"
cat > "$payload_file"

session_id="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.session_id || "default-session");' "$payload_file")"
workspace_cwd="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.cwd || process.cwd());' "$payload_file")"

state_dir="${TMPDIR:-/tmp}/copilot-hook-state"
changed_file_list="$state_dir/${session_id}.files"
e2e_log="${TMPDIR:-/tmp}/copilot-hook-e2e.log"

if [[ ! -f "$changed_file_list" ]]; then
  rm -f "$payload_file"
  exit 0
fi

if ! grep -Eq '^(src/|tests/|package.json$|playwright.config.ts$|vite.config.ts$|eslint.config.js$|tsconfig(\.[^/]+)?\.json$)' "$changed_file_list"; then
  rm -f "$payload_file"
  rm -f "$changed_file_list"
  exit 0
fi

cd "$workspace_cwd"

if npm run test:e2e >"$e2e_log" 2>&1; then
  printf '{"systemMessage":"Final validation passed: npm run test:e2e."}\n'
else
  status=$?
  output="$(tail -n 40 "$e2e_log" | tr '\n' ' ' | sed 's/"/\\"/g')"
  printf '{"systemMessage":"Final validation failed: %s"}\n' "$output"
  rm -f "$payload_file"
  rm -f "$changed_file_list"
  exit "$status"
fi

rm -f "$payload_file"
rm -f "$changed_file_list"