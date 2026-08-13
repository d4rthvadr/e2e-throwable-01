#!/usr/bin/env bash

set -euo pipefail

payload_file="${TMPDIR:-/tmp}/copilot-hook-payload-$$.json"
cat > "$payload_file"

session_id="$(node -e 'const fs = require("fs"); const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(input.session_id || "default-session");' "$payload_file")"
state_dir="${TMPDIR:-/tmp}/copilot-hook-state"
mkdir -p "$state_dir"
log_file="$state_dir/${session_id}.tool-log.jsonl"

node - "$payload_file" "$log_file" <<'NODE'
const fs = require("fs");

const payloadPath = process.argv[2];
const logPath = process.argv[3];
const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
const toolName = payload.tool_name || "unknown";
const toolInput = payload.tool_input || {};
const sessionId = payload.session_id || "default-session";

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "No explicit intent provided";
}

function classifyRisk(name, input) {
  const command = typeof input.command === "string" ? input.command : "";
  const patch = typeof input.input === "string" ? input.input : "";
  const dangerousCommandPattern = /(rm\s+-rf|git\s+reset\s+--hard|mkfs|dd\s+if=|sudo\b|shutdown\b|reboot\b|killall\b|kill\s+-9\b)/i;

  if (name === "run_in_terminal" || name === "send_to_terminal") {
    return {
      risk: dangerousCommandPattern.test(command) ? "dangerous command execution" : "command execution",
      severity: dangerousCommandPattern.test(command) ? "high" : "medium",
    };
  }

  if (name === "apply_patch" || name === "create_file" || name === "vscode_renameSymbol") {
    return {
      risk: /\*\*\* Delete File:/m.test(patch) ? "destructive workspace mutation" : "workspace mutation",
      severity: /\*\*\* Delete File:/m.test(patch) ? "high" : "medium",
    };
  }

  if (name === "kill_terminal") {
    return {
      risk: "process termination",
      severity: "medium",
    };
  }

  if (name === "fetch_webpage") {
    return {
      risk: "external content fetch",
      severity: "low",
    };
  }

  return {
    risk: "read-only or low-impact action",
    severity: "low",
  };
}

const { risk, severity } = classifyRisk(toolName, toolInput);
const entry = {
  timestamp: new Date().toISOString(),
  sessionId,
  toolName,
  intent: firstString(
    toolInput.goal,
    toolInput.explanation,
    toolInput.description,
    toolInput.query,
    toolInput.filePath,
    toolInput.command,
  ),
  risk,
  severity,
};

fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
NODE

rm -f "$payload_file"