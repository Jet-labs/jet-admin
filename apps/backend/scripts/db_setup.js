const environment = require("../environment");
const { Pool } = require("pg");
const Logger = require("../utils/logger");
const { dbModel } = require("../config/prisma");
const fs = require("fs");
const map = {};

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
    return policy;
  } catch (error) {
    Logger.log("error", {
      message: "create_super_admin_policy:catch-1",
      params: { error },
    });
  }
};


// Configure the connection to your PostgreSQL database
const pool = new Pool({
  connectionString: environment.DATABASE_URL,
});

// Define the SQL queries to create the tables
const create_policy_table_query = `
  CREATE TABLE tbl_pm_policy_objects
(
    pm_policy_object_id serial NOT NULL,
    title character varying NOT NULL,
    description character varying,
    is_disabled boolean DEFAULT false,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    disable_reason character varying,
    policy jsonb,
    CONSTRAINT tbl_pm_policy_objects_pkey PRIMARY KEY (pm_policy_object_id)
)

`;

const create_user_table_query = `
 CREATE TABLE IF NOT EXISTS public.tbl_pm_users
(
    pm_user_id serial NOT NULL,
    first_name character varying,
    last_name character varying,
    address1 character varying,
    pm_policy_object_id integer,
    is_disabled boolean DEFAULT false,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    disable_reason character varying,
    username character varying,
    password_hash character varying,
    salt character varying,
    CONSTRAINT tbl_pm_users_pkey PRIMARY KEY (pm_user_id),
    CONSTRAINT fk_tbl_pm_users_tbl_pm_policy_object_pm_policy_onject_id FOREIGN KEY (pm_policy_object_id)
        REFERENCES public.tbl_pm_policy_objects (pm_policy_object_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
`;

const create_graph_table_query = `CREATE TABLE IF NOT EXISTS public.tbl_pm_graphs
(
    pm_graph_id serial NOT NULL,
    graph_title character varying COLLATE pg_catalog."default" NOT NULL,
    graph_description character varying COLLATE pg_catalog."default",
    is_disabled boolean DEFAULT false,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    disable_reason character varying COLLATE pg_catalog."default",
    graph_options jsonb,
    CONSTRAINT tbl_pm_graphs_pkey PRIMARY KEY (pm_graph_id)
);`;

const super_admin_policy_query = `
      INSERT INTO tbl_pm_policy_objects(title, description, is_disabled, policy)
      VALUES($1, $2, $3, $4)
      RETURNING pm_policy_object_id;
    `;
const super_user_query_text = `
      INSERT INTO public.tbl_pm_users(
        first_name, last_name, address1, pm_policy_object_id, 
        is_disabled, username, password_hash, salt
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING pm_user_id;
    `;
const create_trigger_query = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tbl_pm_users
BEFORE UPDATE ON tbl_pm_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tbl_pm_policy_objects
BEFORE UPDATE ON tbl_pm_policy_objects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();`;

async function setup_database() {
  try {
    Logger.log("info", { message: "setup_database:connecting to database..." });
    const client = await pool.connect();
    Logger.log("info", { message: "setup_database:database connected!" });

    // create required pm_user and pm_user_policy tables
    await client.query("BEGIN");
    await client.query(create_policy_table_query);
    await client.query(create_user_table_query);
    await client.query(create_graph_table_query);
    await client.query("COMMIT");

    Logger.log("success", {
      message: "setup_database:required table creation completed!",
    });

    // calculate the super_admin policy
    const super_admin_policy = create_super_admin_policy();

    // create super admin policy in database
    Logger.log("info", {
      message: "setup_database:super admin policy creation started...",
    });

    await client.query("BEGIN");
    const { rows: super_admin_policy_db_entry } = await client.query(
      super_admin_policy_query,
      [
        "super_admin",
        "This policy grants super admin privileges.",
        false,
        super_admin_policy,
      ]
    );
    await client.query("COMMIT");
    Logger.log("success", {
      message: "setup_database:super admin policy creation completed!",
    });

    // create super admin user in database

    Logger.log("info", {
      message: "setup_database:super admin user creation started...",
    });
    await client.query("BEGIN");
    const { rows: super_user_db_entry } = await client.query(
      super_user_query_text,
      [
        "Super",
        "Admin",
        "",
        super_admin_policy_db_entry[0].pm_policy_object_id,
        false, // is_disabled
        "superadmin",
        // password:password
        "908e080381907685d00035f9e7e971d1cf5cd8fb4c20509d3169413c324fa42332476565ecac675ff397c432455505ded05dc6fb8265eae617f2bd2131d7c1b1",
        "ed2b6072e463cbe7e5387de6bae69d55",
      ]
    );
    await client.query("COMMIT");
    Logger.log("success", {
      message: "setup_database:super admin user creation completed!",
    });

    // create triggers in database

    Logger.log("info", {
      message: "setup_database:triggers creation started...",
    });
    await client.query("BEGIN");
    const triggers = await client.query(create_trigger_query);
    await client.query("COMMIT");
    Logger.log("success", {
      message: "setup_database:triggers creation completed!",
    });

    client.release();

    const setup_object = {
      super_admin_policy: super_admin_policy,
    };
    fs.writeFileSync("setup-config.json", JSON.stringify(setup_object), {
      encoding: "utf8",
      flag: "w",
    });
    Logger.log("success", {
      message: "setup_database:setup-config.json written!",
    });
  } catch (error) {
    Logger.log("error", {
      message: "setup_database:database setup failed!",
      params: { error },
    });
  }
}

// Call the function to create the tables
setup_database();
