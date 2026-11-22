# Invoice Matching Desk

Compare invoices, purchase orders and receipts; route discrepancies for review.

An accounts-payable matching workspace: invoice intake, three-way match against purchase orders and receipts, variance detection, discrepancy triage, approval routing, supplier context and an admin panel for audit, imports, integrations and data quality.

**Category:** Finance & Accounting  
**Version:** 1.0.0  
**Template slug:** `invoice-matching-desk`  
**Minimum platform:** 2.1.0-preview.1

## What it does

The Invoice Matching Desk gives AP teams a single queue for invoice intake and exception handling. Each invoice carries supplier, purchase-order and receipt context, a match score and variance results. Discrepancies are categorized by price, quantity, tax, duplicate, missing document or supplier issue, assigned to an owner and routed through review and approval. Managers get match-rate, exception-age and supplier-quality reporting; admins get audit diffs, import/export, integration health, job monitoring, webhook logs and data-quality checks.

The package is data-only: schema, deterministic seed, parameterized queries, widgets, pages, workflows, listeners, cron jobs and roles. Installing it creates tenant-isolated physical tables named `tpl_ap_<tenantShort>_*` and bundles every UI resource through the existing Bundle v1 importer.

## Page map

| Page slug | Title | Access tags |
| --- | --- | --- |
| `ap-invoices-list` | Invoices · list | core, staff, manager, admin |
| `ap-invoices-detail` | Invoices · detail | core, staff, manager, admin |
| `ap-invoices-create` | Create Invoice | core, staff, manager, admin |
| `ap-purchase_orders-list` | Purchase Orders · list | core, staff, manager, admin |
| `ap-purchase_orders-detail` | Purchase Orders · detail | core, staff, manager, admin |
| `ap-purchase_orders-create` | Create Purchase order | core, staff, manager, admin |
| `ap-receipts-list` | Receipts · list | core, staff, manager, admin |
| `ap-receipts-detail` | Receipts · detail | core, staff, manager, admin |
| `ap-receipts-create` | Create Receipt | core, staff, manager, admin |
| `ap-suppliers-list` | Suppliers · list | core, staff, manager, admin |
| `ap-suppliers-detail` | Suppliers · detail | core, staff, manager, admin |
| `ap-suppliers-create` | Create Supplier | core, staff, manager, admin |
| `ap-dashboard` | Dashboard | core, shared, staff, manager, admin, viewer |
| `ap-reports-operations` | Reports · operations | report, manager, admin |
| `ap-reports-secondary` | Reports · secondary mix | report, manager, admin |
| `ap-reports-quality` | Reports · data quality | report, manager, admin |
| `ap-invoices-kanban` | Invoices · kanban | core, staff, manager, admin |
| `ap-invoices-calendar` | Invoices · calendar | core, staff, manager, admin |
| `ap-search` | Global search | shared, staff, manager, admin, viewer |
| `ap-profile` | My profile | shared, staff, manager, admin, viewer, portal |
| `ap-notifications` | Notifications | shared, staff, manager, admin, viewer, portal |
| `ap-settings` | Settings | shared, manager, admin |
| `ap-portal` | Client portal | portal, client, admin, manager |
| `ap-admin-users` | Admin · users | admin, manager |
| `ap-admin-roles` | Admin · roles and permissions | admin |
| `ap-admin-audit` | Admin · audit log | admin, manager |
| `ap-admin-settings` | Admin · system settings | admin |
| `ap-admin-import` | Admin · import / export | admin, manager |
| `ap-admin-integrations` | Admin · integration health | admin |
| `ap-admin-jobs` | Admin · jobs and workflow runs | admin |
| `ap-admin-quality` | Admin · data quality | admin, manager |

## Data model

```mermaid
erDiagram
  INVOICES {
    int id PK
    string invoice_number
    int supplier_id FK
    int po_id FK
    string status
    decimal total_amount
    string currency
    string invoice_date
    string due_date
    datetime received_at
    int match_score
    int discrepancy_count
    int owner_id FK
    string notes
  }
  PURCHASE_ORDERS {
    int id PK
    string po_number
    int supplier_id FK
    string status
    decimal total_amount
    string currency
    datetime issued_at
    string expected_date
    int buyer_id FK
    string department
    string notes
  }
  RECEIPTS {
    int id PK
    string receipt_number
    int po_id FK
    int supplier_id FK
    string status
    string received_date
    decimal total_amount
    string warehouse
    string notes
  }
  SUPPLIERS {
    int id PK
    string name
    string code
    string status
    string contact_name
    string email
    string phone
    string payment_terms
    int lead_time_days
    string tax_id
    string address
  }
  INVOICE_LINES {
    int id PK
    int invoice_id FK
    int line_number
    string description
    int quantity
    decimal unit_price
    decimal line_total
    decimal tax_amount
    string po_line_ref
  }
  PURCHASE_ORDER_LINES {
    int id PK
    int po_id FK
    int line_number
    string sku
    string description
    int quantity
    decimal unit_price
    decimal line_total
    int received_qty
  }
  MATCH_RESULTS {
    int id PK
    int invoice_id FK
    int po_id FK
    int receipt_id FK
    string match_type
    string status
    decimal variance_amount
    decimal variance_pct
    datetime checked_at
    int checked_by_id FK
  }
  DISCREPANCIES {
    int id PK
    int invoice_id FK
    int match_result_id FK
    string severity
    string category
    string status
    int assigned_to_id FK
    decimal amount_impact
    string description
    datetime resolved_at
  }
  SUPPLIERS ||--o{ INVOICES : "supplier_id"
  PURCHASE_ORDERS ||--o{ INVOICES : "po_id"
  STAFF ||--o{ INVOICES : "owner_id"
  SUPPLIERS ||--o{ PURCHASE_ORDERS : "supplier_id"
  STAFF ||--o{ PURCHASE_ORDERS : "buyer_id"
  PURCHASE_ORDERS ||--o{ RECEIPTS : "po_id"
  SUPPLIERS ||--o{ RECEIPTS : "supplier_id"
  INVOICES ||--o{ INVOICE_LINES : "invoice_id"
  PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_LINES : "po_id"
  INVOICES ||--o{ MATCH_RESULTS : "invoice_id"
  PURCHASE_ORDERS ||--o{ MATCH_RESULTS : "po_id"
  RECEIPTS ||--o{ MATCH_RESULTS : "receipt_id"
  STAFF ||--o{ MATCH_RESULTS : "checked_by_id"
  INVOICES ||--o{ DISCREPANCIES : "invoice_id"
  MATCH_RESULTS ||--o{ DISCREPANCIES : "match_result_id"
  STAFF ||--o{ DISCREPANCIES : "assigned_to_id"
  STAFF ||--o{ AUDIT_LOG : actor
  STAFF ||--o{ COMMENTS : author
  STAFF ||--o{ NOTIFICATIONS : recipient
```

The package ships 8 domain tables plus 10 support tables (staff, lookups, audit, comments, attachments, notifications, settings, imports, operations, role matrix).

## Workflows

| Workflow | Purpose | Nodes |
| --- | --- | --- |
| `ap.intake-triage` | Invoices · intake triage | 8 |
| `ap.round-robin-assignment` | Invoices · round-robin assignment | 6 |
| `ap.approval-chain` | Invoices · approval chain | 8 |
| `ap.threshold-sweep` | Invoices · threshold sweep | 6 |
| `ap.daily-digest` | Invoices · daily digest | 5 |
| `ap.escalation` | Invoices · escalation | 7 |
| `ap.integration-sync` | Invoice Matching Desk · integration sync | 6 |
| `ap.document-generation` | Invoices · document generation | 6 |
| `ap.data-collection` | Invoices · supplier/customer follow-up | 4 |
| `ap.error-recovery` | Invoice Matching Desk · expected failure and recovery | 5 |
| `ap.notify-only` | Invoice Matching Desk · notify only | 3 |

### Invoices · intake triage

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["loadRecord<br/><small>dataQuery</small>"]
  n2["scoreRecord<br/><small>javascript</small>"]
  n3["highValue<br/><small>condition</small>"]
  n4["setReview<br/><small>dataQuery</small>"]
  n5["setStandard<br/><small>dataQuery</small>"]
  n6["notifyReview<br/><small>dataQuery</small>"]
  n7["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|success| n3
  n3 -->|review| n4
  n3 -->|standard| n5
  n4 -->|success| n6
  n6 -->|success| n7
  n5 -->|success| n7

### Invoices · round-robin assignment

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["loadStaff<br/><small>dataQuery</small>"]
  n2["pickAssignee<br/><small>javascript</small>"]
  n3["assignOwner<br/><small>dataQuery</small>"]
  n4["notifyOwner<br/><small>dataQuery</small>"]
  n5["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|success| n3
  n3 -->|success| n4
  n4 -->|success| n5

### Invoices · approval chain

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["loadRecord<br/><small>dataQuery</small>"]
  n2["Approve Invoice #{{ ctx.recordID }}<br/><small>approval</small>"]
  n3["setApproved<br/><small>dataQuery</small>"]
  n4["setRejected<br/><small>dataQuery</small>"]
  n5["setExpired<br/><small>dataQuery</small>"]
  n6["notifyDecision<br/><small>dataQuery</small>"]
  n7["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|approved| n3
  n2 -->|rejected| n4
  n2 -->|expired| n5
  n3 -->|success| n6
  n4 -->|success| n6
  n5 -->|success| n6
  n6 -->|success| n7

### Invoices · threshold sweep

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["loadOverdue<br/><small>dataQuery</small>"]
  n2["boundBatch<br/><small>javascript</small>"]
  n3["loopOverdue<br/><small>loop</small>"]
  n4["notifyOverdue<br/><small>dataQuery</small>"]
  n5["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|success| n3
  n3 -->|loop| n4
  n3 -->|completed| n5

### Invoices · daily digest

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["loadStats<br/><small>dataQuery</small>"]
  n2["composeDigest<br/><small>javascript</small>"]
  n3["sendDigest<br/><small>dataQuery</small>"]
  n4["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|success| n3
  n3 -->|success| n4

### Invoices · escalation

flowchart TD
  n0["start<br/><small>start</small>"]
  n1["waitForResponse<br/><small>delay</small>"]
  n2["loadRecord<br/><small>dataQuery</small>"]
  n3["readPriority<br/><small>javascript</small>"]
  n4["needsEscalation<br/><small>condition</small>"]
  n5["notifyEscalation<br/><small>dataQuery</small>"]
  n6["done<br/><small>end</small>"]
  n0 -->|output| n1
  n1 -->|success| n2
  n2 -->|success| n3
  n3 -->|success| n4
  n4 -->|escalate| n5
  n4 -->|normal| n6
  n5 -->|success| n6


Failure behavior: every workflow declares per-node `errorHandling`; external sync and recovery workflows have explicit error edges. Human tasks (approval/dataCollection) suspend with an expiry and resume through the platform's data-collection endpoint. Cron jobs and listeners ship **inactive/disabled** until reviewed.

## Roles and permissions

- **AP Administrator** (`admin`): Full access to every page, query, workflow and admin panel.
- **AP Manager** (`manager`): Owns matching policy, exceptions, approvals and AP reporting.
- **Invoice Matching Specialist** (`specialist`): Works the invoice queue, runs matches and investigates discrepancies.
- **AP Approver** (`approver`): Reviews approved matches and signs off exceptions and payment holds.
- **Read-only Viewer** (`readonly`): Read-only invoice, match and supplier context without workflow execution.

The installer creates tenant-scoped platform roles and grants asset-level Casbin permissions for the pages, queries and workflows in this package. Admin pages are tagged `admin`; the client portal is tagged `portal`. Widget visibility is enforced by page grouping and query execution permissions because the platform has no widget-level RBAC.

## Integrations

- **ERP accounts-payable REST** — required: base URL, API token. Mock: Connector ships disabled with no credentials; seeded invoices and purchase orders are the demo source of truth.
- **Supplier invoice webhook** — required: endpoint path, optional signature header. Mock: POST { "kind": "webhook.received", "record_id": 1 } to the inactive listener to simulate a supplier invoice.
- **OCR document service** — required: endpoint URL, API key. Mock: Invoice files are represented by seeded metadata and attachment URLs until an OCR provider is connected.

## Install

1. Open **Marketplace → App templates**.
2. Select **Invoice Matching Desk** and choose install options (sample data is on by default).
3. Install. The installer creates the schema, seed, resources, roles and (optionally) cron jobs.
4. Reconnect the primary PostgreSQL datasource only if the platform database differs from the tenant's target database; the bundled install injects the platform connection server-side.
5. Review inactive listeners and disabled cron jobs before enabling automation.
6. Open **Dashboard** (or **Client portal** for external roles).

## Quality features

- Audit trigger on every domain and support write, with old/new JSON snapshots.
- Soft delete + restore on domain tables.
- CSV import with validation summary and stored error report.
- CSV export on every list, report and comment/attachment table.
- Saved filter views, bulk actions, comments, attachments, in-app notifications.
- Keyboard-accessible form widget with required/format/min/max validation.
- Empty, loading and error states on every operational page.

## Customization

- **Fields:** edit `schema/001-schema.sql` and the field arrays in the spec, then regenerate.
- **Seed:** edit `seed/001-seed.sql` or the generator spec; dates are relative to `now()`.
- **Queries:** `queries/*.json` are parameterized (`$1...$n`); keep the input definition order in sync with the numbers.
- **Pages/widgets:** `pages/*.json` and `widgets/*.json` use layout v2 and the `{{ state.* }}` binding syntax.
- **Workflows:** `workflows/*.json` use the platform node handlers; edges carry `sourceHandle` values.
- **Regenerate deterministically:** `node marketplace/scripts/generate-templates.js invoice-matching-desk`.

## Known limitations

- Widget-level RBAC is not a platform primitive; use page tags and asset permissions.
- Modal/drawer widgets are not available; detail pages and tabs are used.
- DataCollection API/webhook delivery is not first-class; forms/approval plus webhook listeners are used.
- XLSX export is Excel-compatible CSV; there is no XLSX runtime.
