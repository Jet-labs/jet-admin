/**
 * Centralized Datasource Manifest Registry
 * Provides LLM-readable metadata for the agent to understand each datasource type.
 * 
 * Each manifest has:
 * - name: Human readable
 * - description: LLM context on what data this source typically contains
 * - capabilities: ['read', 'write', 'aggregate', 'filter']
 * - queryInstructions: How to write queries for this datasource type
 * - exampleQueries: Few-shot examples
 * - semanticHints: Field-level semantic explanations
 */

// ============================================================
// SQL DATABASES
// ============================================================

const postgresqlManifest = {
  name: "PostgreSQL",
  description: `A relational SQL database. Use this when the user asks about structured 
    transactional data — bookings, orders, users, restaurants, inventory, appointments, 
    payments stored directly in the database. Supports complex JOINs, GROUP BY aggregations, 
    date range filters, and COUNT/SUM/AVG operations. Best for historical data analysis 
    and reporting.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write standard PostgreSQL SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM schema.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Always schema-qualify tables: public.bookings NOT just bookings
    - Use $1, $2 for parameterized values mapped to args array
    - Date ranges: use >= and <= or BETWEEN on timestamp/date columns
    - For aggregations, always include a human-readable alias: SUM(amount) as total_amount
    - Never use SELECT * — always specify columns
    - Amounts stored in paise (integer) — divide by 100 for INR display
    
    Template syntax for dynamic args: {{args.paramName}}
  `,
  exampleQueries: [
    {
      description: "Total bookings and revenue for a restaurant in a date range",
      dataQueryOptions: {
        query: `SELECT 
          COUNT(*) as total_bookings,
          SUM(p.amount)/100 as revenue_inr,
          DATE(b.created_at) as booking_date
        FROM public.bookings b
        JOIN public.payments p ON p.booking_id = b.booking_id
        WHERE b.restaurant_id = $1
          AND b.created_at >= $2
          AND b.created_at <= $3
        GROUP BY DATE(b.created_at)
        ORDER BY booking_date`,
        args: [
          { key: "restaurantId", type: "string" },
          { key: "startDate", type: "string" },
          { key: "endDate", type: "string" }
        ]
      }
    }
  ],
  semanticHints: {
    amount: "Stored in paise (smallest currency unit). Divide by 100 for INR.",
    status: "Common values: CONFIRMED, PENDING, CANCELLED, REFUNDED",
    created_at: "Timezone-aware timestamp. Use TIMESTAMPTZ comparisons.",
    restaurant_id: "UUID foreign key. Usually filterable from context."
  }
};

const mysqlManifest = {
  name: "MySQL",
  description: `A relational SQL database (MySQL dialect). Use for structured transactional 
    data. Similar to PostgreSQL but uses MySQL-specific syntax. Supports JOINs, GROUP BY, 
    aggregations.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write MySQL SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use backticks for identifiers: \`table_name\`.\`column_name\`
    - Use ? for parameterized values mapped to args array
    - For date functions: DATE(), DATE_FORMAT(), NOW()
    - Use LIMIT instead of FETCH FIRST
    - Never use SELECT * — always specify columns
  `,
  exampleQueries: [],
  semanticHints: {}
};

const mssqlManifest = {
  name: "Microsoft SQL Server",
  description: `Microsoft SQL Server relational database. Use for enterprise transactional 
    data in T-SQL dialect. Supports complex JOINs, CTEs, window functions.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write T-SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM dbo.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use square brackets for identifiers: [schema].[table].[column]
    - Use @paramName for parameterized values
    - For date functions: GETDATE(), DATEADD(), DATEDIFF()
    - Use TOP instead of LIMIT
    - Schema-qualify with dbo. by default
  `,
  exampleQueries: [],
  semanticHints: {}
};

const oracleManifest = {
  name: "Oracle",
  description: `Oracle relational database. Enterprise-grade SQL with PL/SQL dialect. 
    Use for large-scale enterprise data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write Oracle SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM schema.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use double quotes for case-sensitive identifiers
    - Use :paramName for bind variables
    - For date: SYSDATE, TO_DATE(), TO_CHAR()
    - Use FETCH FIRST N ROWS ONLY (12c+) or ROWNUM for limiting
  `,
  exampleQueries: [],
  semanticHints: {}
};

const sqliteManifest = {
  name: "SQLite",
  description: `SQLite embedded relational database. Lightweight, file-based. Use for 
    local or embedded application data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write SQLite SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - No schema qualification needed
    - Use ? for parameterized values
    - For date: datetime(), date(), strftime()
    - Use LIMIT for row limiting
  `,
  exampleQueries: [],
  semanticHints: {}
};

const cockroachdbManifest = {
  name: "CockroachDB",
  description: `CockroachDB distributed SQL database. PostgreSQL-compatible syntax. 
    Use for distributed, fault-tolerant transactional data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write PostgreSQL-compatible SQL in the 'query' field.
    CockroachDB is wire-compatible with PostgreSQL. Follow PostgreSQL query rules.
    
    Query shape: Same as PostgreSQL.
  `,
  exampleQueries: [],
  semanticHints: {}
};

const supabaseManifest = {
  name: "Supabase",
  description: `Supabase (hosted PostgreSQL). Use for Supabase-backed application data. 
    Query using standard PostgreSQL SQL.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write PostgreSQL SQL in the 'query' field. Supabase uses PostgreSQL under the hood.
    Follow PostgreSQL query rules. Tables are usually in the public schema.
    
    Query shape: Same as PostgreSQL.
  `,
  exampleQueries: [],
  semanticHints: {}
};

const bigqueryManifest = {
  name: "BigQuery",
  description: `Google BigQuery data warehouse. Use for large-scale analytics, 
    data warehouse queries. Best for aggregations over massive datasets.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Write BigQuery Standard SQL in the 'query' field.
    
    Query shape:
    {
      "query": "SELECT ... FROM \`project.dataset.table\` WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use backtick-qualified table names: \`project.dataset.table\`
    - Use @paramName for parameterized values
    - For date: CURRENT_DATE(), DATE(), TIMESTAMP()
    - Use LIMIT for row limiting
    - Use UNNEST for arrays
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// NOSQL / DOCUMENT DATABASES
// ============================================================

const mongodbManifest = {
  name: "MongoDB",
  description: `MongoDB NoSQL document database. Use for document-oriented data — 
    user profiles, product catalogs, logs, events. Supports aggregation pipelines.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    MongoDB queries use a JSON-based query format.
    
    Query shape:
    {
      "collection": "collectionName",
      "operation": "find|aggregate|count",
      "query": { "field": "value" },
      "projection": { "field1": 1, "field2": 1 },
      "sort": { "field": -1 },
      "limit": 100,
      "pipeline": [] // for aggregate operations
    }
    
    Rules:
    - For filtering: use MongoDB query operators ($eq, $gt, $lt, $in, etc.)
    - For aggregation: use $match, $group, $sort, $project, $limit stages
    - Date comparisons: use ISODate strings or $date operator
  `,
  exampleQueries: [],
  semanticHints: {}
};

const firestoreManifest = {
  name: "Firestore",
  description: `Google Firestore NoSQL document database. Use for real-time 
    application data, user profiles, settings. Document-collection model.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Firestore queries use collection paths and query operators.
    
    Query shape:
    {
      "collection": "collectionPath",
      "operation": "get|query|list",
      "filters": [
        { "field": "fieldName", "operator": "==", "value": "someValue" }
      ],
      "orderBy": { "field": "fieldName", "direction": "asc" },
      "limit": 100
    }
    
    Rules:
    - Operators: ==, !=, <, <=, >, >=, array-contains, in
    - Composite queries may require indexes
    - Use collection group queries for subcollections
  `,
  exampleQueries: [],
  semanticHints: {}
};

const neo4jManifest = {
  name: "Neo4j",
  description: `Neo4j graph database. Use for relationship-heavy data — social networks, 
    fraud detection, knowledge graphs. Query using Cypher.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write Cypher queries in the 'query' field.
    
    Query shape:
    {
      "query": "MATCH (n:Label) -[r:RELATES]-> (m) WHERE n.prop = $param RETURN n, r, m",
      "args": [
        { "key": "param", "type": "string" }
      ]
    }
    
    Rules:
    - Use MATCH for pattern matching
    - Use WHERE for filtering
    - Use RETURN for output
    - Use $paramName for parameters
    - Use WITH for chaining queries
  `,
  exampleQueries: [],
  semanticHints: {}
};

const elasticsearchManifest = {
  name: "Elasticsearch",
  description: `Elasticsearch search and analytics engine. Use for full-text search, 
    log analysis, metrics aggregation, monitoring data.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Elasticsearch queries use the Query DSL JSON format.
    
    Query shape:
    {
      "index": "indexName",
      "body": {
        "query": { "match": { "field": "value" } },
        "aggs": { "agg_name": { "terms": { "field": "field.keyword" } } },
        "size": 100,
        "sort": [{ "timestamp": "desc" }]
      }
    }
    
    Rules:
    - Use .keyword suffix for exact match on text fields
    - Use bool query for complex filtering (must, should, must_not)
    - Aggregations: terms, date_histogram, sum, avg, cardinality
  `,
  exampleQueries: [],
  semanticHints: {}
};

const airtableManifest = {
  name: "Airtable",
  description: `Airtable spreadsheet-database hybrid. Use for structured data managed 
    in Airtable bases — project tracking, CRM, inventory.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Airtable queries use the Airtable API format.
    
    Query shape:
    {
      "baseId": "appXXXXXXX",
      "tableName": "TableName",
      "operation": "list|get|create|update",
      "filterByFormula": "AND({Field}='value', {Date}>='2024-01-01')",
      "sort": [{ "field": "FieldName", "direction": "asc" }],
      "maxRecords": 100
    }
    
    Rules:
    - Use filterByFormula with Airtable formula syntax
    - Field names are case-sensitive and wrapped in {}
    - Date format: YYYY-MM-DD
  `,
  exampleQueries: [],
  semanticHints: {}
};

const googlesheetsManifest = {
  name: "Google Sheets",
  description: `Google Sheets spreadsheet datasource. Use for data stored in 
    Google Sheets — reports, shared data, manual entry data.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Google Sheets queries use spreadsheet range notation.
    
    Query shape:
    {
      "spreadsheetId": "spreadsheet-id",
      "range": "Sheet1!A1:Z1000",
      "operation": "read|append|update"
    }
    
    Rules:
    - Use A1 notation for ranges
    - First row is typically headers
    - Use sheet name prefix: SheetName!A1:Z100
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// APIs & SERVICES
// ============================================================

const restapiManifest = {
  name: "REST API",
  description: `A generic REST API datasource. Use this for external services like 
    payment gateways (Razorpay, Stripe), booking platforms, CRMs, or any HTTP API. 
    Can fetch, create, update data via HTTP methods. Use when data lives outside 
    the main database — payment records, SMS logs, email events, third-party bookings.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Query shape for REST API datasource:
    {
      "apiEndpoint": "/v1/endpoint",
      "method": "GET",
      "headers": [{ "key": "Authorization", "value": "Bearer {{args.token}}" }],
      "queryParams": [
        { "key": "from", "value": "{{args.startDate}}" },
        { "key": "to", "value": "{{args.endDate}}" }
      ],
      "body": null,
      "args": [
        { "key": "startDate", "type": "string" },
        { "key": "endDate", "type": "string" }
      ]
    }
    
    Rules:
    - For Razorpay: base URL is https://api.razorpay.com/v1
      Payments: GET /payments?from={unix_timestamp}&to={unix_timestamp}
      from/to are UNIX timestamps (seconds since epoch), NOT ISO strings
    - Automatically prefixed with the datasource baseUrl. Only provide the relative apiEndpoint (e.g. /users, NOT https://...).
    - queryParams and headers MUST be arrays of { key, value } objects.
    - Response is returned as-is — the agent will handle parsing
  `,
  exampleQueries: [
    {
      description: "Fetch Razorpay payments for a date range",
      dataQueryOptions: {
        apiEndpoint: "/payments",
        method: "GET",
        queryParams: [
          { key: "from", value: "{{args.fromTimestamp}}" },
          { key: "to", value: "{{args.toTimestamp}}" },
          { key: "count", value: "100" }
        ],
        args: [
          { key: "fromTimestamp", type: "number" },
          { key: "toTimestamp", type: "number" }
        ]
      }
    }
  ],
  semanticHints: {
    amount: "In Razorpay: paise (divide by 100 for INR). In Stripe: smallest currency unit.",
    from: "Razorpay uses UNIX timestamp in SECONDS",
    status: "Razorpay: captured|authorized|refunded|failed"
  }
};

const graphqlManifest = {
  name: "GraphQL",
  description: `GraphQL API datasource. Use for APIs that expose a GraphQL endpoint. 
    Supports queries, mutations, and subscriptions.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Query shape for GraphQL datasource:
    {
      "url": "https://api.example.com/graphql",
      "query": "query GetUsers($limit: Int) { users(limit: $limit) { id name email } }",
      "variables": { "limit": 100 },
      "headers": { "Authorization": "Bearer {{args.token}}" },
      "args": [
        { "key": "token", "type": "string" }
      ]
    }
    
    Rules:
    - Write valid GraphQL queries/mutations
    - Use variables for parameterization (not inline values)
    - Include auth headers from datasource config
  `,
  exampleQueries: [],
  semanticHints: {}
};

const stripeManifest = {
  name: "Stripe",
  description: `Stripe payment processor. Use for payment data, subscription info, 
    invoices, refunds, customer records. Best for revenue analytics, payment failure 
    analysis, subscription metrics.`,
  capabilities: ["read", "filter"],
  queryInstructions: `
    Stripe datasource uses Stripe API operations.
    
    Query shape:
    {
      "operation": "list",
      "resource": "payment_intents",
      "params": {
        "created[gte]": 1234567890,
        "created[lte]": 1234567890,
        "limit": 100
      },
      "args": [{ "key": "paramName", "type": "number" }]
    }
    
    Key resources: payment_intents, charges, customers, invoices, refunds, subscriptions
    Dates: UNIX timestamps in SECONDS
    Amounts: in smallest currency unit (paise for INR, cents for USD)
  `,
  exampleQueries: [],
  semanticHints: {
    amount: "Smallest currency unit. For INR: paise (divide by 100).",
    created: "UNIX timestamp in seconds"
  }
};

const twilioManifest = {
  name: "Twilio",
  description: `Twilio communication platform. Use for SMS/call logs, message delivery 
    status, phone number management.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Twilio datasource uses Twilio REST API operations.
    
    Query shape:
    {
      "resource": "messages|calls",
      "operation": "list|create|get",
      "params": {
        "DateSent>": "2024-01-01",
        "To": "+1234567890",
        "PageSize": 100
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const sendgridManifest = {
  name: "SendGrid",
  description: `SendGrid email delivery platform. Use for email send logs, delivery 
    metrics, bounce rates, email campaign data.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    SendGrid datasource uses the SendGrid v3 API.
    
    Query shape:
    {
      "endpoint": "/v3/messages",
      "method": "GET",
      "params": {
        "limit": 100,
        "query": "status='delivered'"
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const slackManifest = {
  name: "Slack",
  description: `Slack workspace API. Use for channel messages, user info, workspace 
    activity. Read-only analytics on team communication.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Slack datasource uses Slack Web API methods.
    
    Query shape:
    {
      "method": "conversations.history|users.list|channels.list",
      "params": {
        "channel": "C1234567890",
        "limit": 100,
        "oldest": "1234567890.123456"
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const notionManifest = {
  name: "Notion",
  description: `Notion workspace API. Use for page content, database entries, 
    project management data stored in Notion.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Notion datasource uses the Notion API.
    
    Query shape:
    {
      "operation": "query_database|get_page|search",
      "database_id": "database-uuid",
      "filter": {
        "property": "Status",
        "select": { "equals": "Done" }
      },
      "sorts": [{ "property": "Created", "direction": "descending" }]
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const jiraManifest = {
  name: "Jira",
  description: `Jira project management. Use for issue tracking data, sprint metrics, 
    project velocity, bug reports.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Jira datasource uses JQL (Jira Query Language) and the Jira REST API.
    
    Query shape:
    {
      "operation": "search|get_issue",
      "jql": "project = PROJ AND status = 'In Progress' ORDER BY created DESC",
      "maxResults": 100,
      "fields": ["summary", "status", "assignee", "created"]
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const googleanalyticsManifest = {
  name: "Google Analytics",
  description: `Google Analytics web analytics. Use for website traffic data, 
    user behavior, page views, conversion metrics.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Google Analytics datasource uses the GA4 Data API.
    
    Query shape:
    {
      "propertyId": "properties/123456789",
      "dateRanges": [{ "startDate": "2024-01-01", "endDate": "2024-12-31" }],
      "metrics": [{ "name": "activeUsers" }, { "name": "sessions" }],
      "dimensions": [{ "name": "date" }, { "name": "country" }],
      "limit": 1000
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// MESSAGING & CACHE
// ============================================================

const kafkaManifest = {
  name: "Kafka",
  description: `Apache Kafka message streaming platform. Use for event streams, 
    real-time data pipelines, message consumption.`,
  capabilities: ["read", "write"],
  queryInstructions: `
    Kafka datasource operates on topics and consumer groups.
    
    Query shape:
    {
      "operation": "consume|produce|list_topics",
      "topic": "topicName",
      "consumerGroup": "groupName",
      "maxMessages": 100
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const rabbitmqManifest = {
  name: "RabbitMQ",
  description: `RabbitMQ message broker. Use for queue messages, exchange routing, 
    message publishing/consuming.`,
  capabilities: ["read", "write"],
  queryInstructions: `
    RabbitMQ datasource operates on queues and exchanges.
    
    Query shape:
    {
      "operation": "consume|publish|list_queues",
      "queue": "queueName",
      "exchange": "exchangeName",
      "maxMessages": 100
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

const redisManifest = {
  name: "Redis",
  description: `Redis in-memory data store. Use for cached data, session data, 
    counters, sorted sets, real-time leaderboards.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Redis datasource uses Redis commands.
    
    Query shape:
    {
      "command": "GET|SET|HGETALL|KEYS|SCAN",
      "args": ["keyPattern*"],
      "key": "keyName"
    }
    
    Rules:
    - For key scanning: use SCAN with pattern matching
    - For hash data: use HGETALL, HGET
    - For sorted sets: use ZRANGE, ZRANGEBYSCORE
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// STORAGE
// ============================================================

const s3Manifest = {
  name: "AWS S3",
  description: `AWS S3 object storage. Use for file listings, object metadata, 
    bucket contents. Not for querying data within files.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    S3 datasource operates on buckets and objects.
    
    Query shape:
    {
      "operation": "listObjects|getObject|putObject",
      "bucket": "bucketName",
      "prefix": "path/to/",
      "maxKeys": 100
    }
    
    Rules:
    - Use prefix for folder-like filtering
    - listObjects returns object keys and metadata
    - getObject fetches object contents
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// WEB
// ============================================================

const weburlManifest = {
  name: "Web URL",
  description: `Web URL datasource. Fetches content from web pages. Use for 
    scraping public web content or fetching data from URLs.`,
  capabilities: ["read"],
  queryInstructions: `
    Web URL datasource fetches content from a URL.
    
    Query shape:
    {
      "url": "https://example.com/data",
      "method": "GET",
      "headers": {},
      "responseType": "json|text|html"
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};

// ============================================================
// MANIFEST REGISTRY
// ============================================================

/**
 * Registry mapping datasource type values to their manifests.
 * The keys match DATASOURCE_TYPES[X].value from @jet-admin/datasource-types.
 */
export const DATASOURCE_MANIFESTS = {
  // SQL Databases
  postgresql: postgresqlManifest,
  mysql: mysqlManifest,
  mssql: mssqlManifest,
  oracle: oracleManifest,
  sqlite: sqliteManifest,
  cockroachdb: cockroachdbManifest,
  supabase: supabaseManifest,
  bigquery: bigqueryManifest,

  // NoSQL / Document
  mongodb: mongodbManifest,
  firestore: firestoreManifest,
  neo4j: neo4jManifest,
  elasticsearch: elasticsearchManifest,
  airtable: airtableManifest,
  googlesheets: googlesheetsManifest,

  // APIs & Services
  restapi: restapiManifest,
  graphql: graphqlManifest,
  stripe: stripeManifest,
  twilio: twilioManifest,
  sendgrid: sendgridManifest,
  slack: slackManifest,
  notion: notionManifest,
  jira: jiraManifest,
  googleanalytics: googleanalyticsManifest,

  // Messaging & Cache
  kafka: kafkaManifest,
  rabbitmq: rabbitmqManifest,
  redis: redisManifest,

  // Storage
  s3: s3Manifest,

  // Web
  weburl: weburlManifest,
};

/**
 * Get the manifest for a datasource type.
 * Returns a generic fallback manifest if no specific one exists.
 * 
 * @param {string} datasourceType - The datasource type value (e.g., 'postgresql')
 * @returns {Object} The manifest for this datasource type
 */
export function getManifestForType(datasourceType) {
  const manifest = DATASOURCE_MANIFESTS[datasourceType];
  if (manifest) return { ...manifest };

  // Generic fallback for any unknown datasource types
  return {
    name: datasourceType,
    description: `${datasourceType} datasource. No detailed manifest available.`,
    capabilities: ["read"],
    queryInstructions: `Use standard ${datasourceType} query format as configured in dataQueryOptions.`,
    exampleQueries: [],
    semanticHints: {},
  };
}
