/**
 * connection.js
 *
 * Tests whether the configured Excel/CSV file URL is reachable.
 * All storage strategy selection (S3 → Supabase client → plain HTTP HEAD/GET)
 * is fully delegated to fileStorage.util.js — this file owns only the
 * connection-test contract (parameters in, {ok, statusText|error} out).
 */

import { Logger } from "../../utils/logger.js";

/**
 * @param {{ datasourceOptions: object, helpers?: object }} params
 * @returns {Promise<{ ok: boolean, statusText?: string, error?: string }>}
 */
export const excelcsvTestConnection = async ({ datasourceOptions, helpers }) => {
  const fileInfo = datasourceOptions?.fileInfo || {};
  const fileUrl = datasourceOptions?.fileUrl || fileInfo.fileUrl;
  const fileName = datasourceOptions?.fileName || fileInfo.fileName;
  const label = fileName || "uploaded file";

  Logger.log("info", {
    message: "excelcsv:excelcsvTestConnection:params",
    params: datasourceOptions,
  });

  if (!fileUrl) {
    return {
      ok: false,
      error: "File URL is required. Please upload a file first.",
    };
  }

  try {
    if (helpers && helpers.fileStorage && typeof helpers.fileStorage.checkFileExists === "function") {
      await helpers.fileStorage.checkFileExists(fileUrl);
    } else {
      // Fallback or warning
      throw new Error("Missing fileStorage helper for ExcelCSV connection check.");
    }
    return { ok: true, statusText: `Successfully reached file: ${label}` };
  } catch (err) {
    Logger.log("error", {
      message: "excelcsv:excelcsvTestConnection:error",
      params: err.message || err,
    });
    return { ok: false, error: `Could not reach file: ${err.message || err}` };
  }
};