<a href="https://www.producthunt.com/posts/jet-admin-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jet&#0045;admin&#0045;3" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=474841&theme=light" alt="Jet&#0032;Admin - PostgreSQL&#0032;tables&#0032;manager&#0032;and&#0032;admin&#0032;dashboard | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

# **Jet Admin**

Welcome to Jet Admin, a comprehensive web-based PostgreSQL management and visualization platform. Edit data, build graphs, and create dashboards using queries.

![mackup_final](https://github.com/user-attachments/assets/ed50a792-470e-4701-9a65-e71f07830c36)

## Overview

Jet Admin combines robust database management capabilities with powerful visualization tools, making it ideal for both developers and operations teams. The project consists of a React-based frontend and a Node.js backend for managing PostgreSQL databases through an intuitive web interface.

## Core Features

- **Database Management**
  - Full DML support (Insert, Update, Delete, Select)
  - Bulk operations (Delete, Update, Insert)
  - DDL operations (Create, Alter, Drop)

- **Query Management**
  - PostgreSQL query creation and execution
  - JavaScript-based queries
  - REST API-based queries

- **Visualization**
  - Multiple chart types (Line, Bar, Pie, Radar, etc.)
  - Drag-and-drop dashboard creation
  - Real-time data updates

- **Security**
  - Firebase Authentication
  - Role-based access control
  - Multi-tenant support
  - Granular permissions system

## Quick Start

### Frontend Setup
```bash
cd apps/frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd apps/backend
npm install
npx prisma migrate dev
npm run dev
```

For detailed setup instructions, refer to:
- [Frontend Setup Guide](https://jet-labs.github.io/jet-admin/docs/setup/setup-frontend)
- [Backend Setup Guide](https://jet-labs.github.io/jet-admin/docs/setup/setup-backend)

## Documentation

Visit our [documentation website](https://jet-labs.github.io/jet-admin/) for:
- Detailed setup guides
- Architecture overview
- Feature documentation
- API references
- Best practices

## 🚀 Contributions

This project is still growing — and yes, it has a few bugs and rough edges. If you’re interested in helping out, **we’d love your contributions!**

### How to Help
- Fix bugs 🐛  
- Improve code structure 🧱  
- Suggest or add new features ✨  
- Clean up or improve documentation 📝  

### Getting Started
1. Fork the repo  
2. Create a branch  
3. Make your changes  
4. Open a pull request — that’s it!

If you’re not sure where to start, check out the [issues](./issues) tab.

## License

This project is licensed under the MIT License.
