
const { prisma } = require("../config/prisma.config");
const {
  TenantAwarePostgreSQLPoolManager,
  tenantAwarePostgreSQLPoolManager,
} = require("../config/tenant-aware-pgpool-manager.config");
const jsonSchemaGenerator = require("json-schema-generator");
const { postgreSQLParserUtil } = require("../utils/postgresql.util");
const constants = require("../constants");
const Logger = require("../utils/logger");


const databaseQueryService = {};

// --- Helper Functions ---

/**
 * Resolves the database query input, either by fetching via ID or using the provided object.
 * @param {number} [databaseQueryID] - The ID of the query to fetch.
 * @param {DatabaseQueryInput} [databaseQueryData] - The query data object.
 * @param {string} databaseQueryRunnerJobID - Job ID for logging context.
 * @returns {Promise<DatabaseQueryInput>} - The resolved query data.
 * @throws {Error} - If query cannot be resolved or fetched query is invalid.
 * @private
 */
const _resolveDatabaseQueryInput = async (databaseQueryID, databaseQueryData, databaseQueryRunnerJobID) => {
  if (databaseQueryData) {
    // Validate provided query structure (basic check)
    if (typeof databaseQueryData.databaseQueryString !== 'string') {
      throw new Error(`_resolveDatabaseQueryInput: Invalid 'databaseQueryData' object structure provided. Expected { databaseQueryString: string, databaseQueryArgValues?: any[] }.`);
    }
    Logger.log("info", {
      message: "_resolveDatabaseQueryInput: Using provided databaseQueryData",
      params: { databaseQueryRunnerJobID },
    });
    // Ensure databaseQueryArgValues is at least an empty array if not provided
    return { ...databaseQueryData, databaseQueryArgValues: databaseQueryData.databaseQueryArgValues || [] };
  }

  if (databaseQueryID) {
    const queryId = parseInt(databaseQueryID, 10);
    if (isNaN(queryId)) {
      throw new Error(`_resolveDatabaseQueryInput: Invalid databaseQueryID format: ${databaseQueryID}`);
    }

    Logger.log("info", {
      message: "_resolveDatabaseQueryInput: Fetching database query by ID",
      params: { databaseQueryID: queryId, databaseQueryRunnerJobID },
    });

    // Renamed variable to reflect it holds the record from DB
    const databaseQueryRecord = await prisma.tblDatabaseQueries.findUnique({
      where: { databaseQueryID: queryId },
      select: { databaseQueryData: true } // Field name in DB is 'databaseQueryData'
    });

    // Use databaseQueryRecord here
    if (!databaseQueryRecord || !databaseQueryRecord.databaseQueryData) {
      throw new Error(`_resolveDatabaseQueryInput: Database query with ID ${queryId} not found.`);
    }
    // Ensure fetched query data structure is valid (basic check)
    // Access the actual query object via databaseQueryRecord.databaseQueryData
     if (typeof databaseQueryRecord.databaseQueryData.databaseQueryString !== 'string' || (databaseQueryRecord.databaseQueryData.databaseQueryArgValues != null && !Array.isArray(databaseQueryRecord.databaseQueryData.databaseQueryArgValues))) {
      throw new Error(`_resolveDatabaseQueryInput: Invalid databaseQueryData structure found for ID ${queryId}.`);
    }
     // Ensure databaseQueryArgValues is at least an empty array if not provided
    return { ...databaseQueryRecord.databaseQueryData, databaseQueryArgValues: databaseQueryRecord.databaseQueryData.databaseQueryArgValues || [] };
  }

  // This case should be prevented by initial validation in the main function
  throw new Error("_resolveDatabaseQueryInput: Could not resolve query data. Neither ID nor object provided.");
};

/**
 * Processes the raw database query string and arguments for safe execution.
 * @param {DatabaseQueryInput} databaseQueryData - The raw query data.
 * @param {string} databaseQueryRunnerJobID - Job ID for logging context.
 * @returns {ProcessedDatabaseQuery} - The processed query and values.
 * @private
 */
const _processDatabaseQuery = ({ databaseQueryString: originalQueryString, databaseQueryArgValues }, databaseQueryRunnerJobID) => {
  Logger.log("info", {
    message: "_processDatabaseQuery: Processing query for execution",
    params: { databaseQueryRunnerJobID },
  });
  // Ensure databaseQueryArgValues is an array (should be guaranteed by _resolveDatabaseQueryInput)
  const processedResult = postgreSQLParserUtil.processDatabaseQuery({
    databaseQueryString: originalQueryString, // Use the destructured name
    databaseQueryArgValues: databaseQueryArgValues || [],
  });
  return {
      processedQueryString: processedResult.databaseQueryString, // Renamed field in typedef
      queryValues: processedResult.values
  };
};

/**
 * Executes the processed database query against the database pool.
 * @param {object} dbPool - The database connection pool.
 * @param {string} processedQueryString - The query string with placeholders.
 * @param {any[]} queryValues - The values for the placeholders.
 * @param {string} databaseQueryRunnerJobID - Job ID for logging context.
 * @returns {Promise<DatabaseQueryResult>} - The database query result.
 * @throws {Error} - If database execution fails.
 * @private
 */
const _executeDatabaseQuery = async (dbPool, processedQueryString, queryValues, databaseQueryRunnerJobID) => {
  Logger.log("info", {
    message: "_executeDatabaseQuery: Executing database query",
    params: { databaseQueryRunnerJobID },
  });
  const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
    dbPool,
    async (client) => client.query(processedQueryString, queryValues) // Use renamed parameter
  );
  Logger.log("info", {
    message: "_executeDatabaseQuery: Database query executed successfully",
    params: { databaseQueryRunnerJobID, rowCount: result?.rowCount },
  });
  // Ensure result conforms to expected structure
  return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
      // Map other relevant fields from 'result' if necessary
  };
};

/**
 * Generates a JSON schema from database query result rows and saves it to the DB if a query ID is provided.
 * @param {number|null} databaseQueryID - The ID of the query (or null if query was not fetched by ID).
 * @param {any[]} databaseQueryResultRows - The rows returned from the query execution.
 * @param {string} databaseQueryRunnerJobID - Job ID for logging context.
 * @returns {Promise<void>}
 * @throws {Error} - If schema generation or DB update fails.
 * @private
 */
const _generateAndSaveDatabaseQuerySchema = async (databaseQueryID, databaseQueryResultRows, databaseQueryRunnerJobID) => {
  // Note: JSON.parse(JSON.stringify(...)) is used for deep cloning.
  // Evaluate alternatives if performance with large datasets is a concern.
  let databaseQueryResultSchema; // Renamed variable
   try {
       // Use renamed variable
       databaseQueryResultSchema = jsonSchemaGenerator(JSON.parse(JSON.stringify(databaseQueryResultRows)));
   } catch(e) {
        Logger.log("warn", {
            message: "_generateAndSaveDatabaseQuerySchema: Failed to generate JSON schema",
            params: { databaseQueryRunnerJobID, error: e.message },
        });
        return; // Exit if schema generation fails
   }


  if (databaseQueryID) {
    const queryId = parseInt(databaseQueryID, 10);
     if (isNaN(queryId)) {
          Logger.log("error", {
            message: "_generateAndSaveDatabaseQuerySchema: Invalid databaseQueryID received for saving schema",
            params: { databaseQueryID, databaseQueryRunnerJobID },
         });
         return;
     }

    Logger.log("info", {
      message: "_generateAndSaveDatabaseQuerySchema: Saving database query result schema",
      params: { databaseQueryID: queryId, databaseQueryRunnerJobID },
    });
    try {
        await prisma.tblDatabaseQueries.update({
            where: { databaseQueryID: queryId },
            // Use renamed variable. Assuming DB field name is 'databaseQueryResultSchema' or similar. Adjust if needed.
            data: { databaseQueryResultSchema: databaseQueryResultSchema },
        });
         Logger.log("info", {
            message: "_generateAndSaveDatabaseQuerySchema: Saved database query result schema successfully",
            params: { databaseQueryID: queryId, databaseQueryRunnerJobID },
        });
    } catch(dbError) {
         Logger.log("error", {
            message: "_generateAndSaveDatabaseQuerySchema: Failed to save database query result schema",
            params: { databaseQueryID: queryId, databaseQueryRunnerJobID, error: dbError.message },
        });
        throw dbError; // Re-throw DB errors
    }
  } else {
       Logger.log("info", {
            message: "_generateAndSaveDatabaseQuerySchema: No databaseQueryID provided, skipping schema save.",
            params: { databaseQueryRunnerJobID },
        });
  }
};

/**
 * Publishes the database query result to a Kafka topic.
 * @param {string} databaseQueryRunnerJobID - The job ID (used as Kafka key).
 * @param {DatabaseQueryResult} databaseQueryResult - The result object from the query execution.
 * @returns {Promise<void>}
 * @throws {Error} - If Kafka publishing fails.
 * @private
 */
const _publishDatabaseQueryResultToKafka = async (
  databaseQueryRunnerJobID,
  databaseQueryResult,
  userID,
  tenantID,
  postQueryRunnerJobResult
) => {
  Logger.log("info", {
    message:
      "_publishDatabaseQueryResultToKafka: Preparing to send job result to Kafka",
    params: {
      databaseQueryRunnerJobID,
      topic: constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOB_RESULTS,
      userID,
      tenantID,
      databaseQueryResult,
    },
  });

  // Define the payload structure explicitly using renamed parameter
  const databaseQueryKafkaPayload = {
    // Renamed variable
    databaseQueryResult,
    userID,
    tenantID,
    status: constants.BACKEND_JOB_STATUS.COMPLETED,
    // Add other relevant fields from 'databaseQueryResult' if needed by consumers
  };
  await postQueryRunnerJobResult(databaseQueryKafkaPayload);

  
  Logger.log("success", {
    message:
      "_publishDatabaseQueryResultToKafka: Job result successfully sent to Kafka",
    params: { databaseQueryRunnerJobID },
  });
};


// --- Main Orchestrator Function ---

/**
 * Executes a database query pipeline: resolve, process, execute, handle schema, publish result.
 *
 * @param {object} params - The parameters object.
 * @param {object} params.dbPool - The database connection pool instance.
 * @param {number} [params.databaseQueryID] - The ID of the database query to fetch and run.
 * @param {DatabaseQueryInput} [params.databaseQueryData] - The database query object (if not fetching by ID). **Note:** Parameter name kept as `databaseQueryData` for external consistency if desired, but internally treated as `DatabaseQueryInput`. Adjust if `databaseQueryData` is preferred externally too.
 * @param {string} params.databaseQueryRunnerJobID - The ID for the job runner.
 * @returns {Promise<boolean>} - Resolves with true if the entire operation succeeds.
 * @throws {Error} - Throws an error if any step in the pipeline fails.
 */
databaseQueryService.runDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueryID,
  databaseQueryData, // Kept name for potential external consistency, maps to databaseQueryData internally
  databaseQueryRunnerJobID,
  postQueryRunnerJobResult,
}) => {
  const dbPool = await tenantAwarePostgreSQLPoolManager.getPool(tenantID);
  // --- 1. Initial Validation ---
  if (!dbPool) {
    throw new Error("runDatabaseQuery: Missing required parameter 'dbPool'.");
  }
  if (!databaseQueryRunnerJobID) {
    throw new Error(
      "runDatabaseQuery: Missing required parameter 'databaseQueryRunnerJobID'."
    );
  }
  if (!databaseQueryID && !databaseQueryData) {
    throw new Error(
      "runDatabaseQuery: Either 'databaseQueryID' or 'databaseQueryData' must be provided."
    );
  }

  Logger.log("info", {
    message: "runDatabaseQuery: Initiated pipeline",
    params: {
      databaseQueryID,
      hasDatabaseQuery: !!databaseQueryData,
      databaseQueryRunnerJobID,
    },
  });

  try {
    // --- 2. Resolve Query Data ---
    // Pass the external 'databaseQueryData' parameter as the 'databaseQueryData' argument
    const resolvedDatabaseQuery = await _resolveDatabaseQueryInput(
      databaseQueryID,
      databaseQueryData,
      databaseQueryRunnerJobID
    );

    // --- 3. Process Query ---
    const processedDatabaseQuery = _processDatabaseQuery(
      resolvedDatabaseQuery,
      databaseQueryRunnerJobID
    );

    // --- 4. Execute Query ---
    const databaseQueryResult = await _executeDatabaseQuery(
      dbPool,
      processedDatabaseQuery.processedQueryString, // Use updated field name
      processedDatabaseQuery.queryValues,
      databaseQueryRunnerJobID
    );

    // --- 5. Generate & Save Schema (if applicable) ---
    await _generateAndSaveDatabaseQuerySchema(
      databaseQueryID,
      databaseQueryResult.rows,
      databaseQueryRunnerJobID
    );

    // --- 6. Publish Result to Kafka ---
    await _publishDatabaseQueryResultToKafka(
      databaseQueryRunnerJobID,
      databaseQueryResult,
      userID,
      tenantID,
      postQueryRunnerJobResult
    );

    // --- 7. Final Success ---
    Logger.log("success", {
      message: "runDatabaseQuery: Pipeline completed successfully",
      params: { databaseQueryRunnerJobID },
    });
    return true;
  } catch (error) {
    // Log the detailed error from any step and re-throw
    Logger.log("error", {
      message: "runDatabaseQuery: Pipeline failed",
      params: {
        databaseQueryID,
        databaseQueryRunnerJobID,
        error: error.message,
        stack: error.stack,
      },
    });
    throw error; // Re-throw the original error
  }
};

module.exports = { databaseQueryService };
