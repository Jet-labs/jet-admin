import fs from "fs/promises";
import { Logger } from "../../utils/logger.js";
import { resolveInRoot } from "./datasource";

export const filesystemTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "filesystem:filesystemTestConnection:params",
      params: { rootPath: datasourceOptions.rootPath },
    });

    const root = String(datasourceOptions.rootPath || "").trim();
    if (!root) throw new Error("rootPath is required.");

    const absolute = resolveInRoot(root, ".");
    const stat = await fs.stat(absolute);
    if (!stat.isDirectory()) throw new Error(`rootPath is not a directory: ${root}`);

    Logger.log("info", {
      message: "filesystem:filesystemTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "filesystem:filesystemTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
