# Jet Admin MCP Server

A **Model Context Protocol (MCP) server** that exposes Jet Admin's full platform as callable tools for any MCP-compatible AI client — including Antigravity, Claude Desktop, and any LangChain/LlamaIndex agent.

---

## What it does

Connects any MCP-compatible LLM to your live Jet Admin tenant. The AI can then:

- 📦 **Inspect datasources** — list, read schema, get sample data
- 🔍 **Build & run queries** — create SQL/REST queries, test them, execute them
- 🏗️ **Assemble App Pages** — create pages with widgets, queries, and variables
- 📊 **Manage widgets** — create tables, charts, KPI cards, forms
- ⚡ **Real-time listeners** — create, activate, and manage event-driven listeners
- 🔄 **Automate workflows** — build and execute multi-step DAG workflows
- 👥 **Inspect IAM** — read tenant members and roles (read-only)
- 🔎 **Discover resources** — search across all resource types in one call

---

## Quick Start

### 1. Install dependencies

```bash
cd packages/mcp-server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
JET_ADMIN_BACKEND_URL=http://localhost:5000  # Your Jet Admin backend URL
JET_ADMIN_API_KEY=your_api_key_here          # From Settings → API Keys in Jet Admin
JET_ADMIN_TENANT_ID=your_tenant_id_here      # From the URL: /tenants/<tenantID>/...
```

**Getting an API key:**
1. Open Jet Admin in your browser
2. Navigate to a tenant
3. Go to **Settings → API Keys**
4. Create a new key with the permissions you need
5. Copy the key value (shown only once)

### 3. Test it manually

```bash
node src/index.js
```

You should see:
```
[jet-admin-mcp] Registered 52 tools:
  • get_tenant_resource_summary
  • search_resources
  • get_widget_schemas
  • list_datasources
  ...
[jet-admin-mcp] Starting server...
  Base URL  : http://localhost:5000
  Tenant ID : abc-123
  API Key   : api_key_...
  Tools     : 52
  Transport : stdio
[jet-admin-mcp] Server connected and ready.
```

The server is now waiting for MCP messages on stdin.

---

## Connecting to Antigravity (this AI assistant)

In your Antigravity/Claude Desktop config file, add:

```json
{
  "mcpServers": {
    "jet-admin": {
      "command": "node",
      "args": ["d:/PROJECTS/PERSONAL/jet-admin/packages/mcp-server/src/index.js"],
      "env": {
        "JET_ADMIN_BACKEND_URL": "http://localhost:5000",
        "JET_ADMIN_API_KEY": "your_api_key_here",
        "JET_ADMIN_TENANT_ID": "your_tenant_id_here"
      }
    }
  }
}
```

> **Windows path note**: Use forward slashes or escaped backslashes in the JSON config.

---

## Connecting to Claude Desktop

1. Open `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the server config above
3. Restart Claude Desktop
4. You'll see "jet-admin" in the MCP servers list

---

## Tool Reference

### 🔎 Discovery & Schemas (call these first)

| Tool | Description |
|------|-------------|
| `get_tenant_resource_summary` | Full inventory of all 6 resource types in one call — the mandatory first step of any task |
| `search_resources` | Substring search across all resource types, returns IDs for any resource by name |
| `get_widget_schemas` | Authoritative JSON schemas for widget configs (table, chart, stat, form...) |
| `get_data_query_schemas` | Authoritative JSON schemas for query options per datasource type |
| `get_datasource_schemas` | Authoritative JSON schemas for datasource connection options |
| `get_listener_schemas` | Authoritative JSON schemas for listener configs and pipelines |
| `get_workflow_schema` | Authoritative JSON schema for workflow nodes and edges |
| `get_app_page_schema` | Authoritative JSON schema for app page configs |

### 📦 Datasource Tools

| Tool | Description |
|------|-------------|
| `list_datasources` | List all datasources |
| `get_datasource` | Get datasource by ID |
| `get_datasource_schema` | Introspect tables and fields |
| `get_datasource_sample_data` | Fetch sample rows from a table |
| `test_datasource_connection` | Test connection health |
| `create_datasource` | Create a new connection |
| `update_datasource` | Update connection config |
| `delete_datasource` | Delete (cascades to queries) |

### 🔍 Query Tools

| Tool | Description |
|------|-------------|
| `list_queries` | List all saved queries |
| `get_query` | Get full query config |
| `create_query` | Create a SQL/REST query |
| `update_query` | Update a query |
| `delete_query` | Delete a query |
| `test_query` | Test a saved query with inputs |
| `run_query` | Execute a saved query |
| `test_query_by_data` | Test inline query config without saving |

### ⚡ Listener Tools

| Tool | Description |
|------|-------------|
| `list_listeners` | List all listeners |
| `get_listener` | Get listener + pipeline config |
| `create_listener` | Create a real-time listener |
| `update_listener` | Update listener config |
| `delete_listener` | Delete a listener |
| `activate_listener` | Start a listener |
| `deactivate_listener` | Stop a listener |

### 🔄 Workflow Tools

| Tool | Description |
|------|-------------|
| `list_workflows` | List all workflows |
| `get_workflow` | Get full DAG config |
| `create_workflow` | Create a workflow from nodes/edges |
| `update_workflow` | Update workflow DAG |
| `delete_workflow` | Delete a workflow |
| `execute_workflow` | Trigger async execution |
| `get_workflow_instance` | Poll execution status |

### 📊 Widget Tools

| Tool | Description |
|------|-------------|
| `list_widgets` | List all widgets |
| `get_widget` | Get full widget config |
| `create_widget` | Create a widget (table, chart, stat, form...) |
| `update_widget` | Update widget config |
| `delete_widget` | Delete a widget |

### 🏗️ App Page Tools

| Tool | Description |
|------|-------------|
| `list_app_pages` | List all app pages |
| `get_app_page` | Get full page config |
| `create_app_page` | Create a new page |
| `update_app_page` | Update page layout/config |
| `delete_app_page` | Delete a page |
| `get_app_page_preview_url` | Get URL to view the page |

### 👥 IAM Tools (read-only)

| Tool | Description |
|------|-------------|
| `list_tenant_members` | List users and their roles |
| `list_tenant_roles` | List custom roles |
| `get_tenant_info` | Get tenant metadata and counts |

---

## Tool Documentation for Agents

Every tool description is written to be self-sufficient: it states the purpose, when to use it (and when
not to), the exact return shape, one or more **example calls with realistic arguments**, common pitfalls
(what causes errors), and related tools to call next. Parameter descriptions carry their own examples and
constraints. An agent should be able to complete a full build task using tool descriptions alone — no
external documentation needed.

**The canonical build flow** (each tool's description references its place in this sequence):

```
get_tenant_resource_summary        ← always first: dedupe + reuse
        ↓
get_datasource_schema → get_datasource_sample_data   ← real table/column names, real data shapes
        ↓
test_query_by_data (iterate) → create_query → test_query   ← validate before persisting
        ↓
get_widget_schemas → create_widget                        ← visual elements
        ↓
create_app_page → get_app_page_preview_url                ← assemble page, share link
```

**Destructive tools** (`delete_*`) state their cascade effects in the description and require explicit
user confirmation before the agent calls them. **Full-replacement updates** (`update_app_page`,
`update_widget`, `update_query` options) warn in their descriptions to read current state with the
matching `get_*` tool first — partial sends silently drop existing fields.

---

## Architecture

```
MCP Client (Antigravity / Claude Desktop)
    │  stdio (JSON-RPC)
    ▼
Jet Admin MCP Server (this package)
    │  HTTP + api_key auth
    ▼
Jet Admin Backend (Express + Prisma)
    │
    ▼
PostgreSQL database
```

All requests are authenticated with the configured API key. The server acts as a thin bridge — it does not store any state.

---

## Security Notes

- **API Key**: Create a scoped API key with only the permissions the AI needs. Read-only keys for read-only agents.
- **Tenant Isolation**: The server is configured for a single tenant ID. Each tenant needs its own server instance.
- **Credentials in tool output**: `get_datasource` and the fallback responses of `get_datasource_schema` /
  `get_datasource_sample_data` return the datasource `options` object, which may contain connection
  credentials. Use a scoped API key and be aware the agent may see these values.
- **IAM tools are read-only**: Write operations (invite user, promote role) require human confirmation in the UI.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing required env var` | Copy `.env.example` to `.env` and fill in values |
| `Jet Admin API unreachable` | Ensure backend is running at `JET_ADMIN_BACKEND_URL` |
| `Authentication failed (401)` | Check `JET_ADMIN_API_KEY` is valid and not disabled |
| `Permission denied (403)` | The API key lacks the required permission for that operation |
| `Resource not found (404)` | Verify the ID belongs to `JET_ADMIN_TENANT_ID` |
| Tools not showing in Claude | Restart Claude Desktop after editing config |

Enable debug logging for verbose output:
```env
DEBUG=true
```

---

## Development

```bash
# Watch mode — restarts on file changes
npm run dev

# Check which tools are registered
node src/index.js 2>&1 | head -40
```
