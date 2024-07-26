Jet Admin
=====================================

Welcome to Jet Admin, a web based postres tables manager and admin dashbaord for your operations! Edit data, build graphs and dashbaords using queries.

Overview
--------

This project aims to provide users with a user-friendly interface to manage their PostgreSQL databases & create dashbaords. This project consists of a frontend and a backend component for managing PostgreSQL databases through a web interface.


https://github.com/user-attachments/assets/7b387e54-6cf8-4257-9ce9-4c85bd8a3868


Features
--------
- Database management
    - [ ] Data Manipulation Language
        - [x] Insert
        - [x] Update
        - [x] Delele
        - [x] Select
        - [ ] Bulk Delete
    - [ ] Data Definition Language (DDL) : Create, Alter, Drop, Truncate
- Queries
    - [x] Postgre SQL queries
        - [x] Create query
        - [x] Edit query
        - [x] Delete query
        - [x] Run query
        - [x] Duplicate query
    - [ ] Javascript based query
    - [ ] Rest API based query
- Graphs
    - [x] Line graph
    - [x] Bar graph
    - [x] Pie graph
    - [x] Radial graph
    - [x] Doughnut graph
    - [x] Polar graph
- Authentication
    - [x] JWT based local user authentication
- Authorization
    - [x] JSON based policy editor
    - [x] GUI based policy editor
    - [x] Fine grained RBAC
    - [x] Prisma based RBAC for tables
    - [x] Record based RBAC for queries, graphs & dashbaords


Topics
------
- Setup : To get started with the project, follow the instructions in the `apps/frontend/README.md` and `apps/backend/README.md` files to set up the frontend and backend components respectively.
- Tables
- Queries : Postgres queries can be saved as variables which when used will be executed in run-time. Output can be checked by testing the query. [Using query variables](#using-query-variables)!
- Graphs
- Jobs
- App constants
- Policies
- Accounts

Using query variables
---------------------
- [x] Inside another query: Query values can be used in run time inside another query by utilizing below syntax
    - ```
      select * from city where city_id={{[pm_query_id:21][0].city_id]}};
      ```
    - `{{}}` is used to utilize the variable
    - `[]` is used to define the `pm_query_id` of desired query
      
- [ ] Inside app constants : Currently this functionality is not available

Contributing
------------

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to open an issue or submit a pull request.

License
-------

This project is licensed under the MIT License.
