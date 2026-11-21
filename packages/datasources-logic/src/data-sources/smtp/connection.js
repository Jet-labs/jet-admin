import { Logger } from "../../utils/logger.js";
import { buildTransport } from "./datasource";

export const smtpTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "smtp:smtpTestConnection:params",
      params: { host: datasourceOptions.host, port: datasourceOptions.port },
    });

    if (!datasourceOptions.host || !datasourceOptions.port) {
      throw new Error("SMTP host and port are required.");
    }

    const transporter = buildTransport(datasourceOptions);
    try {
      await transporter.verify();
    } finally {
      try {
        transporter.close();
      } catch {}
    }

    Logger.log("info", {
      message: "smtp:smtpTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "smtp:smtpTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
