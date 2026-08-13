#!/usr/bin/env bash

set -euo pipefail

payload_file="${TMPDIR:-/tmp}/copilot-hook-payload-$$.json"
cat > "$payload_file"

tool_name="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.tool_name || "");' "$payload_file")"
session_id="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.session_id || "default-session");' "$payload_file")"
workspace_cwd="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.cwd || process.cwd());' "$payload_file")"

case "$tool_name" in
  apply_patch|create_file|vscode_renameSymbol)
    ;;
  *)
    rm -f "$payload_file"
    exit 0
    ;;
esac

state_dir="${TMPDIR:-/tmp}/copilot-hook-state"
mkdir -p "$state_dir"
changed_file_list="$state_dir/${session_id}.files"
build_log="${TMPDIR:-/tmp}/copilot-hook-build.log"
lint_log="${TMPDIR:-/tmp}/copilot-hook-lint.log"

node - "$payload_file" <<'NODE' >> "$changed_file_list"
const fs = require("fs");

const payload = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const toolName = payload.tool_name || "";
const toolInput = payload.tool_input || {};
const files = [];

if (toolName === "create_file" && typeof toolInput.filePath === "string") {
  files.push(toolInput.filePath);
}

if (toolName === "vscode_renameSymbol" && typeof toolInput.filePath === "string") {
  files.push(toolInput.filePath);
}

if (toolName === "apply_patch" && typeof toolInput.input === "string") {
  const matches = toolInput.input.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm);
  for (const match of matches) {
    files.push(match[1].trim());
  }
}

for (const file of files) {
  if (file) {
    console.log(file);
  }
}
NODE

sort -u "$changed_file_list" -o "$changed_file_list"

if ! grep -Eq '^(src/|tests/|package.json$|playwright.config.ts$|vite.config.ts$|eslint.config.js$|tsconfig(\.[^/]+)?\.json$)' "$changed_file_list"; then
  rm -f "$payload_file"
  exit 0
fi

cd "$workspace_cwd"

if npm run build >"$build_log" 2>&1 && npm run lint >"$lint_log" 2>&1; then
  printf '{"systemMessage":"Post-edit validation passed: npm run build and npm run lint."}\n'
else
  build_status=$?
  build_output=""
  lint_output=""

  if [[ -f "$build_log" ]]; then
    build_output="$(tail -n 20 "$build_log" | tr '\n' ' ' | sed 's/"/\\"/g')"
  fi

  if [[ -f "$lint_log" ]]; then
    lint_output="$(tail -n 20 "$lint_log" | tr '\n' ' ' | sed 's/"/\\"/g')"
  fi

  printf '{"systemMessage":"Post-edit validation failed. build: %s lint: %s"}\n' "$build_output" "$lint_output"
  rm -f "$payload_file"
  exit "$build_status"
fi

rm -f "$payload_file"