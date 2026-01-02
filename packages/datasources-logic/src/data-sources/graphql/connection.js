import axios from "axios";
import { Logger } from "../../utils/logger.js";

export const graphqlTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "graphql:graphqlTestConnection:params",
    });

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
      return {
        ok: false,
        error: "GraphQL endpoint is required",
      };
    }

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

    // Test with introspection query
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
        }
      }
    `;

    const response = await axios({
      method: "POST",
      url: endpoint,
      headers,
      data: { query: introspectionQuery },
      timeout: timeout * 1000,
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      // Some endpoints may not allow introspection but should still work
      const errorMessages = response.data.errors.map(e => e.message).join("; ");
      // If it's just an introspection error, we consider it connected
      if (errorMessages.toLowerCase().includes("introspection")) {
        Logger.log("info", {
          message: "graphql:graphqlTestConnection:connected (introspection disabled)",
        });
        return {
          ok: true,
          status: 200,
          statusText: "Connected (introspection disabled)",
        };
      }
    }

    Logger.log("info", {
      message: "graphql:graphqlTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "graphql:graphqlTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
