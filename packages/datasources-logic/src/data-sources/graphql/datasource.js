import axios from "axios";
import { createClient } from "graphql-ws";
import WebSocket from "ws";
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
        const gqlError = new Error(`GraphQL errors: ${errorMessages}`);
        gqlError.errors = error.response.data.errors;
        gqlError.response = error.response;
        throw gqlError;
      }

      const gqlError = new Error(`GraphQL request failed: ${error.message}`);
      gqlError.response = error.response;
      gqlError.request = error.request;
      gqlError.config = error.config;
      throw gqlError;
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

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    const endpoint = datasourceOptions.endpoint;
    
    if (!endpoint) {
      throw new Error("GraphQL endpoint is required for subscriptions");
    }

    let wsEndpoint = endpoint.replace(/^http/, 'ws');
    if (datasourceOptions.wsEndpoint) {
      wsEndpoint = datasourceOptions.wsEndpoint;
    }

    const { subscription, variables } = config;

    if (!subscription) {
      throw new Error("GraphQL subscription query is required");
    }

    Logger.log("info", {
      message: "graphql:subscribe:start",
      params: { wsEndpoint, datasourceID: this.config.datasourceID },
    });

    let parsedVariables = {};
    if (variables) {
      try {
        parsedVariables = typeof variables === "string" ? JSON.parse(variables) : variables;
      } catch (e) {
        Logger.log("warn", {
          message: "graphql:subscribe:variableParseError",
          params: { error: e.message },
        });
      }
    }

    const connectionParams = {};
    if (datasourceOptions.authType === "bearer" && datasourceOptions.bearerToken) {
      connectionParams.Authorization = `Bearer ${datasourceOptions.bearerToken}`;
    } else if (datasourceOptions.authType === "apiKey" && datasourceOptions.apiKey?.value) {
      connectionParams[datasourceOptions.apiKey.headerName || "x-api-key"] = datasourceOptions.apiKey.value;
    }

    if (datasourceOptions.headers && Array.isArray(datasourceOptions.headers)) {
      datasourceOptions.headers.forEach(header => {
        if (header.key && header.value) {
          connectionParams[header.key] = header.value;
        }
      });
    }

    const client = createClient({
      url: wsEndpoint,
      webSocketImpl: WebSocket,
      connectionParams: Object.keys(connectionParams).length > 0 ? connectionParams : undefined,
    });

    const unsubscribeFn = client.subscribe(
      {
        query: subscription,
        variables: parsedVariables,
      },
      {
        next: (data) => {
          onEvent({ payload: data.data || data });
        },
        error: (error) => {
          Logger.log("error", {
            message: "graphql:subscribe:error",
            params: { error },
          });
        },
        complete: () => {
          Logger.log("info", {
            message: "graphql:subscribe:complete",
            params: { datasourceID: this.config.datasourceID },
          });
        },
      }
    );

    return { client, unsubscribeFn };
  }

  async unsubscribe(handle) {
    if (!handle) return;
    
    Logger.log("info", {
      message: "graphql:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      if (handle.unsubscribeFn) {
        handle.unsubscribeFn();
      }
      if (handle.client) {
        await handle.client.dispose();
      }
    } catch (e) {
      Logger.log("error", {
        message: "graphql:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
