import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class RestAPIDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    const { method, apiEndpoint, headers = {}, body, params } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions || {};
    const finalUrl = `${datasourceOptions.baseUrl}${apiEndpoint}`;

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
      // Build headers with auth
      const finalHeaders = { ...headers };

      // Apply authentication from datasource config
      const { authType, username, password, bearerToken, oauth2, contentType } = datasourceOptions;

      if (contentType) {
        finalHeaders["Content-Type"] = contentType;
      }

      if (authType === "basic" && username && password) {
        finalHeaders["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
      } else if (authType === "bearer" && bearerToken) {
        finalHeaders["Authorization"] = `Bearer ${bearerToken}`;
      }
      // Note: OAuth2 token refresh would need more complex handling in production

      const response = await axios({
        method,
        url: finalUrl,
        headers: finalHeaders,
        data: body,
        params,
        timeout: (datasourceOptions.timeout || 15) * 1000,
      });

      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:response",
        params: {
          method,
          finalUrl,
          headers: finalHeaders,
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
