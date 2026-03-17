# Workflow Engine Stress Test Suite

## Structure

```
tests/stress/
  helpers/
    inMemoryPrisma.js     In-memory Prisma mock — all DB calls, no network
    workflowExecutor.js   Drives orchestrator↔handler cycle without real queue
  fixtures/
    topologies.js         12 synthetic workflow shapes
  workflowStress.test.js  Full test suite (unit + integration + load)
```

## Running

```bash
# Full suite
npx jest tests/stress/workflowStress.test.js --testTimeout=60000

# One group only
npx jest tests/stress/workflowStress.test.js -t "Load"

# With coverage
npx jest tests/stress/workflowStress.test.js --coverage --testTimeout=60000

# Watch mode during development
npx jest tests/stress/workflowStress.test.js --watch
```

## Path configuration

The test file mocks modules using paths relative to itself. If your source
is not at `src/modules/workflow/...`, update the `jest.mock()` paths at the
top of `workflowStress.test.js` and the `require()` paths in
`workflowExecutor.js` to match your project layout.

## Test groups

| Group | What it tests |
|---|---|
| `dagScheduler — isNodeReadyToExecute` | Barrier logic for AND/OR joins, test-run sentinel |
| `stateManager` | Log writes, context assembly, barrier check, recovery |
| `orchestrator — _buildLogPayload` | Payload construction, end node output key |
| `Integration — workflow topologies` | All 12 shapes run end-to-end |
| `Error paths` | Fail nodes, error edges, recovery, bad handler type |
| `Concurrency — join node correctness` | Double-dispatch detection on AND join under parallel execution |
| `Context integrity` | Downstream nodes see upstream outputs |
| `Load — 100 concurrent linear` | Throughput + all-complete assertion |
| `Load — 50 concurrent diamond AND-join` | Throughput + zero double-dispatch assertion |
| `Edge cases` | Recovery sweep, empty output params, missing start node |

## Synthetic handlers

Three test-only handlers are registered in the test setup:

| Type | Behaviour |
|---|---|
| `__echo` | Returns `nodeConfig.echoOutput` via `nodeConfig.echoHandle`. Supports `joinMode` in `nodeConfig`. |
| `__fail` | Always throws with `nodeConfig.errorMessage`. |
| `__delay` | Waits `nodeConfig.delayMs` ms, then echoes like `__echo`. |

## The join-node race condition test

The key concurrency assertion is:

```
join node should execute exactly once per instance
```

When parallel branches complete at the same time, `calculateNextNodes` may
be called by two `handleTaskResult` invocations simultaneously. Both read
`getCompletedNodeIDs`, both see all upstream nodes complete, and both
dispatch the join node — running it twice.

The test `DIAMOND_AND run 10 times in parallel` catches this by asserting
`getNodeExecutionCount(instanceID, 'J') === 1` for every instance. If your
orchestrator has the double-dispatch bug, this test will fail and report:

```
⚠️  Double-dispatch detected on J in N/50 instances
```

The fix is to add an idempotency check in `_dispatchNextNodes`: before
calling `addNodeJob`, verify no `NODE_COMPLETED` or pending-queue entry
already exists for that nodeID in this instance.
