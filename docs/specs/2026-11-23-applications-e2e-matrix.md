# Applications E2E matrix and evidence

**Date:** 2026-11-23  
**Scope:** Deployed Application authoring, releases, routing/lifecycle, versions, environment bindings, consumer policy, managed adoption, observability, and recovery paths.  
**Status:** Normal, edge, and complex cases below were exercised through automated suites and live browser/API QA. Infrastructure-dependent workflow/listener cases remain blocked.

## Test environment

| Item | Value |
| --- | --- |
| Tenant | `855b7183-350c-45cc-b0e8-d408e0c2e3f1` |
| Application | `461f28de-8e55-4661-8e68-9ae79ab04581` (“Applications foundation QA”) |
| Current user | `1a3ece78-45ae-4a19-8475-3e443e2b01e8` |
| Backend | `http://localhost:8090` (`/health` = ok) |
| Frontend | `http://localhost:5173` |
| Deployed release | Release **8** (`c2580efd-63b3-46c0-a8ec-97c85aac8728`), 3 page versions, draft revision 13 |
| Prior release | Release **7** (`a23f854a-617a-493a-a197-173ebfa43e15`) |
| Environment bindings | Revision **2**, self-mapping `6c190e0f-c9f3-4dab-b4f2-4f3342b66c66`, note “QA identity binding” |
| Consumer policy | Revision **3**, enabled; wildcard allow plus route deny `sla` for the QA user |
| Assets | `overview-page` → `/`, `risk-desk-page` → `/risk`, `sla-page` → `/sla`; all referenced/shared |

## Automated verification

| Suite | Result |
| --- | --- |
| Frontend full Jest suite | **198 passed / 31 suites** |
| Backend application/appPage/asset-version/integration batch | **122 passed across 13 suites**; 1 PostgreSQL opt-in suite skipped (2 tests) |
| Frontend production build | Passed |
| Changed-source ESLint | Passed |
| Prisma validate | Passed |
| Backend health | `{"status":"ok"}` |

## Normal-path matrix

| Case | Expected | Result | Evidence |
| --- | --- | --- | --- |
| Authoring: save draft, publish, deploy | New immutable release and production pointer | **Pass** | Draft revision 11 saved; release 8 published and deployed; release history showed 8 as Production. |
| Publish reuses unchanged page versions | Release 8 keeps release 7’s exact page version IDs | **Pass** | Both releases map `sla-page`, `overview-page`, and `risk-desk-page` to `6d7a…`, `af64…`, and `ed4b…`. |
| Deploy an older retained release | Pointer moves without mutating either release | **Pass** | Rolled back to release 7, then deployed release 8 again through the release history dialog. |
| Route guard admits or redirects | `false` redirects; `true` admits | **Pass** | Release 7 `/run/production/risk` redirected to `/`; release 8 `/risk` rendered the Risk page. |
| Unknown route uses not-found page | Home page renders at the unknown URL | **Pass** | `/run/production/not-a-route` kept its URL and rendered “Incident room”; document title was “Incident room · SLO routing and recovery · Application”. |
| Document titles | Route title or page title becomes the browser title | **Pass** | Risk route title “Risk” produced “Risk · Application”; home produced the page title. |
| Keep-alive retention | Page state survives navigation | **Pass** | Risk slider set to 90 and query result 23 rows; navigated home, then back to risk; slider stayed 90 and cached results remained. |
| Typed route query binding | Typed query seeds a matching page variable | **Pass** | `/risk?threshold=90` filtered the query to 23 rows (default 70 produced a larger result set). |
| Query-only navigation | Does not remount the page | **Pass** | Route runtime test plus live threshold update; page cache key excludes query string. |
| Version diff and restore | Diff shows draft delta; restore writes only the draft | **Pass** | Version 1 → draft diff showed `CHANGED appPageTitle`; restore reverted the page title. Version ID, number, and creation time were unchanged. |
| Environment binding runtime remap | Runtime resolves the bound datasource ID | **Pass** | Revision 2 self-mapping served Risk data-source executions with HTTP 200. |
| Consumer policy deny | Denied route is hidden and blocked | **Pass** | Revision 1 denied `sla`: manifest/nav showed only home/risk; `/sla` rendered “This view has no reachable page in the deployed release.” |
| Consumer policy disable/re-enable | Policy can be toggled without changing release | **Pass** | Revision 2 disabled enforcement and `/sla` rendered the SLA page; revision 3 re-enabled enforcement. |
| Managed adoption | Clone page row; keep widgets/bindings shared | **Pass** | `managed-order-desk` created a distinct page copy with the same 8 widget keys; source page unchanged. |
| Managed unlink | Unreleased clone is removed with its asset link | **Pass** | After unlink, asset count returned to 3 and the cloned page row no longer existed; source row remained. |
| Run history | Shows production application runs or empty state | **Pass** | Dialog listed “No application workflow runs were recorded for production yet.” |
| Strict expression mode | Opt-in path-only mode; default trusted behavior unchanged | **Pass (automated)** | Strict expression tests pass; Studio selector is present. QA app remains `trusted-js` by design. |

## Edge-case matrix

| Case | Expected | Result | Evidence |
| --- | --- | --- | --- |
| Invalid draft definition (duplicate route ID) | Reject with diagnostic, no draft mutation | **Pass** | `PATCH /draft` returned **400 `INVALID_APPLICATION_DEFINITION`**. |
| Stale draft revision | Reject with conflict | **Pass** | `PATCH /draft` with revision 1 returned **409 `APPLICATION_REVISION_CONFLICT`**. |
| Stale publish revision | Reject without creating a release | **Pass** | `POST /releases` with revision 1 returned **409 `APPLICATION_REVISION_CONFLICT`**. |
| Version delete attempt | No deletion route | **Pass** | `DELETE /asset-versions/.../versions/:id` returned **404 `INVALID_REQUEST`**. |
| Release delete attempt | No deletion route | **Pass** | `DELETE /applications/:id/releases/:releaseID` returned **404 `INVALID_REQUEST`**. |
| Stale version restore | Reject and require reload | **Pass** | Restore with old `expectedUpdatedAt` returned **409 `ASSET_VERSION_RESTORE_CONFLICT`**. |
| Invalid route query value | Fail closed with empty state | **Pass (automated + prior live)** | Typed query parser tests reject non-numeric/non-integer/boolean/UUID mismatches; earlier live `sla?page=abc` rendered the invalid-query state. |
| Invalid route/path params | Reject navigation/render target | **Pass (automated)** | Navigation target/param validation tests throw for invalid/unknown params. |
| Nested route declarations | Unknown parent, cycle, or non-nested child path rejected | **Pass (automated)** | Contract tests assert `UNKNOWN_ROUTE_PARENT`, `ROUTE_PARENT_CYCLE`, and `NESTED_ROUTE_PATH`. |
| Guard safety | Unknown/self/parameterized/guarded redirects rejected | **Pass (automated)** | Contract tests assert all four guard diagnostics; runtime test admits only literal `true`. |
| Binding type mismatch | Reject incompatible datasource type | **Pass** | PUT bindings mapping DuckDB → SQLite returned **409 `ENVIRONMENT_BINDING_TYPE_MISMATCH`**. |
| Stale binding revision | Reject overwrite | **Pass** | PUT bindings with revision 1 when current is 2 returned **409 `ENVIRONMENT_BINDING_CONFLICT`**. |
| Binding history | Inspect prior revisions | **Pass** | Environment API returned revision 2 and two binding revisions; Studio dialog rendered revision and history. |
| Consumer policy stale revision | Reject overwrite | **Pass (automated)** | `CONSUMER_POLICY_CONFLICT` test covers expected revision mismatch. |
| Invalid consumer subject | Reject malformed subject | **Pass** | PUT policy with non-UUID subject returned **400 `VALIDATION_ERROR`**; UI now validates UUIDs before submit. |
| Duplicate managed asset key | Reject without partial clone | **Pass** | Second adoption with `managed-order-desk` returned HTTP 409; only one asset row remained. |
| Unlink an in-use page | Reject | **Pass (automated)** | `APPLICATION_ASSET_IN_USE` test covers routed asset. |
| Versioned managed unlink | Keep clone for immutable history | **Pass (automated)** | Managed unlink test preserves a copy with versions. |
| Create version with unchanged content | Reuse latest version | **Pass (automated + prior live)** | Content-hash tests; earlier live Versions dialog reused v1. |
| Permission revocation | Denied content disappears from manifest | **Pass** | Denied `sla` route, page, and widgets were absent; route render failed closed. |
| Run/workflow unavailable | No crash; explicit empty/failure state | **Pass with blocker** | Run history empty state works. Clicking “Score eight orders” sent no workflow request because the release has no pinned workflow source. |

## Complex-case matrix

| Case | Expected | Result | Evidence |
| --- | --- | --- | --- |
| Multi-route application with three pages | Shell/nav, deep links, guards | **Pass** | Home, Risk, and SLA routes rendered through the shared shell; nav was policy-filtered. |
| Multiple releases and rollback | Exact pins and pointer semantics | **Pass** | Releases 7 and 8 share page version IDs; rollback to 7 restored guard redirect, re-deploy of 8 restored admission. |
| Keep-alive + typed query coexistence | Widget state retained; route query still authoritative | **Pass** | Slider/widget state survived navigation; route query defaults/values remain URL-driven. |
| Consumer policy + guard + not-found interaction | Denied route hidden; allowed guard redirect works; unknown path still resolves | **Pass** | `/risk` guard redirect worked while `sla` was denied; unknown path rendered home. |
| Managed adoption + version readiness | Managed page appears in readiness without affecting release pins | **Pass** | Asset list and Version readiness showed `managed-order-desk` as “Not versioned”; release remained on 3 page versions. |
| Source isolation | Editing a shared source cannot alter a deployed release | **Pass (automated + prior live)** | Versioned page/query tests; prior live mutation-source check. |
| Navigation action chain | Navigation terminates the remaining action chain | **Pass (automated)** | `eventDispatch.integration.test.js` verifies actions after `NAVIGATE` do not run. |
| Overlapping navigation | Last requested route wins; no page remount on query-only change | **Pass (design + automated)** | Router push/replace target tests; cache key excludes query. Not separately stress-tested with rapid concurrent clicks. |
| Page-state reset on release reload | Runtime cache is scoped to the release definition | **Pass (automated/design)** | `ApplicationRouteSession` recreates the cache per deployed definition; browser reload rebuilds the runtime. |
| Workflow reconnect and human-input | Observe existing run; no duplicate start | **Blocked live** | Service/client contract tests pass; Temporal is unavailable and QA pages have no pinned workflow source. |
| Listener cursor replay/retention gap | Bounded ordered replay; explicit gap errors | **Blocked live** | Listener runtime tests pass; no listener buffer/listener-proxy available in this environment. |
| Boundary limits | Route/asset/widget/input/policy limits fail closed | **Pass (automated)** | Contract and service tests cover route/asset/widget/query input/policy limits; live paths returned bounded diagnostics. |

## Live evidence log

1. Saved draft revision 11 with Risk title, `keepAlive`, guard `false → home`, and not-found route `home`; published and deployed release 7.
2. Verified release 7 `/run/production/risk` redirected to `/run/production/` and rendered “Incident room”.
3. Verified `/run/production/not-a-route` rendered home at the unchanged URL with title “Incident room · SLO routing and recovery · Application”.
4. Changed the Risk guard to `true`, saved revision 11, published and deployed release 8; verified exact page-version reuse.
5. Set the Risk slider to 90, navigated home, returned to Risk; slider remained 90 and data remained filtered (23 rows).
6. Opened the Risk page Versions dialog, expanded v1, compared against draft after a temporary title change; UI showed `CHANGED appPageTitle`. Restored the version through the UI confirmation; page title reverted and version metadata stayed identical.
7. API checks: DELETE version → 404; diff after restore → 0 changes; stale restore → 409.
8. Bindings: revision 2 self-map served runtime; type mismatch and stale revision both returned 409.
9. Consumer policy: revision 1 denied `sla`; manifest/nav excluded it and `/sla` failed closed. Revision 2 disabled enforcement and `/sla` rendered. Revision 3 re-enabled enforcement.
10. Managed adoption: created `managed-order-desk` with 8 identical widgets and a distinct page ID; duplicate key returned 409; unlink removed the asset and unreleased clone, leaving the source page intact.
11. Run history dialog opened successfully and showed the empty production state.
12. Rolled production to release 7 (guard false → redirect), then deployed release 8 again (guard true → admitted).
13. Malformed draft → 400; stale draft/publish → 409; invalid policy subject → 400; release/version delete → 404.

## Blockers and limitations

- **Temporal unavailable:** No workflow run could be started or observed live. Run history has no real runs. Workflow graph pinning, reconnect, cancellation, and human input are verified at service/client contract level only.
- **Redis unavailable:** Backend logs continuously report `redis:client:error` for bus/socket clients. Durable distributed observation and queue behavior were not live-tested.
- **Listener proxy unavailable:** Local webhook ingress is skipped and no listener buffer is available. Listener cursor replay and retention-gap behavior are verified by unit/runtime tests only.
- **No pinned workflow source in QA pages:** Workflow-trigger buttons do not send a start request for this release composition, so a Temporal failure could not even be surfaced from the UI.
- **Strict mode not live-enabled for this app:** The QA pages use JavaScript expressions; switching them to `safe-path` would intentionally break them. Strict mode is opt-in and unit-tested, and the Studio selector is present.
- **Keep-alive scope:** Widget state and cached query results survive route navigation; typed route defaults still re-apply on return. Browser reload/release change resets the runtime cache.
- **No version/release deletion:** By design. Attempts return 404 and versions/releases remain immutable.
- **Managed copy history:** A managed copy with immutable versions is retained on unlink so history and published references stay inspectable; only an unreleased clone is deleted.

## Reproduce

```powershell
cd apps/frontend; npx jest --runInBand --silent
cd ../backend; npx jest --runInBand --silent __tests__/unit/application __tests__/unit/appPage __tests__/unit/assetVersion __tests__/integration/application.database.test.js
cd ../backend; npx prisma validate
cd ../frontend; npx eslint <changed-source-files>
cd ../frontend; npm run build
```

Runtime URLs:

```text
/tenants/855b7183-350c-45cc-b0e8-d408e0c2e3f1/applications/461f28de-8e55-4661-8e68-9ae79ab04581
/tenants/855b7183-350c-45cc-b0e8-d408e0c2e3f1/applications/461f28de-8e55-4661-8e68-9ae79ab04581/run/production/
/tenants/855b7183-350c-45cc-b0e8-d408e0c2e3f1/applications/461f28de-8e55-4661-8e68-9ae79ab04581/run/production/risk
/tenants/855b7183-350c-45cc-b0e8-d408e0c2e3f1/applications/461f28de-8e55-4661-8e68-9ae79ab04581/run/production/not-a-route
```
