# Repository-local browser QA agents

## Start here

```text
/qa-plan full platform, including every registered widget, connector, and workflow node
/qa http://localhost:YOUR_PORT full platform; staging; read-only initially
/qa-status
```

Use the actual URL. For fixture mutations, explicitly identify the disposable
tenant/accounts and permitted operations. The coordinator asks for missing details.
The configuration itself does **not** start a campaign or an OpenCode goal.

## Agents

| Agent | Role | Model |
| --- | --- | --- |
| `qa-strategist` | Primary coordinator + adversarial edge-case strategist; delegates serial batches and audits evidence | `openai/gpt-6.1-sol#xhigh` |
| `qa-browser-tester` | Subagent that executes BrowserSkill tests, updates inventory, and reports back | `opencode/crouton-alpha-free#high` |

The commands explicitly select the strategist/model. Normal Build/Plan defaults,
global settings, and existing goal-plugin configuration are unchanged. Selecting
an agent manually may retain the session's previous model; prefer `/qa` commands
for the pinned selection. Both model variants were verified in the model catalog.

## Files and feedback loop

- `.opencode/agents/`: agent prompts and agent-specific permission rules.
- `.opencode/skills/platform-qa/SKILL.md`: shared safety, discovery, evidence,
  edge-case, ownership, and handoff protocol.
- `reports/qa/visual-test-inventory.md`: dedicated living visual/functional matrix.
- `reports/qa/runs/<run-id>/`: plans, batch orders/results, and run summaries.
- `reports/qa/evidence/<run-id>/<scenario-id>/`: screenshots and safe observations.

Strategist discovers/plans -> one worker executes and records -> strategist reads
the returned report AND evidence -> challenges missing assertions -> plans the next
batch. Only the worker edits execution rows during its batch; no concurrent writers.
Old reports are retained as historical leads, never silently reused as fresh passes.

## Prerequisites and limits

- OpenCode V2 discovers these project files automatically; use `/reload` if needed.
  `opencode debug agents` can confirm discovery.
- The existing `browser-skill` must be available to this OpenCode installation,
  with its separate `bsk` CLI and Chromium extension set up and connected. This
  setup does not install software, change extension settings, or log in for you.
- Logged-in test accounts, explicit environment authorization, and appropriate
  disposable fixtures are needed. Never save passwords/keys in the inventory.
- Both agents can read project code but cannot edit outside `reports/qa/` via
  edit/write/patch. The strategist can only launch the named worker. The worker
  cannot delegate; its shell allowlist is `bsk` only. No global permission loosening.
- These are tool permission gates plus behavioral safeguards, **not an OS sandbox**.
  Browser actions still use real sessions. Destructive/external/fault/security
  operations require scoped approval even though the CLI command is permitted.
- Batch time/command budgets are agent-tracked, not a hard scheduler guarantee.
  Commands do not guarantee unattended continuation across context/budget limits.
- Browser QA cannot prove every edge case, all server-side behavior, full WCAG
  conformance, cross-browser correctness, or performance certification. Unsupported
  or unexecuted assertions remain visible as partial, blocked, or untested.

Optional future step: promote confirmed important bugs to deterministic regression
tests under a separately authorized implementation task.
