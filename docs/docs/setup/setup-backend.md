# Backend Setup Guide

This guide will walk you through setting up the backend environment for both development and production.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) & **npm** - [Download from nodejs.org](https://nodejs.org/)
- **Docker** - [Download from docker.com](https://www.docker.com/)
- **PostgreSQL** database (local or remote access)

## Local Development Setup

### Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository_url>
   cd apps/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory of your backend project with the following variables:

```dotenv
# Server Configuration
NODE_ENV=development
PORT=8090
EXPRESS_REQUEST_SIZE_LIMIT="5mb"

# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Authentication
JWT_ACCESS_TOKEN_SECRET="lhflsdcshdlkflkfsldkcksldjljclsd"
JWT_REFRESH_TOKEN_SECRET="lhflsdcshdlkflkfsldkcksldjljclsd"
ACCESS_TOKEN_TIMEOUT=900
REFRESH_TOKEN_TIMEOUT="100h"

# CORS Settings
CORS_WHITELIST="http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3001"

# Logging Configuration
SYSLOG_HOST=127.0.0.1
SYSLOG_PORT=514
SYSLOG_PROTOCOL=udp4
SYSLOG_LEVEL="warning"
LOG_LEVEL="info"
LOG_RETENTION=7
LOG_FILE_SIZE=1
```

:::tip
You can copy these settings from `apps/backend/development.env` as a starting point and modify them as needed.
:::

:::caution
Be sure to replace the placeholder values with your actual configurations, especially the `DATABASE_URL` and JWT secrets for security purposes.
:::

### Firebase Configuration

Create a `firebase-key.json` file in the root directory with the following structure:

```json
{
    "type": "",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": "",
    "universe_domain": ""
}
```

:::warning
Fill in your actual Firebase credentials. Never commit this file to your repository.
:::

### Database Setup

We use Prisma as our ORM for database management. Set up your database with these commands:

```bash
# Create database schema
npx prisma migrate dev

# Open visual database editor (optional)
npx prisma studio
```

The first command applies migrations based on your schema definition in `prisma/schema.prisma`, while the second opens a visual interface to manage your database at `http://localhost:5555`.

### Running the Application

Start the development server with hot-reload enabled:

```bash
npm run dev
```

Your API will be available at `http://localhost:8090`.

## Production Deployment

### Environment Preparation

1. Ensure all environment variables are properly configured for your production environment
2. Configure the Firebase credentials as described in the development setup section

### Docker Deployment

1. **Build the Docker image**

   ```bash
   docker build -t backend .
   ```

2. **Run the container**

   ```bash
   docker run -p 8090:8090 \
     -e DATABASE_URL="<your_production_db_url>" \
     -e JWT_ACCESS_TOKEN_SECRET="<secure_token>" \
     -e JWT_REFRESH_TOKEN_SECRET="<secure_token>" \
     -e CORS_WHITELIST="<production_domains>" \
     backend
   ```

:::tip
For security, use environment variables rather than hardcoded values in your Docker commands.
:::

### Process Management Options

**Option 1: Standard Node.js**

```bash
npm start
```

**Option 2: PM2 (Recommended)**

```bash
npm run pm2
```

PM2 provides enhanced process management, automatic restarts, and monitoring for your production application.

### Database Seeding (Optional)

To populate your database with initial data:

```bash
docker run -p 8090:8090 \
  -e SEED_DATABASE=true \
  -e DATABASE_URL="<your_production_db_url>" \
  -e JWT_ACCESS_TOKEN_SECRET="<secure_token>" \
  -e JWT_REFRESH_TOKEN_SECRET="<secure_token>" \
  -e CORS_WHITELIST="<production_domains>" \
  backend
```

This executes the `seed.js` script located in the `scripts` directory.

## Troubleshooting

If you encounter issues during setup or deployment, check the following:

- Ensure PostgreSQL is running and accessible
- Verify environment variables are correctly set
- Check network connectivity for external services
- Review logs for specific error messages

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)