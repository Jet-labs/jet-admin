<div align="center">

<img src="docs/static/img/logo.png" alt="Jet Admin Logo" width="140"/>

# Jet Admin

### 🚀 Open-Source Analytics Platform & Internal Tools Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](docker-compose.cloud.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](apps/frontend)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white)](apps/backend)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**Connect your data sources · Build powerful queries · Design workflow automations · Visualize with widgets & dashboards**

[📖 Documentation](https://jet-labs.github.io/jet-admin/) · [🎯 Live Demo](#demo) · [⚡ Quick Start](#-quick-start) · [🤝 Contributing](docs/contributing.md)

<br/>

<a href="https://www.producthunt.com/products/jet-admin-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-jet-admin-4" target="_blank" rel="noopener noreferrer">
  <img alt="Jet Admin - Web-based PostgreSQL tables manager and visualizer | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=958307&theme=light&t=1770205579857">
</a>

</div>

---

## 🌟 Overview

**Jet Admin** is a comprehensive open-source analytics platform that evolved from a PostgreSQL database manager into a full-featured internal tools builder. Empower your team to connect multiple data sources, create reusable queries, build visual workflow automations, and design interactive dashboards with customizable widgets.

<div align="center">

### 💡 What You Can Build

</div>

<table>
<tr>
<td width="25%" align="center">
  <h4>📊 BI Dashboards</h4>
  Real-time KPI monitoring and data visualization
</td>
<td width="25%" align="center">
  <h4>🔄 Data Pipelines</h4>
  Visual workflow builder with conditional logic
</td>
<td width="25%" align="center">
  <h4>🛠️ Admin Tools</h4>
  CRUD interfaces for your databases
</td>
<td width="25%" align="center">
  <h4>📈 Analytics Reports</h4>
  Query-based charts and data tables
</td>
</tr>
</table>

---

## ✨ Key Features

### 🔌 Multi-Datasource Support
**25+ Integrations** with extensible connector architecture

<table>
<tr>
<th width="33%">💾 Databases</th>
<th width="33%">☁️ Cloud Services</th>
<th width="33%">🔗 APIs & Messaging</th>
</tr>
<tr>
<td>

- PostgreSQL
- MySQL
- MongoDB
- MS SQL Server
- SQLite
- CockroachDB
- Oracle
- Redis
- Neo4j

</td>
<td>

- Google BigQuery
- Google Sheets
- Google Analytics
- Firestore
- Supabase
- Airtable
- Amazon S3
- Elasticsearch
- Kafka

</td>
<td>

- REST API
- GraphQL
- Slack
- Twilio
- SendGrid
- Stripe
- Jira
- Notion
- RabbitMQ

</td>
</tr>
</table>

### 📝 Powerful Data Query Engine

<table>
<tr>
<td width="50%">

**🎯 Smart Queries**
- Parameterized queries with dynamic variables
- SQL & NoSQL native support
- Real-time testing panel
- AI-assisted generation

</td>
<td width="50%">

**⚡ High Performance**
- Query result caching
- Optimized execution
- Batch processing
- Error handling

</td>
</tr>
</table>

### 🔄 Visual Workflow Builder

Build complex automation pipelines with drag-and-drop simplicity:

```
┌─────────────────────────────────────────────────────────┐
│  🟢 Start → 🔷 Query → 📜 Script → 🔀 Condition        │
│                                      ├─ True → 🔴 End   │
│                                      └─ False → 🔁 Loop │
└─────────────────────────────────────────────────────────┘
```

<details>
<summary><b>View All Node Types</b></summary>

| Node | Description |
|------|-------------|
| 🟢 **Start** | Entry point with input argument definitions |
| 🔷 **Data Query** | Execute any configured data query |
| 📜 **JavaScript** | Custom JS code execution with full context access |
| 🔀 **Condition** | Branch logic based on expressions |
| 🔁 **Loop** | Iterate over arrays with nested execution |
| ⏱️ **Delay** | Pause execution for specified duration |
| 🔴 **End** | Terminal node with output mapping |

</details>

### 📊 Rich Widget System

Create stunning visualizations connected to your workflows:

<table>
<tr>
<td width="33%" align="center">

**📈 Chart Types**

Bar · Line · Pie · Radar  
Bubble · Scatter · Polar

</td>
<td width="33%" align="center">

**📋 Data Displays**

Tables · Text · Markdown  
Custom HTML · iFrames

</td>
<td width="33%" align="center">

**🎨 Features**

Real-time updates  
Custom styling · Multi-dataset  
Auto-refresh · Export

</td>
</tr>
</table>

### 🖥️ Dashboard Builder

- 🎨 **Drag-and-drop Layout** - Grid-based widget positioning
- 📱 **Responsive Design** - Adapts to all screen sizes
- 📑 **Template System** - Clone and reuse dashboards
- 🖨️ **Export to PDF** - Generate professional reports

### 👥 Enterprise-Ready Multi-Tenancy

<table>
<tr>
<td width="50%">

**🔒 Security**
- Complete tenant isolation
- Role-based access control (RBAC)
- API key authentication
- Audit logging

</td>
<td width="50%">

**👤 User Management**
- Invite team members
- Granular permissions
- SSO support
- Activity tracking

</td>
</tr>
</table>

### 🎁 Additional Capabilities

<table>
<tr>
<td width="50%">

- ⏰ **Cron Jobs** - Schedule recurring workflows
- 📋 **Table Manager** - Direct CRUD operations
- 🔔 **Real-time Notifications** - WebSocket updates
- 🤖 **AI Chat Assistant** - Query generation helper

</td>
<td width="50%">

- 🎣 **Database Triggers** - React to database events
- 📊 **Data Transformations** - ETL pipelines
- 🔍 **Search & Filter** - Advanced data exploration
- 📤 **Import/Export** - Data migration tools

</td>
</tr>
</table>

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (React)"]
        DB[Dashboard Builder]
        WE[Workflow Editor]
        WC[Widget Config]
        QE[Query Editor]
    end
    
    subgraph Backend["⚙️ Backend (Node.js)"]
        API[REST API / WebSocket]
        MS[Module System]
        WEE[Workflow Execution Engine]
    end
    
    subgraph Data["💾 Data Layer"]
        P[Prisma ORM]
        DC[Datasource Connectors]
    end
    
    Frontend --> API
    API --> MS
    MS --> WEE
    WEE --> P
    WEE --> DC
```

</div>

<details>
<summary><b>Tech Stack Details</b></summary>

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 · Vite · TailwindCSS · React Query · React Flow |
| **Backend** | Node.js · Express.js · Socket.IO |
| **ORM** | Prisma |
| **Authentication** | Firebase Auth |
| **Message Queue** | RabbitMQ |
| **Containerization** | Docker · Docker Compose |

</details>

---

## 🚀 Quick Start

### Prerequisites

<table>
<tr>
<td>

- ✅ Node.js 18+
- ✅ PostgreSQL 14+
- ✅ Docker & Docker Compose

</td>
<td>

- ✅ Firebase project
- ✅ Git
- ✅ 4GB+ RAM recommended

</td>
</tr>
</table>

### 🐳 Option 1: Docker Deployment (Recommended)

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

🎉 **Access the application at** `http://localhost:3000`

### 🛠️ Option 2: Manual Setup

<details>
<summary><b>Backend Setup</b></summary>

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

</details>

<details>
<summary><b>Frontend Setup</b></summary>

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

</details>

<details>
<summary><b>Environment Configuration</b></summary>

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jetadmin
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-jwt-secret
```

**Frontend (public/config.js)**
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

</details>

---

## 📁 Project Structure

```
jet-admin/
├── 📱 apps/
│   ├── backend/                 # Node.js Express API
│   │   ├── config/              # App configurations
│   │   ├── modules/             # Feature modules
│   │   │   ├── datasource/      # Data source management
│   │   │   ├── dataQuery/       # Query engine
│   │   │   ├── workflow/        # Workflow execution engine
│   │   │   ├── widget/          # Widget management
│   │   │   └── dashboard/       # Dashboard management
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
├── 📦 packages/                 # Shared packages (monorepo)
│   ├── datasource-types/        # Datasource form configs
│   ├── datasources-logic/       # Datasource connectors
│   ├── widgets/                 # Widget implementations
│   └── workflow-nodes/          # Workflow node components
│
├── 📚 docs/                     # Docusaurus documentation
├── 🐳 docker-compose.cloud.yml  # Docker deployment
└── 📄 Dockerfile.*              # Container definitions
```

---

## 📚 Documentation

<div align="center">

### 📖 [**Full Documentation →**](https://jet-labs.github.io/jet-admin/)

</div>

<table>
<tr>
<th>🎯 Getting Started</th>
<th>🏛️ Architecture</th>
<th>✨ Features</th>
</tr>
<tr>
<td>

- [Introduction](https://jet-labs.github.io/jet-admin/docs/intro)
- [Docker Deployment](https://jet-labs.github.io/jet-admin/docs/setup/docker-deployment)
- [Backend Setup](https://jet-labs.github.io/jet-admin/docs/setup/setup-backend)
- [Frontend Setup](https://jet-labs.github.io/jet-admin/docs/setup/setup-frontend)

</td>
<td>

- [Backend Architecture](https://jet-labs.github.io/jet-admin/docs/architecture/backend-architecture)
- [Frontend Architecture](https://jet-labs.github.io/jet-admin/docs/architecture/frontend-architecture)
- [Database Schema](https://jet-labs.github.io/jet-admin/docs/architecture/database-schema)
- [Data Flow](https://jet-labs.github.io/jet-admin/docs/concepts/data-flow)

</td>
<td>

- [Datasources](https://jet-labs.github.io/jet-admin/docs/features/datasource/overview)
- [Data Queries](https://jet-labs.github.io/jet-admin/docs/features/data-query/overview)
- [Workflows](https://jet-labs.github.io/jet-admin/docs/features/workflow/overview)
- [Widgets & Charts](https://jet-labs.github.io/jet-admin/docs/features/widgets/charts)
- [Dashboards](https://jet-labs.github.io/jet-admin/docs/features/dashboard/overview)

</td>
</tr>
</table>

---

## 🤝 Contributing

<div align="center">

**We ❤️ contributions from the community!**

[![Contributors](https://img.shields.io/github/contributors/Jet-labs/jet-admin?style=flat-square)](https://github.com/Jet-labs/jet-admin/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/Jet-labs/jet-admin?style=flat-square)](https://github.com/Jet-labs/jet-admin/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Jet-labs/jet-admin?style=flat-square)](https://github.com/Jet-labs/jet-admin/pulls)

</div>

### How to Contribute

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🎉 Open** a Pull Request

### 🎯 Areas We Need Help

<table>
<tr>
<td width="50%">

**🔌 New Connectors**
Add support for more databases and APIs

**📊 Widget Types**
Create new visualization components

</td>
<td width="50%">

**🔄 Workflow Nodes**
Implement additional automation nodes

**📖 Documentation**
Improve guides and examples

</td>
</tr>
</table>

Check out our [**Contributing Guide**](https://jet-labs.github.io/jet-admin/docs/contributing) for detailed information.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

<div align="center">

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React Flow](https://img.shields.io/badge/React_Flow-FF6B6B?style=for-the-badge&logo=react&logoColor=white)](https://reactflow.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

</div>

---

<div align="center">

### ⭐ Star this repo if you find it useful!

<a href="https://github.com/Jet-labs/jet-admin/stargazers">
  <img src="https://img.shields.io/github/stars/Jet-labs/jet-admin?style=social" alt="Star on GitHub">
</a>

**[🐛 Report Bug](https://github.com/Jet-labs/jet-admin/issues)** · 
**[💡 Request Feature](https://github.com/Jet-labs/jet-admin/issues)** · 
**[💬 Join Discussions](https://github.com/Jet-labs/jet-admin/discussions)**

---

**Made with ❤️ by the Jet Labs Team**

</div>