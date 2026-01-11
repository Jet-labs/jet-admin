const Logger = require("../../utils/logger");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const storedProcedureService = {};

/**
 * Retrieves all stored procedures (true procedures, prokind='p') in a database schema.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @returns {Promise<Array>} - Array of stored procedures.
 */
storedProcedureService.getAllStoredProcedures = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "storedProcedureService:getAllStoredProcedures:params",
    params: { userID, databaseSchemaName },
  });
  try {
    const query = {
      text: `
        SELECT 
          p.proname AS procedure_name,
          n.nspname AS schema_name,
          pg_get_function_arguments(p.oid) AS arguments,
          obj_description(p.oid, 'pg_proc') AS description,
          l.lanname AS language
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = $1 AND p.prokind = 'p'
        ORDER BY p.proname
      `,
      values: [databaseSchemaName],
    };

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );
    const storedProcedures = result.rows;
    Logger.log("success", {
      message: "storedProcedureService:getAllStoredProcedures:success",
      params: {
        userID,
        databaseSchemaName,
        storedProceduresLength: storedProcedures.length,
      },
    });
    return storedProcedures;
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureService:getAllStoredProcedures:catch-1",
      params: { userID, databaseSchemaName, error },
    });
    throw error;
  }
};

/**
 * Retrieves a specific stored procedure by name including source code.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.procedureName
 * @returns {Promise<object>} - The procedure details with source code.
 */
storedProcedureService.getStoredProcedureByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  procedureName,
}) => {
  Logger.log("info", {
    message: "storedProcedureService:getStoredProcedureByName:params",
    params: { userID, databaseSchemaName, procedureName },
  });
  try {
    const query = {
      text: `
        SELECT 
          p.proname AS procedure_name,
          n.nspname AS schema_name,
          pg_get_function_arguments(p.oid) AS arguments,
          pg_get_functiondef(p.oid) AS source_code,
          p.prosecdef AS security_definer,
          obj_description(p.oid, 'pg_proc') AS description,
          l.lanname AS language,
          array_to_json(p.proargnames) AS argument_names,
          (
            SELECT json_agg(json_build_object(
              'name', COALESCE(p.proargnames[i], '$' || i),
              'type', format_type(p.proargtypes[i-1], NULL),
              'mode', CASE COALESCE(p.proargmodes[i], 'i')
                WHEN 'i' THEN 'IN'
                WHEN 'o' THEN 'OUT'
                WHEN 'b' THEN 'INOUT'
                WHEN 'v' THEN 'VARIADIC'
              END
            ))
            FROM generate_series(1, array_length(p.proargtypes, 1)) AS i
          ) AS parameters
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = $1 AND p.proname = $2 AND p.prokind = 'p'
        LIMIT 1
      `,
      values: [databaseSchemaName, procedureName],
    };

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );

    const storedProcedure = result.rows[0];
    if (!storedProcedure) {
      throw new Error(`Stored procedure not found: ${procedureName}`);
    }

    Logger.log("success", {
      message: "storedProcedureService:getStoredProcedureByName:success",
      params: { userID, databaseSchemaName, procedureName },
    });
    return storedProcedure;
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureService:getStoredProcedureByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        procedureName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Executes a stored procedure using CALL syntax.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.procedureName
 * @param {Array} param0.args - Array of argument values
 * @returns {Promise<object>} - Execution result.
 */
storedProcedureService.executeStoredProcedure = async ({
  userID,
  dbPool,
  databaseSchemaName,
  procedureName,
  args = [],
}) => {
  Logger.log("info", {
    message: "storedProcedureService:executeStoredProcedure:params",
    params: { userID, databaseSchemaName, procedureName, argsLength: args.length },
  });
  try {
    // Validate identifiers
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(procedureName)) {
      throw new Error("Invalid schema or procedure name");
    }

    // Build parameter placeholders
    const placeholders = args.map((_, i) => `$${i + 1}`).join(", ");
    // Use CALL syntax for procedures (PostgreSQL 11+)
    const query = {
      text: `CALL "${databaseSchemaName}"."${procedureName}"(${placeholders})`,
      values: args,
    };

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );

    Logger.log("success", {
      message: "storedProcedureService:executeStoredProcedure:success",
      params: {
        userID,
        databaseSchemaName,
        procedureName,
      },
    });

    // Procedures don't return results like functions
    return {
      success: true,
      message: "Procedure executed successfully",
    };
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureService:executeStoredProcedure:catch-1",
      params: {
        userID,
        databaseSchemaName,
        procedureName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Creates a new stored procedure (PostgreSQL 11+).
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.procedureName
 * @param {Array} param0.parameters - Array of {name, type, mode, default}
 * @param {string} param0.language - plpgsql, sql, etc.
 * @param {string} param0.body - Procedure body
 * @param {boolean} param0.securityDefiner
 * @param {boolean} param0.orReplace
 * @returns {Promise<object>} - Result of creation.
 */
storedProcedureService.createStoredProcedure = async ({
  userID,
  dbPool,
  databaseSchemaName,
  procedureName,
  parameters = [],
  language = "plpgsql",
  body,
  securityDefiner = false,
  orReplace = false,
}) => {
  Logger.log("info", {
    message: "storedProcedureService:createStoredProcedure:params",
    params: { userID, databaseSchemaName, procedureName, language },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(procedureName)) {
      throw new Error("Invalid schema or procedure name");
    }

    // Build parameter list
    const paramList = parameters.map(p => {
      let param = "";
      if (p.mode && p.mode !== "IN") {
        param += `${p.mode} `;
      }
      if (p.name) {
        param += `"${p.name}" `;
      }
      param += p.type;
      if (p.default) {
        param += ` DEFAULT ${p.default}`;
      }
      return param;
    }).join(", ");

    // Build CREATE PROCEDURE statement (no return type for procedures)
    let sql = orReplace
      ? `CREATE OR REPLACE PROCEDURE "${databaseSchemaName}"."${procedureName}"`
      : `CREATE PROCEDURE "${databaseSchemaName}"."${procedureName}"`;

    sql += `(${paramList})`;

    sql += ` LANGUAGE ${language}`;

    // Options
    if (securityDefiner) {
      sql += " SECURITY DEFINER";
    }

    sql += ` AS $BODY$${body}$BODY$`;

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "storedProcedureService:createStoredProcedure:success",
      params: { userID, databaseSchemaName, procedureName },
    });

    return { success: true, procedureName };
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureService:createStoredProcedure:catch-1",
      params: { userID, databaseSchemaName, procedureName, error },
    });
    throw error;
  }
};

/**
 * Updates a stored procedure (uses CREATE OR REPLACE).
 */
storedProcedureService.updateStoredProcedure = async (params) => {
  return await storedProcedureService.createStoredProcedure({
    ...params,
    orReplace: true,
  });
};

/**
 * Deletes a stored procedure.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.procedureName
 * @param {string} param0.argumentTypes - Argument types for overloaded procedures
 * @param {boolean} param0.cascade
 * @returns {Promise<object>} - Result of deletion.
 */
storedProcedureService.deleteStoredProcedure = async ({
  userID,
  dbPool,
  databaseSchemaName,
  procedureName,
  argumentTypes = "",
  cascade = false,
}) => {
  Logger.log("info", {
    message: "storedProcedureService:deleteStoredProcedure:params",
    params: { userID, databaseSchemaName, procedureName, cascade },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(procedureName)) {
      throw new Error("Invalid schema or procedure name");
    }

    const cascadeClause = cascade ? " CASCADE" : "";
    const argsClause = argumentTypes ? `(${argumentTypes})` : "()";
    // Use DROP PROCEDURE for true procedures
    const sql = `DROP PROCEDURE IF EXISTS "${databaseSchemaName}"."${procedureName}"${argsClause}${cascadeClause}`;

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "storedProcedureService:deleteStoredProcedure:success",
      params: { userID, databaseSchemaName, procedureName },
    });

    return { success: true, procedureName };
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureService:deleteStoredProcedure:catch-1",
      params: { userID, databaseSchemaName, procedureName, error },
    });
    throw error;
  }
};

module.exports = { storedProcedureService };
