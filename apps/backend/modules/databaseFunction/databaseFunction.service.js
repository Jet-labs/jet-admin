const Logger = require("../../utils/logger");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const databaseFunctionService = {};

/**
 * Retrieves all functions in a database schema.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @returns {Promise<Array>} - Array of functions.
 */
databaseFunctionService.getAllFunctions = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseFunctionService:getAllFunctions:params",
    params: { userID, databaseSchemaName },
  });
  try {
    const query = {
      text: `
        SELECT 
          p.proname AS function_name,
          n.nspname AS schema_name,
          pg_get_function_arguments(p.oid) AS arguments,
          pg_get_function_result(p.oid) AS return_type,
          CASE p.provolatile
            WHEN 'i' THEN 'immutable'
            WHEN 's' THEN 'stable'
            WHEN 'v' THEN 'volatile'
          END AS volatility,
          obj_description(p.oid, 'pg_proc') AS description,
          l.lanname AS language
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = $1 AND p.prokind = 'f'
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
    const functions = result.rows;
    Logger.log("success", {
      message: "databaseFunctionService:getAllFunctions:success",
      params: {
        userID,
        databaseSchemaName,
        functionsLength: functions.length,
      },
    });
    return functions;
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionService:getAllFunctions:catch-1",
      params: { userID, databaseSchemaName, error },
    });
    throw error;
  }
};

/**
 * Retrieves a specific function by name including source code.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.functionName
 * @returns {Promise<object>} - The function details with source code.
 */
databaseFunctionService.getFunctionByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  functionName,
}) => {
  Logger.log("info", {
    message: "databaseFunctionService:getFunctionByName:params",
    params: { userID, databaseSchemaName, functionName },
  });
  try {
    const query = {
      text: `
        SELECT 
          p.proname AS function_name,
          n.nspname AS schema_name,
          pg_get_function_arguments(p.oid) AS arguments,
          pg_get_function_result(p.oid) AS return_type,
          pg_get_functiondef(p.oid) AS source_code,
          CASE p.provolatile
            WHEN 'i' THEN 'immutable'
            WHEN 's' THEN 'stable'
            WHEN 'v' THEN 'volatile'
          END AS volatility,
          p.prosecdef AS security_definer,
          p.proisstrict AS strict,
          obj_description(p.oid, 'pg_proc') AS description,
          l.lanname AS language,
          p.proretset AS returns_set,
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
                WHEN 't' THEN 'TABLE'
              END
            ))
            FROM generate_series(1, array_length(p.proargtypes, 1)) AS i
          ) AS parameters
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = $1 AND p.proname = $2 AND p.prokind = 'f'
        LIMIT 1
      `,
      values: [databaseSchemaName, functionName],
    };

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );

    const func = result.rows[0];
    if (!func) {
      throw new Error(`Function not found: ${functionName}`);
    }

    Logger.log("success", {
      message: "databaseFunctionService:getFunctionByName:success",
      params: { userID, databaseSchemaName, functionName },
    });
    return func;
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionService:getFunctionByName:catch-1",
      params: { userID, databaseSchemaName, functionName, error },
    });
    throw error;
  }
};

/**
 * Executes a function with provided arguments.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.functionName
 * @param {Array} param0.args - Array of argument values
 * @returns {Promise<object>} - Execution result.
 */
databaseFunctionService.executeFunction = async ({
  userID,
  dbPool,
  databaseSchemaName,
  functionName,
  args = [],
}) => {
  Logger.log("info", {
    message: "databaseFunctionService:executeFunction:params",
    params: { userID, databaseSchemaName, functionName, argsLength: args.length },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(functionName)) {
      throw new Error("Invalid schema or function name");
    }

    const placeholders = args.map((_, i) => `$${i + 1}`).join(", ");
    const query = {
      text: `SELECT * FROM "${databaseSchemaName}"."${functionName}"(${placeholders})`,
      values: args,
    };

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );

    Logger.log("success", {
      message: "databaseFunctionService:executeFunction:success",
      params: {
        userID,
        databaseSchemaName,
        functionName,
        rowCount: result.rowCount,
      },
    });

    return {
      rows: result.rows,
      fields: result.fields,
      rowCount: result.rowCount,
    };
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionService:executeFunction:catch-1",
      params: { userID, databaseSchemaName, functionName, error },
    });
    throw error;
  }
};

/**
 * Creates a new function.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.functionName
 * @param {Array} param0.parameters - Array of {name, type, mode, default}
 * @param {string} param0.returnType - Return type
 * @param {string} param0.language - plpgsql, sql, etc.
 * @param {string} param0.body - Function body
 * @param {string} param0.volatility - VOLATILE, STABLE, IMMUTABLE
 * @param {boolean} param0.securityDefiner
 * @param {boolean} param0.strict
 * @param {boolean} param0.orReplace
 * @param {boolean} param0.returnsSet
 * @returns {Promise<object>} - Result of creation.
 */
databaseFunctionService.createFunction = async ({
  userID,
  dbPool,
  databaseSchemaName,
  functionName,
  parameters = [],
  returnType = "void",
  language = "plpgsql",
  body,
  volatility = "VOLATILE",
  securityDefiner = false,
  strict = false,
  orReplace = false,
  returnsSet = false,
}) => {
  Logger.log("info", {
    message: "databaseFunctionService:createFunction:params",
    params: { userID, databaseSchemaName, functionName, language },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(functionName)) {
      throw new Error("Invalid schema or function name");
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

    // Build CREATE FUNCTION statement
    let sql = orReplace
      ? `CREATE OR REPLACE FUNCTION "${databaseSchemaName}"."${functionName}"`
      : `CREATE FUNCTION "${databaseSchemaName}"."${functionName}"`;

    sql += `(${paramList})`;

    // Return type
    if (returnsSet) {
      sql += ` RETURNS SETOF ${returnType}`;
    } else {
      sql += ` RETURNS ${returnType}`;
    }

    sql += ` LANGUAGE ${language}`;

    // Options
    if (volatility) {
      sql += ` ${volatility}`;
    }
    if (securityDefiner) {
      sql += " SECURITY DEFINER";
    }
    if (strict) {
      sql += " STRICT";
    }

    sql += ` AS $BODY$${body}$BODY$`;

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "databaseFunctionService:createFunction:success",
      params: { userID, databaseSchemaName, functionName },
    });

    return { success: true, functionName };
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionService:createFunction:catch-1",
      params: { userID, databaseSchemaName, functionName, error },
    });
    throw error;
  }
};

/**
 * Updates a function (uses CREATE OR REPLACE).
 */
databaseFunctionService.updateFunction = async (params) => {
  return await databaseFunctionService.createFunction({
    ...params,
    orReplace: true,
  });
};

/**
 * Deletes a function.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.functionName
 * @param {string} param0.argumentTypes - Argument types for overloaded functions
 * @param {boolean} param0.cascade
 * @returns {Promise<object>} - Result of deletion.
 */
databaseFunctionService.deleteFunction = async ({
  userID,
  dbPool,
  databaseSchemaName,
  functionName,
  argumentTypes = "",
  cascade = false,
}) => {
  Logger.log("info", {
    message: "databaseFunctionService:deleteFunction:params",
    params: { userID, databaseSchemaName, functionName, cascade },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(functionName)) {
      throw new Error("Invalid schema or function name");
    }

    const cascadeClause = cascade ? " CASCADE" : "";
    const argsClause = argumentTypes ? `(${argumentTypes})` : "()";
    const sql = `DROP FUNCTION IF EXISTS "${databaseSchemaName}"."${functionName}"${argsClause}${cascadeClause}`;

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "databaseFunctionService:deleteFunction:success",
      params: { userID, databaseSchemaName, functionName },
    });

    return { success: true, functionName };
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionService:deleteFunction:catch-1",
      params: { userID, databaseSchemaName, functionName, error },
    });
    throw error;
  }
};

module.exports = { databaseFunctionService };
