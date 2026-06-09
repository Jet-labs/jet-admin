# Jet Admin — Comprehensive Audit & Roadmap

> **Scope:** `packages/datasource-types`, `packages/datasources-logic`, `packages/datasources-ui`, `packages/widgets-ui`, `packages/widgets-logic`, `packages/widget-types`
> **Date:** June 2026

---

## Table of Contents

1. [Datasource Audit — Existing Sources](#1-datasource-audit--existing-sources)
2. [Missing Datasource Configurations & Gaps](#2-missing-datasource-configurations--gaps)
3. [New Datasource Recommendations](#3-new-datasource-recommendations)
4. [Widget Audit — Existing Widgets](#4-widget-audit--existing-widgets)
5. [Missing Widget Events & Configurations](#5-missing-widget-events--configurations)
6. [New Widget Recommendations](#6-new-widget-recommendations)
7. [Full Roadmap (Phased)](#7-full-roadmap-phased)
8. [Testing Methodology](#8-testing-methodology)

---

## 1. Datasource Audit — Existing Sources

### 1.1 SQL Databases

| Source | formConfig | queryConfig | listenerConfig | Connection Test | Execute | Issues Found |
|--------|-----------|-------------|----------------|-----------------|---------|--------------|
| PostgreSQL | ✅ | ✅ | ✅ | ✅ | ✅ | Missing: SSL cert upload, connection pooling params, read replica toggle, query timeout per-query, named prepared statements |
| MySQL | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: SSL cert/key upload, charset config, connection pool size, multi-statement flag |
| MSSQL | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: Windows auth (NTLM), Azure AD auth mode, connection pool, domain field, named instances |
| Oracle | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: Wallet/TNS config, connection pool, SYSDBA mode, LOB handling options |
| SQLite | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: WAL mode toggle, busy_timeout, in-memory DB support flag (only string today), foreign keys pragma |
| CockroachDB | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: cluster topology field, follower reads toggle, retry logic config |
| BigQuery | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: dataset selector, billing project override, max bytes billed, DML support flag, job labels |
| Supabase | ✅ | ✅ | ❌ | ✅ | ✅ | Missing: Realtime listener (critical gap — Supabase has native realtime), storage bucket ops, auth admin ops |

### 1.2 NoSQL / Document Databases

| Source | formConfig | queryConfig | listenerConfig | Execute | Issues Found |
|--------|-----------|-------------|----------------|---------|--------------|
| MongoDB | ✅ | ✅ | ✅ (change streams) | ✅ | Missing: read preference, write concern, collation, explain plan, index hint, session/transaction support |
| Firestore | ✅ | ✅ | ✅ | ✅ | Missing: batch writes, transactions, server timestamp, array-union/remove ops, subcollection query, Firestore emulator toggle |
| Neo4j | ✅ | ✅ | ❌ | ✅ | Missing: bookmark support, read mode (routing), explain/profile queries, multi-database routing |
| Elasticsearch | ✅ | ✅ | ❌ | ✅ | Missing: async search, scroll/search-after pagination, multi-index, index template management, bulk indexing op |
| Airtable | ✅ | ✅ | ❌ | ✅ | Missing: view ID (not just name), offset-based pagination, linked record field handling, formula editor helper, attachment field download |

### 1.3 SaaS / API Sources

| Source | formConfig | queryConfig | Execute | Issues Found |
|--------|-----------|-------------|---------|--------------|
| REST API | ✅ | ✅ | ✅ | Missing: request interceptors, response transformers, retry config, proxy settings, multipart/form-data body, cookie auth, mTLS, pagination cursor helpers |
| GraphQL | ✅ | ✅ | ✅ | Missing: persisted queries, batch requests, file uploads (multipart), fragment library, schema introspection cache |
| Google Sheets | ✅ | ✅ | ❌ | Missing: batch get (multiple ranges), named ranges, conditional formatting write, copy/paste sheet, freeze rows |
| Google Analytics | ✅ | ✅ | ❌ | Missing: GA4 Funnel reports, cohort reports, attribution reports, custom channel groups |
| Stripe | ✅ | ✅ | ❌ (no webhook listener) | Missing: webhook listener, Stripe Connect support, dispute management, radar rules, billing portal |
| Slack | ✅ | ✅ | ❌ | Missing: event listener (RTM/Events API), file uploads, blocks/attachments builder, slash command receiver |
| Jira | ✅ | ✅ | ❌ | Missing: webhook listener, attachments, transitions (workflow), bulk operations, custom field mapping |
| Notion | ✅ | ✅ | ❌ | Missing: block content creation, property type-specific updates, rollup queries, webhook support |
| SendGrid | ✅ | ✅ | ❌ | Missing: webhook event listener (bounces/clicks), template rendering, contact list management |
| Twilio | ✅ | ✅ | ❌ | Missing: webhook listener for inbound SMS/calls, Conversations API, Verify API, video rooms |

### 1.4 Messaging / Streaming

| Source | formConfig | queryConfig | listenerConfig | Issues Found |
|--------|-----------|-------------|----------------|--------------|
| Kafka | ✅ | ✅ | ✅ | Missing: schema registry config, Avro/Protobuf deserialization, exactly-once semantics toggle, consumer lag metric, dead letter queue config |
| RabbitMQ | ✅ | ✅ | ✅ | Missing: dead letter exchange, message TTL on queue, priority queues, shovel/federation config, SSL client cert |
| Redis | ✅ | ✅ | ✅ | Missing: Lua scripting (EVAL), MULTI/EXEC transactions, Redis Sentinel config, ACL user auth, geospatial ops (GEOADD, GEORADIUS) |
| MQTT | ✅ | ✅ | ✅ | Missing: last-will message, clean session toggle, message persistence, TLS client cert |
| NATS | ✅ | ✅ | ✅ | Missing: JetStream config, durable consumer, pull-subscribe mode, message acknowledgment policies |
| WebSocket | ✅ | ✅ | ✅ | Missing: subprotocol negotiation, ping/pong heartbeat config, binary message support, message queue |
| SSE | ✅ | ✅ | ✅ | Missing: reconnection delay config, last-event-id tracking, event name filtering in queryConfig |
| Webhook | ✅ | ✅ | ✅ | Missing: HMAC signature validation, IP allowlist, rate limiting config, retry policy for downstream, payload transformation |
| Syslog | ✅ | ✅ | ✅ | Missing: TCP support (only UDP today), TLS syslog, structured data parsing (RFC5424), log rotation config |

### 1.5 Storage / File

| Source | formConfig | queryConfig | Issues Found |
|--------|-----------|-------------|--------------|
| AWS S3 | ✅ | ✅ | Missing: multipart upload, pre-signed URL generation, object tagging, lifecycle rules, bucket versioning, server-side encryption params |
| Excel/CSV | ✅ | ✅ | Missing: delimiter config for CSV, encoding detection (UTF-8/Latin-1), skip rows config, date format hint, column type overrides, multi-sheet export |

---

## 2. Missing Datasource Configurations & Gaps

### 2.1 Cross-Cutting Gaps (All Datasources)

```
Priority: CRITICAL
```

| Gap | Impact | Effort |
|-----|--------|--------|
| **Connection pooling** — no pool size, idle timeout, or max lifetime on any SQL source | High (memory leaks in prod) | Medium |
| **Query timeout** — per-query timeout override missing on all SQL sources | High | Low |
| **Secrets / environment variable references** — credentials stored in plain text, no `{{env.MY_SECRET}}` binding | Critical (security) | High |
| **Pagination helpers** — no cursor/offset pagination built into queryConfig for REST, GraphQL, Supabase | High | Medium |
| **Response transformers** — no field mapping / JSONPath extractor on query output | High | Medium |
| **Error handling config** — no retry policy, fallback value, or circuit breaker config | Medium | High |
| **SSL certificate upload** — no file picker for CA cert, client cert, client key on any source | High | Medium |
| **Query caching** — no TTL-based caching config on any source | Medium | Medium |
| **Audit logging** — no query logging/history per datasource | Medium | High |
| **Test connection with sample query** — only ping-level test, no schema browse | Medium | Medium |

### 2.2 Datasource-Specific Critical Gaps

#### PostgreSQL
```json
{
  "missing_formConfig_fields": [
    "sslCert (file upload)",
    "sslKey (file upload)",
    "sslCaCert (file upload)",
    "poolMin",
    "poolMax",
    "idleTimeoutMs",
    "statementTimeout",
    "searchPath",
    "applicationName (already exists but no template binding)"
  ],
  "missing_queryConfig_fields": [
    "queryTimeout",
    "fetchSize (for large result sets)",
    "transactionIsolation",
    "readOnly toggle",
    "namedStatement"
  ],
  "missing_features": [
    "LISTEN/NOTIFY already supported but no payload schema validation",
    "COPY TO/FROM support",
    "Stored procedure / function call helper",
    "Explain plan viewer"
  ]
}
```

#### REST API
```json
{
  "missing_formConfig_fields": [
    "proxyUrl",
    "proxyAuth",
    "clientCert (mTLS)",
    "retryCount",
    "retryDelay",
    "retryOnStatusCodes",
    "responseEncoding",
    "cookieJar (persist cookies across requests)"
  ],
  "missing_queryConfig_fields": [
    "paginationType (none | offset | cursor | link-header)",
    "paginationConfig { pageParam, sizeParam, cursorPath, nextLinkPath }",
    "responseTransform (JSONPath expression)",
    "multipart body support",
    "rawBody (binary/base64)",
    "preRequestScript",
    "postResponseScript"
  ]
}
```

#### Supabase
```json
{
  "missing_features": [
    "Realtime listener (channels, broadcast, presence) — CRITICAL for a realtime product",
    "Storage: upload, download, list, delete, getPublicUrl",
    "Auth: listUsers, inviteUser, updateUser, deleteUser (admin)",
    "Edge Functions invocation",
    "PostgREST advanced operators (full-text search, range types)"
  ]
}
```

#### Elasticsearch
```json
{
  "missing_queryConfig_fields": [
    "searchAfter (cursor pagination for deep results)",
    "pit (point-in-time API)",
    "highlightConfig",
    "suggester config (term, phrase, completion)",
    "aggregation builder (UI for bucket/metric aggs)",
    "knnSearch (vector/semantic search)"
  ]
}
```

---

## 3. New Datasource Recommendations

### 3.1 Tier 1 — Critical for Enterprise & Analytics

#### A. Snowflake
**Why:** #1 cloud data warehouse for enterprise analytics. Most enterprise data teams use it.
```json
{
  "formConfig": {
    "account": "string (org-account.snowflakecomputing.com)",
    "username": "string",
    "password": "password",
    "privateKey": "textarea (RSA private key for key-pair auth)",
    "warehouse": "string",
    "database": "string",
    "schema": "string",
    "role": "string",
    "authenticator": "enum [snowflake, externalbrowser, oauth, keypair]"
  },
  "queryConfig": {
    "queryType": "enum [sql, storedProcedure]",
    "query": "code-sql",
    "warehouse": "string (override per query)",
    "timeout": "integer",
    "multiStatement": "boolean",
    "inputDefinitions": "array"
  },
  "listenerConfig": null,
  "package": "snowflake-sdk"
}
```

#### B. Databricks (Spark SQL)
**Why:** Standard for ML/AI pipelines and lakehouse architecture. Used by 60%+ of Fortune 500.
```json
{
  "formConfig": {
    "host": "string (<workspace>.azuredatabricks.net)",
    "token": "password (PAT)",
    "httpPath": "string (/sql/1.0/warehouses/<id>)",
    "catalog": "string",
    "schema": "string"
  },
  "queryConfig": {
    "query": "code-sql",
    "catalog": "string (override)",
    "schema": "string (override)",
    "inputDefinitions": "array"
  },
  "package": "@databricks/sql"
}
```

#### C. Amazon Redshift
**Why:** Dominant AWS data warehouse. Enterprises with AWS stack require it.
```json
{
  "formConfig": {
    "connectionOption": "enum [connectionDetails, connectionString, iamRole]",
    "host": "string",
    "port": "integer (5439)",
    "database": "string",
    "user": "string",
    "password": "password",
    "ssl": "boolean",
    "iamRoleArn": "string (for IAM auth)",
    "clusterIdentifier": "string",
    "dbUser": "string"
  },
  "queryConfig": "same as PostgreSQL (Redshift is pg-wire compatible)",
  "package": "pg (with Redshift-specific dialect hints)"
}
```

#### D. ClickHouse
**Why:** Fastest OLAP DB for real-time analytics. Used by Cloudflare, Uber, GitHub for event analytics.
```json
{
  "formConfig": {
    "host": "string",
    "port": "integer (8123 HTTP / 9000 native)",
    "database": "string",
    "username": "string",
    "password": "password",
    "protocol": "enum [http, https, native]",
    "compression": "boolean",
    "maxExecutionTime": "integer"
  },
  "queryConfig": {
    "query": "code-sql",
    "queryId": "string (idempotency)",
    "settings": "code-json",
    "inputDefinitions": "array"
  },
  "package": "@clickhouse/client"
}
```

#### E. Google BigQuery (Enhancement) → Looker Studio / Looker API
**Why:** Many enterprises using BigQuery also use Looker. A Looker datasource would let admins embed looks/dashboards and run explores directly.

#### F. Pinecone (Vector Database)
**Why:** Critical for AI/LLM-powered apps. Enables semantic search, RAG pipelines, similarity queries.
```json
{
  "formConfig": {
    "apiKey": "password",
    "environment": "string (deprecated) or host",
    "indexName": "string"
  },
  "queryConfig": {
    "operation": "enum [query, upsert, delete, fetch, update, describeIndexStats]",
    "vector": "code-json (embedding array)",
    "topK": "integer",
    "namespace": "string",
    "filter": "code-json",
    "includeMetadata": "boolean",
    "includeValues": "boolean"
  },
  "package": "@pinecone-database/pinecone"
}
```

#### G. Weaviate / Qdrant (Vector DBs alternative)
Similar to Pinecone but self-hosted. Important for enterprises with data residency requirements.

### 3.2 Tier 2 — Important for Specific Enterprise Verticals

#### H. Salesforce
**Why:** CRM standard for sales/marketing teams. Essential for RevOps dashboards.
```json
{
  "formConfig": {
    "instanceUrl": "string",
    "authType": "enum [usernamePassword, oauth2, jwtBearer]",
    "clientId": "string",
    "clientSecret": "password",
    "username": "string",
    "password": "password",
    "securityToken": "string",
    "apiVersion": "string (v59.0)"
  },
  "queryConfig": {
    "queryType": "enum [soql, sosl, rest, bulk]",
    "query": "code-sql",
    "objectName": "string",
    "operation": "enum [query, create, update, upsert, delete]",
    "externalIdField": "string (for upsert)"
  },
  "package": "jsforce"
}
```

#### I. HubSpot
**Why:** Second most common CRM. Marketing and sales teams need it for pipeline/reporting dashboards.
```json
{
  "formConfig": {
    "apiKey": "password (private app token)",
    "portalId": "string"
  },
  "queryConfig": {
    "resource": "enum [contacts, companies, deals, tickets, properties, owners, pipelines, emails]",
    "operation": "enum [list, get, create, update, delete, search, batch]",
    "filters": "code-json",
    "properties": "string (comma-separated)",
    "limit": "integer"
  },
  "package": "@hubspot/api-client"
}
```

#### J. Azure Synapse Analytics / Azure SQL
**Why:** Microsoft-stack enterprises with Azure Synapse require dedicated support beyond generic MSSQL.

#### K. Dbt (dbt Cloud / dbt Core)
**Why:** Standard for data transformation. Admins need to trigger runs, query semantic layer, browse models.
```json
{
  "formConfig": {
    "apiKey": "password",
    "accountId": "string",
    "projectId": "string",
    "environmentId": "string",
    "baseUrl": "string (cloud.getdbt.com or self-hosted)"
  },
  "queryConfig": {
    "operation": "enum [triggerRun, getRunStatus, getJobStatus, querySemanticLayer, listModels]",
    "jobId": "string",
    "steps": "array",
    "semanticLayerQuery": "code-sql"
  },
  "package": "axios (REST)"
}
```

#### L. Apache Flink / Flink SQL Gateway
**Why:** Real-time stream processing. Enterprises running Flink pipelines need query/monitoring capabilities.

#### M. Prometheus + Alertmanager
**Why:** Standard for infrastructure monitoring. SRE teams need Prometheus query support in dashboards.
```json
{
  "formConfig": {
    "baseUrl": "string",
    "authType": "enum [none, bearer, basic]",
    "bearerToken": "password",
    "username": "string",
    "password": "password"
  },
  "queryConfig": {
    "queryType": "enum [instant, range, series, labels, labelValues, targets, alerts, rules]",
    "query": "string (PromQL)",
    "startTime": "string",
    "endTime": "string",
    "step": "string",
    "timeout": "string"
  },
  "package": "axios (REST)"
}
```

#### N. OpenAI / Anthropic / Azure OpenAI
**Why:** AI-native admin panels need to invoke LLMs, process documents, and run embeddings inline.
```json
{
  "formConfig": {
    "provider": "enum [openai, anthropic, azure-openai, ollama, custom]",
    "apiKey": "password",
    "baseUrl": "string (for azure/custom)",
    "apiVersion": "string (azure)",
    "model": "string (default model)"
  },
  "queryConfig": {
    "operation": "enum [chat, complete, embed, transcribe, generateImage, moderate]",
    "messages": "code-json",
    "systemPrompt": "textarea",
    "model": "string (override)",
    "temperature": "number",
    "maxTokens": "integer",
    "tools": "code-json (function calling)",
    "responseFormat": "enum [text, json_object]"
  }
}
```

#### O. Linear
**Why:** Growing replacement for Jira in engineering teams. Issue tracking, cycles, projects.

#### P. PagerDuty / OpsGenie
**Why:** On-call management. DevOps dashboards need to create/acknowledge incidents, query on-call schedules.

### 3.3 Tier 3 — Specialized / Emerging

| Datasource | Use Case | Package |
|-----------|----------|---------|
| Apache Cassandra | Time-series, high-write workloads | `cassandra-driver` |
| ScyllaDB | Cassandra-compatible high-perf | `cassandra-driver` |
| DynamoDB | AWS NoSQL, serverless apps | `@aws-sdk/client-dynamodb` |
| Cosmos DB | Azure NoSQL | `@azure/cosmos` |
| TimescaleDB | IoT/metrics time-series (pg extension) | `pg` |
| InfluxDB | IoT/metrics TSDB | `@influxdata/influxdb-client` |
| CrateDB | Distributed SQL for IoT | `pg` |
| Hasura | GraphQL over Postgres with admin API | GraphQL client |
| PlanetScale | MySQL-compatible serverless DB | `mysql2` |
| Neon | Serverless Postgres | `pg` |
| Turso (libSQL) | Distributed SQLite | `@libsql/client` |
| Zendesk | Customer support ticketing | `axios` |
| Intercom | Customer messaging | `axios` |
| Mixpanel | Product analytics | `axios` |
| Amplitude | Product analytics | `axios` |
| Segment | CDP / event stream | `axios` |
| Datadog | Metrics + logs + APM | `axios` |
| GitHub | Code, issues, PRs, actions | `octokit` |
| GitLab | Same as GitHub | `axios` |
| QuickBooks | Accounting/finance | OAuth2 + REST |
| Xero | Accounting (UK/AU/NZ) | `xero-node` |
| Shopify | eCommerce | `@shopify/shopify-api` |
| WooCommerce | eCommerce | REST |
| Box / Dropbox / OneDrive | File storage | SDK per provider |

---

## 4. Widget Audit — Existing Widgets

### 4.1 Table Widget
**Current state:** Solid foundation. TanStack Table, pagination, search, export, multi-select, bulk edit, inline editing.

**Missing configurations:**
```json
{
  "display": {
    "rowHeight": "enum [compact, default, comfortable, auto]",
    "stickyHeader": "boolean (currently always sticky)",
    "stickyColumns": "integer (number of left columns to freeze)",
    "columnResizing": "boolean",
    "columnReordering": "boolean (drag to reorder)",
    "columnVisibilityToggle": "boolean (show/hide columns UI)",
    "stripedRows": "boolean",
    "showGridLines": "boolean",
    "rowNumberColumn": "boolean",
    "emptyStateMessage": "string",
    "emptyStateTemplate": "template"
  },
  "data": {
    "defaultSortColumn": "string",
    "defaultSortDirection": "enum [asc, desc]",
    "defaultPageSize": "integer",
    "pageSizeOptions": "array",
    "virtualScrolling": "boolean (for 10k+ rows)",
    "serverSideSort": "boolean",
    "refreshInterval": "integer (auto-refresh ms)"
  },
  "columns": {
    "columnType": "enum [text, number, currency, percentage, boolean, date, datetime, badge, image, link, button, progress, rating, json]",
    "columnFormat": "string (format string per type)",
    "columnAlignment": "enum [left, center, right]",
    "columnWidth": "integer | 'auto'",
    "columnMinWidth": "integer",
    "columnMaxWidth": "integer",
    "columnSortable": "boolean",
    "columnFilterable": "boolean",
    "columnTooltipTemplate": "template",
    "columnHref": "template (for link type)",
    "columnHrefTarget": "enum [_self, _blank]",
    "columnBadgeConfig": "object { colorMap: {value: color} }",
    "columnSummary": "enum [none, sum, avg, min, max, count]"
  },
  "actions": {
    "rowActions": "array [{ label, icon, variant, href, workflow, confirmMessage, showCondition }]",
    "headerActions": "array [{ label, icon, variant, workflow }]",
    "rowClickAction": "enum [none, selectRow, openDetails, navigate, workflow]",
    "rowDoubleClickAction": "same"
  },
  "filtering": {
    "columnFilters": "boolean (per-column filter inputs)",
    "globalFilterDebounce": "integer",
    "filterPersistence": "enum [none, url, localStorage]"
  }
}
```

**Missing events:**
- `onSort` — fires when column sort changes, payload: `{ column, direction }`
- `onColumnFilter` — per-column filter change
- `onColumnResize` — column width changed
- `onCellClick` — individual cell clicked
- `onRowDoubleClick`
- `onRowHover` — (for preview panels)
- `onRowAction` — fires for any configured row action, payload: `{ actionKey, row }`

### 4.2 Vega / Vega-Lite Widget
**Current state:** Good base. vega-embed, shelf builder, raw JSON editor, template autocomplete.

**Missing configurations:**
```json
{
  "interaction": {
    "selectionType": "enum [none, single, multi, interval]",
    "selectionCallback": "boolean (fire onSelect event)",
    "tooltipRenderer": "enum [default, custom]",
    "customTooltipTemplate": "template"
  },
  "display": {
    "padding": "integer | object",
    "background": "string",
    "title": "string (already in shelf but not in raw mode editor shortcut)",
    "titleFontSize": "integer",
    "legend": "boolean",
    "legendPosition": "enum",
    "exportButton": "boolean (show download PNG/SVG)",
    "fullscreenButton": "boolean"
  },
  "data": {
    "refreshInterval": "integer",
    "loadingStrategy": "enum [spinner, skeleton, lastData]"
  }
}
```

**Missing events:**
- `onSelect` — Vega selection/param change, payload: `{ name, value }` (signal listener exists in code but not wired to fireWidgetEvent)
- `onView` — vega view initialized (already `onWidgetInit` but not standardized)

### 4.3 Button Widget
**Current state:** Simple. text, variant, size, isLoading.

**Missing configurations:**
```json
{
  "icon": "string (Lucide icon name)",
  "iconPosition": "enum [left, right, only]",
  "fullWidth": "boolean",
  "confirmDialog": {
    "enabled": "boolean",
    "title": "template",
    "message": "template",
    "confirmLabel": "string",
    "cancelLabel": "string",
    "variant": "enum [default, destructive]"
  },
  "disabledCondition": "template (expression)",
  "disabledTooltip": "string",
  "loadingText": "string",
  "href": "template (turns button into a link)",
  "hrefTarget": "enum [_self, _blank]",
  "tooltip": "string",
  "keyboardShortcut": "string (e.g. ctrl+s)"
}
```

**Missing events:**
- `onHover` — mouse enter/leave, useful for preview panels
- `onLongPress` — useful for mobile
- `onRightClick` — context menu trigger

### 4.4 Form Widget
**Current state:** Dynamic fields: text, email, password, number, checkbox, select.

**Missing configurations:**
```json
{
  "layout": "enum [vertical, horizontal, grid]",
  "gridColumns": "integer",
  "labelPosition": "enum [top, left, floating]",
  "autoFocus": "boolean",
  "validateOnBlur": "boolean",
  "validateOnChange": "boolean",
  "schema": "code-json (JSON Schema validation)",
  "successMessage": "template",
  "errorMessage": "template",
  "loadingState": "template"
}
```

**Missing field types:**
```
- textarea (multi-line text)
- richtext (WYSIWYG)
- date (date picker integration)
- dateRange (date range picker integration)
- file (file upload)
- multiselect (multi-value dropdown)
- combobox (searchable select)
- radio (radio group)
- toggle (switch)
- slider (number range)
- colorPicker
- jsonEditor
- codeEditor
- rating
- address (structured address fields)
- phone (phone number with country code)
```

**Missing events:**
- `onValidationError` — payload: `{ field, error, formData }`
- `onReset` — form was reset
- `onFocus` — field focused, payload: `{ field }`
- `onBlur` — field blurred

### 4.5 Text/Markdown Widget
**Current state:** Custom markdown parser, template expressions.

**Missing configurations:**
```json
{
  "overflow": "enum [scroll, truncate, expand]",
  "maxLines": "integer (for truncate)",
  "copyButton": "boolean",
  "linkTarget": "enum [_self, _blank]",
  "sanitizeHtml": "boolean (currently using dangerouslySetInnerHTML without sanitization — SECURITY GAP)",
  "customCSS": "string"
}
```

**Critical Security Gap:** `dangerouslySetInnerHTML` is used directly in `textWidget.jsx` with no HTML sanitization. User-controlled template data can inject XSS. Need `DOMPurify` or similar.

### 4.6 Stat / KPI Widget
**Missing configurations:**
```json
{
  "sparkline": {
    "enabled": "boolean",
    "data": "template (array of numbers)",
    "color": "string",
    "type": "enum [line, bar, area]"
  },
  "comparison": {
    "enabled": "boolean",
    "comparisonValue": "template",
    "comparisonLabel": "string (e.g. vs last month)"
  },
  "icon": "string (Lucide icon name)",
  "iconColor": "string",
  "iconBackground": "string",
  "numberFormat": {
    "locale": "string",
    "notation": "enum [standard, compact, scientific, engineering]",
    "minimumFractionDigits": "integer",
    "maximumFractionDigits": "integer"
  },
  "colorThresholds": "array [{ value, color, label }] (conditional color based on value)",
  "clickable": "boolean",
  "drilldownLink": "template"
}
```

### 4.7 Alert Widget
**Missing configurations:**
```json
{
  "icon": "string (custom icon override)",
  "showIcon": "boolean",
  "actions": "array [{ label, variant, workflow }]",
  "autoDismissAfter": "integer (ms)",
  "position": "enum [inline, top-fixed, bottom-fixed]",
  "maxWidth": "string",
  "border": "boolean",
  "shadow": "boolean",
  "conditionTemplate": "template (show/hide based on expression)"
}
```

### 4.8 Date/DateTime Pickers
**Missing configurations:**
```json
{
  "minDate": "template",
  "maxDate": "template",
  "disabledDates": "template (array of dates or function)",
  "disabledDaysOfWeek": "array [0-6]",
  "firstDayOfWeek": "enum [0-6]",
  "locale": "string",
  "outputFormat": "string (moment.js/date-fns format string)",
  "inputFormat": "string",
  "clearable": "boolean (already has X but not configurable)",
  "inline": "boolean (always show calendar, no popover)",
  "showWeekNumbers": "boolean",
  "todayButton": "boolean",
  "shortcuts": "array [{ label, value }]"
}
```

### 4.9 HTML Widget
**Security Review:** The `HtmlWidget` uses `srcDoc` with `sandbox` attribute correctly. However:
- `allow-same-origin` could enable localStorage access if enabled — the config description is misleading
- `postMessage` protocol for `onMessage` event requires `widgetID` matching — good design but no schema validation
- Missing: `onLoad` event for iframe, height auto-resize option, communication API documentation

---

## 5. Missing Widget Events & Configurations

### 5.1 Comprehensive Event Audit

The `WIDGET_EVENT_TYPES` in `widget-types/src/index.js` is missing these events:

```javascript
// Should be added to WIDGET_EVENT_TYPES:

COMMON: [
  // Currently has: onClick, onRefresh, onLoad
  { value: "onMount", label: "On Mount", desc: "Fires once when widget first renders" },
  { value: "onUnmount", label: "On Unmount", desc: "Fires when widget is removed from DOM" },
  { value: "onError", label: "On Error", desc: "Fires when widget encounters an error" },
  { value: "onStateChange", label: "On State Change", desc: "Fires when widgetState changes" },
]

// Missing entirely:
"vega-lite": [
  { value: "onSelect", label: "On Select", desc: "Vega selection/signal fires", 
    inputDefinitions: [{ key: "event.selection", description: "Selected data items" }] }
]

"stat": [
  { value: "onClick", label: "On Click", desc: "KPI card clicked",
    inputDefinitions: [{ key: "event.value", description: "Current stat value" }] }
]

"text": [
  { value: "onLinkClick", label: "On Link Click", desc: "Markdown link clicked",
    inputDefinitions: [{ key: "event.href", description: "Clicked link URL" }] }
]

"date-picker": [
  // Already good, missing:
  { value: "onInvalid", label: "On Invalid", desc: "Invalid date entered" }
]

"image": [
  { value: "onClick", label: "On Click", desc: "Image clicked" }, // exists in component but not in types
  { value: "onError", label: "On Error", desc: "Image failed to load" },
  { value: "onLoad", label: "On Load", desc: "Image finished loading" }
]

"iframe": [
  { value: "onLoad", label: "On Load", desc: "IFrame content loaded" },
  { value: "onMessage", label: "On Message", desc: "IFrame sent a postMessage" }
]

"form": [
  { value: "onValidationError" }, // missing from WIDGET_EVENT_TYPES even though field exists
  { value: "onReset" }
]
```

### 5.2 Widget Methods Audit

`WIDGET_METHODS` in `widget-types/src/index.js` is missing methods for:

```javascript
{
  "button": [
    { name: "click", description: "..." }, // exists
    { name: "disable", description: "Programmatically disable button" },  // missing
    { name: "enable", description: "Programmatically enable button" },    // missing
    { name: "setLoading", description: "Set loading state" }              // missing
  ],
  "form": [
    { name: "submit", description: "Programmatically submit form" },
    { name: "reset", description: "Reset all fields to defaults" },
    { name: "setFieldValue", description: "Set a specific field value" },
    { name: "setFieldError", description: "Show validation error on field" },
    { name: "getValues", description: "Return current form values" }
  ],
  "stat": [
    { name: "refresh", description: "Re-evaluate templates" }
  ],
  "date-picker": [
    { name: "setValue", description: "Set the selected date programmatically" },
    { name: "clear", description: "Clear the selected date" },
    { name: "open", description: "Open the date picker popover" },
    { name: "close", description: "Close the date picker popover" }
  ],
  "date-range-picker": [
    { name: "setRange", description: "Set start and end dates" },
    { name: "clear", description: "Clear the range" }
  ],
  "html": [
    { name: "refresh", description: "..." }, // exists
    { name: "postMessage", description: "Send a message to the iframe" }  // missing — critical
  ],
  "text": [
    { name: "scrollTo", description: "Scroll to a position or anchor" }
  ]
}
```

---

## 6. New Widget Recommendations

### 6.1 Tier 1 — Critical for Enterprise App Building

#### A. Rich Data Grid (Enhanced Table)
Distinct from the current table — an Excel-like grid with:
- Cell-level formula support
- Frozen rows + columns
- Column grouping (multi-level headers)
- Row grouping with aggregations
- Column auto-sizing
- Virtual scrolling (100k+ rows)
- Sparklines in cells
- Conditional formatting rules
- Copy/paste from clipboard
- Right-click context menu
- In-cell dropdowns / date pickers

**Suggested library:** `AG Grid Community` or `@glideapps/glide-data-grid`

#### B. Kanban Board
Standard for project management, CRM pipeline stages, support queue management.
```json
{
  "config": {
    "dataTemplate": "template (array of cards)",
    "columnField": "string (field determining column)",
    "columns": "array [{ id, label, color, icon, limit }]",
    "cardTitleField": "string",
    "cardDescriptionField": "string",
    "cardTagsField": "string",
    "cardAvatarField": "string",
    "cardPriorityField": "string",
    "cardColorField": "string",
    "draggable": "boolean",
    "collapsibleColumns": "boolean",
    "addCardEnabled": "boolean",
    "columnLimits": "boolean (WIP limits)",
    "swimlanes": "string (field for grouping rows)"
  },
  "events": [
    "onCardMove (oldColumn, newColumn, card, newIndex)",
    "onCardClick (card)",
    "onCardAdd (column)",
    "onColumnAdd",
    "onColumnDelete"
  ]
}
```

#### C. Timeline / Gantt Chart
Project management, release planning, resource scheduling.
```json
{
  "config": {
    "tasksTemplate": "template",
    "titleField": "string",
    "startField": "string",
    "endField": "string",
    "groupField": "string",
    "progressField": "string (0-100)",
    "dependenciesField": "string (array of task IDs)",
    "colorField": "string",
    "view": "enum [day, week, month, quarter, year]",
    "today": "boolean (highlight today)",
    "editable": "boolean (drag to resize/move)"
  },
  "events": ["onTaskClick", "onTaskResize", "onTaskMove", "onViewChange"]
}
```

#### D. Calendar Widget
Scheduling, event management, appointment booking.
```json
{
  "config": {
    "eventsTemplate": "template",
    "titleField": "string",
    "startField": "string",
    "endField": "string",
    "colorField": "string",
    "allDayField": "boolean",
    "view": "enum [month, week, day, agenda]",
    "defaultDate": "template",
    "editable": "boolean",
    "selectable": "boolean (drag to create)",
    "slotDuration": "string (HH:mm)",
    "businessHours": "object"
  },
  "events": ["onEventClick", "onEventCreate", "onEventResize", "onEventDrop", "onDateClick", "onViewChange"],
  "library": "@fullcalendar/react"
}
```

#### E. Map Widget (Geographic Visualization)
Location-based data visualization for logistics, field ops, sales territory, etc.
```json
{
  "config": {
    "mapType": "enum [markers, heatmap, choropleth, routes, clusters]",
    "dataTemplate": "template",
    "latField": "string",
    "lngField": "string",
    "labelField": "string",
    "colorField": "string",
    "sizeField": "string",
    "popupTemplate": "template (HTML per marker)",
    "center": "object { lat, lng }",
    "zoom": "integer",
    "provider": "enum [mapbox, googleMaps, leaflet, openStreetMap]",
    "apiKey": "string (for Mapbox/Google)"
  },
  "events": ["onMarkerClick", "onMapClick", "onBoundsChange", "onZoomChange"]
}
```

#### F. Tree / Hierarchy Widget
Org charts, file system browsers, category trees, BOM (Bill of Materials).
```json
{
  "config": {
    "dataTemplate": "template",
    "idField": "string",
    "parentIdField": "string",
    "labelField": "string",
    "iconField": "string",
    "badgeField": "string",
    "expandedByDefault": "boolean | integer (depth)",
    "selectable": "enum [none, single, multi]",
    "checkboxes": "boolean",
    "draggable": "boolean",
    "searchable": "boolean",
    "contextMenu": "array [{ label, workflow }]",
    "loadChildrenAsync": "boolean"
  },
  "events": ["onNodeSelect", "onNodeExpand", "onNodeCollapse", "onNodeDrop", "onNodeContextMenu"]
}
```

#### G. Chart Builder (Recharts/ECharts based)
A simpler alternative to Vega for non-technical users with point-and-click chart configuration:
- Bar, Line, Area, Pie, Donut, Scatter, Radar, Funnel
- Each with full styling options
- Dual-axis support
- Annotations
- Drill-down support
- ECharts provides better out-of-box interactivity than Vega-Lite

#### H. Metric / Dashboard Cards (Grid)
A compound widget rendering multiple KPIs in a responsive grid — not just one stat but a configurable grid of stats with sparklines.

#### I. Filter Bar / Query Builder Widget
A toolbar widget for building complex filter conditions visually — outputs a filter object consumed by other widgets.
```json
{
  "config": {
    "fields": "array [{ key, label, type, options }]",
    "layout": "enum [horizontal, vertical, dropdown]",
    "outputVariable": "string (state variable to write to)",
    "defaultFilters": "code-json"
  },
  "events": ["onChange (filters object)"]
}
```

### 6.2 Tier 2 — Highly Useful

#### J. Rich Text Editor (WYSIWYG)
For creating content, notes, documentation within admin panels. TipTap or Quill.

#### K. Code Editor Widget (Monaco)
Display/edit code, SQL queries, JSON configs. Monaco already used internally — expose as widget.

#### L. File Upload / Dropzone Widget
```json
{
  "config": {
    "accept": "string (mime types)",
    "maxSize": "integer (bytes)",
    "maxFiles": "integer",
    "multiple": "boolean",
    "dragDrop": "boolean",
    "preview": "boolean",
    "uploadUrl": "template",
    "uploadMethod": "enum [POST, PUT]",
    "uploadHeaders": "array",
    "storageType": "enum [s3, supabase, custom]",
    "storageDatasource": "string"
  },
  "events": ["onUploadStart", "onUploadProgress", "onUploadComplete", "onUploadError", "onFileRemove"]
}
```

#### M. JSON Viewer / Tree Widget
Read-only or editable JSON with syntax highlighting, collapse/expand, search, copy path.

#### N. Timeline (Vertical Event Log)
Audit logs, activity feeds, user history. Different from Gantt — a vertical list of timestamped events.

#### O. Progress Steps / Stepper
Order status, onboarding flows, multi-step approvals.

#### P. Chat / Message Thread Widget
Customer support queues, internal team communication, AI chat interface (connects to OpenAI datasource).

#### Q. Number Input / Slider Widget
Range selector for numeric inputs, pricing configurators, resource allocation.

#### R. Tabs / Accordion Container Widget
Layout widgets that contain other widgets — for organizing complex dashboards.

#### S. Notification / Toast System Widget
Programmatic notifications triggered by workflow events.

#### T. Signature Pad Widget
For forms requiring e-signatures in legal/HR/compliance apps.

---

## 7. Full Roadmap (Phased)

### Phase 1 — Security & Stability (Weeks 1–4)

**Priority: CRITICAL — Must ship before enterprise customers**

| Task | Component | Owner Area |
|------|-----------|-----------|
| Add `DOMPurify` sanitization to `TextWidget` | widgets-ui | Security |
| Secret/env variable binding for datasource credentials | datasource-types | Security |
| SSL certificate file upload for PostgreSQL, MySQL, MongoDB, Redis | datasource-types | Security |
| Webhook HMAC signature validation | datasources-logic/webhook | Security |
| HTML widget sandbox documentation + `allow-same-origin` warning | widgets-ui | Security |
| Connection pooling for all SQL datasources | datasources-logic | Stability |
| Per-query timeout override for all SQL datasources | datasource-types + logic | Stability |
| Error handling config (retry, fallback) for REST API | datasources-logic | Stability |

### Phase 2 — Datasource Configuration Completeness (Weeks 5–10)

**Priority: HIGH — Unblocks enterprise use cases**

| Task | Effort | Impact |
|------|--------|--------|
| Supabase Realtime listener | High | Critical |
| REST API: pagination cursor helpers, response transformer | Medium | High |
| REST API: multipart/form-data body support | Low | High |
| PostgreSQL: stored procedure call helper | Low | Medium |
| Airtable: view ID picker, linked record handling | Medium | Medium |
| MongoDB: read preference, write concern, transactions | Medium | Medium |
| Elasticsearch: scroll/search-after, bulk indexing | Medium | High |
| Kafka: schema registry + Avro/Protobuf | High | High |
| S3: pre-signed URL generation, multipart upload | Medium | High |
| All datasources: query caching with TTL | High | Medium |

### Phase 3 — Tier 1 New Datasources (Weeks 8–16)

| Datasource | Weeks | Complexity |
|-----------|-------|-----------|
| Snowflake | 2 | Medium |
| ClickHouse | 2 | Medium |
| Amazon Redshift | 1 | Low (pg-wire) |
| Databricks SQL | 2 | Medium |
| Pinecone (Vector DB) | 2 | Low |
| Salesforce | 3 | High |
| HubSpot | 2 | Medium |
| Prometheus | 1 | Low |
| OpenAI / Anthropic | 2 | Low-Medium |

### Phase 4 — Widget Enhancements (Weeks 8–14, parallel with Phase 3)

| Widget | Enhancement | Priority |
|--------|-------------|---------|
| Table | Column types (badge, link, progress, image) | Critical |
| Table | Row actions (configurable per-row buttons) | Critical |
| Table | Column sorting/filtering events | High |
| Table | Virtual scrolling | High |
| Table | Sticky columns | Medium |
| Form | Missing field types (textarea, date, file, multiselect) | Critical |
| Form | JSON Schema validation | High |
| Button | Confirm dialog | High |
| Button | Disabled condition expression | High |
| Stat | Sparkline | High |
| Stat | Conditional color thresholds | High |
| Vega | onSelect event wired to fireWidgetEvent | High |
| All | refreshInterval config | Medium |

### Phase 5 — Tier 1 New Widgets (Weeks 14–24)

| Widget | Weeks | Library | Impact |
|--------|-------|---------|--------|
| Filter Bar / Query Builder | 2 | Custom | Critical |
| Rich Data Grid | 4 | AG Grid Community | Critical |
| Chart Builder (ECharts) | 3 | apache-echarts | High |
| Kanban Board | 3 | @dnd-kit | High |
| Calendar | 2 | @fullcalendar/react | High |
| Map Widget | 3 | mapbox-gl / leaflet | High |
| File Upload | 2 | react-dropzone | High |
| Tree/Hierarchy | 2 | Custom | Medium |
| Gantt/Timeline | 3 | dhtmlx-gantt | Medium |

### Phase 6 — Tier 2 New Datasources (Weeks 16–28)

Cosmos DB, DynamoDB, InfluxDB, TimescaleDB, Linear, GitHub, Zendesk, Mixpanel, Amplitude, Shopify, dbt.

### Phase 7 — Tier 2 New Widgets (Weeks 24–36)

Rich Text Editor, Code Editor Widget, JSON Viewer, Timeline (event log), Stepper, Chat Widget, Notification System, Tabs/Accordion Container.

---

## 8. Testing Methodology

### 8.1 Datasource Testing Strategy

#### Unit Tests (`jest`)

Each datasource needs:

```javascript
// Template: packages/datasources-logic/src/data-sources/<name>/__tests__/
// datasource.test.js

describe('XxxDataSource', () => {
  describe('execute()', () => {
    it('should return rows for a valid query', async () => { ... })
    it('should throw on invalid credentials', async () => { ... })
    it('should throw on SQL syntax error', async () => { ... })
    it('should handle empty result set', async () => { ... })
    it('should resolve template args from context', async () => { ... })
    it('should close connection on error (no leaks)', async () => { ... })
  })
  
  describe('subscribe()', () => {
    it('should call onEvent for each message', async () => { ... })
    it('should handle reconnection', async () => { ... })
  })
  
  describe('unsubscribe()', () => {
    it('should clean up resources', async () => { ... })
  })
})

// connection.test.js
describe('testConnection()', () => {
  it('should return ok: true for valid credentials', async () => { ... })
  it('should return ok: false for invalid credentials', async () => { ... })
  it('should return ok: false for unreachable host', async () => { ... })
  it('should return ok: false for wrong database', async () => { ... })
})
```

#### Integration Tests (Docker Compose)

Create `docker-compose.test.yml` with real service instances:

```yaml
# packages/datasources-logic/docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15
    environment: { POSTGRES_DB: test, POSTGRES_PASSWORD: test }
    ports: ["5433:5432"]
  
  mysql-test:
    image: mysql:8
    environment: { MYSQL_DATABASE: test, MYSQL_ROOT_PASSWORD: test }
    ports: ["3307:3306"]
  
  mongodb-test:
    image: mongo:7
    ports: ["27018:27017"]
  
  redis-test:
    image: redis:7
    ports: ["6380:6379"]
  
  elasticsearch-test:
    image: elasticsearch:8.12.0
    environment: { "discovery.type": single-node, "xpack.security.enabled": "false" }
    ports: ["9201:9200"]
  
  kafka-test:
    image: confluentinc/cp-kafka:7.5.0
    ports: ["9093:9092"]
  
  rabbitmq-test:
    image: rabbitmq:3-management
    ports: ["5673:5672"]
```

```bash
# Test script
npm run test:integration -- --runInBand --forceExit
```

#### Contract Tests (Datasource Config Validation)

```javascript
// packages/datasource-types/src/__tests__/
// Validate every formConfig and queryConfig against their JSON Schema

import { DATASOURCE_TYPES } from '../index.js'
import Ajv from 'ajv'

const ajv = new Ajv()

Object.entries(DATASOURCE_TYPES).forEach(([key, ds]) => {
  describe(`${key} formConfig`, () => {
    it('schema compiles without errors', () => {
      expect(() => ajv.compile(ds.formConfig.schema)).not.toThrow()
    })
    
    it('default data validates against schema', () => {
      const validate = ajv.compile(ds.formConfig.schema)
      // Default data may be intentionally incomplete — check required fields exist in schema
      const requiredFields = ds.formConfig.schema.required || []
      requiredFields.forEach(field => {
        expect(ds.formConfig.schema.properties).toHaveProperty(field)
      })
    })
    
    it('uischema elements reference valid property scopes', () => {
      // Walk uischema elements and verify scope paths exist in schema
    })
  })
})
```

#### E2E Tests (Playwright)

```javascript
// tests/e2e/datasources/
// Test the full datasource UI flow

test('PostgreSQL datasource creation', async ({ page }) => {
  await page.goto('/admin/datasources/new')
  await page.click('[data-testid="datasource-type-postgresql"]')
  await page.fill('[name="connectionDetails.host"]', 'localhost')
  await page.fill('[name="connectionDetails.database"]', 'test')
  await page.fill('[name="connectionDetails.user"]', 'test')
  await page.fill('[name="connectionDetails.password"]', 'test')
  await page.click('[data-testid="test-connection"]')
  await expect(page.locator('[data-testid="connection-result"]')).toContainText('Connected')
})
```

#### Security Tests

```javascript
// SQL Injection tests
const injectionPayloads = [
  "'; DROP TABLE users; --",
  "1 OR 1=1",
  "1; SELECT * FROM pg_user",
]

injectionPayloads.forEach(payload => {
  it(`should reject SQL injection: ${payload}`, async () => {
    // Verify parameterized queries prevent injection
    const source = new PostgreSQLDataSource(config)
    await expect(source.execute({ query: `SELECT * FROM users WHERE id = ${payload}` }))
      .rejects.toThrow() // Should use parameterized queries
  })
})
```

### 8.2 Widget Testing Strategy

#### Unit Tests (React Testing Library)

```javascript
// packages/widgets-ui/src/<widget>/__tests__/
// Example: tableWidget.test.jsx

import { render, screen, fireEvent, within } from '@testing-library/react'
import { TableWidget } from '../tableWidget'

const mockData = {
  data: [
    { id: 1, name: 'Alice', status: 'active' },
    { id: 2, name: 'Bob', status: 'inactive' },
  ],
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ],
  pagination: { enabled: false },
}

describe('TableWidget', () => {
  describe('Rendering', () => {
    it('renders column headers', () => {
      render(<TableWidget data={mockData} />)
      expect(screen.getByText('Name')).toBeInTheDocument()
    })
    
    it('renders data rows', () => {
      render(<TableWidget data={mockData} />)
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
    
    it('renders empty state when no data', () => {
      render(<TableWidget data={{ data: [], columns: [], pagination: { enabled: false } }} />)
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    })
    
    it('shows loading overlay when isLoading is true', () => {
      render(<TableWidget data={{ ...mockData, isLoading: true }} />)
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })
  
  describe('Events', () => {
    it('fires onRowSelect when row is clicked', () => {
      const fireWidgetEvent = jest.fn()
      render(<TableWidget data={mockData} fireWidgetEvent={fireWidgetEvent} />)
      fireEvent.click(screen.getByText('Alice'))
      expect(fireWidgetEvent).toHaveBeenCalledWith('onRowSelect', {
        row: { id: 1, name: 'Alice', status: 'active' },
        rowIndex: 0,
      })
    })
    
    it('fires onPageChange with correct payload', () => {
      const fireWidgetEvent = jest.fn()
      const paginatedData = { ...mockData, pagination: { enabled: true, totalRows: 100 } }
      render(<TableWidget data={paginatedData} fireWidgetEvent={fireWidgetEvent} />)
      fireEvent.click(screen.getByTitle('Next page'))
      expect(fireWidgetEvent).toHaveBeenCalledWith('onPageChange', {
        page: 2, pageSize: expect.any(Number), offset: expect.any(Number)
      })
    })
  })
  
  describe('Multi-select', () => {
    it('shows checkbox column when multiSelect is enabled', () => {
      const data = { ...mockData, multiSelect: { enabled: true, showSelectAll: true } }
      render(<TableWidget data={data} />)
      expect(screen.getAllByRole('checkbox')).toHaveLength(3) // header + 2 rows
    })
  })
  
  describe('Search', () => {
    it('filters rows client-side when search is enabled and serverSide is false', async () => {
      const data = { ...mockData, search: { enabled: true, serverSide: false } }
      render(<TableWidget data={data} />)
      fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Alice' } })
      await screen.findByText('Alice')
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })
  })
  
  describe('Export', () => {
    it('triggers client-side CSV export', () => {
      const data = { ...mockData, export: { enabled: true, format: 'csv', serverSide: false } }
      const createObjectURL = jest.fn()
      global.URL.createObjectURL = createObjectURL
      render(<TableWidget data={data} />)
      fireEvent.click(screen.getByText('Export'))
      expect(createObjectURL).toHaveBeenCalled()
    })
  })
  
  describe('Inline Editing', () => {
    it('shows edit button when editing is enabled', () => {
      const data = { ...mockData, editing: { enabled: true }, 
        columns: [{ key: 'name', label: 'Name', editable: true }] }
      render(<TableWidget data={data} />)
      expect(screen.getAllByTitle('Edit row')).toHaveLength(2)
    })
    
    it('fires onRowSave with correct payload', () => {
      const fireWidgetEvent = jest.fn()
      const data = { ...mockData, editing: { enabled: true },
        columns: [{ key: 'name', label: 'Name', editable: true }] }
      render(<TableWidget data={data} fireWidgetEvent={fireWidgetEvent} />)
      
      fireEvent.click(screen.getAllByTitle('Edit row')[0])
      const input = screen.getByDisplayValue('Alice')
      fireEvent.change(input, { target: { value: 'Alice Updated' } })
      fireEvent.click(screen.getByTitle('Save'))
      
      expect(fireWidgetEvent).toHaveBeenCalledWith('onRowSave', expect.objectContaining({
        rowIndex: 0,
        changes: { name: 'Alice Updated' },
      }))
    })
  })
  
  describe('Accessibility', () => {
    it('table has proper ARIA roles', () => {
      render(<TableWidget data={mockData} />)
      expect(screen.getByRole('table')).toBeInTheDocument() // currently no role — gap to fix
    })
    
    it('column headers have scope attribute', () => {
      render(<TableWidget data={mockData} />)
      const headers = screen.getAllByRole('columnheader')
      headers.forEach(h => expect(h).toHaveAttribute('scope', 'col'))
    })
  })
})
```

#### Visual Regression Tests (Storybook + Chromatic)

```javascript
// packages/widgets-ui/src/<widget>/<widget>.stories.jsx

export default {
  title: 'Widgets/Table',
  component: TableWidget,
  parameters: { chromatic: { viewports: [375, 768, 1440] } }
}

export const Default = { args: { data: mockData } }
export const WithPagination = { args: { data: { ...mockData, pagination: { enabled: true, totalRows: 150 } } } }
export const WithSearch = { args: { data: { ...mockData, search: { enabled: true } } } }
export const Loading = { args: { data: { ...mockData, isLoading: true } } }
export const Empty = { args: { data: { data: [], columns: mockData.columns, pagination: { enabled: false } } } }
export const MultiSelect = { args: { data: { ...mockData, multiSelect: { enabled: true } } } }
```

#### Performance Tests

```javascript
// packages/widgets-ui/src/table/__tests__/table.perf.test.jsx

import { render } from '@testing-library/react'
import { performance } from 'perf_hooks'

it('renders 1000 rows within 200ms', () => {
  const largeData = {
    data: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}`, email: `user${i}@example.com` })),
    columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
    pagination: { enabled: false },
  }
  
  const start = performance.now()
  render(<TableWidget data={largeData} />)
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(200)
})
```

### 8.3 Test Infrastructure Setup

```
packages/
├── datasources-logic/
│   ├── src/data-sources/<name>/__tests__/
│   │   ├── datasource.test.js       # Unit with mocked DB clients
│   │   ├── datasource.int.test.js   # Integration (real Docker services)
│   │   └── connection.test.js       # Connection test unit
│   ├── jest.config.js
│   └── docker-compose.test.yml
│
├── datasource-types/
│   └── src/__tests__/
│       └── configs.validation.test.js  # JSON Schema validation
│
└── widgets-ui/
    ├── src/<widget>/__tests__/
    │   ├── <widget>.test.jsx           # Unit + behavior
    │   └── <widget>.stories.jsx        # Storybook stories
    ├── jest.config.js
    └── .storybook/

tests/
├── e2e/
│   ├── datasources/                    # Playwright datasource flows
│   └── widgets/                        # Playwright widget interactions
├── security/
│   ├── sql-injection.test.js
│   ├── xss-prevention.test.jsx
│   └── credential-exposure.test.js
└── performance/
    ├── widget-render.perf.test.jsx
    └── datasource-query.perf.test.js
```

### 8.4 CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage --ci
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:15, env: { POSTGRES_PASSWORD: test } }
      mysql: { image: mysql:8, env: { MYSQL_ROOT_PASSWORD: test } }
      mongodb: { image: mongo:7 }
      redis: { image: redis:7 }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx playwright install --with-deps
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }
  
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build-storybook
      - uses: chromaui/action@v1
        with: { projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }} }
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - run: npm run test:security
```

### 8.5 Quality Gates

| Metric | Threshold |
|--------|-----------|
| Unit test coverage (datasources-logic) | ≥ 80% |
| Unit test coverage (widgets-ui) | ≥ 70% |
| Integration test pass rate | 100% |
| E2E test pass rate | 100% |
| Visual regression diff | 0 unexpected |
| Lighthouse performance score (widgets) | ≥ 85 |
| npm audit critical vulns | 0 |
| Bundle size regression | < 5% increase per PR |

---

*End of audit. Estimated total engineering effort: ~6–9 months for Phases 1–5 with a team of 3–4 engineers.*
