---
sidebar_position: 5
---

# Frontend Local Development

This guide will walk you through setting up the frontend environment for development.

## Prerequisites

Before deploying the frontend, ensure you have:

- Node.js (v16 or higher) and npm installed
- Access to the project repository
- Necessary environment variables and API keys

## Local Development Environment

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository_url>
cd apps/frontend
npm install
```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8090/api

# Firebase Configuration (used for authentication)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Supabase Configuration (used for file storage)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

:::caution
Never commit `.env` files to your repository. Add them to your `.gitignore` file.
:::

### Running for Development

Start the development server:

```bash
npm run dev
```

This will launch the application on `http://localhost:5173` with hot module replacement enabled.

## Building for Production

Create a production build:

```bash
npm run build
```

This creates optimized assets in the `dist` directory. You can test the production build locally:

```bash
npm run preview
```

## Performance Optimization

### Build Optimization

For optimal performance, consider these build optimizations:

1. **Code Splitting**

   Vite handles code splitting automatically, but you can further optimize by using dynamic imports:

   ```jsx
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   ```