# Backend Local Development

This guide will walk you through setting up the backend environment for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) & **npm** - [Download from nodejs.org](https://nodejs.org/)
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

:::caution
Be sure to replace the placeholder values with your actual configurations, especially the `DATABASE_URL` and JWT secrets for security purposes.
:::

### Firebase Configuration

Generate Firebase key from Firebase console and rename the file to `firebase-key.json` in the root directory with the following structure:

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

## Troubleshooting

If you encounter issues during setup or deployment, check the following:

- Ensure PostgreSQL is running and accessible
- Verify environment variables are correctly set
- Check network connectivity for external services
- Review logs for specific error messages

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)