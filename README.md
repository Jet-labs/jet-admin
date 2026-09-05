<div align="center">

<img width="112" height="112" alt="logo" src="https://github.com/user-attachments/assets/21741a12-1315-4de9-b993-7a004050c50e" />

# Jet Admin

### Open Source Analytics Platform & Internal Tools Builder

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square"/>
  <img src="https://img.shields.io/github/stars/Jet-labs/jet-admin?style=flat-square&logo=github"/>
  <img src="https://img.shields.io/github/issues/Jet-labs/jet-admin?style=flat-square"/>
</p>

**Connect data sources · Build workflows · Create dashboards · Automate operations**

[🚀 Quick Start](#-quick-start) •
[🏗️ Architecture](#-architecture) •
[✨ Features](#-features) •
[🔧 Development Guide](#-development-guide) •
[🤝 Contributing](#-contributing)

</div>

---

## 📌 Project Overview

**Jet Admin** is a modular, open-source internal tools platform that allows engineering and operations teams to connect data sources, build automation workflows, and create powerful dashboards — all from a single extensible system.

Unlike traditional BI tools, Jet Admin is designed around a **workflow execution engine** with a plugin-based datasource architecture. This makes it suitable not just for querying data, but for building automated pipelines, internal operations tools, and multi-step data processing flows.

> **The system evolved from a PostgreSQL admin tool into a full internal automation platform.**

### Why Jet Admin?

| Capability | Jet Admin | Traditional BI |
|---|---|---|
| Workflow Automation | ✅ Node-based engine | ❌ |
| Plugin Datasources | ✅ 25+ connectors | ⚠️ Limited |
| Internal Tool Builder | ✅ Full widget system | ❌ |
| Self-Hostable | ✅ Docker ready | ⚠️ |
| AI Query Support | ✅ Built-in | ❌ |
| Multi-Tenancy | ✅ RBAC + Isolation | ⚠️ |

---

## ✨ Features

### 🔌 Data Source Integration

Jet Admin supports 35+ datasource connectors through its package-driven plugin system.

**Databases**
- PostgreSQL · MySQL · MongoDB · SQLite · SQL Server · Redis · Neo4j · Oracle · CockroachDB

**Cloud & SaaS**
- BigQuery · Supabase · Firestore · Elasticsearch · AWS S3 · Airtable · Notion · Jira

**APIs, Events & Services**
- REST · GraphQL · Slack · Stripe · Twilio · SendGrid · Kafka · RabbitMQ · NATS · MQTT · Webhooks

---

### 🔄 Workflow Automation Engine

A visual node-based execution system for building multi-step automation pipelines.

```
Start → Query → Transform → Condition → Loop → Notify → End
```

**Capabilities:**
- ✅ Visual node-based builder
- ✅ Conditional branching logic
- ✅ Loop and iterator nodes
- ✅ Context-driven data passing
- ✅ Worker-based execution model
- ✅ Scheduled and triggered workflows
- ✅ Template variable resolution

---

### 📱 App Page Builder (Canvas)

A visual drag-and-drop page builder based on Craft.js, allowing you to compose complex UIs and multi-page apps.

**Features:** Z-Stack layout · Component tree · Custom styling · Data binding · Responsive layouts

---

### 📊 Dashboard & Widget System

**Charts:** Vega-based custom charts · Bar · Line · Pie

**Data Widgets:** Advanced Tables · Text · Custom widgets

**Features:** Real-time updates · Export support

---

### 🏢 Enterprise Features

**Security:** Multi-tenancy · RBAC (Role-Based Access Control) · API authentication · Audit logs · Vault for secrets

**User Management:** Team invites · Custom roles (TenantRole) · Permissions · Activity tracking

**System & Ops:** Cron Jobs · System monitoring · Notifications (Slack, Email, Webhooks)

---

## 🏗️ Architecture

### High-Level System Design

```mermaid
graph TD
    A[Frontend - React] -->|REST / WebSocket| B[API Gateway]
    B --> C[Module System]
    C --> D[Workflow Engine]
    D --> E[Execution Workers]
    E --> F[Datasource Connectors]
    F --> G[(PostgreSQL / External DBs)]
    C --> H[Widget System]
    C --> I[Dashboard Engine]
```

### Monorepo Structure

```
jet-admin/
├── apps/
│   ├── backend/              # Node.js API + Workflow Engine
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── datasource/
│   │   │   ├── dataQuery/
│   │   │   ├── workflow/
│   │   │   ├── widget/
│   │   │   └── dashboard/
│   │   ├── prisma/
│   │   └── utils/
│   └── frontend/             # React Application
│       └── src/
│           ├── data/          # API layer
│           ├── logic/         # Hooks, state, contexts
│           └── presentation/  # UI components only
│
├── packages/
│   ├── datasource-types/      # Shared connector contracts
│   ├── datasources-logic/     # Connector implementations
│   ├── datasources-ui/        # Connector UI components
│   ├── expression-engine/     # Template resolution & evaluation
│   ├── json-forms-renderers/  # Custom form renderers
│   ├── ui/                    # Shared UI library
│   ├── widget-types/          # Widget definitions
│   ├── widgets-logic/         # Widget business logic
│   ├── widgets-ui/            # Widget UI components
│   ├── workflow-edges/        # Workflow edge connections
│   └── workflow-nodes/        # Node type definitions
│
└── docker-compose.yml
```

---

## ⚙️ Backend Architecture

The backend uses a **feature-module architecture** instead of a traditional layered monolith. Each feature is fully isolated with its own controller, service, repository, and execution logic.

```
modules/
├── datasource/
│   ├── controller.js
│   ├── service.js
│   ├── repository.js
│   └── validation.js
├── workflow/
│   ├── controller.js
│   ├── engine.js          ← Workflow execution
│   └── workers/           ← Node workers
├── auth/                  ← Authentication & authorization
├── appPage/               ← App builder pages
├── tenant/                ← Multi-tenancy isolation
└── ... (13+ other isolated modules like audit, cronJob, vault, system, widget, notification)
```

**Design principles enforced:**
- ✅ Feature isolation — modules do not directly call each other
- ✅ Low coupling — changes in one module don't cascade
- ✅ High cohesion — all logic for a feature lives in its module
- ✅ Clear ownership — every file has a single responsibility

---

## 🔄 Workflow Execution Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant E as Workflow Engine
    participant R as Input Resolver
    participant W as Worker
    participant C as Context Store

    U->>E: Trigger Workflow
    E->>E: Load Node Definitions
    E->>R: Resolve Node Inputs
    R->>C: Read Context Variables
    C-->>R: Return Values
    R-->>E: Resolved Inputs
    E->>W: Execute Worker(node, inputs)
    W-->>E: Return Result
    E->>C: Write Output to Context
    E->>E: Determine Next Nodes
    E-->>U: Execution Complete
```

---

## 🧠 Execution Design Principles

The workflow engine enforces a strict contract between nodes, workers, and the engine.

### Node Responsibilities

| A Node MUST define | A Node MUST NOT do |
|---|---|
| Input schema | Execute business logic |
| Output schema | Mutate workflow context |
| UI configuration | Access the database directly |
| Worker reference | Call other modules |
| Validation rules | Resolve template variables |

> **Execution happens exclusively in workers. Nodes are metadata only.**

---

## ⚡ Worker Architecture

Workers are the execution units of the workflow engine. This separation is intentional — it enables testability, strategy replacement, and future distributed execution.

```
Node Definition
      ↓
Input Resolution (Engine)
      ↓
Worker Execution
      ↓
Result Returned
      ↓
Context Updated (Engine)
      ↓
Next Nodes Triggered
```

**Worker contract:**

```js
// ✅ Correct worker pattern
export async function executeQueryWorker(node, resolvedInputs, context) {
  const result = await queryService.execute(
    resolvedInputs.queryId,
    resolvedInputs.params
  );
  return { result }; // Engine writes this to context
}
```

**Rules workers must follow:**
- ✅ Return deterministic output
- ✅ Accept only pre-resolved inputs
- ❌ Never mutate context directly
- ❌ Never call the workflow engine
- ❌ Never resolve template variables internally

---

## 🧩 Context Resolution Model

Workflow execution is driven by a **context-propagation model**. Each node reads from context and writes results back through the engine.

**Context structure:**

```js
context = {
  input: { customerId: 15 },
  node_query_1: { result: [...] },
  node_filter_2: { filtered: [...] }
}
```

**Input types supported:**

| Type | Example |
|---|---|
| Literal | `"value": 25` |
| Template | `"value": "{{node_query_1.result}}"` |

**Resolution flow:**

```
Detect Input Type
       ↓
If Literal → Return Value Immediately
       ↓
If Template → Parse Reference
       ↓
Resolve from Context
       ↓
Return Evaluated Value to Worker
```

> **Resolution always happens before worker execution — never inside workers.**

---

## 🔌 Plugin Architecture

Extensibility is achieved through **package-driven plugins**. The core system never depends on plugin implementations. Plugins depend on core contracts.

```
packages/
├── datasources-logic/src/data-sources/
│   ├── postgres/
│   ├── mysql/
│   ├── restapi/
│   ├── graphql/
│   └── ... (35+ datasources)
├── workflow-nodes/src/nodes/
│   ├── dataQueryNode/
│   ├── loopNode/
│   ├── javascriptNode/
│   └── ... (8+ nodes)
└── widgets-logic/src/
    ├── table/
    ├── vega/
    └── ...
```

### Creating a Datasource Connector

Every connector must implement the standard contract:

```js
export class PostgresConnector {
  async connect(config) { /* ... */ }
  async disconnect() { /* ... */ }
  async execute(query, params) { /* normalized result */ }
  async validate(config) { /* boolean */ }
  async healthCheck() { /* status */ }
}
```

**Rules:**
- ✅ Return normalized results only
- ✅ Handle connection errors internally
- ❌ No workflow logic inside connectors
- ❌ No cross-connector dependencies

### Creating a Workflow Node

```js
export const QueryNode = {
  type: "dataQuery",
  name: "Execute Query",
  inputs: {
    queryId: { type: "string", required: true },
    params:  { type: "object" }
  },
  outputs: {
    result: "array"
  },
  worker: executeQueryWorker,
  uiConfig: { /* form schema */ }
};
```

### Creating a Widget

```js
export const BarChartWidget = {
  type: "barChart",
  configSchema: { /* JSON Schema */ },
  render(data, config) {
    return <BarChart data={data} options={config} />;
  }
};
```

---

## 📘 Example Workflow Definition

```json
{
  "id": "sales-report-workflow",
  "name": "Monthly Sales Report",
  "nodes": [
    { "id": "start",    "type": "start" },
    { "id": "query_1",  "type": "dataQuery",    "inputs": { "queryId": "fetchOrders" } },
    { "id": "filter_2", "type": "transform",    "inputs": { "data": "{{query_1.result}}", "filter": "last30days" } },
    { "id": "agg_3",    "type": "aggregate",    "inputs": { "data": "{{filter_2.filtered}}", "field": "revenue" } },
    { "id": "chart_4",  "type": "generateChart","inputs": { "data": "{{agg_3.aggregated}}", "type": "bar" } },
    { "id": "end",      "type": "end" }
  ],
  "edges": [
    { "from": "start",   "to": "query_1"  },
    { "from": "query_1", "to": "filter_2" },
    { "from": "filter_2","to": "agg_3"    },
    { "from": "agg_3",   "to": "chart_4"  },
    { "from": "chart_4", "to": "end"      }
  ]
}
```

---

## 🧪 Coding Standards

### Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Functions | camelCase | `executeWorkflow()` |
| Classes | PascalCase | `WorkflowEngine` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Files | kebab-case | `workflow-engine.js` |
| DB columns | snake_case (Prisma mapped) | `created_at` |

### Function Rules

```js
// ✅ Good — single responsibility, deterministic
async function resolveNodeInputs(node, context) {
  return node.inputs.map(input => resolveInput(input, context));
}

// ❌ Bad — mixed responsibilities
async function resolveAndExecuteAndStore(node, context) {
  const inputs = resolve(node, context);   // resolution
  const result = await execute(inputs);    // execution
  await db.save(result);                   // storage
}
```

### Error Handling

```js
// ✅ Correct — errors propagate with context
try {
  await executeWorker(node, resolvedInputs);
} catch (error) {
  logger.error({ nodeId: node.id, executionId, error });
  throw new WorkflowExecutionError(node.id, executionId, error.message);
}

// ❌ Wrong — swallowed error, silent failure
try {
  await executeWorker(node, resolvedInputs);
} catch (e) {
  return null;
}
```

### Database Practices

```
Rule:  Controller → Service → Repository → DB
Never: Controller → DB directly
Never: Worker → DB directly
Always: Use Prisma models only
Always: Wrap multi-step operations in transactions
```

---

## 🎨 Frontend Architecture

Frontend is organized into **three strict layers** that must never be mixed:

```
src/
├── data/           # API calls, models, transformers
├── logic/          # Hooks, state, contexts
└── presentation/   # UI components only (no logic)
```

```js
// ✅ Correct — component uses hook, hook uses service
const WorkflowList = () => {
  const { workflows } = useWorkflows();          // logic layer
  return workflows.map(w => <WorkflowCard w={w} />);
};

// ❌ Wrong — component calls API directly
const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  useEffect(() => { axios.get('/api/workflows').then(setWorkflows); }, []);
};
```

---

## ❌ Anti-Patterns (Do NOT do this)

| Anti-Pattern | Why it's wrong |
|---|---|
| Business logic in controllers | Breaks testability and reuse |
| Workers mutating context | Breaks execution determinism |
| Nodes executing DB logic | Breaks separation of concerns |
| Template resolution inside workers | Engine responsibility, not worker |
| Cross-module direct calls | Creates hidden coupling |
| Hardcoded datasource logic | Breaks plugin isolation |
| Swallowing errors silently | Hides failures during debugging |

---

## ⚙️ Engineering Philosophy

Jet Admin enforces these design decisions deliberately:

| Decision | Reason |
|---|---|
| Workers execute, nodes define | Enables strategy replacement and testability |
| Context is read-only for workers | Prevents hidden mutations and execution chaos |
| Inputs resolved before execution | Ensures predictable, deterministic worker behavior |
| Plugins are packages, not inline code | Enables independent versioning and release |
| Module isolation enforced | Prevents cascading failures and coupling |

> **These are not opinions — they are guarantees the system depends on.**

---

## 📈 Scaling Strategy

The architecture is designed to support distributed execution in future iterations:

```
Current:   Synchronous Worker Execution
Next:      Queue-based worker dispatch (RabbitMQ ready)
Future:    Distributed workflow runners + execution snapshots
```

**Why workers remain pure matters:** Stateless workers can be picked up by any runner — local, queued, or distributed — without code changes.

---

## 🔐 Security Model

- **Multi-tenancy:** All queries scoped to tenant context
- **RBAC:** Role-based permissions enforced at service layer
- **Credential storage:** Datasource secrets encrypted at rest
- **Query validation:** All user-supplied queries validated before execution
- **Execution sandboxing:** Workers run in isolated execution contexts

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Docker (recommended)
- Firebase project (for auth)

### Docker Setup (Recommended)

```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
cp .env.docker .env
docker compose up -d --build
```

Access: `http://localhost:80` (app) · API: `http://localhost:8090`

### Manual Setup

**Backend Setup:**
```bash
cd apps/backend
cp .env.example .env
npx prisma migrate dev
```

**Run full stack from root:**
```bash
cd ../..
npm install
npm run dev:all
```

### Environment Variables

**Backend `.env`:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/jetadmin
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
RABBITMQ_URL=amqp://localhost
API_PORT=4000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:4000
VITE_FIREBASE_CONFIG={"apiKey":"..."}
```

---

## 🤝 Contributing

### Branch Naming

```
feature/workflow-loop-node
fix/context-resolution-bug
docs/plugin-development-guide
refactor/worker-execution-pattern
```

### Commit Format

```
feat: add loop execution node
fix: resolve context variable mutation issue
docs: add datasource connector guide
refactor: extract worker strategy pattern
test: add workflow engine unit tests
```

### Pull Request Checklist

- [ ] No business logic in controllers
- [ ] Workers don't mutate context
- [ ] Modules remain isolated
- [ ] Error handling follows established pattern
- [ ] No console.log statements
- [ ] No unused imports
- [ ] Code follows naming conventions
- [ ] Tests added for new features

### Development Process

```
1. Fork the repository
2. Create a feature branch
3. Implement changes following coding standards
4. Write/update tests
5. Open a PR with description of changes
6. Address review feedback
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Workflow Engine](docs/workflow-engine.md) | Execution lifecycle, context model, design decisions |
| [Node Spec](docs/node-spec.md) | Node definition contract, worker patterns |
| [Plugin Development](docs/plugin-development.md) | Building datasource connectors and widget plugins |
| [Execution Context](docs/execution-context.md) | Context model, template resolution, immutability rules |
| [Worker Design](docs/worker-design.md) | Worker architecture, strategy patterns, scaling |
| [Contribution Rules](docs/contribution-rules.md) | Coding standards, PR process, anti-patterns |

---

## 📈 Roadmap

- [ ] Workflow versioning and rollback
- [ ] Visual execution debugger
- [ ] Distributed worker execution
- [ ] AI-powered workflow builder
- [ ] Plugin marketplace
- [ ] Real-time execution tracing
- [ ] Partial workflow resume
- [ ] Execution snapshots

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Flow, React Query |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | Firebase |
| Messaging | RabbitMQ |
| Charts | Chart.js |
| Realtime | Socket.IO |
| Infra | Docker, Linux |

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

Built with: React · Node.js · Prisma · React Flow · Chart.js · Socket.IO · PostgreSQL

---

<div align="center">

**⭐ Star this repo if it helps you**

[Report a Bug](https://github.com/Jet-labs/jet-admin/issues) · [Request a Feature](https://github.com/Jet-labs/jet-admin/issues) · [Discussions](https://github.com/Jet-labs/jet-admin/discussions)

</div>
