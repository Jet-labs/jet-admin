import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";
import { confinedFetch } from "../../utils/confinedRequest.js";

function kvArrayToObject(arr) {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, { key, value }) => {
    if (key) acc[key] = value;
    return acc;
  }, {});
}

async function gitlabRequest({ options, method, path: apiPath, queryParams, headers: extra, body, signal }) {
  const authType = options.authType || "privateToken";
  const authHeaders = {};
  if (authType === "oauthToken" && options.token) {
    authHeaders.Authorization = `Bearer ${options.token}`;
  } else if (authType === "privateToken" && options.token) {
    authHeaders["PRIVATE-TOKEN"] = options.token;
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(1, Number(options.timeout) || 15) * 1000
  );

  try {
    const response = await confinedFetch({
      baseUrl: options.baseUrl || "https://gitlab.com/api/v4",
      path: apiPath,
      params: kvArrayToObject(queryParams),
      method: method || "GET",
      timeoutMs: Math.max(1, Number(options.timeout) || 15) * 1000,
      signal: signal || controller.signal,
      headers: {
        Accept: "application/json",
        ...authHeaders,
        ...kvArrayToObject(extra),
        ...(body !== undefined && body !== null ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();

    if (!response.ok) {
      let message = `GitLab HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        const detail = typeof json === "string" ? json : json.message;
        if (detail) {
          message = `GitLab HTTP ${response.status}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`;
        }
      } catch {}
      throw new Error(message);
    }

    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } finally {
    clearTimeout(timer);
  }
}

export default class GitLabDataSource extends DataSource {
  async execute(dataQueryOptions, context, helpers) {
    const options = this.config.datasourceOptions || {};
    const method = String(dataQueryOptions?.method || "GET").toUpperCase();
    const apiPath = String(dataQueryOptions?.path || "").trim();

    Logger.log("info", {
      message: "gitlab:GitLabDataSource:execute:params",
      params: { method, path: apiPath },
    });

    if (!apiPath) {
      throw new Error("GitLab API path is required.");
    }

    try {
      return await gitlabRequest({
        options,
        method,
        path: apiPath,
        queryParams: dataQueryOptions.queryParams,
        headers: dataQueryOptions.headers,
        body: dataQueryOptions.body,
        signal: helpers?.signal,
      });
    } catch (error) {
      Logger.log("error", {
        message: "gitlab:GitLabDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`GitLab request failed: ${error.message || String(error)}`);
    }
  }
}

export { gitlabRequest };
