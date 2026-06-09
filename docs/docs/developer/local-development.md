---
id: local-development
title: Local Development Setup
sidebar_label: Local Setup & Conventions
sidebar_position: 2
description: Step-by-step guide to setting up Jet Admin locally and codebase conventions.
---

# Local Development Setup & Codebase Conventions

This guide walks you through setting up Jet Admin for local development, allowing you to contribute to the core platform or build custom extensions.

## Prerequisites

Before starting, ensure your system has:
- **Node.js** (v18.0.0 or higher)
- **NPM** (v9.0.0 or higher, supporting workspaces)
- **PostgreSQL** (v13 or higher running locally or via Docker)

---

## Local Development Setup

Jet Admin uses an NPM Workspace Monorepo. Follow these steps to get both the frontend and backend running locally in watch mode.

### 1. Clone the Repository
```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
```

### 2. Install Dependencies
Run npm install from the repository root. This will install dependencies for all workspace packages and apps.
```bash
npm install
```

### 3. Setup PostgreSQL Database
Ensure you have a local PostgreSQL server running. Create an empty database named `jetadmin_dev`.

### 4. Configure Backend Environment
Navigate to the backend app and copy the example environment file.
```bash
cd apps/backend
cp .env.example .env
```
Open `.env` and set the required variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jetadmin_dev"
JWT_SECRET="local-dev-secret-do-not-use-in-prod"
ENCRYPTION_KEY="01234567890123456789012345678901" # Exactly 32 chars
```

### 5. Run Database Migrations
Initialize your local database schema using Prisma:
```bash
npx prisma migrate dev
```
*Optional:* You can run `npm run seed` if a seed script is provided to populate default roles.

### 6. Start the Development Servers

Jet Admin is composed of multiple packages that need to be built/watched. Open three separate terminal tabs at the repository root.

**Terminal 1: Watch Shared Packages**
```bash
npm run dev:all-packages
```
*This compiles packages like `@jet-admin/widgets-ui` when changes are made.*

**Terminal 2: Start Backend**
```bash
cd apps/backend
npm run dev
```
*The Express server will start on `http://localhost:8090`.*

**Terminal 3: Start Frontend**
```bash
cd apps/frontend
npm run dev
```
*The Vite dev server will start on `http://localhost:3000`.*

Open your browser to `http://localhost:3000` to begin developing.

---

## Running Tests

Jet Admin uses Jest for testing.

**Backend Tests:**
```bash
cd apps/backend
npm test
```

**Testing Shared Packages:**
```bash
cd packages/expression-engine
npm test
```

---

## Codebase Conventions

When contributing to Jet Admin, please adhere to the following conventions:

### File and Folder Naming
- **Directories:** `camelCase` (e.g., `userManagement`, `dataQuery`).
- **Files:** `camelCase.type.js` (e.g., `workflow.controller.js`, `appPage.validator.js`).
- **React Components:** `PascalCase.jsx` (e.g., `TableWidget.jsx`).

### Constants Management
Do not hardcode magic strings. Centralize them in `constants.js` files located either at the app root (`apps/backend/constants.js`) or the package root.
- Use uppercase snake_case for constant keys: `SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE`.

### State Management Patterns (Frontend)
Jet Admin uses Zustand. Stores are located in `apps/frontend/src/logic/stores/`.
- **Slice Pattern:** Break large stores into logical slices.
- **Immutability:** Always update state immutably.
- **Prefixing:** Action functions inside stores should typically be prefixed with verbs (e.g., `setWidgetProperty`, `clearSelection`).

### API Response Envelope
All API endpoints must return a standardized JSON envelope to the frontend:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
If an error occurs, `success` is `false`, and `error` contains a descriptive message or code.

### Error Codes
Standardize HTTP error codes:
- `400 Bad Request`: Validation failures (Zod schema mismatch).
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: RBAC permission denied.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled backend exception.
