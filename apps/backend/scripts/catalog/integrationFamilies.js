/**
 * Curated catalog of popular, usable integration families for the generalized
 * marketplace store.
 *
 * The first block mirrors the built-in connector registry in
 * packages/datasource-types (DATASOURCE_TYPES). The second block adds widely
 * used SaaS/data tools that are reachable through the generic REST API or
 * Webhook connectors.Keeping the data here (declarative) makes the generated
 * catalog deterministic and easy to review/extend.
 *
 * Entry: [key, name, category, icon, iconColor, datasourceType, tags]
 */

const f = (key, name, category, icon, iconColor, datasourceType, tags = []) => ({
  key,
  name,
  category,
  icon,
  iconColor,
  datasourceType,
  tags,
});

const BUILTIN_FAMILIES = [
  // Databases
  f("postgresql", "PostgreSQL", "Databases", "SiPostgresql", "#336791", "postgresql", ["sql", "relational"]),
  f("mysql", "MySQL", "Databases", "SiMysql", "#4479A1", "mysql", ["sql", "relational"]),
  f("mongodb", "MongoDB", "Databases", "SiMongodb", "#47A248", "mongodb", ["nosql", "document"]),
  f("mssql", "Microsoft SQL Server", "Databases", "SiMicrosoftsqlserver", "#CC2927", "mssql", ["sql", "microsoft"]),
  f("oracle", "Oracle Database", "Databases", "SiOracle", "#F80000", "oracle", ["sql", "enterprise"]),
  f("sqlite", "SQLite", "Databases", "SiSqlite", "#003B57", "sqlite", ["sql", "embedded"]),
  f("cockroachdb", "CockroachDB", "Databases", "SiCockroachlabs", "#6933FF", "cockroachdb", ["sql", "distributed"]),
  f("neo4j", "Neo4j", "Databases", "SiNeo4j", "#008CC1", "neo4j", ["graph", "nosql"]),
  f("firestore", "Firestore", "Databases", "SiFirebase", "#FFCA28", "firestore", ["nosql", "google", "realtime"]),
  f("supabase", "Supabase", "Databases", "SiSupabase", "#3ECF8E", "supabase", ["postgres", "baas"]),
  f("redis", "Redis", "Databases", "SiRedis", "#DC382D", "redis", ["cache", "key-value", "realtime"]),
  f("clickhouse", "ClickHouse", "Databases", "SiClickhouse", "#F8DC1A", "clickhouse", ["analytics", "columnar"]),
  f("duckdb", "DuckDB", "Databases", "SiDuckdb", "#FFF100", "duckdb", ["analytics", "embedded"]),
  f("influxdb", "InfluxDB", "Databases", "SiInfluxdb", "#229ED9", "influxdb", ["time-series", "metrics"]),
  f("mariadb", "MariaDB", "Databases", "SiMariadb", "#003399", "mysql", ["sql", "relational"]),
  f("dynamodb", "Amazon DynamoDB", "Databases", "SiAmazondynamodb", "#4053D6", "restapi", ["nosql", "aws"]),
  f("cassandra", "Apache Cassandra", "Databases", "SiCassandra", "#1287B1", "restapi", ["nosql", "distributed"]),
  f("snowflake", "Snowflake", "Data & Analytics", "SiSnowflake", "#29B5E8", "restapi", ["warehouse", "analytics"]),

  // Data & Analytics
  f("bigquery", "Google BigQuery", "Data & Analytics", "SiGooglebigquery", "#4285F4", "bigquery", ["warehouse", "google"]),
  f("googleanalytics", "Google Analytics", "Data & Analytics", "SiGoogleanalytics", "#E37400", "googleanalytics", ["web", "analytics"]),
  f("elasticsearch", "Elasticsearch", "Data & Analytics", "SiElasticsearch", "#005571", "elasticsearch", ["search", "logs"]),
  f("prometheus", "Prometheus", "Monitoring", "SiPrometheus", "#E6522C", "prometheus", ["metrics", "monitoring"]),
  f("excelcsv", "Excel & CSV", "Data & Analytics", "FaFileExcel", "#107c41", "excelcsv", ["spreadsheet", "import"]),
  f("googlesheets", "Google Sheets", "Data & Analytics", "SiGooglesheets", "#0F9D58", "googlesheets", ["spreadsheet", "google"]),
  f("airtable", "Airtable", "Data & Analytics", "SiAirtable", "#18BFFF", "airtable", ["spreadsheet", "baas"]),
  f("databricks", "Databricks", "Data & Analytics", "SiDatabricks", "#FF3621", "restapi", ["lakehouse", "analytics"]),
  f("mixpanel", "Mixpanel", "Data & Analytics", "SiMixpanel", "#7856FF", "restapi", ["product", "analytics"]),
  f("amplitude", "Amplitude", "Data & Analytics", "SiAmplitude", "#1E61F0", "restapi", ["product", "analytics"]),
  f("segment", "Segment", "Data & Analytics", "SiSegment", "#52BD94", "restapi", ["cdp", "events"]),

  // Messaging & Communication
  f("slack", "Slack", "Messaging", "SiSlack", "#4A154B", "slack", ["chat", "notifications"]),
  f("twilio", "Twilio", "Messaging", "SiTwilio", "#F22F46", "twilio", ["sms", "voice"]),
  f("sendgrid", "SendGrid", "Messaging", "SiSendgrid", "#1A82E2", "sendgrid", ["email", "transactional"]),
  f("smtp", "SMTP", "Messaging", "TbMail", "#EA4335", "smtp", ["email", "mail"]),
  f("webhook", "Webhook", "Messaging", "TbWebhook", "#8B5CF6", "webhook", ["events", "realtime"]),
  f("mqtt", "MQTT", "Messaging", "SiMqtt", "#660066", "mqtt", ["iot", "realtime"]),
  f("websocket", "WebSocket", "Messaging", "TbPlugConnected", "#06B6D4", "websocket", ["realtime", "streaming"]),
  f("sse", "Server-Sent Events", "Messaging", "TbArrowBigDownLines", "#F59E0B", "sse", ["realtime", "streaming"]),
  f("syslog", "Syslog", "Messaging", "TbFileText", "#64748B", "syslog", ["logs", "events"]),
  f("rabbitmq", "RabbitMQ", "Messaging", "SiRabbitmq", "#FF6600", "rabbitmq", ["queue", "events"]),
  f("kafka", "Apache Kafka", "Messaging", "SiApachekafka", "#231F20", "kafka", ["streaming", "events"]),
  f("nats", "NATS", "Messaging", "SiNatsdotio", "#27AAE1", "nats", ["messaging", "events"]),
  f("telegram", "Telegram", "Messaging", "SiTelegram", "#26A5E4", "restapi", ["chat", "bots"]),
  f("discord", "Discord", "Messaging", "SiDiscord", "#5865F2", "restapi", ["chat", "community"]),
  f("whatsapp", "WhatsApp Business", "Messaging", "SiWhatsapp", "#25D366", "restapi", ["chat", "messaging"]),

  // Payments & Commerce
  f("stripe", "Stripe", "Payments & Commerce", "SiStripe", "#635BFF", "stripe", ["payments", "billing"]),
  f("paypal", "PayPal", "Payments & Commerce", "SiPaypal", "#003087", "restapi", ["payments", "checkout"]),
  f("square", "Square", "Payments & Commerce", "SiSquare", "#006AFF", "restapi", ["payments", "pos"]),
  f("braintree", "Braintree", "Payments & Commerce", "SiBraintree", "#044E7A", "restapi", ["payments", "billing"]),
  f("shopify", "Shopify", "Payments & Commerce", "SiShopify", "#96BF48", "restapi", ["ecommerce", "orders"]),
  f("woocommerce", "WooCommerce", "Payments & Commerce", "SiWoocommerce", "#7F54B3", "restapi", ["ecommerce", "orders"]),
  f("magento", "Magento / Adobe Commerce", "Payments & Commerce", "SiMagentohorizontal", "#F26322", "restapi", ["ecommerce", "catalog"]),
  f("quickbooks", "QuickBooks", "Payments & Commerce", "SiQuickbooks", "#2CA01C", "restapi", ["accounting", "finance"]),
  f("xero", "Xero", "Payments & Commerce", "SiXero", "#13B5EA", "restapi", ["accounting", "finance"]),
  f("gocardless", "GoCardless", "Payments & Commerce", "SiGocardless", "#006DFF", "restapi", ["payments", "direct-debit"]),

  // DevOps & Infrastructure
  f("github", "GitHub", "DevOps & Infrastructure", "SiGithub", "#181717", "github", ["git", "code"]),
  f("gitlab", "GitLab", "DevOps & Infrastructure", "SiGitlab", "#FC6D26", "gitlab", ["git", "ci"]),
  f("bitbucket", "Bitbucket", "DevOps & Infrastructure", "SiBitbucket", "#0052CC", "restapi", ["git", "code"]),
  f("circleci", "CircleCI", "DevOps & Infrastructure", "SiCircleci", "#343434", "restapi", ["ci", "builds"]),
  f("jenkins", "Jenkins", "DevOps & Infrastructure", "SiJenkins", "#D33833", "restapi", ["ci", "builds"]),
  f("kubernetes", "Kubernetes", "DevOps & Infrastructure", "SiKubernetes", "#326CE5", "restapi", ["containers", "orchestration"]),
  f("docker", "Docker", "DevOps & Infrastructure", "SiDocker", "#2496ED", "restapi", ["containers", "images"]),
  f("terraform", "Terraform", "DevOps & Infrastructure", "SiTerraform", "#7B42BC", "restapi", ["iac", "infrastructure"]),
  f("digitalocean", "DigitalOcean", "DevOps & Infrastructure", "SiDigitalocean", "#0080FF", "restapi", ["cloud", "hosting"]),
  f("aws", "Amazon Web Services", "DevOps & Infrastructure", "SiAmazonaws", "#FF9900", "restapi", ["cloud", "aws"]),
  f("azure", "Microsoft Azure", "DevOps & Infrastructure", "SiMicrosoftazure", "#0078D4", "restapi", ["cloud", "microsoft"]),
  f("gcp", "Google Cloud Platform", "DevOps & Infrastructure", "SiGooglecloud", "#4285F4", "restapi", ["cloud", "google"]),

  // Monitoring & Observability
  f("datadog", "Datadog", "Monitoring", "SiDatadog", "#632CA6", "restapi", ["monitoring", "apm"]),
  f("newrelic", "New Relic", "Monitoring", "SiNewrelic", "#1CE783", "restapi", ["monitoring", "apm"]),
  f("pagerduty", "PagerDuty", "Monitoring", "SiPagerduty", "#06AC38", "restapi", ["incidents", "oncall"]),
  f("sentry", "Sentry", "Monitoring", "SiSentry", "#362D59", "restapi", ["errors", "monitoring"]),
  f("grafana", "Grafana", "Monitoring", "SiGrafana", "#F46800", "restapi", ["dashboards", "metrics"]),
  f("zabbix", "Zabbix", "Monitoring", "SiZabbix", "#D40000", "restapi", ["monitoring", "metrics"]),

  // Storage & Files
  f("s3", "AWS S3", "Storage & Files", "SiAmazons3", "#569A31", "s3", ["object-storage", "aws"]),
  f("filesystem", "File System", "Storage & Files", "TbFolder", "#64748B", "filesystem", ["local", "files"]),
  f("sftp", "SFTP", "Storage & Files", "TbServer", "#0EA5E9", "sftp", ["transfer", "files"]),
  f("dropbox", "Dropbox", "Storage & Files", "SiDropbox", "#0061FF", "restapi", ["cloud", "files"]),
  f("googledrive", "Google Drive", "Storage & Files", "SiGoogledrive", "#0F9D58", "restapi", ["cloud", "files"]),
  f("onedrive", "OneDrive", "Storage & Files", "SiMicrosoftonedrive", "#0364B8", "restapi", ["cloud", "microsoft"]),
  f("box", "Box", "Storage & Files", "SiBox", "#0061D5", "restapi", ["cloud", "files"]),

  // Identity & Security
  f("ldap", "LDAP", "Identity & Security", "TbUsers", "#30538E", "ldap", ["directory", "auth"]),
  f("okta", "Okta", "Identity & Security", "SiOkta", "#007DC1", "restapi", ["sso", "identity"]),
  f("auth0", "Auth0", "Identity & Security", "SiAuth0", "#EB5424", "restapi", ["identity", "oauth"]),
  f("azuread", "Microsoft Entra ID", "Identity & Security", "SiMicrosoftazure", "#0078D4", "restapi", ["sso", "microsoft"]),
  f("vault", "HashiCorp Vault", "Identity & Security", "SiVault", "#FFEC6E", "restapi", ["secrets", "security"]),

  // Productivity & Content
  f("notion", "Notion", "Productivity & Content", "SiNotion", "#000000", "notion", ["docs", "wiki"]),
  f("confluence", "Confluence", "Productivity & Content", "SiConfluence", "#2684FF", "restapi", ["docs", "atlassian"]),
  f("trello", "Trello", "Productivity & Content", "SiTrello", "#0079BF", "restapi", ["boards", "tasks"]),
  f("asana", "Asana", "Productivity & Content", "SiAsana", "#F06A6A", "restapi", ["tasks", "projects"]),
  f("monday", "monday.com", "Productivity & Content", "Simondaydotcom", "#FF3D57", "restapi", ["boards", "work"]),
  f("clickup", "ClickUp", "Productivity & Content", "SiClickup", "#7B68EE", "restapi", ["tasks", "projects"]),
  f("linear", "Linear", "Productivity & Content", "SiLinear", "#5E6AD2", "restapi", ["issues", "projects"]),
  f("zoom", "Zoom", "Productivity & Content", "SiZoom", "#2D8CFF", "restapi", ["meetings", "video"]),
  f("calendly", "Calendly", "Productivity & Content", "SiCalendly", "#006BFF", "restapi", ["scheduling", "events"]),
  f("mailchimp", "Mailchimp", "Productivity & Content", "SiMailchimp", "#FFE01B", "restapi", ["email", "marketing"]),
  f("hubspot", "HubSpot", "Productivity & Content", "SiHubspot", "#FF7A59", "restapi", ["crm", "marketing"]),
  f("salesforce", "Salesforce", "Productivity & Content", "SiSalesforce", "#00A1E0", "restapi", ["crm", "sales"]),
  f("zendesk", "Zendesk", "Productivity & Content", "SiZendesk", "#03363D", "restapi", ["support", "tickets"]),
  f("intercom", "Intercom", "Productivity & Content", "SiIntercom", "#1F8DED", "restapi", ["support", "chat"]),
  f("freshdesk", "Freshdesk", "Productivity & Content", "SiFreshdesk", "#28A859", "restapi", ["support", "tickets"]),
  f("jira", "Jira", "Productivity & Content", "SiJira", "#0052CC", "jira", ["issues", "atlassian"]),
  f("youtube", "YouTube", "Productivity & Content", "SiYoutube", "#FF0000", "restapi", ["video", "media"]),
  f("reddit", "Reddit", "Productivity & Content", "SiReddit", "#FF4500", "restapi", ["social", "community"]),
  f("x", "X (Twitter)", "Productivity & Content", "SiX", "#000000", "restapi", ["social", "microblog"]),
  f("linkedin", "LinkedIn", "Productivity & Content", "SiLinkedin", "#0A66C2", "restapi", ["social", "professional"]),
];

const SAAS_FAMILIES = [
  f("klaviyo", "Klaviyo", "Productivity & Content", "SiKlaviyo", "#232529", "restapi", ["email", "marketing"]),
  f("stripe-billing", "Stripe Billing", "Payments & Commerce", "SiStripe", "#635BFF", "stripe", ["subscriptions", "invoices"]),
  f("zoom-webinar", "Zoom Webinars", "Productivity & Content", "SiZoom", "#2D8CFF", "restapi", ["webinars", "events"]),
  f("gcal", "Google Calendar", "Productivity & Content", "SiGooglecalendar", "#4285F4", "restapi", ["calendar", "google"]),
  f("outlook", "Microsoft Outlook", "Productivity & Content", "SiMicrosoftoutlook", "#0078D4", "restapi", ["email", "microsoft"]),
];

const INTEGRATION_FAMILIES = [...BUILTIN_FAMILIES, ...SAAS_FAMILIES];

module.exports = {
  INTEGRATION_FAMILIES,
  f,
};
