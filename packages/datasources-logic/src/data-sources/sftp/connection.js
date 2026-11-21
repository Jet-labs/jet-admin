import { Logger } from "../../utils/logger.js";
import { withSftp } from "./datasource";

export const sftpTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "sftp:sftpTestConnection:params",
      params: { host: datasourceOptions.host, port: datasourceOptions.port, username: datasourceOptions.username },
    });

    if (!datasourceOptions.host || !datasourceOptions.username) {
      throw new Error("SFTP host and username are required.");
    }
    if (!datasourceOptions.password && !datasourceOptions.privateKey) {
      throw new Error("SFTP password or privateKey is required.");
    }

    await withSftp(datasourceOptions, (server) =>
      new Promise((resolve, reject) => {
        server.realpath(".", (error, dir) => (error ? reject(error) : resolve(dir)));
      })
    );

    Logger.log("info", {
      message: "sftp:sftpTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "sftp:sftpTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
