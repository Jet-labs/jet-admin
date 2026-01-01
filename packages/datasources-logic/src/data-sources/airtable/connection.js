import Airtable from "airtable";
import { Logger } from "../../utils/logger.js";

export const airtableTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "airtable:airtableTestConnection:params",
      params: { baseId: datasourceOptions.baseId },
    });

    Airtable.configure({
      apiKey: datasourceOptions.apiKey,
    });

    const base = Airtable.base(datasourceOptions.baseId);
    
    // Test connection by trying to access the base
    // We'll try to get metadata - this should work if credentials are valid
    const tables = await base.tables();
    
    Logger.log("info", {
      message: "airtable:airtableTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "airtable:airtableTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
