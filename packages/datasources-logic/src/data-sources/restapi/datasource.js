import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class RestAPIDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    const {
      method,
      apiEndpoint,
      headers: queryHeaders = [],
      body: queryBody,
      queryParams = [],
      contentType: queryContentType,
    } = dataQueryOptions;

    Logger.log("info", {
      message: "restapi:RestAPIDataSource:execute:rawOptions",
      params: {
        dataQueryOptions
      }
    });

    const datasourceOptions = this.config.datasourceOptions || {};
    const finalUrl = `${datasourceOptions.baseUrl}${apiEndpoint}`;

    // Fail fast on unresolved templates. An input that resolved to undefined
    // (or a leftover {{ }}) would otherwise reach axios as a literal
    // "https://undefined/..." and bury the cause in socket dumps.
    // Only the hostname and leftover braces are checked — path segments are
    // never inspected, so legitimate values are unaffected.
    try {
      const parsedHost = new URL(finalUrl).hostname;
      if (
        parsedHost === "undefined" ||
        parsedHost === "" ||
        (typeof apiEndpoint === "string" && apiEndpoint.includes("{{"))
      ) {
        throw new Error(
          `Unresolved template in REST endpoint "${apiEndpoint}". ` +
          `An input resolved to undefined — check the query's input values.`
        );
      }
    } catch (e) {
      if (e.message && e.message.startsWith("Unresolved template")) throw e;
      // new URL threw (relative URL etc.) — leave validation to axios.
    }

    // Helper to convert KV array to object
    const kvArrayToObject = (arr) => {
      if (!arr || !Array.isArray(arr)) return {};
      return arr.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});
    };

    try {
      // Build headers: DS Defaults -> Query Overrides
      const finalHeaders = {
        ...kvArrayToObject(datasourceOptions.headers),
        ...kvArrayToObject(queryHeaders),
      };

      // Set Content-Type: DS Default -> Query Override
      const finalContentType =
        queryContentType || datasourceOptions.contentType || "application/json";
      if (finalContentType) {
        finalHeaders["Content-Type"] = finalContentType;
      }

      // Build Query Params: DS Defaults -> Query Overrides
      const finalParams = {
        ...kvArrayToObject(datasourceOptions.queryParams),
        ...kvArrayToObject(queryParams),
      };

      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:params",
        params: {
          method,
          apiEndpoint,
          finalUrl,
          headers: finalHeaders,
          body: queryBody,
          params: finalParams,
          config: this.config,
        },
      });

      // Apply authentication from datasource config
      const { authType, username, password, bearerToken, oauth2 } = datasourceOptions;

      if (authType === "basic" && username && password) {
        finalHeaders["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
      } else if (authType === "bearer" && bearerToken) {
        finalHeaders["Authorization"] = `Bearer ${bearerToken}`;
      }
      // Note: OAuth2 token refresh would need more complex handling in production

      const requestConfig = {
        method: method || "GET",
        url: finalUrl,
        headers: finalHeaders,
        data: queryBody,
        params: finalParams,
        timeout: (datasourceOptions.timeout || 15) * 1000,
      };

      Logger.log("info", {
        message: `restapi:RestAPIDataSource:execute: Executing ${requestConfig.method} ${requestConfig.url}`,
        params: {
          requestDetails: {
            method: requestConfig.method,
            url: requestConfig.url,
            headers: requestConfig.headers,
            queryParams: requestConfig.params,
            body: requestConfig.data,
            timeout: requestConfig.timeout
          }
        }
      });

      const response = await axios(requestConfig);

      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:response",
        params: {
          method,
          finalUrl,
          headers: finalHeaders,
          body: queryBody,
          params: finalParams,
          status: response.status,
          statusText: response.statusText,
        },
      });

      return response.data;
    } catch (error) {
      Logger.log("error", {
        message: `restapi:RestAPIDataSource:execute:catch - Failed to execute ${method || "GET"} ${finalUrl}`,
        params: {
          error: error.message || error,
          responseStatus: error.response?.status,
          responseStatusText: error.response?.statusText,
          responseBody: error.response?.data,
          requestUrl: finalUrl
        },
      });
      const apiError = new Error(
        `API request failed: ${error.response?.status || "No response"}`
      );
      apiError.response = error.response;
      apiError.request = error.request;
      apiError.config = error.config;
      throw apiError;
    }
  }
}
