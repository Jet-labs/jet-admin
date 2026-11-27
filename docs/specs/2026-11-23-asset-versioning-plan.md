# Asset versioning foundation

## Contract

- Drafts remain the mutable source rows and editors.
- `tblAssetVersions` stores immutable, tenant-scoped definition snapshots.
- A version payload contains exact dependency version IDs; it never contains a floating “latest” reference.
- `tblAssetVersionReferences` records dependency edges from a parent asset version or Application release to a child version. Impact review walks these edges transitively.
- Application releases store exact App Page version IDs plus routes/shell, not copies of page/widget/query/workflow/listener definitions.
- Runtime manifests and executions resolve the release’s exact version IDs.
- Datasource version payloads exclude credentials/secrets; runtime connection resolution remains separate.
- Listener/cron activation state remains mutable and separate from definition versions.
- Ordinary saves stay draft-only. Versions are created explicitly from any editor or automatically at the Application publication boundary.
- An Application draft page link may pin an exact page version. Unpinned links capture the latest page version at publish.
- Content-hash reuse prevents duplicate versions when nothing changed. Changed dependencies create child versions and a new parent version.
- History retention must not prune versions referenced by releases, runs, or activations. Reference edges are recorded now; pruning/deletion is not enabled.

## Delivered

1. Generic immutable asset versions for datasource, listener, query, cron job, widget, workflow and App Page definitions.
2. Exact dependency version capture for App Page sources/widgets and workflow query/child-workflow nodes.
3. Content-hash reuse so unchanged dependencies do not create duplicate versions.
4. Thin Application releases containing page version IDs and definition/routes/diagnostics.
5. Runtime manifest assembly from page versions and version-aware query/workflow/listener resolution.
6. Asset version HTTP read/create/impact APIs and tests.
7. A shared per-editor **Versions** dialog for every asset editor: explicit create with change note, immutable history, content hashes, reuse feedback, and transitive **Used by** impact.
8. Application Studio **Version readiness** review: each linked page shows its latest version, its deployed version, exact-version match status, upgrade/new/legacy state, and direct access to page-version impact.
9. Optional exact page-version pinning per linked page: `Latest on publish` or a specific immutable page version. Pins are revision-checked and the release uses the pinned ID; unpinned pages capture latest at publish.
10. Reference recording at version creation and thin-release publication.
11. `node scripts/backfill-asset-version-references.js` (dry-run by default, `--apply` to insert) to reconstruct edges for pre-existing versions/releases without modifying or deleting version rows.
12. Version list responses return metadata only; full payloads remain available through the single-version read API.
13. Opt-in route-query/page-variable binding (`syncPageVariables`): matching page variables initialize from typed route query values and write non-default values back through the application router without remounting the page.
14. Version-to-draft restore with `expectedUpdatedAt` conflict protection. Restore writes only mutable source/draft rows; immutable versions and releases are unchanged.
15. Payload diff against the current draft or another version, bounded to 500 structural changes, using secret-safe comparable fields. Listener diff/restore preserves the datasource binding.
16. Shared Versions dialog actions: create with change note, impact review, compare draft, and restore with confirmation.

## Verification

- Application/appPage/asset-version unit and integration batch: **122 passing** across 13 suites, with 1 PostgreSQL opt-in suite skipped (2 skipped tests). Coverage includes immutable hashes, exact dependency IDs, cycle rejection, permission checks, credential exclusion, direct/transitive impact, release impact filtering, thin release pointers, exact page-version pins, release history summaries, rollback deployment, version diff/restore conflicts, listener datasource restore, and versioned runtime resolution.
- Frontend full suite: **198 passing across 31 suites**. The production build, changed-source ESLint, Prisma validation, and backend `/health` pass. Full-repository ESLint still has the pre-existing unrelated backlog.
- Browser QA on the query editor: Versions opened, created v1 with a change note, auto-expanded the used-by impact panel, and reused v1 on a second unchanged create. Application Studio rendered the Version readiness review.
- Live QA pinned an Application page to page version v1, verified `Pinned · up to date`, published release 3 using the pinned version, and confirmed release history counted both page versions.
- Live QA also verified release history and rollback: published releases 1 and 2, rolled production back to release 1, then published release 3. Release 7/8 later verified rollback and re-deploy of retained releases.
- Live QA version diff/restore: temporary page-title change produced a `CHANGED appPageTitle` diff; UI restore reverted it, version metadata stayed identical, stale restore returned 409, and version/release DELETE attempts returned 404.
- Live QA managed adoption created a distinct App Page clone with shared widgets, rejected a duplicate asset key with 409, and removed the unreleased clone on unlink while leaving the source unchanged.
- Live QA also verified the caller/tenant context is attached before per-asset authorization and that the frontend reads the top-level success envelope.
- The reference and page-pin migrations were applied. Backfill inserted 6 version edges and 1 release edge; all 6 pre-existing immutable versions now have incoming references.
- Live QA smoke published release 2 with one page version, temporarily deployed it, assembled the runtime manifest, executed the pinned query (four SQLite rows), and restored production to release 1. PostgreSQL constraint tests: 2 passing, opt-in and rolled back.

## Not in this slice

- General version garbage collection or deletion. No asset-version delete route exists; unreferenced versions are retained.
- Listener/cron activation reconciliation and generation fencing.
- Worker/Temporal code versioning; only declarative workflow definitions are versioned.
- Live Temporal/Redis/listener-proxy verification.

See the [E2E matrix](2026-11-23-applications-e2e-matrix.md) for normal, edge, complex, and blocked cases.
