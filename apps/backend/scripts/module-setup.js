const environment = require("../environment");
const { Pool } = require("pg");
const Logger = require("../utils/logger");
const setupConfig = require("./setup-config.json");
// Configure the connection to your PostgreSQL database
const pool = new Pool({
  connectionString: environment.DATABASE_URL,
});

const setupConfigProvider = () => {
  if (setupConfig) {
    // validate modules
    let _modules = [...setupConfig.modules];
    if (setupConfig.modules && Array.isArray(setupConfig.modules)) {
      _modules = [...setupConfig.modules];
      if (setupConfig.modules.includes("dashboard")) {
        _modules.push(["query", "graph", "app_constant"]);
      } else if (setupConfig.modules.includes("graph")) {
        _modules.push(["query", "app_constant"]);
      } else if (setupConfig.modules.includes("query")) {
        _modules.push(["app_constant"]);
      } else if (setupConfig.modules.includes("job")) {
        _modules.push(["query", "app_constant"]);
      }
    }
    _modules.filter((item, index) => _modules.indexOf(item) === index);
    return { ...setupConfig, modules: _modules };
  } else {
    return { modules: ["query", "graph", "dashboard", "app_constant", "job"] };
  }
};

const create_graph_table_query = `CREATE TABLE IF NOT EXISTS public.tbl_pm_graphs
(
    pm_graph_id serial NOT NULL,
    pm_graph_title character varying NOT NULL,
    graph_description character varying,
    is_disabled boolean DEFAULT false,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    disable_reason character varying,
    pm_graph_options jsonb,
    CONSTRAINT tbl_pm_graphs_pkey PRIMARY KEY (pm_graph_id)
);`;

const create_query_table_query = `CREATE TABLE IF NOT EXISTS tbl_pm_queries
(
    pm_query_id serial NOT NULL,
    pm_query_type character varying DEFAULT 'POSTGRE_QUERY'::character varying,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    is_disabled boolean DEFAULT false,
    pm_query_title character varying NOT NULL DEFAULT 'Untitled'::character varying,
    pm_query_description character varying,
    pm_query json,
    run_on_load boolean,
    pm_query_metadata json NULL,
    CONSTRAINT tbl_pm_queries_pk PRIMARY KEY (pm_query_id)
)`;

const create_dashboard_table_query = `CREATE TABLE IF NOT EXISTS tbl_pm_dashboards
(
    pm_dashboard_id serial NOT NULL,
    dashboard_title character varying NOT NULL,
    dashboard_description character varying,
    is_disabled boolean DEFAULT false,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    disable_reason character varying,
    dashboard_options jsonb,
    dashboard_graph_ids integer[],
    CONSTRAINT tbl_pm_dashboard_layout_pkey PRIMARY KEY (pm_dashboard_id)
);`;

const create_jobs_table_query = `CREATE TABLE IF NOT EXISTS public.tbl_pm_jobs
(
    pm_job_id serial NOT NULL,
    pm_job_title character varying NOT NULL,
    pm_query_id integer NOT NULL,
	  pm_job_schedule varchar NOT NULL,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    is_disabled boolean DEFAULT false,
    CONSTRAINT tbl_pm_jobs_pk PRIMARY KEY (pm_job_id)
);`;

const create_jobs_history_table_query = `CREATE TABLE IF NOT EXISTS public.tbl_pm_job_history (
	pm_job_history_id serial NOT NULL,
	history_result json NULL,
	created_at timestamptz(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	disabled_at timestamptz(6) NULL,
	is_disabled bool DEFAULT false NULL,
	pm_job_id int NOT NULL,
	CONSTRAINT tbl_pm_job_histors_pk PRIMARY KEY (pm_job_history_id),
	CONSTRAINT tbl_pm_job_history_tbl_pm_jobs_fk FOREIGN KEY (pm_job_id) REFERENCES public.tbl_pm_jobs(pm_job_id)
);`;

const create_app_constants_table_query = `CREATE TABLE IF NOT EXISTS public.tbl_pm_app_constants
(
    pm_app_constant_id serial NOT NULL,
    pm_app_constant_title character varying NOT NULL,
    pm_app_constant_value json NOT NULL,
    created_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at timestamp(6) with time zone,
    is_disabled boolean DEFAULT false,
    is_internal boolean DEFAULT false,
    CONSTRAINT tbl_pm_app_constants_pk PRIMARY KEY (pm_app_constant_id),
    CONSTRAINT unique_app_constants_title UNIQUE (pm_app_constant_title)
);`;

const custom_int_mapping_query = `
      INSERT INTO tbl_pm_app_constants(pm_app_constant_title, pm_app_constant_value, is_internal)
      VALUES($1, $2, $3)
      RETURNING pm_app_constant_id;
    `;

const create_module_trigger_query = `
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

async function setup_module_database() {
  try {
    Logger.log("info", {
      message: "setup_module_database:connecting to database...",
    });
    const _setupConfig = setupConfigProvider();
    const client = await pool.connect();
    Logger.log("info", {
      message: "setup_module_database:database connected!",
    });

    // create required pm_user and pm_user_policy tables
    await client.query("BEGIN");
    if (_setupConfig.modules.includes("graph"))
      await client.query(create_graph_table_query);
    if (_setupConfig.modules.includes("query"))
      await client.query(create_query_table_query);
    if (_setupConfig.modules.includes("dashboard"))
      await client.query(create_dashboard_table_query);
    if (_setupConfig.modules.includes("job")) {
      await client.query(create_jobs_table_query);
      await client.query(create_jobs_history_table_query);
    }
    if (_setupConfig.modules.includes("app_constant"))
      await client.query(create_app_constants_table_query);
    await client.query("COMMIT");

    Logger.log("success", {
      message: "setup_module_database:required table creation completed!",
    });

    Logger.log("info", {
      message: "setup_module_database:app constants creation started...",
    });
    await client.query("BEGIN");
    await client.query(custom_int_mapping_query, [
      "CUSTOM_INT_VIEW_MAPPING",
      {},
      true,
    ]);
    await client.query(custom_int_mapping_query, [
      "CUSTOM_INT_EDIT_MAPPING",
      {},
      true,
    ]);
    await client.query(custom_int_mapping_query, [
      "APP_NAME",
      { value: "Jet Admin" },
      true,
    ]);
    await client.query("COMMIT");
    Logger.log("success", {
      message: "setup_module_database:app constants creation completed!",
    });

    // create triggers in database

    Logger.log("info", {
      message: "setup_module_database:triggers creation started...",
    });
    await client.query("BEGIN");
    const triggers = await client.query(create_module_trigger_query);
    await client.query("COMMIT");
    Logger.log("success", {
      message: "setup_module_database:triggers creation completed!",
    });

    client.release();

    Logger.log("success", {
      message: "setup_module_database:setup-config.json written!",
    });
  } catch (error) {
    Logger.log("error", {
      message: "setup_module_database:database setup failed!",
      params: { error },
    });
  }
}

// Call the function to create the tables
setup_module_database();
