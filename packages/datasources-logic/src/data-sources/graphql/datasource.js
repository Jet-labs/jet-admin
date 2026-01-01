import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class GraphQLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "graphql:GraphQLDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const { query, variables, operationName } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions || {};
    const { 
      endpoint, 
      authType, 
      bearerToken, 
      apiKey, 
      basicAuth, 
      headers: customHeaders = [],
      timeout = 30 
    } = datasourceOptions;

    if (!endpoint) {
      throw new Error("GraphQL endpoint is required");
    }

    try {
      // Build headers
      const headers = {
        "Content-Type": "application/json",
      };

      // Apply authentication
      if (authType === "bearer" && bearerToken) {
        headers["Authorization"] = `Bearer ${bearerToken}`;
      } else if (authType === "apiKey" && apiKey?.value) {
        headers[apiKey.headerName || "x-api-key"] = apiKey.value;
      } else if (authType === "basic" && basicAuth?.username && basicAuth?.password) {
        const credentials = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
      }

      // Apply custom headers
      if (customHeaders && Array.isArray(customHeaders)) {
        customHeaders.forEach(header => {
          if (header.key && header.value) {
            headers[header.key] = header.value;
          }
        });
      }

      // Parse variables
      let parsedVariables = {};
      if (variables) {
        try {
          parsedVariables = typeof variables === "string" ? JSON.parse(variables) : variables;
        } catch (e) {
          Logger.log("warn", {
            message: "graphql:GraphQLDataSource:execute:variableParseError",
            params: { error: e.message },
          });
        }
      }

      // Make the request
      const response = await axios({
        method: "POST",
        url: endpoint,
        headers,
        data: {
          query,
          variables: parsedVariables,
          ...(operationName ? { operationName } : {}),
        },
        timeout: timeout * 1000,
      });

      Logger.log("info", {
        message: "graphql:GraphQLDataSource:execute:success",
        params: { 
          endpoint,
          hasData: !!response.data?.data,
          hasErrors: !!response.data?.errors,
        },
      });

      // Check for GraphQL errors
      if (response.data?.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors.map(e => e.message).join("; ");
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      return response.data?.data || response.data;
    } catch (error) {
      Logger.log("error", {
        message: "graphql:GraphQLDataSource:execute:catch",
        params: { 
          error: error.message,
          response: error.response?.data,
        },
      });

      // Check if it's a GraphQL error response
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(e => e.message).join("; ");
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      throw new Error(`GraphQL request failed: ${error.message}`);
    }
  }

  /**
   * Perform introspection query to get schema information
   */
  async introspect() {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          types {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;

    return await this.execute({ query: introspectionQuery });
  }
}
