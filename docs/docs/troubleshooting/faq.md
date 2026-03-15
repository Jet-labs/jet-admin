---
id: faq
title: Frequently Asked Questions
sidebar_label: FAQ
sidebar_position: 2
description: Frequently asked questions about Jet Admin covering installation, features, security, development, deployment, and troubleshooting.
---

# Frequently Asked Questions (FAQ)

<div align="center">

### 📚 Quick Answers to Common Questions

**General · Installation · Features · Security · Development · Deployment**

</div>

---

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Features & Capabilities](#features--capabilities)
- [Security & Authentication](#security--authentication)
- [Development](#development)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [Troubleshooting](#troubleshooting)
- [Licensing & Support](#licensing--support)

---

## General Questions

### Q: What is Jet Admin?

**A:** Jet Admin is an open-source analytics platform and internal tools builder that helps teams connect data sources, build workflows, create dashboards, and automate business processes—all through a visual interface.

### Q: Who should use Jet Admin?

**A:** Jet Admin is designed for:
- **Developers** building internal tools faster
- **Data teams** creating analytics dashboards
- **Operations teams** automating workflows
- **Business users** who need self-service analytics
- **Organizations** needing multi-tenant internal tooling

### Q: Is Jet Admin free?

**A:** Yes! Jet Admin is open-source under the MIT License. You can:
- Use it for free (personal or commercial)
- Self-host without licensing fees
- Modify and extend the codebase
- Contribute improvements back

### Q: What's the difference between Jet Admin and similar tools?

**A:** Jet Admin stands out with:
- **Complete open-source** - No feature gates or paywalls
- **Visual workflow builder** - Automate complex business logic
- **Multi-tenancy** - Built-in tenant isolation and RBAC
- **Self-hosted** - Full control over your data
- **Extensible** - Add custom datasources, widgets, and workflow nodes
- **Real-time** - WebSocket-based live updates

### Q: Can I use Jet Admin for commercial projects?

**A:** Absolutely! The MIT License allows commercial use without restrictions. You can use Jet Admin internally, offer it as a service, or build commercial products on top of it.

### Q: What companies use Jet Admin?

**A:** Jet Admin is used by startups, enterprises, and agencies worldwide for:
- Internal admin panels
- Business intelligence dashboards
- Data pipeline automation
- Customer support tools
- Operations management

---

## Installation & Setup

### Q: What are the system requirements?

**A:** Minimum requirements:
- **CPU:** 2 cores (4+ recommended)
- **RAM:** 2GB (4GB+ recommended)
- **Storage:** 10GB for application + database space
- **Network:** Stable internet connection for setup

### Q: How do I install Jet Admin?

**A:** Quick installation with Docker:
```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
docker-compose -f docker-compose.cloud.yml up -d
```
Access at `http://localhost:3000`

See [Docker Deployment Guide](../setup/docker-deployment) for details.

### Q: Can I install without Docker?

**A:** Yes! You can run Jet Admin manually:
1. Install Node.js 18+ and PostgreSQL 14+
2. Clone the repository
3. Install dependencies: `npm install`
4. Configure environment variables
5. Run migrations: `npx prisma migrate dev`
6. Start backend: `npm run start:b`
7. Start frontend: `npm run start:f`

### Q: How long does installation take?

**A:** 
- **Docker installation:** 5-10 minutes
- **Manual installation:** 15-30 minutes
- **Production deployment:** 30-60 minutes (including SSL, monitoring, etc.)

### Q: Do I need Firebase?

**A:** Yes, Jet Admin uses Firebase Authentication for user management. You'll need to:
1. Create a Firebase project (free tier available)
2. Enable authentication providers
3. Generate an admin SDK key for the backend
4. Configure Firebase client SDK for the frontend

### Q: What database does Jet Admin use?

**A:** Jet Admin uses PostgreSQL (14+) for storing application metadata. You can connect to other databases (MySQL, MongoDB, etc.) as datasources for your queries and workflows.

### Q: Can I use an existing PostgreSQL database?

**A:** Yes! Jet Admin will create its own schema/tables in your PostgreSQL database. Just provide the connection string in the `DATABASE_URL` environment variable.

---

## Features & Capabilities

### Q: How many datasources can I connect?

**A:** Unlimited! You can connect as many datasources as your infrastructure supports. Jet Admin supports 25+ datasource types including PostgreSQL, MySQL, MongoDB, REST APIs, and more.

### Q: Can I connect to multiple databases simultaneously?

**A:** Yes! You can connect multiple databases of the same or different types. Each datasource is independent and can be used in queries, workflows, and dashboards.

### Q: What chart types are supported?

**A:** Jet Admin includes:
- **Basic charts:** Bar, Line, Area, Pie, Donut
- **Advanced charts:** Scatter, Bubble, Radar, Polar Area
- **Data displays:** Tables, Text, Markdown, Custom HTML, iFrames

More chart types can be added via custom widgets.

### Q: Can I schedule workflows to run automatically?

**A:** Yes! Jet Admin supports cron-based scheduling for workflows. You can configure workflows to run:
- At specific times (e.g., daily at 9 AM)
- At intervals (e.g., every 5 minutes)
- Based on complex cron expressions

### Q: Do workflows support error handling?

**A:** Yes! Workflows include:
- Automatic retry with exponential backoff
- Conditional error handling branches
- Dead letter queue for failed executions
- Alert notifications on failures

### Q: Can I version control my workflows?

**A:** Jet Admin tracks workflow versions automatically. You can:
- View workflow history
- Revert to previous versions
- Compare versions
- Export/import workflow definitions

### Q: Is there a limit to workflow complexity?

**A:** Workflows can have unlimited nodes and execution depth. However, for maintainability, we recommend:
- Maximum 20-25 nodes per workflow
- Break complex logic into sub-workflows
- Document workflows with comments

### Q: Can I embed Jet Admin dashboards in other applications?

**A:** Yes! You can:
- Export dashboards as PDF reports
- Embed individual widgets via iFrame
- Use the API to fetch data for custom visualizations
- White-label Jet Admin for your organization

### Q: Does Jet Admin support real-time data?

**A:** Yes! Real-time features include:
- Live workflow execution updates via WebSocket
- Real-time widget data refresh
- Live dashboard updates
- Collaborative editing indicators

### Q: Can I create custom widgets?

**A:** Absolutely! Jet Admin provides a widget SDK for creating custom widgets. You can:
- Build custom visualizations
- Integrate third-party libraries
- Share widgets across your organization
- Contribute to the community

---

## Security & Authentication

### Q: Is Jet Admin secure?

**A:** Yes! Security features include:
- Firebase Authentication for user identity
- Role-based access control (RBAC)
- Multi-tenant data isolation
- Encrypted credentials at rest
- HTTPS/TLS support
- Audit logging
- API key authentication

### Q: How is data isolated between tenants?

**A:** Jet Admin uses logical isolation:
- All database queries include tenant ID filtering
- Foreign key constraints enforce tenant scoping
- Middleware validates tenant context on every request
- Socket.IO rooms are tenant-isolated

### Q: Can users belong to multiple tenants?

**A:** Yes! A single user can be a member of multiple tenants with different roles in each. Users can switch between tenants seamlessly.

### Q: What authentication providers are supported?

**A:** Jet Admin uses Firebase Auth, which supports:
- Google Sign-In
- Email/Password
- Phone authentication
- Microsoft, Facebook, Twitter, GitHub
- SAML/OIDC (enterprise)
- Custom authentication systems

### Q: Does Jet Admin support SSO?

**A:** Yes! Through Firebase Enterprise, you can configure SAML or OIDC-based single sign-on for your organization.

### Q: Are API keys secure?

**A:** Yes! API keys are:
- Hashed before storage (bcrypt)
- Shown only once during creation
- Can be set to expire
- Can be revoked at any time
- Scoped to specific permissions

### Q: Is data encrypted at rest?

**A:** Yes! Sensitive data is encrypted:
- Datasource credentials (AES-256)
- API keys (bcrypt hash)
- Database can use native encryption
- Backups can be encrypted

### Q: Does Jet Admin comply with GDPR?

**A:** Jet Admin provides features to support GDPR compliance:
- Data export capabilities
- User data deletion
- Audit logging
- Access controls
- Data processing agreements available

However, compliance depends on your specific implementation and usage.

### Q: Where is my data stored?

**A:** With self-hosted Jet Admin, **you control where data is stored**. Your data resides in:
- Your PostgreSQL database (you choose the location)
- Your Firebase project (you choose the region)
- Your server infrastructure

Jet Labs does not have access to your data.

---

## Development

### Q: What programming languages are used?

**A:** Jet Admin is built with:
- **Frontend:** JavaScript/JSX (React 18)
- **Backend:** JavaScript/Node.js (Express)
- **Database:** PostgreSQL with Prisma ORM
- **Shared packages:** JavaScript/TypeScript

### Q: Can I contribute to Jet Admin?

**A:** Yes! Contributions are welcome! You can:
- Report bugs and suggest features
- Submit pull requests
- Improve documentation
- Build custom datasources or widgets
- Help other users in discussions

See the [Contributing Guide](../contributing) for details.

### Q: How do I add a new datasource type?

**A:** Creating a new datasource involves:
1. Define the schema in `packages/datasource-types`
2. Implement connection logic in `packages/datasources-logic`
3. Create the UI form in `packages/datasources-ui`
4. Register in backend and frontend

See [Creating a Datasource](../developer/creating-datasource) for a step-by-step guide.

### Q: Can I customize the UI/branding?

**A:** Yes! You can:
- Modify the React components
- Change colors and themes via TailwindCSS
- Replace the logo and favicon
- Customize layouts and navigation
- White-label for your organization

### Q: Is there a TypeScript version?

**A:** The codebase is primarily JavaScript, but TypeScript definitions are available for some packages. You can:
- Use TypeScript in your custom code
- Contribute TypeScript migrations
- Add JSDoc type annotations

### Q: How do I test my changes?

**A:** Jet Admin includes:
- Unit tests for critical functions
- Integration tests for API endpoints
- E2E tests for key workflows
- Manual testing guides

Run tests with: `npm test`

### Q: What IDE should I use?

**A:** Any modern IDE works, but we recommend:
- **VS Code** (most common among contributors)
- WebStorm
- Any editor with JavaScript/React support

VS Code extensions recommended:
- ESLint
- Prettier
- React Developer Tools
- Prisma

---

## Deployment & Infrastructure

### Q: Can I self-host Jet Admin?

**A:** Yes! Self-hosting is the primary deployment method. You can deploy on:
- Your own servers
- Cloud VMs (AWS EC2, DigitalOcean, etc.)
- Container platforms (Kubernetes, ECS)
- PaaS providers (Heroku, Railway, etc.)

### Q: Do you offer cloud hosting?

**A:** Jet Labs is working on a managed cloud offering. Join the waitlist or contact us for early access.

### Q: How do I scale Jet Admin?

**A:** Scaling strategies:
- **Vertical:** Increase server resources (CPU, RAM)
- **Horizontal:** Run multiple backend instances behind a load balancer
- **Database:** Use read replicas, connection pooling
- **Caching:** Add Redis for session/cache
- **CDN:** Serve frontend from CDN

See [Scaling Guide](../deployment/scaling) for details.

### Q: What's the recommended production setup?

**A:** For production:
1. Use Docker Compose or Kubernetes
2. Deploy backend and frontend separately
3. Use managed PostgreSQL (RDS, Cloud SQL)
4. Configure SSL/TLS
5. Set up monitoring and alerting
6. Enable automated backups

See [Production Checklist](../deployment/production-checklist).

### Q: How do I backup my data?

**A:** Backup strategies:
```bash
# PostgreSQL backup
pg_dump -U jetadmin jetadmin > backup.sql

# Automated daily backups
0 2 * * * pg_dump -U jetadmin jetadmin | gzip > backup_$(date +\%F).sql.gz
```

See [Backup & Recovery](../deployment/backup-recovery) for comprehensive guidance.

### Q: Can I deploy to Kubernetes?

**A:** Yes! Kubernetes manifests are available. Deployment includes:
- Frontend Deployment + Service
- Backend Deployment + Service
- PostgreSQL StatefulSet (or use managed DB)
- ConfigMaps for configuration
- Secrets for sensitive data

### Q: What ports need to be open?

**A:** Required ports:
- **80/443:** Frontend (HTTP/HTTPS)
- **8090:** Backend API (internal, or exposed directly)
- **5432:** PostgreSQL (internal only, not exposed)

### Q: How do I configure SSL/HTTPS?

**A:** SSL configuration with Nginx:
```nginx
server {
  listen 443 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://frontend:80;
  }
  
  location /api/ {
    proxy_pass http://backend:8090;
  }
}
```

Use Let's Encrypt for free SSL certificates.

### Q: Can I use a custom domain?

**A:** Yes! Configure your DNS to point to your server and update your Nginx/Apache configuration with the domain name.

---

## Troubleshooting

### Q: Why am I getting a 401 error?

**A:** 401 errors indicate authentication issues:
- Firebase token expired → Refresh page or re-login
- Invalid Firebase configuration → Check Firebase settings
- Time synchronization issue → Sync server clock

See [Authentication Troubleshooting](../troubleshooting/common-issues#authentication-issues).

### Q: Why can't I connect to my database?

**A:** Common causes:
- Incorrect connection details (host, port, credentials)
- Firewall blocking connections
- Database not running
- Network connectivity issues

See [Datasource Troubleshooting](../troubleshooting/common-issues#connection-issues).

### Q: Why are workflows not executing?

**A:** Check:
- Backend logs for errors
- Workflow queue is running
- Node handlers are registered
- Required datasources are configured

### Q: How do I view logs?

**A:** 
```bash
# Docker logs
docker logs jet-admin-backend --tail=100
docker logs jet-admin-frontend --tail=100

# Or view log files
tail -f apps/backend/logs/error.log
```

### Q: Where can I get help?

**A:** Support channels:
- **Documentation:** Comprehensive guides and references
- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Community Q&A
- **Email Support:** For enterprise customers

---

## Licensing & Support

### Q: What license is Jet Admin under?

**A:** Jet Admin is licensed under the MIT License, which allows:
- Commercial use
- Modification and distribution
- Private use
- No warranty or liability

### Q: Can I use Jet Admin in a commercial product?

**A:** Yes! The MIT License allows commercial use without restrictions. You can:
- Use it internally for your business
- Offer it as a managed service
- Build commercial products on top of it
- White-label it for clients

### Q: Do you offer enterprise support?

**A:** Yes! Enterprise support includes:
- Priority support response
- Dedicated support channel
- Custom feature development
- On-premise deployment assistance
- Training and onboarding

Contact us for enterprise pricing.

### Q: What's included in the free version?

**A:** Everything! Jet Admin is fully open-source with:
- All features unlocked
- No user limits
- No datasource limits
- No workflow limits
- Community support

### Q: How can I support the project?

**A:** You can support Jet Admin by:
- ⭐ Starring the GitHub repository
- 🐛 Reporting bugs and suggesting features
- 💻 Contributing code or documentation
- 📖 Helping others in discussions
- 📢 Sharing with your network

---

## Still Have Questions?

### Quick Links

- [Documentation](../index) - Comprehensive guides
- [API Reference](../api-reference/index) - Endpoint documentation
- [GitHub](https://github.com/Jet-labs/jet-admin) - Source code and issues
- [Discussions](https://github.com/Jet-labs/jet-admin/discussions) - Community Q&A

### Contact Us

- **General Inquiries:** info@jet-labs.io
- **Support:** support@jet-labs.io
- **Enterprise:** enterprise@jet-labs.io

---

<div align="center">

### Can't Find Your Answer?

[Open GitHub Issue](https://github.com/Jet-labs/jet-admin/issues) · [Join Discussions](https://github.com/Jet-labs/jet-admin/discussions) · [Contact Support](#)

</div>
