/**
 * DataQueryHandler
 * Wrapper around the legacy (atomic) Data Query Service.
 */
const { dataQueryService } = require("../../../dataQuery/dataQuery.service");
const Logger = require("../../../../utils/logger");

class DataQueryHandler {
  async execute(config, context) {
    const { queryId, params } = config;

    // 1. Resolve Parameters
    // If params are strictly values, use them. 
    // If they are templated `{{ ctx.nodeA.data }}`, they should have been resolved by the Scheduler BEFORE calling execute.
    // For now, we assume `params` passed here are already resolved values.
    
    Logger.log("info", { message: "DataQueryHandler:execute", params: { queryId } });

    try {
      // 2. Execute via existing Service
      // We rely on runDataQueryByID which handles the DB connection
      // userID/tenantID typically come from the workflow trigger context
      
      const { userID, tenantID } = context; 

      if (!userID || !tenantID) {
        throw new Error("Missing userID or tenantID in execution context for DataQuery");
      }

      const result = await dataQueryService.runDataQueryByID({
        userID,
        tenantID,
        dataQueryID: queryId,
        argValues: params || {}
      });

      return result;

    } catch (error) {
      Logger.log("error", { message: "DataQueryHandler:execute:error", params: { error: error.message } });
      throw error;
    }
  }
}

module.exports = new DataQueryHandler();
