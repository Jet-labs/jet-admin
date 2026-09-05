# Temporal DSL Migration — Temporal-Only (Final)

This is the executable plan after restructuring to **Temporal-only** with `executeNode` abstraction in `@jet-admin/workflow-nodes-logic`.

## 1. File Structure (Current)

```
packages/workflow-nodes-logic/          # NEW — single source of truth for node logic
  package.json
  src/
    constants.js                        # ERROR_HANDLING, NEXT_HANDLE, NODE_TYPE
    utils/vm.js                         # isolated-vm (lazy, Node vm fallback)
    handlers/
      start.js, end.js, javascript.js, condition.js, delay.js, dataCollection.js, dataQuery.js, loop.js
    executor/
      executeNode.js                    # ← REQUIRED ABSTRACTION: common to all node types
    index.js

apps/backend/modules/workflow/
  temporal/
    config.js                           # TASK_QUEUE, ADDRESS, WORKFLOW_TYPE, SIGNALS, WORKFLOW_OPTIONS (no driver flag)
    policyDefaults.json                 # canonical PLATFORM_* + LIMITS (required by workflowConfig.js)
    client.js                           # singleton Connection + Client
    worker.js                           # Temporal-only Worker (sidecar or in-process; concurrency via TEMPORAL_MAX_* env)
    service.js                          # startWorkflowTemporal / startTestWorkflowTemporal / signalHumanInput (uses WORKFLOW_TYPE/SIGNALS)
    workflowConfig.js                   # Node-side resolver (requires policyDefaults.json)
    activities/
      index.js                          # barrel (worker requires this dir)
      executeNode.js                    # executeNodeActivity via @jet-admin/workflow-nodes-logic
      emitProgress.js                   # socket/widget/DB audit (+ buildProgressPayload/resolveProgressEvent)
      emitCompleted.js                  # instance COMPLETED/FAILED + status broadcast
      dataCollection.js                 # idempotent PENDING request creation
      resolveTemplate.js                # shared expression-engine options
    workflows/
      helpers.js                        # normalizeHandle, buildGraphMaps, isNodeReady (deterministic)
      workflowPolicy.js                 # sandbox mirror: PLATFORM_* + ERROR_HANDLING + SIGNALS + WORKFLOW_PROGRESS + resolvers
      dslWorkflow.js                    # DSL interpreter — wave DAG + native loop + sleep + signals; calls executeNode only
  workflowEngine/
    stateManager.js                     # Kept: DB instance/logs (UI still reads tblWorkflowInstanceLogs)
  dataCollection/dataCollection.service.js # Temporal signal only
  workflow.service.js                   # delegates to temporal/service
  workflow.controller.js / routes etc   # unchanged (React Flow JSON preserved)

Deleted (native engine removed):
  workflowEngine/engine.js, workflowEngine/dagScheduler.js, orchestrator/dagScheduler.js,
  listeners/taskListener.js, handlers/*, workflow.runtime.js, queue.config workflow usage
```

## 2. executeNode Contract

**Location:** `packages/workflow-nodes-logic/src/executor/executeNode.js:1`

```js
import { executeNode } from '@jet-admin/workflow-nodes-logic';

const result = await executeNode({
  node: { id, type, data },        // React Flow node
  context,                         // workflow ctx (mutable reference)
  helpers: { resolveTemplate, tenantID, instanceID, workflowID, nodeID },
  services: { resolveInputs, authorizedExecuteDataQuery, createSystemContext, ... } // only for dataQuery
});
// returns { output, nextHandle, suspended?, queueDelay? }
```

- All types go through this one function — satisfies requirement.
- Pure handlers inside package; `dataQuery` receives `services` injection to keep package DB-free.
- Backend `temporal/activities/index.js:1` is thin wrapper that builds `helpers/services` and calls `executeNode`.

**DSL workflow** `temporal/workflows/dslWorkflow.js:1` never switches on type except for `loop` native handling; otherwise:

```js
const result = await executeNode(node, context, common); // single call
if (result.suspended) { /* HITL */ }
if (node.type==='delay' && result.queueDelay) await sleep(result.queueDelay);
```

## 3. Running

```bash
# 1. Infra
docker compose -f docker-compose.temporal.yml up -d # gRPC 7233, UI 8088

# 2. Build logic package
npm --prefix packages/workflow-nodes-logic run build

# 3. Install (root workspaces)
npm install --ignore-engines

# 4. Start
npm run temporal:worker --prefix apps/backend &  # sidecar
npm run dev-w --prefix apps/backend               # backend (always temporal now)
```

Frontend unchanged: saves `{nodes, edges}` JSON, receives `WORKFLOW_NODE_UPDATE` via `emitProgressActivity`.

> **Single-worker rule (dev):** run EITHER the in-process worker (`npm run dev-w`,
> started by `startup.js`) OR the sidecar (`npm run temporal:worker`) — never
> both against the same task queue. Two workers split activities randomly, and a
> sidecar process owns no socket clients, so `workflow_node_update` emits from
> its activities reach nobody (DB rows still write fine, which makes this look
> like "workflow ran but UI showed nothing"). If node logs go missing while the
> final status arrives, check for a second `node` process and kill it. Backend
> logs `temporal:emitProgress:noListeners` when an emit finds no socket in the
> instance room.

## 4. Why This Is Proper

- **One abstraction:** `executeNode` in logic package, not scattered `handlers/*` in backend.
- **Temporal-only:** no `WORKFLOW_ENGINE_DRIVER` branching, no CAS retry loop, no `fastq` workflow queue.
- **DB schema preserved:** `stateManager.js` still writes `NODE_COMPLETED/FAILED/SUSPENDED` for `workflow.service.getRunStatus`.
- **Deterministic workflow:** `dslWorkflow.js` only imports `@temporalio/workflow` + deterministic helpers; all IO in activities.
- **Policy precedence:** `node.data > workflowOptions.nodeDefaults > platform defaults` resolved in `workflowConfig.js` (Node) and mirrored in `workflows/workflowPolicy.js` (sandbox); canonical values live in `policyDefaults.json`, parity enforced by `__tests__/unit/workflow/temporalPolicyParity.test.js`.
- **Deterministic waves:** multi-ready waves run sequentially in sorted order (shared-context mutation makes `Promise.all` unsafe).
- **Loop contract:** `maxIterations` 1-100000, `delayBetweenItems` ms 0-60000 (matches `loopNode.jsx`), `isDisabled` skips, `errorHandling` allowlisted in `workflow.validator.js`.
- **Recovery:** startup marks stale `RUNNING` instances `FAILED` via `stateManager.getStaleRunningInstances` (`WORKFLOW_STALE_AFTER_MS`, default 5m).
```

## 5. Conventions

- Workflow/signal names: `WORKFLOW_TYPE` / `SIGNALS` in `temporal/config.js` (Node) mirrored in `workflows/workflowPolicy.js` (sandbox). Never hardcode `'dslInterpreterWorkflow'` / `'submitHumanInput'` literals.
- Progress statuses: `WORKFLOW_PROGRESS.{RUNNING,SUCCESS,FAILED,SUSPENDED}` in workflow code; activities accept both cases for back-compat.
- Error modes: `ERROR_HANDLING.{CONTINUE,CONTINUE_DEFAULT,FAIL_WORKFLOW,SKIP_ITEM,RETRY_THEN_FAIL,RETRY_THEN_CONTINUE}` — same values in `@jet-admin/workflow-nodes-logic`, `workflowPolicy.js`, validator, and frontend `loopNode.jsx`.
```

