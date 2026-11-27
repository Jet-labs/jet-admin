# Deployed workflow/listener implementation

## Contract

- Source definitions determine behavior; no `effect` classification or read/write API split.
- Publish snapshots workflow graphs, static child-workflow/query dependencies, input definitions, and listener observation definitions in the same consistent source snapshot.
- Executions retain release provenance and the real caller. Query nodes and child workflows resolve only the captured dependency closure; no latest-source fallback.
- Start, observe, cancel, and human-input submission are separately authorized against application/run provenance. Observation/reconnect never starts a run.
- Listeners observe existing backend-owned, persisted listener buffers with bounded cursor replay. Browsers never start, duplicate, mutate, or stop upstream integrations. Non-buffered listener delivery is not advertised as durable/replayable support.
- Listener definition changes require republishing before observation can continue; changed mutable processing definitions cannot silently alter a release. Credentials and incoming business events remain live.
- Existing standalone page/workflow/listener transports remain backward compatible.

## Work sequence

1. Add bounded dependency capture and compiler support for workflow/listener aliases, with explicit diagnostics for unsupported/dynamic targets.
2. Add release-aware workflow proxy/Temporal execution, transitive query/child pinning, run provenance, projected observation, cancellation, and existing human-input service integration.
3. Add authorized release-scoped buffered listener observation, scope-bound cursors, retention-gap handling, and source-change checks.
4. Inject transports into existing page lifecycle/event/form adapters, retain run handles across route navigation, and clean observers on leave.
5. Verify compiler/service/proxy/Temporal/client contracts and regressions; perform bounded live checks where infrastructure is available; document remaining operational limits honestly.

## Acceptance evidence

- Source edits after publication cannot replace workflow graphs, query inputs/definitions, or child graphs during an admitted run.
- Wrong tenant/application/alias/principal/run/cursor is denied before data is returned or execution starts.
- Workflow polling/reconnect/route revisits observe an accepted run without creating another one.
- Human-input validation uses the existing service and a request belonging to the admitted run.
- Listener cursor replay is bounded and ordered; stale configuration, expired cursor, archive, or permission revocation fails explicitly.
- Existing query execution, composition-only preview, and standalone runtime tests still pass.

## Progress

Implemented and verified at unit/service/contract level:

- Dependency closure capture: root/child graphs, static query nodes, sub-workflow cycles, input definitions, listener definitions, tenant/source authorization, and size limits.
- Release-aware workflow proxy/Temporal execution: captured graph and query definitions, caller/release provenance, current authorization/archive checks, start uncertainty, run-family observation, cancellation, and human-input submission.
- Buffered listener observation: HMAC-scoped cursors, latest-100 initial snapshot plus ordered bounded cursor pages, retention-gap errors, definition-change checks, and verified event stamping.
- Client adapters: retained workflow run identities, polling observation without live rooms, listener cursor polling, form submission through run provenance, and observer cleanup on navigation.
- Application workflow run-history API/UI with environment filtering and empty-state handling.
- Live application consumer route/action policy, including manifest filtering and execute/workflow/listener gates.
- Regression verification: backend application/appPage/asset-version batch **122 passing** (13 suites, 2 PostgreSQL opt-in tests skipped); frontend full suite **198 passing across 31 suites**; production build, changed-source ESLint, Prisma validation, and `/health` passed.

Not verified live: Temporal, Redis, and the listener proxy were not running. Backend logs repeatedly reported `redis:client:error`; no workflow run was recorded, and no listener buffer existed for replay. The QA application also has no pinned workflow source, so workflow-trigger buttons sent no start request. Non-buffered listener delivery, release-owned automation reconciliation, direct socket projection, and external/anonymous consumer identities remain out of scope. Application consumer route/action permissions are implemented.

See the [E2E matrix](2026-11-23-applications-e2e-matrix.md) for the exact blocked cases and operational follow-up.
