Backend
=======

This is the backend component of the project. It includes various scripts and dependencies for building and running the backend server.

Installation
------------

To install the backend dependencies, run the following command in the terminal:

`npm install`

This will install all the required dependencies listed in the `package.json` file.

Scripts
-------

The following npm scripts are available for managing the backend:

-   start: Starts the backend server in production mode using `nodemon`.
-   dev: Starts the backend server in development mode using `nodemon`.
-   db-setup: Sets up the database for development environment using `node`.
-   serve: Starts the backend server without `nodemon`.
-   migrate: Runs database migrations using `knex`.
-   rollback: Rolls back the latest database migration using `knex`.
-   pm2: Starts the backend server in production mode using `pm2`.
-   pm2-restart: Restarts the backend server using `pm2`.
-   prisma-studio: Starts Prisma Studio to interact with the database in production mode.
-   prisma-studio-dev: Starts Prisma Studio to interact with the database in development mode.
-   prisma-db-pull: Pulls the database schema from the production database using Prisma.
-   prisma-db-pull-dev: Pulls the database schema from the development database using Prisma.
-   prisma-migrate-dev: Applies database migrations in development environment using Prisma.

Dependencies
------------

The backend relies on the following dependencies:

-   Express: Fast, unopinionated, minimalist web framework for Node.js.
-   Prisma: Next-generation ORM for Node.js and TypeScript.
-   Axios: Promise-based HTTP client for the browser and Node.js.
-   Bcrypt: Library to help you hash passwords.
-   Dotenv: Loads environment variables from a `.env` file.
-   JWT (jsonwebtoken): JSON Web Token implementation.
-   Socket.io: Real-time bidirectional event-based communication.
-   Winston: Logging library for Node.js.
-   PM2: Production process manager for Node.js applications.

For a complete list of dependencies and their versions, refer to the `package.json` file.

Development Dependencies
------------------------

-   Nodemon: Utility that monitors for changes and automatically restarts the server.
-   Prisma CLI: Command-line interface for Prisma schema migrations.
-   Prisma JSON Schema Generator: Generates JSON schema from Prisma schema.

License
-------

This project's frontend is included in the main project's license. For license information, refer to the main project's license file.