# Jet Admin

Welcome to Jet Admin, a web-based PostgreSQL tables manager and admin dashboard for your operations! Edit data, build graphs, and create dashboards using queries.

## Overview

This project aims to provide users with a user-friendly interface to manage their PostgreSQL databases and create dashboards. The project consists of a frontend and a backend component for managing PostgreSQL databases through a web interface.

![Jet Admin](https://github.com/user-attachments/assets/7b387e54-6cf8-4257-9ce9-4c85bd8a3868)

## Features

### Database Management
- **Data Manipulation Language**
  - [x] Insert
  - [x] Update
  - [x] Delete
  - [x] Select
  - [ ] Bulk Delete
- **Data Definition Language (DDL)**
  - [ ] Create, Alter, Drop, Truncate

### Queries
- **PostgreSQL Queries**
  - [x] Create query
  - [x] Edit query
  - [x] Delete query
  - [x] Run query
  - [x] Duplicate query
- **Javascript-based Query**
- **Rest API-based Query**

### Graphs
- [x] Line graph
- [x] Bar graph
- [x] Pie graph
- [x] Radial graph
- [x] Doughnut graph
- [x] Polar graph

### Authentication
- [x] JWT-based local user authentication

### Authorization
- [x] JSON-based policy editor
- [x] GUI-based policy editor
- [x] Fine-grained RBAC
- [x] Prisma-based RBAC for tables
- [x] Record-based RBAC for queries, graphs, and dashboards

## Topics

- **Setup:** To get started with the project, follow the instructions in the [Frontend Setup](#frontend-setup) and [Backend Setup](#backend-setup) sections to set up the frontend and backend components respectively.
- **Tables**
- **Queries:** Postgres queries can be saved as variables which when used will be executed in run-time. Output can be checked by testing the query. [Using query variables](#using-query-variables)!
- **Graphs**
- **Jobs**
- **App Constants**
- **Policies**
- **Accounts**

### Using Query Variables

- **Inside Another Query:** Query values can be used in run-time inside another query by utilizing the syntax below:
  ```sql
  select * from city where city_id={{[pm_query_id:21][0].city_id]};
  ```
    - `{{}}` is used to utilize the variable
    - `[]` is used to define the `pm_query_id` of desired query
      
- [ ] Inside app constants : Currently this functionality is not available

### Backend setup

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


### Frontend setup

This is the frontend component of the project build in React JS. It includes various dependencies and scripts for building and running the frontend application for Jet Admin.

Installation
------------

To install the frontend dependencies, run the following command in the terminal:

`npm install`

This will install all the required dependencies listed in the `package.json` file.

Scripts
-------

The following npm scripts are available for managing the frontend:

-   start: Starts the development server using `react-scripts`.
-   build: Builds the production-ready bundle using `react-scripts`.
-   deploy: Alias for `build`. Used for deploying the application.
-   test: Runs the test suite using `react-scripts`.

Folder structure
----------------
### Folder Structure

```
|-- src
    |-- api
    |-- assets
    |-- components
    |-- contexts
    |-- models
    |-- pages
    |-- plugins
        |-- graphs
        |-- queries
    |-- utils
```

Dependencies
------------

For a complete list of dependencies and their versions, refer to the `package.json` file of different apps.

Contributing
------------

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to open an issue or submit a pull request.

License
-------

This project is licensed under the MIT License.
