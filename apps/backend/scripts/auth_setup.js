const Logger = require("../utils/logger");
const { dbModel } = require("../config/prisma");
const fs = require("fs");
const auth_db = require("better-sqlite3")("../../../auth_db.db");
const create_super_admin_policy = () => {
  try {
    Logger.log("info", {
      message: "create_super_admin_policy:starting...",
    });
    const policy = {
      actions: {},
      tables: {
        tbl_pm_policy_objects: true,
        tbl_pm_users: true,
      },
    };
    const name_array = dbModel.map((t) => t.name);
    name_array.forEach((t) => {
      policy.tables[t] = true;
    });
    Logger.log("success", {
      message: "create_super_admin_policy:policy created",
      params: { policy },
    });
    policy.graphs = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.queries = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.dashboards = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.jobs = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.app_constants = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.accounts = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.policies = {
      add: true,
      edit: true,
      read: true,
      delete: true,
    };
    policy.schemas = {
      edit: true,
      read: true,
    };
    return policy;
  } catch (error) {
    Logger.log("error", {
      message: "create_super_admin_policy:catch-1",
      params: { error },
    });
  }
};

const create_read_admin_policy = () => {
  try {
    Logger.log("info", {
      message: "create_read_admin_policy:starting...",
    });
    const policy = {
      actions: {},
      tables: {
        tbl_pm_policy_objects: true,
        tbl_pm_users: true,
      },
    };
    const name_array = dbModel.map((t) => t.name);
    name_array.forEach((t) => {
      policy.tables[t] = {
        add: false,
        edit: false,
        read: true,
        delete: false,
      };
    });
    Logger.log("success", {
      message: "create_read_admin_policy:policy created",
      params: { policy },
    });
    policy.graphs = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.queries = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.dashboards = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.jobs = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.app_constants = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.accounts = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.policies = {
      add: false,
      edit: false,
      read: true,
      delete: false,
    };
    policy.schemas = {
      edit: false,
      read: true,
    };
    return policy;
  } catch (error) {
    Logger.log("error", {
      message: "create_read_admin_policy:catch-1",
      params: { error },
    });
  }
};

// Define the SQL queries to create the tables
const create_policy_table_query = `
  CREATE TABLE tbl_pm_policy_objects (
    pm_policy_object_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR NOT NULL,
    description VARCHAR,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMPTZ,
    disable_reason VARCHAR,
    policy TEXT
);
`;

const create_user_table_query = `
 CREATE TABLE tbl_pm_users (
    pm_user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR,
    last_name VARCHAR,
    address1 VARCHAR,
    pm_policy_object_id INTEGER,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMPTZ,
    disable_reason VARCHAR,
    username VARCHAR,
    password_hash VARCHAR,
    salt VARCHAR,
    FOREIGN KEY (pm_policy_object_id) REFERENCES tbl_pm_policy_objects(pm_policy_object_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);`;

const create_policy_trigger_query = `
    CREATE TRIGGER IF NOT EXISTS update_policy_updated_at
    AFTER UPDATE ON tbl_pm_policy_objects
    FOR EACH ROW
    BEGIN
      UPDATE tbl_pm_policy_objects
      SET updated_at = CURRENT_TIMESTAMP
      WHERE pm_policy_object_id = OLD.pm_policy_object_id;
    END;
  `;

const create_user_trigger_query = `
    CREATE TRIGGER IF NOT EXISTS update_user_updated_at
    AFTER UPDATE ON tbl_pm_users
    FOR EACH ROW
    BEGIN
      UPDATE tbl_pm_users
      SET updated_at = CURRENT_TIMESTAMP
      WHERE pm_user_id = OLD.pm_user_id;
    END;
  `;

const setup_auth_database = () => {
  try {
    Logger.log("info", {
      message: "setup_auth_database:begin",
    });
    auth_db.exec(create_user_table_query);
    auth_db.exec(create_policy_table_query);

    Logger.log("success", {
      message: "setup_auth_database:tables created",
    });
    Logger.log("info", {
      message: "setup_auth_database:policy creation started...",
    });
    const super_admin_policy = create_super_admin_policy();
    const read_only_policy = create_read_admin_policy();

    const policyStmt = auth_db.prepare(`
      INSERT INTO tbl_pm_policy_objects (title, policy)
      VALUES (?, ?)
    `);
    const superAdminPolicyResult = policyStmt.run(
      "Super admin policy",
      JSON.stringify(super_admin_policy)
    );
    const readonlyPolicyResult = policyStmt.run(
      "Readonly policy",
      JSON.stringify(read_only_policy)
    );
    Logger.log("info", {
      message: "setup_auth_database:super admin user creation started...",
    });
    const userStmt = auth_db.prepare(`
      INSERT INTO tbl_pm_users (first_name, pm_policy_object_id, username, password_hash, salt)
      VALUES (?, ?, ?, ?, ?)
    `);
    const userResult = userStmt.run(
      "Super admin",
      superAdminPolicyResult.lastInsertRowid,
      "super_admin",
      "908e080381907685d00035f9e7e971d1cf5cd8fb4c20509d3169413c324fa42332476565ecac675ff397c432455505ded05dc6fb8265eae617f2bd2131d7c1b1",
      "ed2b6072e463cbe7e5387de6bae69d55"
    );

    Logger.log("success", {
      message: "setup_auth_database:data added",
    });
    Logger.log("info", {
      message: "setup_auth_database:adding triggers...",
    });

    // Execute the trigger creation query for tbl_pm_policy_objects
    auth_db.exec(create_policy_trigger_query);

    // Execute the trigger creation query for tbl_pm_users
    auth_db.exec(create_user_trigger_query);

    const setup_object = {
      super_admin_policy: super_admin_policy,
    };
    fs.writeFileSync("default_policy.json", JSON.stringify(setup_object), {
      encoding: "utf8",
      flag: "w",
    });

    Logger.log("success", {
      message: "setup_auth_database:auth setup complete",
    });
  } catch (error) {
    Logger.log("error", {
      message: "setup_auth_database:auth database setup failed!",
      params: { error },
    });
  }
};

// Call the function to create the tables
setup_auth_database();
