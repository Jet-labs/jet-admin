import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function buildBaseUrl(options) {
  return String(options.baseUrl || "http://localhost:9090").replace(/\/+$/, "");
}

function authHeaders(options) {
  const headers = { Accept: "application/json" };
  const authType = options.authType || "none";
  if (authType === "basic" && options.username && options.password) {
    headers.Authorization = `Basic ${Buffer.from(`${options.username}:${options.password}`).toString("base64")}`;
  } else if (authType === "bearer" && options.bearerToken) {
    headers.Authorization = `Bearer ${options.bearerToken}`;
  }
  return headers;
}

async function promGet({ options, path, params, signal }) {
  const url = new URL(path, `${buildBaseUrl(options)}/`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(1, Number(options.timeout) || 15) * 1000
  );
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders(options),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload || payload.status !== "success") {
      const message =
        payload?.error?.message ||
        `Prometheus HTTP ${response.status} for ${path}`;
      throw new Error(message);
    }
    return payload.data;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

function vectorToRows(result) {
  const rows = [];
  for (const item of result || []) {
    const metric = item.metric || {};
    const value = Array.isArray(item.value) ? item.value[1] : undefined;
    const timestamp = Array.isArray(item.value) ? Number(item.value[0]) : undefined;
    // Labels first so generated fields always win on collision.
    rows.push({
      ...metric,
      metric: metric.__name__ || "",
      timestamp,
      value: value === undefined ? value : Number(value),
    });
  }
  return rows;
}

function matrixToRows(result) {
  const rows = [];
  for (const item of result || []) {
    const metric = item.metric || {};
    for (const [timestamp, value] of item.values || []) {
      rows.push({
        ...metric,
        metric: metric.__name__ || "",
        timestamp: Number(timestamp),
        value: Number(value),
      });
    }
    // Buckets/summary of histograms: keep numeric bucket counts + sum/count.
    if (Array.isArray(item.values) === false && item.metric) {
      for (const bucket of item.buckets || []) {
        rows.push({
          ...metric,
          metric: `${metric.__name__ || ""}_bucket`,
          timestamp: bucket.timestamp !== undefined ? Number(bucket.timestamp) : undefined,
          value: Number(bucket.value),
        });
      }
      if (item.sum !== undefined) {
        rows.push({ ...metric, metric: `${metric.__name__ || ""}_sum`, value: Number(item.sum) });
      }
      if (item.count !== undefined) {
        rows.push({ ...metric, metric: `${metric.__name__ || ""}_count`, value: Number(item.count) });
      }
    }
  }
  return rows;
}

export default class PrometheusDataSource extends DataSource {
  async execute(dataQueryOptions, context, helpers) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "instantQuery");

    Logger.log("info", {
      message: "prometheus:PrometheusDataSource:execute:params",
      params: { operation, query: String(dataQueryOptions?.query || "").slice(0, 200) },
    });

    try {
      if (operation === "instantQuery") {
        const data = await promGet({
          options,
          path: "/api/v1/query",
          params: { query: dataQueryOptions.query, time: dataQueryOptions.time },
          signal: helpers?.signal,
        });
        if (data.resultType === "vector") return vectorToRows(data.result);
        if (data.resultType === "matrix") return matrixToRows(data.result);
        if (data.resultType === "scalar") return [{ value: Number(data.result) }];
        if (data.resultType === "string") return [{ value: data.result }];
        if (data.resultType === "histogram") return matrixToRows(data.result);
        return [];
      }

      if (operation === "rangeQuery") {
        const data = await promGet({
          options,
          path: "/api/v1/query_range",
          params: {
            query: dataQueryOptions.query,
            start: dataQueryOptions.start,
            end: dataQueryOptions.end,
            step: dataQueryOptions.step || "30s",
          },
        });
        return matrixToRows(data.result);
      }

      if (operation === "labelValues") {
        const labelName = String(dataQueryOptions.labelName || "").trim();
        if (!labelName) throw new Error("labelName is required for labelValues.");
        const matches = Array.isArray(dataQueryOptions.matches) ? dataQueryOptions.matches : [];
        const urlParams = {};
        for (const match of matches) {
          urlParams["match[]"] = match;
        }
        // Prometheus repeats match[]; promGet sets one key, so handle repeats manually.
        if (matches.length > 1) {
          const url = new URL(`/api/v1/label/${encodeURIComponent(labelName)}/values`, `${buildBaseUrl(options)}/`);
          for (const match of matches) url.searchParams.append("match[]", match);
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), Math.max(1, Number(options.timeout) || 15) * 1000);
          try {
            const response = await fetch(url, { method: "GET", headers: authHeaders(options), signal: controller.signal });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload || payload.status !== "success") {
              throw new Error(payload?.error?.message || `Prometheus HTTP ${response.status}`);
            }
            return (payload.data || []).map((value) => ({ value }));
          } finally {
            clearTimeout(timer);
          }
        }
        const data = await promGet({
          options,
          path: `/api/v1/label/${encodeURIComponent(labelName)}/values`,
          params: urlParams,
        });
        return (data || []).map((value) => ({ value }));
      }

      if (operation === "targets") {
        const data = await promGet({ options, path: "/api/v1/targets", params: {} });
        return data.activeTargets || [];
      }

      throw new Error(`Unsupported Prometheus operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "prometheus:PrometheusDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`Prometheus query failed: ${error.message || String(error)}`);
    }
  }
}

export { promGet, buildBaseUrl, vectorToRows, matrixToRows };
