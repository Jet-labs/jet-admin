---
sidebar_position: 6
title: Docker Development Workflow 
---

# 🐳 Docker Development Workflow

This is your cheat sheet for updating Docker containers during development. Since our Docker setup creates optimized, isolated images, you need to tell Docker when to rebuild things based on what files you changed.

## ⚡ Quick Reference

| If you changed... | Run this command |
| :--- | :--- |
| **Frontend Code** (`apps/frontend/**`) | `docker compose up -d --build frontend` |
| **Backend Code** (`apps/backend/**`) | `docker compose up -d --build backend` |
| **Shared Packages** (`packages/**`) | `docker compose up -d --build` |
| **Dependencies** (`package.json`) | `docker compose up -d --build` |
| **Environment** (`.env`) | `docker compose up -d` (No build needed) |

---

## 🛠️ Detailed Scenarios

### 1. I changed Frontend UI or Logic
*(e.g., edited `App.jsx`, CSS files, or components)*

Since the frontend is built **inside** the container (Multi-Stage Build), you must rebuild the container to re-compile the checks.

```bash
docker compose up -d --build frontend
```

### 2. I changed Backend API or Services
*(e.g., edited controllers, services, or utils)*

The backend code needs to be copied into the container image.

```bash
docker compose up -d --build backend
```

### 3. I installed a new NPM Package
*(e.g., ran `npm install moment`)*

The container needs to run `npm install` to pick up the new dependency.

```bash
# Safest bet: Rebuild everything
docker compose up -d --build
```

### 4. I changed Database Schema (Prisma)
*(e.g., edited `schema.prisma`)*

You need to create a migration locally, then rebuild the backend so it generates the new Prisma Client.

1.  **Generate Migration**:
    ```bash
    cd apps/backend
    npx prisma migrate dev --name <my-change>
    cd ../..
    ```
2.  **Rebuild Backend**:
    ```bash
    docker compose up -d --build backend
    ```

### 5. I changed Environment Variables
*(e.g., edited `docker-compose.yml` or `.env`)*

You don't need to rebuild code, just recreate the container to inject the new values.

```bash
docker compose up -d
```

---

## 🛑 Troubleshooting

**Container won't pick up changes?**
Sometimes Docker cache is stubborn. Force a clean rebuild:
```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

**"Module not found"?**
Did you add a new file in a shared package? You must rebuild **all** services that use that package.
```bash
docker compose up -d --build
```
