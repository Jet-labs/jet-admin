import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function buildBaseUrl(options) {
  const protocol = options.protocol === "https" ? "https" : "http";
  const host = options.host || "localhost";
  const port = options.port || 8123;
  return `${protocol}://${host}:${port}`;
}

async function runQuery({ options, query, timeoutSeconds = 15, database, signal }) {
  const baseUrl = buildBaseUrl(options);
  const url = new URL("/", baseUrl);
  url.searchParams.set("database", database || options.database || "default");
  url.searchParams.set("default_format", "JSONEachRow");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, Number(timeoutSeconds) || 15) * 1000);
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-Type": "text/plain",
        ...(options.username ? { "X-ClickHouse-User": options.username } : {}),
        ...(options.password ? { "X-ClickHouse-Key": options.password } : {}),
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`ClickHouse HTTP ${response.status}: ${text.trim()}`);
    }

    if (!text.trim()) return [];

    // JSONEachRow: one JSON object per line.
    const rows = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        try {
          return JSON.parse(line);
        } catch {
          throw new Error(`ClickHouse returned a non-JSON row at line ${index + 1}`);
        }
      });
    return rows;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

export default class ClickHouseDataSource extends DataSource {
  async execute(dataQueryOptions, context, helpers) {
    const options = this.config.datasourceOptions || {};
    const query = String(dataQueryOptions?.query || "").trim();

    // Never log the SQL body: templates and literals may carry secrets.
    Logger.log("info", {
      message: "clickhouse:ClickHouseDataSource:execute:params",
      params: { queryLength: query.length, database: options.database || "default" },
    });

    if (!query) {
      throw new Error("ClickHouse query is required.");
    }
    if (query.split(";").map((s) => s.trim()).filter(Boolean).length > 1) {
      throw new Error("ClickHouse execute accepts a single statement.");
    }

    try {
      return await runQuery({ options, query, timeoutSeconds: options.timeout, signal: helpers?.signal });
    } catch (error) {
      Logger.log("error", {
        message: "clickhouse:ClickHouseDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`ClickHouse query failed: ${error.message || String(error)}`);
    }
  }
}

export { runQuery, buildBaseUrl };
