import fetch from "node-fetch";
import { Logger } from "../../utils/logger";
import DataSource from "../datasource.js";

export default class WebURLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "weburl:WebURLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });
    const { action, args } = dataQueryOptions;
    const { url, timeout } = this.config.datasourceOptions;
    if (!url) {
      throw new Error("Web URL datasource requires datasourceOptions.url");
    }
    try {
      // datasourceOptions.timeout is in seconds (per formConfig); node-fetch expects ms.
      const timeoutMs = (Number(timeout) > 0 ? Number(timeout) : 10) * 1000;
      // Fetch options
      const opts = {
        method: action || "GET",
        headers: {},
        redirect: "follow",
        timeout: timeoutMs,
      };

      // Execute request
      const res = await fetch(url, opts);
      const contentTypeHeader = res.headers.get("content-type") || "";
      let parsedBody;
      if (contentTypeHeader.includes("application/json")) {
        parsedBody = await res.json();
      } else {
        parsedBody = await res.text();
      }

      Logger.log("info", {
        message: "weburl:WebURLDataSource:execute:response",
        params: {
          status: res.status,
          statusText: res.statusText,
          body: parsedBody,
        },
      });

      // Return the actual response data
      return parsedBody;
    } catch (err) {
      Logger.log("error", {
        message: "weburl:WebURLDataSource:execute:catch",
        params: err.message || err,
      });
      throw new Error(
        `Web URL request failed: ${err.message || "No response"}`
      );
    }
  }
}
