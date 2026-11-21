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

async function githubRequest({ options, method, path: apiPath, queryParams, headers: extra, body, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(1, Number(options.timeout) || 15) * 1000
  );

  try {
    const response = await confinedFetch({
      baseUrl: options.apiUrl || "https://api.github.com",
      path: apiPath,
      params: kvArrayToObject(queryParams),
      method: method || "GET",
      timeoutMs: Math.max(1, Number(options.timeout) || 15) * 1000,
      signal: signal || controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "jet-admin",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...kvArrayToObject(extra),
        ...(body !== undefined && body !== null ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();

    if (!response.ok) {
      let message = `GitHub HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        message = json.message ? `GitHub HTTP ${response.status}: ${json.message}` : message;
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

export default class GitHubDataSource extends DataSource {
  async execute(dataQueryOptions, context, helpers) {
    const options = this.config.datasourceOptions || {};
    const method = String(dataQueryOptions?.method || "GET").toUpperCase();
    const apiPath = String(dataQueryOptions?.path || "").trim();

    Logger.log("info", {
      message: "github:GitHubDataSource:execute:params",
      params: { method, path: apiPath },
    });

    if (!apiPath) {
      throw new Error("GitHub API path is required.");
    }

    try {
      return await githubRequest({
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
        message: "github:GitHubDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`GitHub request failed: ${error.message || String(error)}`);
    }
  }
}

export { githubRequest };
