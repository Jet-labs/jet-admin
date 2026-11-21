# Requires -Version 5.1
<#
.SYNOPSIS
  Contingency reload-and-continue for the Jet Admin MCP self-improvement loop.
  NOT NEEDED for the 2026-10-04 run (no opencode.json/env changes), kept for future use.
.DESCRIPTION
  1. Reads .opencode/mcp-fix-progress.md for next steps.
  2. Restarts Docker MCP + backend containers (avoids killing the opencode host process).
  3. Re-runs health checks.
  Do NOT run this automatically — only when .opencode/opencode.json or MCP env changes require a reload.
#>
$ErrorActionPreference = 'Stop'
$Root = 'D:\PROJECTS\PERSONAL\jet-admin'
Write-Output '=== MCP reload-and-continue (contingency, manual only) ==='
if (Test-Path "$Root\.opencode\mcp-fix-progress.md") {
  Get-Content "$Root\.opencode\mcp-fix-progress.md" | Select-Object -First 20
} else {
  Write-Output 'No progress file found.'
}
Write-Output '--- health ---'
curl.exe -s http://localhost:5001/health
Write-Output ''
Write-Output 'Done. Resume loop at step 1 (RUN & TEST) if needed.'
