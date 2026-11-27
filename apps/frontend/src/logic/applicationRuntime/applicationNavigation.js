import {
  parseApplicationRouteQuery,
  validateApplicationRouteParams,
} from "@jet-admin/application-contracts";

const navigationError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);

const isPrimitiveQueryValue = (value) =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

/**
 * Build a validated application URL from a route ID, path params and query.
 * Shared by the runtime navigation action and any future route-aware UI.
 */
export function buildApplicationRouteTarget({
  routes,
  routeID,
  params = {},
  query = {},
  basePath = "",
}) {
  if (!Array.isArray(routes)) {
    throw navigationError("INVALID_APPLICATION_ROUTES", "Application routes are unavailable.");
  }
  const route = routes.find((candidate) => candidate.id === routeID);
  if (!route) {
    throw navigationError(
      "APPLICATION_ROUTE_NOT_FOUND",
      `Route "${routeID}" is not part of this application release.`
    );
  }
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    throw navigationError("INVALID_ROUTE_PARAMS", "Route params must be an object.");
  }
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw navigationError("INVALID_ROUTE_QUERY", "Route query must be an object.");
  }

  const pathParamNames = route.path
    .split("/")
    .filter((part) => part.startsWith(":"))
    .map((part) => part.slice(1));
  for (const key of Object.keys(params)) {
    if (unsafeKeys.has(key)) {
      throw navigationError("INVALID_ROUTE_PARAM", "Reserved route parameter name.");
    }
    if (!pathParamNames.includes(key)) {
      throw navigationError(
        "UNKNOWN_ROUTE_PARAM",
        `Route "${routeID}" has no path parameter named "${key}".`
      );
    }
  }

  const resolvedParams = {};
  const path = route.path
    .split("/")
    .map((part) => {
      if (!part.startsWith(":")) return part;
      const key = part.slice(1);
      const value = params[key];
      if (value === undefined || value === null || value === "") {
        throw navigationError(
          "MISSING_ROUTE_PARAM",
          `Route "${routeID}" requires parameter "${key}".`
        );
      }
      if (!isPrimitiveQueryValue(value)) {
        throw navigationError(
          "INVALID_ROUTE_PARAM",
          `Route parameter "${key}" must be a string, number, or boolean.`
        );
      }
      const stringValue = String(value);
      resolvedParams[key] = stringValue;
      return encodeURIComponent(stringValue);
    })
    .join("/");

  if (!validateApplicationRouteParams(route, resolvedParams)) {
    throw navigationError(
      "INVALID_ROUTE_PARAM",
      `Route "${routeID}" received an invalid parameter value.`
    );
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (!key || key.length > 100 || unsafeKeys.has(key)) {
      throw navigationError("INVALID_ROUTE_QUERY", "Query keys must be non-empty and short.");
    }
    if (!isPrimitiveQueryValue(value)) {
      throw navigationError(
        "INVALID_ROUTE_QUERY",
        `Query value "${key}" must be a string, number, or boolean.`
      );
    }
    search.set(key, String(value));
  }

  const parsedQuery = parseApplicationRouteQuery(route, search);
  if (!parsedQuery.valid) {
    throw navigationError(
      parsedQuery.code || "INVALID_ROUTE_QUERY",
      parsedQuery.message || "The route query is invalid."
    );
  }

  const searchString = search.toString();
  const normalizedBase = basePath.replace(/\/+$/, "");
  return {
    routeID: route.id,
    path: `${normalizedBase}${path || "/"}${searchString ? `?${searchString}` : ""}`,
  };
}
