---
description: Summarize saved QA coverage, findings, blockers, and the next batch without testing
agent: qa-strategist
model: openai/gpt-6.1-sol#xhigh
subagent: false
---

Status only. Load platform-qa and read reports/qa/visual-test-inventory.md plus
the applicable saved run plans, summaries, and batch reports. Filter: $ARGUMENTS

Report scenario counts by status, tested build/freshness, confirmed vs suspected
bugs, missing visual evidence, blockers, cleanup residue, and the highest-risk
next scenario IDs. Keep broad discovery areas separate from executable scenario
counts. Do not browse, delegate, modify files, start services, or rerun tests.
