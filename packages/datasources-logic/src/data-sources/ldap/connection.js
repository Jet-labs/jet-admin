import { Logger } from "../../utils/logger.js";
import { withClient } from "./datasource";

export const ldapTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "ldap:ldapTestConnection:params",
      params: { url: datasourceOptions.url, bindDN: datasourceOptions.bindDN || "(anonymous)" },
    });

    if (!datasourceOptions.url) {
      throw new Error("LDAP url is required.");
    }

    await withClient(datasourceOptions, async () => {});

    Logger.log("info", {
      message: "ldap:ldapTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "ldap:ldapTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
