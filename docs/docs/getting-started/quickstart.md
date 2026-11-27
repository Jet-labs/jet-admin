---
title: Quickstart
description: Build, publish, and observe a complete Jet Admin application in 20–40 minutes.
sidebar_position: 2
---

# Quickstart

This tutorial builds **Order Ops**, a small internal application with:

- a PostgreSQL datasource and a saved order query;
- a Data Table widget bound to that query;
- two app pages (Overview and Orders);
- an application shell with two routes and automatic navigation;
- an immutable release deployed to the `production` environment;
- a verification and cleanup pass.

```mermaid
flowchart LR
    A["1. Setup<br/>tenant · demo data · datasource"] --> B["2. Query<br/>saved SQL + test"]
    B --> C["3. Build<br/>widget · Orders page · Overview page"]
    C --> D["4. Compose<br/>application · routes · preview"]
    D --> E["5. Release<br/>publish · deploy · observe"]
```

**Time budget:** 20–40 minutes once the stack runs; first Docker/Firebase setup takes longer.

:::info Before you start
Complete [Local Setup](local-setup.md), confirm `http://localhost:8090/health` is OK,
and sign in. You need a tenant Admin account. The tutorial assumes a local Docker
stack where the backend can reach PostgreSQL at host `postgres`; native installs use
`localhost` instead.
:::

![Jet Admin home](/img/screenshots/home.png)

## Step 1 — Create a tenant (3 min)

1. Sign in.
2. Open the tenant selector and choose **Add tenant**.
3. Enter a name, for example `Acme Ops`.
4. Submit.

**Expected:** the new tenant opens with empty module drawers. Any signed-in user can
create a tenant; the creator becomes the tenant Admin and receives full access on the
new tenant.

:::note Why a tenant first
Datasources, queries, listeners, workflows, widgets, pages, applications, folders, and
API keys all carry a `tenantID`. There is no useful build surface outside a tenant.
:::

## Step 2 — Add demo data (5 min)

### Option A — Separate PostgreSQL database (recommended)

Create a dedicated database so the tutorial never touches the platform's system
schema:

```bash
docker exec -it jet-admin-postgres psql -U postgres -c "CREATE DATABASE jet_demo;"
```

If the database already exists, that error is safe to ignore. Create the table:

```sql
CREATE TABLE IF NOT EXISTS demo_orders (
  order_id      serial PRIMARY KEY,
  customer_name text NOT NULL,
  status        text NOT NULL CHECK (status IN ('new', 'paid', 'fulfilled', 'refunded')),
  amount_cents  integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

TRUNCATE demo_orders RESTART IDENTITY;

INSERT INTO demo_orders (customer_name, status, amount_cents, created_at) VALUES
  ('Ada Lovelace',   'paid',      12900, now() - interval '6 days'),
  ('Grace Hopper',   'fulfilled', 8400,  now() - interval '5 days'),
  ('Alan Turing',    'new',       21500, now() - interval '3 days'),
  ('Katherine Johnson', 'paid',   5600,  now() - interval '2 days'),
  ('Edsger Dijkstra','refunded',  3200,  now() - interval '1 day'),
  ('Margaret Hamilton', 'fulfilled', 17800, now() - interval '4 hours');
```

Save it as `demo.sql`, then:

```bash
docker exec -i jet-admin-postgres psql -U postgres -d jet_demo < demo.sql
# PowerShell: Get-Content demo.sql | docker exec -i jet-admin-postgres psql -U postgres -d jet_demo
```

Verify:

```bash
docker exec -it jet-admin-postgres psql -U postgres -d jet_demo -c "SELECT status, count(*) FROM demo_orders GROUP BY status ORDER BY status;"
```

**Expected:** six rows across `new`, `paid`, `fulfilled`, and `refunded`.

### Option B — Excel / CSV datasource

If you cannot create a database, use the **Excel / CSV** datasource instead:

1. Create a CSV with the same columns and rows.
2. Add a datasource of type **Excel / CSV** and upload the file.
3. Use the generated table name in the query in Step 4.

The rest of the tutorial is the same; only the datasource type and query syntax
change.

## Step 3 — Connect the datasource (4 min)

1. Open the tenant's **Data sources** drawer.
2. Choose **Add data source**.
3. Name it `Demo Orders DB`.
4. Select type **PostgreSQL**.
5. Enter the connection string:

   **Docker backend:**

   ```text
   postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres:5432/jet_demo
   ```

   **Native backend:**

   ```text
   postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/jet_demo
   ```

   Replace `YOUR_POSTGRES_PASSWORD` with the `POSTGRES_PASSWORD` from `.env`.

6. Run **Test** and save.

**Expected:** a successful connection message and the datasource in the list.

:::warning Credentials are encrypted, not disposable
Datasource secrets are encrypted at rest with `VAULT_ENCRYPTION_KEY`. If that key is
missing or later rotated without re-encrypting stored credentials, connection tests
and query execution fail. Keep the key stable for the life of the data.
:::

## Step 4 — Create and test a query (5 min)

1. Open **Queries**.
2. Choose **Add query**.
3. Name it `Orders list`.
4. Select the `Demo Orders DB` datasource.
5. Keep query type **Raw SQL** and enter:

   ```sql
   SELECT
     order_id,
     customer_name,
     status,
     amount_cents / 100.0 AS amount,
     created_at
   FROM demo_orders
   ORDER BY created_at DESC;
   ```

6. Use **Test query**.
7. Enable **Run on load** and save.

**Expected:** six rows, newest first, with a numeric `amount`.

**Optional input argument.** Add an input definition named `status` of type `string`
and use `{{inputs.status}}` in the `WHERE` clause. The query engine resolves
`{{inputs.*}}` server-side before dispatching to the connector. Treat interpolated
values as trusted builder input; for untrusted values, use the connector's
parameterized mode or constrain values at the database layer.

:::tip Query failures are isolated
A failed query populates an error state in the page runtime; it does not crash the
whole page. Test every saved query before binding it to a widget.
:::

## Step 5 — Create a Data Table widget (5 min)

1. Open **Widgets**.
2. Choose **Add widget**.
3. Name it `Orders table`.
4. Select type **Data Table**.
5. Set the JavaScript data bindings:

   | Field | Value |
   |---|---|
   | Data Array Template | `{{ state.queries.orders.data }}` |
   | Total Count Template | `{{ state.queries.orders.data.length }}` |
   | Is Loading Template | `{{ state.queries.orders.isLoading }}` |

6. Add columns for `order_id`, `customer_name`, `status`, `amount`, and `created_at`,
   or use **Auto-detect** after a data preview is available.
7. Save.

**Expected:** the widget editor preview renders the six rows once a page provides an
`orders` query alias. The widget itself is page-agnostic; the alias is defined on the
page in the next step.

:::note Aliases are the contract
The widget refers to `state.queries.orders`, not to a query ID. That is what makes it
reusable across pages: each page must define an `orders` alias bound to a query that
returns the expected shape.
:::

## Step 6 — Build the Orders app page (5 min)

1. Open **App Pages**.
2. Choose **Add app page**.
3. Name it `Orders`.
4. Open the page editor.
5. In the **Data** tab, choose **Add data source**.
6. Configure:

   | Field | Value |
   |---|---|
   | Alias / Reference Name | `orders` |
   | Source Type | `Data Query` |
   | Select Query | `Orders list` |
   | Trigger Mode | `Auto (Fetch on load)` |

7. Use the fetch/run control and confirm the preview reports six rows.
8. Open the **Widgets** tab, drag `Orders table` onto the canvas, and resize it to a
   useful width.
9. Save the page.

**Expected:** the editor's live preview (or the pinned page viewer) shows the orders table with data.

![App page builder](/img/screenshots/app-page-builder.png)

:::tip Page variables are not query arguments by default
A data source can be `auto`, `reactive`, or `manual`. Use `reactive` when the query
depends on a page variable such as a status filter; use `manual` for expensive or
side-effecting operations triggered by a widget event.
:::

## Step 7 — Build the Overview page (3 min)

The second page makes navigation visible and proves the shell routes between pages.

1. Open **Widgets** and create `Overview text` of type **Text / Markdown**.
2. Set the content to something like:

   ```markdown
   # Order Operations

   Use **Orders** to inspect the current order queue.
   ```

3. Save the widget.
4. Open **App Pages** and create a page named `Overview`.
5. Drag `Overview text` onto the page and save.

**Expected:** a simple page with a heading and one line of text.

## Step 8 — Compose the application (6 min)

1. Open **Applications**.
2. Choose **New application**.
3. Enter:
   - **Application name:** `Order Ops`
   - **URL slug:** `order-ops`
4. Choose **Create application**. Studio opens with an empty draft.

### Link both pages

In **Linked pages**:

1. Select the `Overview` page.
2. Keep ownership as **Referenced shared page**.
3. Set the page key to `overview-page`.
4. Choose **Link shared page**.
5. Repeat for `Orders` with page key `orders-page`.

Page keys are stable route identifiers: lowercase letters, numbers, underscores, or hyphens, starting with a letter.

### Add routes

In **Routes**:

1. Route ID `overview`, Path `/`, Linked page `overview-page`, then
   **Add route to draft**.
2. Route ID `orders`, Path `/orders`, Linked page `orders-page`, then
   **Add route to draft**.

Adding a route automatically appends a navigation item, and the first parameterless
route becomes the shell home route. Drag the route rows to reorder navigation, or use
the up/down arrow keys on the drag handle.

3. Open **Navigation & shell** to adjust branding, item style, and per-route labels if
   desired.
4. Choose **Save draft**.

**Expected:** the draft shows two linked pages, two routes, and a two-item navigation
shell. Conceptually each route is `{ "id": "orders", "path": "/orders", "pageAssetKey": "orders-page" }`.

:::note Parameterized routes are deep links
A route such as `/orders/:orderID` is valid, but the Studio does not add parameterized
routes to parameterless navigation automatically. Link to them from widget navigation
actions instead.
:::

### Preview the composition

Choose **Preview composition**.

**Expected:** the shell, navigation, and page placements render. Composition preview
**does not execute data sources**; it is a structural check, not a data test. Query
execution happens in the deployed runtime.

## Step 9 — Publish and deploy (3 min)

1. Confirm the draft is saved and validation passes.
2. In the **Production** section, choose **Publish & deploy**.
3. Wait for the release confirmation.

**Expected:**

- Studio reports a release number (starting at 1) compiled and deployed.
- **Production** shows the current release, content hash, page-version count, and
  timestamp.
- **Release history** lists the release with a **Production** badge.
- **Open runtime** navigates to the production runtime URL:

  ```text
  http://localhost/tenants/<tenantID>/applications/<applicationID>/run/production
  ```

What publishing does:

- captures immutable versions of changed linked pages and their dependencies;
- stores exact page-version pointers in the release;
- deploys a thin release to the `production` environment by moving the production
  pointer;
- keeps older releases for deploy/rollback. Rollback moves only the pointer; it does
  not reverse external side effects.

:::warning Environment bindings
If the release captured datasource IDs that do not exist in the target environment,
configure **Environment bindings** before relying on runtime queries. Bindings map
captured datasource IDs to live tenant datasources of the same type. Credentials stay
live and are never embedded in a release.
:::

## Step 10 — Verify and observe (4 min)

### Runtime checks

Open the production runtime and verify:

| Check | Expected |
|---|---|
| `/` route | Overview page renders. |
| Navigation item `orders` | Navigates to `/orders` without a full reload. |
| Orders table | Loads six rows from `demo_orders`. |
| Browser refresh on `/orders` | Route resolves directly (deep link). |
| Unknown path | Not-found route renders without changing the URL. |
| Browser tab title | Uses the route title, then the page title. |

### Builder-side observation

| Where | What to look for |
|---|---|
| **Production** | Current release number, hash, page-version count, runtime warnings. |
| **Release history** | Deploy/rollback controls; older releases remain immutable. |
| **Run history** | Workflow runs captured with release provenance. This is empty for a query-only app. |
| **Audit logs** | Recent API activity for the tenant. The audit buffer flushes in batches, so allow a few seconds. |
| **Backend health** | `curl http://localhost:8090/health` |
| **Listener proxy health** | `curl http://localhost:8095/health` if the stack includes it. |

:::note "Run history" is not a query log
Application **Run history** reports workflow runs with route/page/alias/release
provenance. Query-only data sources do not appear there. Use audit logs and the
backend logs for API-level observation, and the workflow run pages for workflow-level
observation.
:::

## What you built

| Layer | Artifact | Why it matters |
|---|---|---|
| Tenant | `Acme Ops` | Isolation and authorization boundary. |
| Connection | `Demo Orders DB` | Encrypted credential + connector configuration. |
| Query | `Orders list` | Reusable, testable read model. |
| Widget | `Orders table` | Reusable presentation bound by alias. |
| Pages | `Orders`, `Overview` | Canvas + data-source bindings (variables when needed). |
| Application | `Order Ops` | Routes, navigation, shell, state, policy, releases. |
| Release | Release 1 in production | Immutable page-version pointers + deploy pointer. |

## Cleanup

### Keep the install, remove the demo

1. To keep the tenant: remove the two routes, unlink both pages, then choose
   **Archive**. The application is retained; there is no release delete route, and
   version/release history is intentionally immutable.
2. Delete the demo pages, widgets, query, and datasource.
3. Drop the demo database:

   ```bash
   docker exec -it jet-admin-postgres psql -U postgres -c "DROP DATABASE IF EXISTS jet_demo;"
   ```

### Remove everything in the tenant

Deleting the tenant cascades to its datasources, queries, widgets, pages,
applications, listeners, and Casbin policies. This is irreversible. Export anything
worth keeping as a [bundle](../platform/export-import-bundles.md) first.

### Reset the whole local stack

```bash
docker compose -f docker-compose-sample.yml down -v --remove-orphans
```

This deletes the application database and all other local volumes. Set
`SEED_DATABASE=true` before the next start. See
[Reset and clean commands](local-setup.md#7-reset-and-clean-commands).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Datasource test fails with `ECONNREFUSED` | Wrong host for the backend runtime | Docker backend uses `postgres:5432`; native uses `localhost:5432`. |
| Datasource test fails with password/auth error | Wrong `POSTGRES_PASSWORD` or database name | Recheck `.env` and the connection string. |
| Query test returns zero rows | Wrong database/table, or data was truncated | Run the verification `SELECT` via `psql`. |
| Page shows "no data" but the query works | Alias mismatch | The widget must reference `state.queries.orders`; the page alias must be `orders`. |
| Widget renders but remains loading | `isLoading` expression wrong or query never triggered | Check trigger mode is `auto`; confirm the alias. |
| Application preview is empty | Preview is composition-only | Use the deployed runtime to execute data sources. |
| Publish is disabled | Draft is dirty or validation failed | Save the draft, fix validation, then publish. |
| Runtime query fails after deploy | Datasource binding missing in the environment | Configure **Environment bindings** and redeploy/retry. |
| Navigation item missing | Route path contains a parameter | Parameterized routes are deep links, not automatic nav items. |
| 403 on a page or query | Missing asset permission or role | Check the tenant role and asset grants; creator access is granted at creation. |

## Next steps

- Add a real workflow: [Workflows](../workflows/workflows.md).
- Go deeper on routes, state, and releases: [Applications](../applications/applications.md).
- Add real-time ingress: [Listeners](../listeners/listeners.md).
- Learn the widget and page model: [App Pages & Widgets](../app-pages-widgets/app-pages-widgets.md).
- Add roles and scoped API keys: [Identity & Access Management](../identity-access-management/identity-access-management.md).
- Move the app between tenants: [Export & Import Bundles](../platform/export-import-bundles.md).
- Compare the platform with alternatives: [Market Comparison](../comparisons/market-comparison.md).
