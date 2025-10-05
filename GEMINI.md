# Project Overview

This is a monorepo for **Jet Admin**, a web-based PostgreSQL management and visualization platform. It allows users to edit data, build graphs, and create dashboards using queries.

The project is composed of:

*   **Frontend:** A React application built with Vite, using Material-UI for components, and various charting libraries for data visualization.
*   **Backend:** A Node.js application using Express.js, with Prisma as the ORM for PostgreSQL.
*   **Packages:** Shared packages for widgets, widget-types, and datasource logic.
*   **Documentation:** A Docusaurus-based documentation site.

# Building and Running

## Prerequisites

*   Node.js
*   npm (or a compatible package manager)
*   PostgreSQL

## Installation

1.  Clone the repository.
2.  Install root dependencies:
    ```bash
    npm install
    ```
3.  Install dependencies for all workspaces:
    ```bash
    npm install --workspaces
    ```

## Running the Application

### Frontend

To start the frontend development server:

```bash
npm run start:f
```

This will start the Vite development server, typically on `http://localhost:5173`.

### Backend

To start the backend server:

1.  Set up your PostgreSQL database and configure the connection string in a `.env` file in the `apps/backend` directory.
2.  Run the database migrations:
    ```bash
    cd apps/backend
    npx prisma migrate dev
    ```
3.  (Optional) Seed the database with initial data:
    ```bash
    npm run seed
    ```
4.  Start the backend development server:
    ```bash
    npm run start:b
    ```

This will start the Node.js server with `nodemon`, which will automatically restart on file changes.

### All Services

To start both the frontend and backend concurrently:

```bash
npm run start:all
```

# Development Conventions

*   **Monorepo:** The project uses npm workspaces to manage the frontend, backend, and shared packages.
*   **Styling:** The frontend uses a combination of Material-UI and Tailwind CSS for styling.
*   **State Management:** The frontend uses `react-query` for server state management.
*   **API:** The backend provides a REST API for the frontend.
*   **Database:** The backend uses Prisma to interact with the PostgreSQL database.
*   **Linting:** The frontend uses ESLint for code quality.
*   **Testing:** There are no dedicated test scripts in the root or app-level `package.json` files.
