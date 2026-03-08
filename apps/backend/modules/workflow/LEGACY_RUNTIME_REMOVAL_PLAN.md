## Legacy runtime identification and removal plan

### Current low-risk legacy/vestigial candidates
- `apps/backend/modules/workflow/queue/` is present but currently empty.
- `apps/backend/modules/dataQuery/dataQuery.middleware.js` is a placeholder export with no behavior.
- `apps/backend/modules/workflow/workers/workerSDK.js` is now a compatibility barrel and should be retired after imports move to split helpers.

### Why this is a plan, not immediate deletion
- The previously suspected alternate workflow engine is not present on the current disk state.
- To avoid breaking external or branch-local integrations, removal should follow import verification and targeted regression tests.

### Removal phases
1. Confirm zero runtime imports for each candidate with code search and unit/integration coverage.
2. Delete placeholder files and empty directories first.
3. Remove `workerSDK.js` only after all imports use `contextResolver.js` or `widgetBinding.js` directly.
4. Keep docs/blueprints aligned with the final runtime surface after deletions.

### Exit criteria
- No backend imports reference the removed path.
- Workflow execution tests and targeted query/queue tests pass.
- Documentation no longer points at compatibility-only files.