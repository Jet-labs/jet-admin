import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";


export default class RestAPIDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    const { method, apiEndpoint, headers, body, params } = dataQueryOptions;
    const finalUrl = `${this.config.datasourceOptions.baseUrl}${apiEndpoint}`;
    Logger.log("info", {
      message: "restapi:RestAPIDataSource:execute:params",
      params: {
        method,
        apiEndpoint,
        finalUrl,
        headers,
        body,
        params,
        config: this.config,
      },
    });

    try {
      const response = await axios({
        method,
        url: finalUrl,
        headers,
        data: body,
        params,
        timeout: 15000,
      });

      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:response",
        params: {
          method,
          finalUrl,
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
