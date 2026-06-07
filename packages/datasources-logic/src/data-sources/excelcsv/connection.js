import axios from "axios";
import { Logger } from "../../utils/logger.js";

export const excelcsvTestConnection = async ({ datasourceOptions }) => {
  const fileInfo = datasourceOptions?.fileInfo || {};
  const fileUrl = datasourceOptions?.fileUrl || fileInfo.fileUrl;
  const fileName = datasourceOptions?.fileName || fileInfo.fileName;


  try {
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

    // Perform a HEAD check or lightweight GET to verify the file is reachable
    const response = await axios.head(fileUrl, { timeout: 5000 });

    if (response.status >= 200 && response.status < 300) {
      return {
        ok: true,
        statusText: `Successfully reached file: ${fileName || "uploaded file"}`,
      };
    } else {
      return {
        ok: false,
        error: `Failed to reach file. HTTP Status: ${response.status}`,
      };
    }
  } catch (err) {
    Logger.log("error", {
      message: "excelcsv:excelcsvTestConnection:catch",
      params: err.message || err,
    });

    // Fallback to GET if HEAD is not supported by Supabase storage settings or CORS
    try {
      const response = await axios.get(fileUrl, {
        headers: { Range: "bytes=0-0" }, // lightweight byte-range query
        timeout: 5000,
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          ok: true,
          statusText: `Successfully reached file: ${fileName || "uploaded file"}`,
        };
      }
    } catch (innerErr) {
      return {
        ok: false,
        error: `Could not reach file URL: ${err.message || err}`,
      };
    }

    return {
      ok: false,
      error: `Could not reach file URL: ${err.message || err}`,
    };
  }
};
