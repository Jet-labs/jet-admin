import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../../core/models/datasource.js";

export default class RestAPIDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    const { method, baseUrl, headers, body, params } = dataQueryOptions;
    Logger.log("info", {
      message: "restapi:RestAPIDataSource:execute:params",
      params: { method, baseUrl, headers, body, params },
    });

    try {
      const response = await axios({
        method,
        url: baseUrl,
        headers,
        data: body,
        params,
        timeout: 15000,
      });

      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:response",
        params: {
          method,
          baseUrl,
          headers,
          body,
          params,
          status: response.status,
          statusText: response.statusText,
          body: response.data,
        },
      });

      return response.data;
    } catch (error) {
      Logger.log("error", {
        message: "restapi:RestAPIDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(
        `API request failed: ${error.response?.status || "No response"}`
      );
    }
  }
}
