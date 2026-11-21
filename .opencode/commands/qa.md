---
description: Run coordinated BrowserSkill QA with a persistent visual test inventory
agent: qa-strategist
model: openai/gpt-6.1-sol#xhigh
subagent: false
---

Coordinate browser QA for Jet Admin using the platform-qa skill and the
qa-browser-tester subagent. User target, scope, and authorizations: $ARGUMENTS

Read reports/qa/visual-test-inventory.md first. Discover current features and
create or resume a bounded run plan. Ask for essential missing target/environment,
accounts, mutation permissions, and budget; never assume localhost is disposable.
Delegate serial batches to the named browser worker, review evidence, invent
targeted follow-up edge cases, and persist coverage and findings after each batch.
Do not modify application code or start services. Do not create an OpenCode goal
unless explicitly requested. End with honest coverage, blockers, and next IDs.
