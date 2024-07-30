<a href="https://www.producthunt.com/posts/jet-admin-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jet&#0045;admin&#0045;3" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=474841&theme=light" alt="Jet&#0032;Admin - PostgreSQL&#0032;tables&#0032;manager&#0032;and&#0032;admin&#0032;dashboard | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![jet-admin](https://github.com/user-attachments/assets/48cb286e-05ee-4d28-a9c5-90c58693eeab)

# **Jet Admin** 

----------
Welcome to Jet Admin, a web-based PostgreSQL tables manager and admin dashboard for your operations! Edit data, build graphs, and create dashboards using queries.


## **Overview**
-----------
This project aims to provide users with a user-friendly interface to manage their PostgreSQL databases and create dashboards. The project consists of a frontend and a backend component for managing PostgreSQL databases through a web interface.

https://github.com/user-attachments/assets/7b387e54-6cf8-4257-9ce9-4c85bd8a3868

## **Features**
----------
#### Database Management
- **Data Manipulation Language**
  - [x] Insert
  - [x] Update
  - [x] Delete
  - [x] Select
  - [x] Bulk Delete
- **Data Definition Language (DDL)**
  - [ ] Create, Alter, Drop, Truncate

#### Queries
- **PostgreSQL Queries**
  - [x] Create query
  - [x] Edit query
  - [x] Delete query
  - [x] Run query
  - [x] Duplicate query
- **Javascript-based Query**
- **Rest API-based Query**

#### Graphs
- [x] Line graph
- [x] Bar graph
- [x] Pie graph
- [x] Radial graph
- [x] Doughnut graph
- [x] Polar graph

#### Authentication
- [x] JWT-based local user authentication

#### Authorization
- [x] JSON-based policy editor
- [x] GUI-based policy editor
- [x] Fine-grained RBAC
- [x] Prisma-based RBAC for tables
- [x] Record-based RBAC for queries, graphs, and dashboards

## **Topics**
---------
- **Setup:** To get started with the project, follow the instructions in the [Frontend Setup](#frontend-setup) and [Backend Setup](#backend-setup) sections to set up the frontend and backend components respectively.
- [**Tables**](#tables)
- [**Queries:**](#queries)
- [**Graphs**](#graphs)
- [**Scheduled Jobs**](#scheduled-jobs)
- [**App Constants**](#app-constants)
- [**Policies**](#policies)
- [**Accounts**](#accounts)


## **Backend setup**
-----------------
This is the backend component of the project. It includes various scripts and dependencies for building and running the backend server.

1. **Install Dependencies:**
   * Navigate to your project's root directory in your terminal.
   * Run the following command to install required packages:
     ```bash
     npm install
     ```

2. **Environment Setup:**
   * Create or edit `.env` files:
     * Create `development.env` and `production.env` files in your project's root directory.
     * Add the following environment variables to both files, replacing placeholder values with your actual credentials:
       ```
       DATABASE_URL="postgresql://your_database_url"
       JWT_ACCESS_TOKEN_SECRET="your_secret_key"
       JWT_REFRESH_TOKEN_SECRET="your_secret_key"
       ```
   * Add the `DATABASE_URL` value to the `package.json` file under the `env` object.

3. **Pull Database Schema:**
   * Run the appropriate command based on your operating system:
     * **Windows:**
       ```bash
       npm run prisma-pull-db-dev-w
       ```
     * **Linux:**
       ```bash
       npm run prisma-pull-db-dev
       ```
   * A `schema` folder will be created if the database connection is successful.

4. **Initial Database Setup:**
   * Create necessary tables and records:
     * **Windows:**
       ```bash
       npm run db-setup-w
       ```
     * **Linux:**
       ```bash
       npm run db-setup
       ```

5. **Generate Prisma Client:**
   * Generate TypeScript types for your database models:
     ```bash
     npx prisma generate
     ```

6. **Start Prisma Studio (Optional):**
   * View and manage your database visually:
     * **Windows:**
       ```bash
       npm run prisma-studio-dev-w
       ```
     * **Linux:**
       ```bash
       npm run prisma-studio-dev
       ```

**Note:** Replace the placeholder values in the `.env` files with your actual database URL and secret keys.
 
**Additional Considerations:**
* Consider using a `.gitignore` file to prevent sensitive information like secret keys from being committed to version control.
* For production environments, use environment variables or a secrets manager to securely store sensitive information.

By following these steps, you should have a working backend environment ready for development.


##### **Scripts**


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


## **Frontend setup**
-----------------
This is the frontend component of the project build in React JS. It includes various dependencies and scripts for building and running the frontend application for Jet Admin.

##### **Installation**

To install the frontend dependencies, run the following command in the terminal:

`npm install`

This will install all the required dependencies listed in the `package.json` file.

##### **Scripts**

The following npm scripts are available for managing the frontend:

-   start: Starts the development server using `react-scripts`.
-   build: Builds the production-ready bundle using `react-scripts`.
-   deploy: Alias for `build`. Used for deploying the application.
-   test: Runs the test suite using `react-scripts`.

##### **Folder Structure**

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

## **Queries**
-------------------------
Postgres queries can be saved as variables which when used will be executed in run-time. Output can be checked by testing the query

![query](https://github.com/user-attachments/assets/6f1b4bd8-2fce-4ded-90d2-4ae0f68cf2d2)

#### **Using queries variables**

- **Inside Another Query:** Query values can be used in run-time inside another query by utilizing the syntax below:
  ```sql
  select * from city where city_id={{[pm_query_id:21][0].city_id]};
  ```
    - `{{}}` is used to utilize the variable
    - `[]` is used to define the `pm_query_id` of desired query
      
- [ ] Inside app constants : Currently this functionality is not available

## **Graphs**
-------------
Saved queries are be used as data source for support graphs by defining label, values, x-axis, y-axis etc. 

![graphs](https://github.com/user-attachments/assets/9d5101ff-8004-47ca-8eb7-9b637662b16a)

Below are the supported graph types
- [x] Line graph
- [x] Bar graph
- [x] Pie graph
- [x] Radial graph
- [x] Doughnut graph
- [x] Polar graph


## **Scheduled Jobs**
-------------------------
These are background jobs scheduled with cron expressions to execute predefined Query objects.

![jobs](https://github.com/user-attachments/assets/3ee35a22-6e09-4ebd-be72-171c1d309756)

##### **Cron Syntax Quick Reference**

| Schedule | Cron Expression | Description |
|---|---|---|
| Daily at Midnight | `0 0 * * *` | Runs the command every day at midnight (12:00 AM). |
| Every Hour | `0 * * * *` | Runs the command at the beginning of every hour. |
| Monday at 3 PM | `0 15 * * 1` | Runs the command every Monday at 3:00 PM. |
| Every 15 Minutes | `*/15 * * * *` | Runs the command every 15 minutes.  |
| First Day of Every Month at 5 AM | `0 5 1 * *` | Runs the command on the 1st of every month at 5:00 AM. |
| Every Weekday at 9 AM | `0 9 * * 1-5` | Runs the command every weekday (Monday to Friday) at 9:00 AM. |
| Every 5 Minutes from 9 AM to 5 PM | `*/5 9-17 * * *` | Runs the command every 5 minutes between 9:00 AM and 5:00 PM. |
| On the 15th of Each Month at Noon | `0 12 15 * *` | Runs the command on the 15th of every month at noon (12:00 PM). |

##### **Fields**
- **Minute**: `0-59`
- **Hour**: `0-23`
- **Day**: `1-31`
- **Month**: `1-12`
- **Day of Week**: `0-7` (0 & 7 are Sunday)

##### **Special Characters**
- **`*`**: Every
- **`,`**: Multiple
- **`-`**: Range
- **`/`**: Increment

## **App constants**
-------------
App constants are constants which contain JSON values and can be used for various purposes. There are two type of app constants, Internal and Global.

Internal app constants are used for declaring constants utlized by Jet Admin while Global app constants can be used in Query objects.

Below are the some app constants
- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:
      
    ```
    {
        table_name: {
            column_name: {
                int_value1:label1,
                int_value2:label2,
                int_value3:label3,
                ...
            }
        }
    }
    ```
    For example
    ```
    {
        "restaurant_menu": {
            "item_id": {
                "1":"Tea",
                "23":"Coffee",
                "34":"Hot chocholate",
                ...
            }
        }
    }
    ```
- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.
- [x] APP_NAME : Used to declare custom application name:
    ```
    {
        "value":"Super food store admin"
    }
    ```


## **Dependencies**
------------

For a complete list of dependencies and their versions, refer to the `package.json` file of different apps.

## **Contributing**
------------

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to open an issue or submit a pull request.

## **License**
-------

This project is licensed under the MIT License.
