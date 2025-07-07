

import fetch from "node-fetch";
import { Agent as HttpsAgent } from "https";
import { Agent as HttpAgent } from "http";
import { Logger } from "../../utils/logger";
import DataSource from "../datasource.js";

export default class WebURLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "weburl:WebURLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });
    const { action, args } = dataQueryOptions;
    const {url, timeout } = this.config.datasourceOptions;
    try {
      // Fetch options
      const opts = {
        method: "GET",
        headers: {},
        redirect: "follow",
        timeout: timeout,
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

      return { url, timeout, args };
    } catch (err) {
      Logger.log("error", {
        message: "weburl:WebURLDataSource:execute:catch",
        params: err.message || err,
      });
      throw new Error(
        `API request failed: ${err.response?.status || "No response"}`
      );
    }
  }
}
