import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class JiraDataSource extends DataSource {
  getAuthHeader() {
    const datasourceOptions = this.config.datasourceOptions;
    return Buffer.from(`${datasourceOptions?.email}:${datasourceOptions?.apiToken}`).toString("base64");
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "jira:JiraDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { resource, operation, jql, issueKey, projectKey, fields, maxResults, startAt } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;
    const auth = this.getAuthHeader();
    const baseUrl = datasourceOptions?.host;

    try {
      let result;

      switch (resource) {
        case "issues":
          if (operation === "search") {
            const params = new URLSearchParams({
              jql: jql || "ORDER BY created DESC",
              maxResults: String(maxResults || 50),
              startAt: String(startAt || 0),
            });
            if (fields) params.append("fields", fields);
            
            const response = await fetch(`${baseUrl}/rest/api/3/search?${params}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          } else if (operation === "get") {
            const params = fields ? `?fields=${fields}` : "";
            const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}${params}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          }
          break;

        case "projects":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/api/3/project/search?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          } else if (operation === "get") {
            const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          }
          break;

        case "users":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/api/3/users/search?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          }
          break;

        case "boards":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/agile/1.0/board?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          }
          break;

        case "sprints":
          if (operation === "search") {
            // Requires boardId, using projectKey as fallback
            const response = await fetch(`${baseUrl}/rest/agile/1.0/board/${projectKey}/sprint?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
            });
            result = await response.json();
          }
          break;

        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "jira:JiraDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Jira operation failed: ${error.message || error}`);
    }
  }
}
