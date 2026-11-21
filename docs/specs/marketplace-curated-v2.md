# Marketplace quality rebuild — first tranche

## Why this replaces the approach, not just the descriptions

The previous 436-entry catalog repeats a family name across four incomplete
resource definitions. Its JSON review report is not install/render/runtime
evidence. That catalog does **not** satisfy the requested quality bar.

The replacement is authored around jobs a user needs to do. Bundle entries
include datasource/query/workflow/widget/page dependencies, actual widget
contracts, a supported v2 page layout and explicit runtime bindings. A focused
widget comes with a small companion page rather than an orphaned expression.

## Current tranche: 36 entries

- 9 operational workspaces: fulfillment, fraud review, treasury close,
  incident response, supply planning, contract/replay lab, public enrichment,
  subscription retention/dunning, SLA escalation.
- 12 playbooks covering child-workflow scoring, payment/stock/risk gates,
  bounded loops and exception isolation, parallel queries/barrier joins,
  human approvals with rejection/expiry, severity switches, durable cooldown,
  validated human intake, error compensation, subscription dunning and
  privileged-access recertification.
- 10 focused panels with their required queries, controls and preview pages:
  master/detail queue, revenue trend, customer anomalies, receivables aging,
  settlement KPI, service health, supplier scorecard, event intake, replay
  timeline and boundary-contract grid.
- 4 datasource/query packs: native GitHub, GraphQL country enrichment,
  World Bank REST and an embedded relational commerce warehouse.
- One credentialed PostgreSQL admin app containing a real datasource, two
  read-only `information_schema` queries, instructions, a count widget and a
  table catalog. It requires reconnect, but is dependency-complete and never
  renders as an empty page.
  - Table pagination is server-side: the query accepts numeric `limit`/`offset`,
    page defaults are `15`/`0`, the table emits `onPageChange`, and that action
    re-runs the `tables` query with `event.pageSize`/`event.offset`. The total
    page count comes from the separate table-count query via `totalTemplate`.

These are not 36 independent SaaS connectors. They are a mixture of reusable
operational components, playbooks and complete applications.

## Honest operating modes

- **Demo:** embedded DuckDB/SQLite synthetic fixtures. Workflows generate
  proposals/audit evidence; they do not send emails, charge cards, revoke
  access, place purchase orders or change external tickets.
- **Public API:** configured read-only queries, invoked manually. No credentials
  embedded. Network/provider failures must be shown, not replaced with fake data.
- Human approvals/intake suspend until input or expiry. Simulated signal tests
  do not prove live Temporal behavior.

Each bundle includes `marketplace.root`, `mode`, `features`, `setup`,
`sampleInputs`, `limitations` and pending verification metadata. `isVerified`
defaults to false. Definitions and local tests are not sufficient to award a
production-ready badge.

## Install selection

The preview API returns every bundled asset with `dependsOn`, `requiredBy`,
`selected` and `missingDependencies`. The tenant dialog renders a dependency-aware
checklist: selecting an asset selects its dependencies; clearing an asset clears
its dependents. The install request sends the exact selected `<type>:<uuid>` keys.
Preview recomputes missing references against the selected subset, so the user
can deliberately install a subset and is warned instead of silently receiving a
broken bundle.

Only the curated tranche is listed in tenant stores. The 436 original generated
placeholders remain stored for operator review but are excluded by default;
operators can pass `includeLegacy=true` to inspect them.

## Our own broken PostgreSQL install

The old `postgresql-admin-app` row was a page-only v1 placeholder with fake grid
blocks and no widgets, queries or real datasource — so an install rendered blank.
`scripts/repair-legacy-postgres-app.js` installs the curated bundle into the same
tenant, verifies the exact legacy signature, backs up the old page, swaps in the
real v2 page config and removes only the duplicate page it just created. It is a
dry run unless `--apply` is passed and aborts on concurrent edits. This repairs
the existing tenant asset rather than deleting it.

## Publication and preservation

`node scripts/seed-marketplace.js` is a no-connection dry run.
`node scripts/seed-marketplace.js --apply` publishes this tranche idempotently.
It refuses to overwrite a user-published row and preserves install counts and
unchanged operator verification.

`--apply --unverify-generated` additionally backs up and removes the false
verification claim **only** on old built-in rows whose publisher is `jet-admin`,
publisher user ID is null and bundle generator is `marketplace-catalog`.
No records or installed tenant resources are deleted.

## Verification required

1. Validate actual widget contracts, complete dependency closure, source aliases,
   query types, bounded graphs and supported page layouts.
2. Execute embedded SQL via QueryEngine and workflow branches via real node
   handlers/DSL (with the transport/timer simulation explicitly recorded).
3. Exercise import ID remapping; an original UUID must not remain in a page
   binding or workflow reference after clone.
4. Install and render in a QA tenant; exercise selection/filter/form/result flows.
5. Verify live Temporal suspension/resumption and public provider queries
   separately. Do not call code review or mocked transport manual browser QA.

All testing is assigned to DeepSeek V4.1 Flash. Evidence lives in
`reports/marketplace-curated-v2/`, separate from the invalid old completion claim.

## Remaining scope

**The 400–500 substantive-item objective is not yet achieved.** This tranche
establishes a higher-quality baseline; it must not be padded by renaming recipes
or by retaining old placeholders in the count. Further packs should include
distinct subscription cohorts, support operations, release governance,
procurement matching, logistics SLAs, cloud cost controls, data quality,
security/compliance and documented credentialed production integrations.
