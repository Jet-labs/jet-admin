Backend
=======

This is the backend component of the project. It includes various scripts and dependencies for building and running the backend server.

Installation
------------

To install the backend dependencies, run the following command in the terminal:

`npm install`
This will install all the required dependencies listed in the `package.json` file.

Add value of below variables in `development.env` & `production.env` file.

`DATABASE_URL="postgresql://_____________"`
`JWT_ACCESS_TOKEN_SECRET =""`
`JWT_REFRESH_TOKEN_SECRET =""`

Add the same `DATABASE_URL` variable in `package.json` file of backend project

Now run below command to pull database schema from your existing database entered above.

For windows : `npm run prisma-pull-db-dev-w`
For linux : `npm run prisma-pull-db-dev`

If a schema file is made in `/schema` folder then it means that database is connected.

Now lets run an initial script to setup some more tables in your database.

For windows : `npm run db-setup-w`
For linux : `npm run db-setup`

This will create required tables and records in your connected databse starting with `tbl_pm` prefix

The project uses Prisma ORM as a database connection layer for which we need to generate types of our imported table schema.

For windows : `npx prisma generate`
For linux : `npx prisma generate`

You can view the database records in prisma studio with below command

For windows : `npm run prisma-studio-dev-w`
For linux : `npm run prisma-studio-dev`



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

For a complete list of dependencies and their versions, refer to the `package.json` file.


License
-------

This project's frontend is included in the main project's license. For license information, refer to the main project's license file.