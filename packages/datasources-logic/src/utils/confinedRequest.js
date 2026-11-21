/**
 * Confined HTTP requests for API datasources.
 *
 * Data queries supply the request path, so a path like `//attacker.invalid/x`
 * must never move the request off the configured origin while still sending
 * the configured API token. This helper builds URLs under the configured
 * base (preserving any path prefix such as GitLab's `/api/v4`), enforces
 * origin + prefix confinement, and handles redirects manually so
 * credentials can never leak to another host.
 */

const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function normalizePath(pathname) {
  const clean = String(pathname || "/").replace(/\\/g, "/");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function buildConfinedUrl(baseUrl, apiPath, params) {
  let base;
  try {
    base = new URL(String(baseUrl));
  } catch {
    throw new Error(`Invalid API base URL: ${baseUrl}`);
  }
  if (!["http:", "https:"].includes(base.protocol)) {
    throw new Error(`API base URL must use http or https: ${baseUrl}`);
  }

  const rawPath = String(apiPath || "").trim();
  if (!rawPath) throw new Error("API path is required.");
  if (rawPath.includes("\\")) {
    throw new Error("API path must not contain backslashes.");
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(rawPath)) {
    throw new Error("API path must be relative to the configured base URL.");
  }

  const basePath = normalizePath(base.pathname).replace(/\/+$/, "");
  const prefix = basePath ? `${basePath}/` : "/";
  const relative = rawPath.replace(/^\/+/, "");
  const url = new URL(relative, `${base.origin}${prefix}`);

  if (url.origin !== base.origin) {
    throw new Error(`API path escapes the configured host: ${apiPath}`);
  }
  if (!(url.pathname === basePath || url.pathname.startsWith(prefix))) {
    throw new Error(`API path escapes the configured base path: ${apiPath}`);
  }

  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

export async function confinedFetch({
  baseUrl,
  path,
  params,
  method = "GET",
  headers = {},
  body,
  timeoutMs = 15000,
  signal,
}) {
  const initialUrl = buildConfinedUrl(baseUrl, path, params);
  const base = new URL(String(baseUrl));
  const basePath = normalizePath(base.pathname).replace(/\/+$/, "");
  const prefix = basePath ? `${basePath}/` : "/";

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(1, Number(timeoutMs) || 15000)
  );

  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    let url = initialUrl;
    let currentMethod = method;
    let currentBody = body;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const response = await fetch(url, {
        method: currentMethod,
        headers,
        body: currentBody,
        signal: controller.signal,
        redirect: "manual",
      });

      if (!REDIRECT_STATUSES.has(response.status)) return response;

      const location = response.headers.get("location");
      if (!location) return response;
      if (hop === MAX_REDIRECTS) {
        throw new Error(`Too many redirects from ${base.origin}`);
      }

      const next = new URL(location, url);
      if (next.origin !== base.origin) {
        throw new Error(`Redirect to foreign host refused: ${next.origin}`);
      }
      if (!(next.pathname === basePath || next.pathname.startsWith(prefix))) {
        throw new Error(`Redirect outside the configured base path refused: ${next.pathname}`);
      }

      // 303 converts to GET; 301/302/307/308 preserve method except for 303.
      if (response.status === 303) {
        currentMethod = "GET";
        currentBody = undefined;
      }
      url = next;
    }

    throw new Error(`Too many redirects from ${base.origin}`);
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}
