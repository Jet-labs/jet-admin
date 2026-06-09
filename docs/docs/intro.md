---
id: intro
title: Introduction to Jet Admin
sidebar_label: Introduction
sidebar_position: 1
description: Welcome to Jet Admin - The comprehensive open-source analytics platform and internal tools builder.
---

# Welcome to Jet Admin

<div align="center">

<img src="/img/logo.png" alt="Jet Admin Logo" width="200"/>

### 🚀 The Complete Platform for Building Internal Tools

**Connect your data · Build workflows · Create dashboards · Automate everything**

[![Quick Start](https://img.shields.io/badge/Quick_Start-Get_Started-2496ED?style=for-the-badge)](./setup/docker-deployment)
[![API Reference](https://img.shields.io/badge/API_Reference-View_Docs-339933?style=for-the-badge)](./api-reference/index)

</div>

---

## What is Jet Admin?

Jet Admin is an open-source analytics and internal tools platform designed for developers and data teams. It allows you to rapidly build custom dashboards, data-driven interfaces, and automated workflows on top of your existing databases and APIs—without writing boilerplate code.

### The Problem It Solves
Building internal tools from scratch often means re-inventing the wheel: setting up authentication, role-based access control (RBAC), API endpoints, UI components, state management, and deployment pipelines. Jet Admin solves this by providing a complete, production-ready fabric where you can focus entirely on your business logic.

Compared to a custom tool built from scratch, Jet Admin offers:
- **Zero UI Boilerplate:** A drag-and-drop widget canvas with pre-built, responsive React components.
- **Unified Data Access:** An Integration Fabric that connects securely to databases (PostgreSQL, MySQL, MongoDB, etc.) and APIs (REST, GraphQL, Stripe, etc.) out-of-the-box.
- **Visual Workflows:** A workflow engine (orchestrator + executor) for building complex, event-driven processes.
- **Security by Default:** Built-in JWT authentication and fine-grained role-based permissions.

## Core Philosophy & Design Principles

1. **Developer First:** While the platform offers visual builders, it never abstracts away code when you need it. You can inject Javascript everywhere using `{{binding}}` expressions evaluated in a secure sandbox.
2. **Extensibility:** The architecture is modular. Need a new widget or datasource connector? You can extend the platform using the internal plugin system.
3. **Real-time Everything:** Built heavily on Socket.IO, Jet Admin ensures that data updates, workflow execution states, and multi-user presence are propagated to clients instantly.
4. **Decoupled Architecture:** The backend API and frontend SPA are strictly separated, communicating via a well-defined REST API and WebSockets.

## Technology Stack & Rationale

Jet Admin is built on a modern, robust JavaScript stack:

### Frontend
- **React 18 + Vite:** For building a fast, component-driven single-page application (SPA).
- **Zustand:** For lightweight, predictable global state management, avoiding the boilerplate of Redux.
- **TanStack Query (React Query):** For managing server state, caching query results, and handling invalidation automatically.
- **React Flow:** Powers the visual node-based workflow canvas.
- **Vega-Lite:** For declarative, highly customizable data visualizations.
- **Socket.IO Client:** For real-time event updates from the server.

### Backend
- **Node.js + Express:** A non-blocking, event-driven runtime ideal for heavy I/O operations (like querying dozens of databases concurrently).
- **Prisma ORM:** Provides type-safe database access and automated schema migrations against the core operational database.
- **PostgreSQL:** The primary operational database storing app metadata, widget configurations, user roles, and workflow definitions.
- **Socket.IO:** Manages real-time bidirectional event bus routing to connected frontend clients.
- **pg-boss:** A robust job queue built on Postgres for orchestrating background tasks and workflow execution without needing external infrastructure like Redis.

## Repository Map

Jet Admin is structured as a **Yarn Workspace Monorepo**, allowing code sharing between the frontend and backend without publishing to npm.

```text
jet-admin/
├── apps/
│   ├── backend/             # Node.js + Express API server, Prisma schema
│   └── frontend/            # React SPA (Vite), Zustand stores
├── packages/
│   ├── datasource-types/    # Shared schemas for DB/API connections
│   ├── datasources-logic/   # Backend drivers for executing queries
│   ├── datasources-ui/      # Frontend forms for configuring connections
│   ├── expression-engine/   # AST-based evaluator for {{bindings}}
│   ├── ui/                  # Shared atomic React components
│   ├── widget-types/        # Shared widget metadata and event definitions
│   ├── widgets-logic/       # Backend data transformers for widgets
│   ├── widgets-ui/          # Frontend widget configuration forms
│   ├── workflow-edges/      # Custom React Flow edges
│   └── workflow-nodes/      # Frontend components for Workflow Nodes
├── docs/                    # Docusaurus documentation site (you are here)
└── docker-compose.yml       # Standard deployment configuration
```

- **`apps/`**: Contains the runnable applications.
- **`packages/`**: Contains modularized, highly decoupled feature systems shared across apps. For example, the backend imports `@jet-admin/datasources-logic` to run queries, while the frontend imports `@jet-admin/datasources-ui` to render the setup form.

---
Next, explore the [System Architecture](./architecture/system-overview) to understand how these pieces fit together.
