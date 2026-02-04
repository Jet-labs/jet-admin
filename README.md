
<div align="center">
  <img src="docs/static/img/logo.png" alt="Jet Admin Logo" width="120"/>
  
  # Jet Admin
  
  ### Open-Source Analytics Platform & Internal Tools Builder
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.cloud.yml)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](apps/frontend)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](apps/backend)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

  **Connect your data sources • Build powerful queries • Design workflow automations • Visualize with widgets & dashboards**

  [Documentation](https://jet-labs.github.io/jet-admin/) • [Live Demo](#demo) • [Quick Start](#-quick-start) • [Contributing](docs/contributing.md)

</div>

<a href="https://www.producthunt.com/products/jet-admin-3?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-jet-admin-4" target="_blank" rel="noopener noreferrer"><img alt="Jet Admin - Web-based PostgreSQL tables manager and visualizer | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=958307&amp;theme=light&amp;t=1770205579857"></a>

<a href="https://www.producthunt.com/products/jet-admin-3/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-jet&#0045;admin&#0045;3" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1059394&theme=light" alt="Jet&#0032;Admin - Built&#0032;for&#0032;devs | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

---

## 🌟 Overview

Jet Admin is a **comprehensive open-source analytics platform** that has evolved from a PostgreSQL database manager into a full-featured internal tools builder. It enables teams to connect multiple data sources, create reusable queries, build visual workflow automations, and design interactive dashboards with customizable widgets.

### What You Can Build

- 📊 **Business Intelligence Dashboards** - Real-time KPI monitoring and data visualization
- 🔄 **Automated Data Pipelines** - Visual workflow builder with conditional logic
- 🛠️ **Internal Admin Tools** - CRUD interfaces for your databases
- 📈 **Analytics Reports** - Query-based charts and data tables
- 🏢 **Multi-tenant Applications** - Isolated environments per organization

---

## ✨ Key Features

### 🔌 Multi-Datasource Support (25+ Integrations)

Connect to virtually any data source with our extensible connector architecture:

| Databases | Cloud Services | APIs & Messaging |
|-----------|---------------|------------------|
| PostgreSQL | Google BigQuery | REST API |
| MySQL | Google Sheets | GraphQL |
| MongoDB | Google Analytics | Slack |
| MS SQL Server | Firestore | Twilio |
| SQLite | Supabase | SendGrid |
| CockroachDB | Airtable | Stripe |
| Oracle | Amazon S3 | Jira |
| Redis | Elasticsearch | Notion |
| Neo4j | Kafka | RabbitMQ |

### 📝 Data Query Engine

- **Parameterized Queries** - Define reusable queries with dynamic variables
- **Query Variables** - Pass arguments at runtime for flexible data retrieval
- **SQL & NoSQL Support** - Native query languages per datasource type
- **Query Testing Panel** - Test and validate queries before deployment
- **AI-Assisted Query Generation** - Generate queries using natural language

### 🔄 Visual Workflow Builder

Build complex automation pipelines with our drag-and-drop workflow editor:

**Node Types:**
| Node | Description |
|------|-------------|
| 🟢 **Start** | Entry point with input argument definitions |
| 🔷 **Data Query** | Execute any configured data query |
| 📜 **JavaScript** | Custom JS code execution with full context access |
| 🔀 **Condition** | Branch logic based on expressions |
| 🔁 **Loop** | Iterate over arrays with nested execution |
| ⏱️ **Delay** | Pause execution for specified duration |
| 🔴 **End** | Terminal node with output mapping |

**Edge Types:**
- Standard flow edges
- Conditional branches (true/false paths)
- Error handling edges

### 📊 Widget System

Create stunning visualizations connected to your workflows:

| Chart Types | Data Displays | Special |
|-------------|---------------|---------|
| 📊 Bar Chart | 📋 Data Table | 🌐 iFrame |
| 📈 Line Chart | 📝 Text/Markdown | |
| 🥧 Pie Chart | | |
| 🎯 Radar Chart | | |
| 🔵 Bubble Chart | | |
| 📉 Scatter Plot | | |
| 🎨 Polar Area | | |

**Widget Features:**
- Connect to workflow outputs for real-time data
- Customizable styling with CSS
- Multi-dataset support per widget
- Field mapping with variable path picker
- Automatic refresh capabilities

### 🖥️ Dashboard Builder

- **Drag-and-drop Layout** - Arrange widgets with grid-based positioning
- **Responsive Design** - Dashboards adapt to different screen sizes
- **Dashboard Cloning** - Duplicate dashboards as templates
- **Print/Export** - Generate PDF reports from dashboards

### 👥 Multi-Tenant Architecture

- **Tenant Isolation** - Complete data separation per organization
- **Role-Based Access Control (RBAC)** - Granular permission system
- **User Management** - Invite and manage users per tenant
- **API Key Authentication** - Programmatic access with scoped permissions

### 📋 Additional Features

- **Cron Jobs** - Schedule recurring workflow executions
- **Audit Logging** - Track all user actions and changes
- **Database Table Manager** - Direct CRUD operations on tables
- **Database Triggers** - Listen to database events
- **Real-time Notifications** - WebSocket-based live updates
- **AI Chat Assistant** - Integrated AI helper for query generation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │Dashboard│ │ Workflow │ │  Widget  │ │  Query    │           │
│  │ Builder │ │  Editor  │ │  Config  │ │  Editor   │           │
│  └─────────┘ └──────────┘ └──────────┘ └───────────┘           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API / WebSocket
┌─────────────────────────┴───────────────────────────────────────┐
│                        Backend (Node.js)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Module System                          │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────────┐  │   │
│  │  │Datasource│ │DataQuery │ │Workflow│ │Widget/Dashboard│  │   │
│  │  └─────────┘ └──────────┘ └────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Workflow Execution Engine                    │   │
│  │  ┌───────────┐ ┌─────────────┐ ┌──────────────────────┐  │   │
│  │  │Orchestrator│ │DAG Scheduler│ │  Node Handlers       │  │   │
│  │  └───────────┘ └─────────────┘ └──────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                     Data Layer                                   │
│  ┌──────────┐  ┌────────────────────────────────────────────┐   │
│  │  Prisma  │  │          Datasource Connectors              │   │
│  │(Metadata)│  │  PostgreSQL │ MySQL │ MongoDB │ REST │ ... │   │
│  └──────────┘  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS, React Query, React Flow |
| **Backend** | Node.js, Express.js, Socket.IO |
| **ORM** | Prisma |
| **Authentication** | Firebase Auth |
| **Message Queue** | RabbitMQ (for workflow workers) |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (recommended)
- Firebase project (for authentication)

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin

# Configure environment
cp .env.docker.example .env.docker
# Edit .env.docker with your configuration

# Start all services
docker-compose -f docker-compose.cloud.yml up -d
```

Access the application at `http://localhost:3000`

### Option 2: Manual Setup

#### Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and Firebase credentials

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npm run seed

# Start the backend
npm run dev
```

#### Frontend Setup

```bash
cd apps/frontend

# Install dependencies
npm install

# Configure environment
cp public/config.example.js public/config.js
# Edit config.js with your API endpoint

# Start the frontend
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jetadmin
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-jwt-secret
```

#### Frontend (public/config.js)
```javascript
window.JET_CONFIG = {
  API_URL: 'http://localhost:4000',
  FIREBASE_CONFIG: {
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id'
  }
};
```

---

## 📁 Project Structure

```
jet-admin/
├── apps/
│   ├── backend/                 # Node.js Express API
│   │   ├── config/              # App configurations
│   │   ├── modules/             # Feature modules
│   │   │   ├── datasource/      # Data source management
│   │   │   ├── dataQuery/       # Query engine
│   │   │   ├── workflow/        # Workflow execution engine
│   │   │   ├── widget/          # Widget management
│   │   │   ├── dashboard/       # Dashboard management
│   │   │   ├── tenant/          # Multi-tenancy
│   │   │   └── ...              # Other modules
│   │   ├── prisma/              # Database schema & migrations
│   │   └── utils/               # Shared utilities
│   │
│   └── frontend/                # React SPA
│       ├── src/
│       │   ├── data/            # API clients & models
│       │   ├── logic/           # Contexts & hooks
│       │   └── presentation/    # UI components & pages
│       └── public/              # Static assets
│
├── packages/                    # Shared packages (monorepo)
│   ├── datasource-types/        # Datasource form configs
│   ├── datasources-logic/       # Datasource connectors
│   ├── datasources-ui/          # Query response viewers
│   ├── widgets/                 # Widget implementations
│   ├── workflow-nodes/          # Workflow node components
│   ├── workflow-edges/          # Workflow edge components
│   └── json-forms-renderers/    # Custom form renderers
│
├── docs/                        # Docusaurus documentation
├── docker-compose.cloud.yml     # Docker deployment
└── Dockerfile.*                 # Container definitions
```

---

## 📚 Documentation

Comprehensive documentation is available at **[jet-labs.github.io/jet-admin](https://jet-labs.github.io/jet-admin/)**

### Quick Links

- [Introduction](https://jet-labs.github.io/jet-admin/docs/intro)
- [Backend Architecture](https://jet-labs.github.io/jet-admin/docs/architecture/backend-architecture)
- [Frontend Architecture](https://jet-labs.github.io/jet-admin/docs/architecture/frontend-architecture)
- [Database Schema](https://jet-labs.github.io/jet-admin/docs/architecture/database-schema)
- [Data Flow](https://jet-labs.github.io/jet-admin/docs/concepts/data-flow)
- [Workflow Architecture](https://jet-labs.github.io/jet-admin/docs/concepts/workflow-architecture)

### Feature Guides

- [Datasources](https://jet-labs.github.io/jet-admin/docs/features/datasource/overview)
- [Data Queries](https://jet-labs.github.io/jet-admin/docs/features/data-query/overview)
- [Workflows](https://jet-labs.github.io/jet-admin/docs/features/workflow/overview)
- [Widgets & Charts](https://jet-labs.github.io/jet-admin/docs/features/widgets/charts)
- [Dashboards](https://jet-labs.github.io/jet-admin/docs/features/dashboard/overview)
- [Users & Roles](https://jet-labs.github.io/jet-admin/docs/features/users)

### Setup Guides

- [Docker Deployment](https://jet-labs.github.io/jet-admin/docs/setup/docker-deployment)
- [Backend Setup](https://jet-labs.github.io/jet-admin/docs/setup/setup-backend)
- [Frontend Setup](https://jet-labs.github.io/jet-admin/docs/setup/setup-frontend)

---

## 🤝 Contributing

We welcome contributions from the community! Jet Admin is actively growing and we'd love your help.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Keep PRs focused and atomic

Check out our [Contributing Guide](https://jet-labs.github.io/jet-admin/docs/contributing) for detailed information.

### Areas We Need Help

- 🔌 **New Datasource Connectors** - Add support for more databases and APIs
- 📊 **Widget Types** - Create new visualization components
- 🔄 **Workflow Nodes** - Implement additional automation nodes
- 📖 **Documentation** - Improve guides and examples
- 🐛 **Bug Fixes** - Check the [issues tab](https://github.com/Jet-labs/jet-admin/issues)

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [Node.js](https://nodejs.org/), and [Prisma](https://www.prisma.io/)
- Workflow editor powered by [React Flow](https://reactflow.dev/)
- Charts rendered with [Chart.js](https://www.chartjs.org/)
- Documentation built with [Docusaurus](https://docusaurus.io/)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/Jet-labs/jet-admin/issues) • [Request Feature](https://github.com/Jet-labs/jet-admin/issues) • [Join Discussions](https://github.com/Jet-labs/jet-admin/discussions)

</div>
This README accurately reflects the evolved state of Jet Admin as described in the directory structure, highlighting its transformation from a PostgreSQL manager to a comprehensive analytics platform with datasources, queries, workflows, widgets, dashboards, and multi-tenant capabilities.
