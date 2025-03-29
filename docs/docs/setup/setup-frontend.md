---
sidebar_position: 5
---

# Frontend Deployment

This document provides comprehensive instructions for deploying the frontend application in various environments.

## Prerequisites

Before deploying the frontend, ensure you have:

- Node.js (v16 or higher) and npm installed
- Access to the project repository
- Necessary environment variables and API keys
- Docker installed (for containerized deployment)

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

## Deployment Options

### Option 1: Static Hosting

Deploy the contents of the `dist` directory to any static hosting service:

1. Build the application: `npm run build`
2. Upload the contents of the `dist` directory to your hosting provider
3. Configure the server to handle client-side routing (all requests should be directed to `index.html`)

#### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 2: Docker Deployment

The application includes a Dockerfile for containerized deployment.

#### Building the Docker Image

```bash
docker build -t frontend .
```

#### Running the Container

```bash
docker run -p 3000:80 frontend
```

This will serve the application on port 3000 of your host machine.

#### Docker Compose Integration

If you're using Docker Compose for the entire stack:

```yaml
version: '3'
services:
  frontend:
    build: ./apps/frontend
    ports:
      - "3000:80"
```

## Continuous Integration/Continuous Deployment

### GitHub Actions Example

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # Add other environment variables as needed
          
      - name: Deploy to Server
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /path/on/server/
```

## Performance Optimization

### Build Optimization

For optimal performance, consider these build optimizations:

1. **Code Splitting**

   Vite handles code splitting automatically, but you can further optimize by using dynamic imports:

   ```jsx
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   ```