import { z } from "zod";

export const APPLICATION_SCHEMA_VERSION = 1;
export const APPLICATION_LIMITS = Object.freeze({ routes: 100, variables: 100, bytes: 262144 });
export const ROUTE_QUERY_TYPES = Object.freeze(["string", "number", "integer", "boolean", "uuid"]);
export const APPLICATION_ASSET_TYPES = Object.freeze({
  appPage: "appPageID", widget: "widgetID", dataQuery: "dataQueryID",
  workflow: "workflowID", listener: "listenerID", cronJob: "cronJobID", datasource: "datasourceID",
});
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
export const applicationKeySchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/)
  .refine(value => !unsafeKeys.has(value), "Reserved key");
export const applicationSlugSchema = z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const routePathSchema = z.string().max(512).regex(/^\/(?:[a-zA-Z0-9_-]+|:[a-zA-Z][a-zA-Z0-9_]*)(?:\/(?:[a-zA-Z0-9_-]+|:[a-zA-Z][a-zA-Z0-9_]*))*$|^\/$/);
const valueType = z.enum(["string", "number", "boolean", "object", "array", "null"]);
const variableSchema = z.object({ type: z.union([valueType, z.array(valueType).min(1)]), default: z.json() }).strict();
export const APPLICATION_STATE_PERSISTENCE_MODES = Object.freeze(["none", "session", "local"]);
export const APPLICATION_SHELL_KINDS = Object.freeze([
  "sidebar",
  "topbar",
  "bottom-bar",
  "hamburger",
]);
export const APPLICATION_SHELL_VARIANTS = Object.freeze([
  "pills",
  "underline",
  "minimal",
  "solid",
]);
export const APPLICATION_SHELL_SIZES = Object.freeze(["sm", "md", "lg"]);
export const APPLICATION_SHELL_ALIGNMENTS = Object.freeze([
  "start",
  "center",
  "end",
]);
const shellAppearanceSchema = z
  .object({
    variant: z.enum(APPLICATION_SHELL_VARIANTS).default("pills"),
    size: z.enum(APPLICATION_SHELL_SIZES).default("md"),
    width: z.number().int().min(160).max(400).default(220),
    collapsedWidth: z.number().int().min(48).max(120).default(64),
    collapsible: z.boolean().default(true),
    defaultCollapsed: z.boolean().default(false),
    sticky: z.boolean().default(true),
    position: z.enum(["start", "end"]).default("start"),
    align: z.enum(APPLICATION_SHELL_ALIGNMENTS).default("start"),
    showLabels: z.boolean().default(true),
    showIcons: z.boolean().default(true),
    showBranding: z.boolean().default(true),
  })
  .strict();
const shellBrandingSchema = z
  .object({
    title: z.string().trim().max(120).default(""),
    subtitle: z.string().trim().max(160).default(""),
  })
  .strict();
const defaultShellAppearance = Object.freeze({
  variant: "pills",
  size: "md",
  width: 220,
  collapsedWidth: 64,
  collapsible: true,
  defaultCollapsed: false,
  sticky: true,
  position: "start",
  align: "start",
  showLabels: true,
  showIcons: true,
  showBranding: true,
});
const defaultShellBranding = Object.freeze({ title: "", subtitle: "" });
export const applicationNavigationItemSchema = z
  .object({
    routeID: applicationKeySchema,
    label: z.string().trim().min(1).max(120),
    icon: z.string().trim().max(64).default("dot"),
    group: z.string().trim().max(80).default(""),
    badge: z.string().trim().max(24).default(""),
    hidden: z.boolean().default(false),
  })
  .strict();

const statePersistenceSchema = z.object({
  mode: z.enum(APPLICATION_STATE_PERSISTENCE_MODES).default("none"),
  resetOnRelease: z.boolean().default(true),
}).strict();
const routeQueryValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const routeQueryDefinitionSchema = z.object({
  type: z.enum(ROUTE_QUERY_TYPES).default("string"),
  default: routeQueryValueSchema.optional(),
}).strict();
const routeGuardSchema = z.object({
  expression: z.string().trim().min(1).max(1000),
  redirectRouteID: applicationKeySchema,
}).strict();
export const applicationDefinitionSchema = z.object({
  schemaVersion: z.literal(APPLICATION_SCHEMA_VERSION),
  shell: z.object({
    kind: z
      .preprocess(
        (value) => (value === "header" ? "topbar" : value),
        z.enum(APPLICATION_SHELL_KINDS).default("sidebar")
      ),
    homeRouteID: applicationKeySchema.nullable(),
    navigation: z.array(applicationNavigationItemSchema).max(100),
    notFoundRouteID: applicationKeySchema.nullable().default(null),
    appearance: shellAppearanceSchema.default(() => ({ ...defaultShellAppearance })),
    branding: shellBrandingSchema.default(() => ({ ...defaultShellBranding })),
  }).strict(),
  routes: z.array(z.object({
    id: applicationKeySchema, path: routePathSchema, pageAssetKey: applicationKeySchema,
    params: z.record(applicationKeySchema, z.enum(["string", "uuid", "integer"])).default({}),
    query: z.record(applicationKeySchema, routeQueryDefinitionSchema).default({}),
    syncPageVariables: z.boolean().default(false),
    syncAllPageVariables: z.boolean().default(false),
    keepAlive: z.boolean().default(false),
    title: z.string().trim().min(1).max(120).optional(),
    parentRouteID: applicationKeySchema.optional(),
    guard: routeGuardSchema.optional(),
  }).strict()).max(APPLICATION_LIMITS.routes),
  state: z.object({
    application: z.record(applicationKeySchema, variableSchema).refine(value => Object.keys(value).length <= APPLICATION_LIMITS.variables),
    persistence: statePersistenceSchema.default({ mode: "none", resetOnRelease: true }),
  }).strict(),
  // Execution contracts will be enabled only with release-scoped authorization.
  resources: z.object({}).strict(),
  actions: z.object({}).strict(),
  theme: z.object({ density: z.enum(["comfortable", "compact"]), tokenOverrides: z.object({}).strict() }).strict(),
  localization: z.object({ defaultLocale: z.string().min(2).max(35), supportedLocales: z.array(z.string().min(2).max(35)).min(1).max(20) }).strict(),
  expressionMode: z.enum(["trusted-js", "safe-path"]).default("trusted-js"),
}).strict();

export function createApplicationDefinition() {
  return {
    schemaVersion: APPLICATION_SCHEMA_VERSION,
    shell: {
      kind: "sidebar",
      homeRouteID: null,
      navigation: [],
      notFoundRouteID: null,
      appearance: { ...defaultShellAppearance },
      branding: { ...defaultShellBranding },
    },
    routes: [],
    state: {
      application: {},
      persistence: { mode: "none", resetOnRelease: true },
    },
    resources: {},
    actions: {},
    theme: { density: "comfortable", tokenOverrides: {} },
    localization: { defaultLocale: "en", supportedLocales: ["en"] },
    expressionMode: "trusted-js",
  };
}

export function matchesApplicationType(value, type) {
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  return (Array.isArray(type) ? type : [type]).includes(actual);
}

export function matchesRouteQueryType(value, type) {
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "integer") return typeof value === "number" && Number.isSafeInteger(value);
  if (type === "uuid") return typeof value === "string" && z.string().uuid().safeParse(value).success;
  return false;
}

/**
 * Parse and coerce a route's declared query parameters.
 * Declared keys are typed/defaulted; undeclared keys remain strings so
 * tracking/analytics parameters do not invalidate a route.
 */
export function parseApplicationRouteQuery(route, searchParams) {
  const declared = route?.query || {};
  const raw = {};
  searchParams.forEach((value, key) => {
    if (!unsafeKeys.has(key)) raw[key] = value;
  });
  const query = {};

  for (const [key, declaration] of Object.entries(declared)) {
    const type = declaration.type || "string";
    const value = raw[key];
    if (value === undefined) {
      if (declaration.default !== undefined) query[key] = declaration.default;
      continue;
    }
    if (value === "") {
      if (declaration.default !== undefined) {
        query[key] = declaration.default;
        continue;
      }
      if (type === "string") {
        query[key] = "";
        continue;
      }
      return {
        valid: false,
        code: "INVALID_ROUTE_QUERY",
        key,
        message: `Query parameter "${key}" cannot be empty.`,
      };
    }
    if (value.length > 4096) {
      return {
        valid: false,
        code: "INVALID_ROUTE_QUERY",
        key,
        message: `Query parameter "${key}" is too long.`,
      };
    }

    let coerced;
    if (type === "string") {
      coerced = value;
    } else if (type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return { valid: false, code: "INVALID_ROUTE_QUERY", key, message: `Query parameter "${key}" must be a number.` };
      }
      coerced = number;
    } else if (type === "integer") {
      if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
        return { valid: false, code: "INVALID_ROUTE_QUERY", key, message: `Query parameter "${key}" must be an integer.` };
      }
      coerced = Number(value);
    } else if (type === "boolean") {
      if (value !== "true" && value !== "false") {
        return { valid: false, code: "INVALID_ROUTE_QUERY", key, message: `Query parameter "${key}" must be true or false.` };
      }
      coerced = value === "true";
    } else if (type === "uuid") {
      if (!z.string().uuid().safeParse(value).success) {
        return { valid: false, code: "INVALID_ROUTE_QUERY", key, message: `Query parameter "${key}" must be a UUID.` };
      }
      coerced = value;
    } else {
      return { valid: false, code: "INVALID_ROUTE_QUERY", key, message: `Query parameter "${key}" has an unsupported type.` };
    }
    query[key] = coerced;
  }

  for (const [key, value] of Object.entries(raw)) {
    if (!Object.prototype.hasOwnProperty.call(declared, key)) query[key] = value;
  }
  return { valid: true, query };
}

// Walk bounded JSON before parsing so pathological input cannot exhaust validation.
export function isSafeApplicationJSON(value, depth = 0) {
  if (depth > 40) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 10000 && value.every(item => isSafeApplicationJSON(item, depth + 1));
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return false;
  return Object.entries(value).every(([key, item]) => !unsafeKeys.has(key) && isSafeApplicationJSON(item, depth + 1));
}

export function validateApplicationDefinition(definition, assets = []) {
  const diagnostics = [];
  const add = (code, path, message) => diagnostics.push({ severity: "error", code, path, message });
  if (!isSafeApplicationJSON(definition) || new TextEncoder().encode(JSON.stringify(definition)).length > APPLICATION_LIMITS.bytes) {
    add("INVALID_DEFINITION_JSON", "definition", "Definition must be bounded, safe JSON (maximum 256 KiB).");
    return { valid: false, diagnostics };
  }
  const parsed = applicationDefinitionSchema.safeParse(definition);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) add("INVALID_DEFINITION", issue.path.join("."), issue.message);
    return { valid: false, diagnostics };
  }
  const value = parsed.data;
  const ids = new Set();
  const paths = new Set();
  const pages = new Set(assets.filter(asset => asset.assetType === "appPage").map(asset => asset.assetKey));
  value.routes.forEach((route, index) => {
    const path = `routes.${index}`;
    if (ids.has(route.id)) add("DUPLICATE_ROUTE_ID", `${path}.id`, "Route IDs must be unique.");
    ids.add(route.id);
    const normalizedPath = route.path.toLowerCase().replace(/:[^/]+/g, ":param");
    if (paths.has(normalizedPath)) add("DUPLICATE_ROUTE_PATH", `${path}.path`, "Route patterns must be unique (including parameter and case variants).");
    paths.add(normalizedPath);
    if (!pages.has(route.pageAssetKey)) add("MISSING_PAGE_ASSET", `${path}.pageAssetKey`, "Register the referenced page before adding a route.");
    const params = route.path.split("/").filter(part => part.startsWith(":")).map(part => part.slice(1));
    if (new Set(params).size !== params.length || params.some(key => unsafeKeys.has(key))) add("INVALID_ROUTE_PARAMS", `${path}.path`, "Route parameters must be unique, non-reserved names.");
    if (Object.keys(route.params).some(key => !params.includes(key))) add("UNKNOWN_ROUTE_PARAM", `${path}.params`, "Parameter types must name parameters in the route path.");
    for (const [key, declaration] of Object.entries(route.query || {})) {
      if (declaration.default !== undefined && !matchesRouteQueryType(declaration.default, declaration.type || "string")) {
        add("INVALID_QUERY_DEFAULT", `${path}.query.${key}.default`, "Query default does not match the declared type.");
      }
    }
    if (route.syncPageVariables && Object.keys(route.query || {}).length === 0) {
      add("QUERY_SYNC_WITHOUT_QUERY", `${path}.syncPageVariables`, "Page-variable sync requires at least one declared query parameter.");
    }
  });
  const routesByID = new Map(value.routes.map(route => [route.id, route]));
  value.routes.forEach((route, index) => {
    const path = `routes.${index}`;
    if (route.parentRouteID) {
      const parent = routesByID.get(route.parentRouteID);
      if (!parent) {
        add("UNKNOWN_ROUTE_PARENT", `${path}.parentRouteID`, "A parent route must exist in the application.");
      } else {
        let cursor = parent;
        const seen = new Set([route.id]);
        let cyclic = false;
        while (cursor) {
          if (seen.has(cursor.id)) {
            cyclic = true;
            break;
          }
          seen.add(cursor.id);
          cursor = cursor.parentRouteID ? routesByID.get(cursor.parentRouteID) : null;
        }
        if (cyclic) add("ROUTE_PARENT_CYCLE", `${path}.parentRouteID`, "Route parent links must not form a cycle.");
        const parentBase = parent.path.replace(/\/+$/, "");
        if (!cyclic && route.path !== parentBase && !route.path.startsWith(`${parentBase}/`)) {
          add("NESTED_ROUTE_PATH", `${path}.path`, "A child route path must be nested under its parent path.");
        }
      }
    }
    if (route.guard) {
      const target = routesByID.get(route.guard.redirectRouteID);
      if (!target) add("UNKNOWN_GUARD_REDIRECT", `${path}.guard.redirectRouteID`, "Choose an existing guard redirect route.");
      else if (target.id === route.id) add("GUARD_REDIRECT_SELF", `${path}.guard.redirectRouteID`, "A guard cannot redirect to its own route.");
      else if (target.path.includes(":")) add("PARAMETERIZED_GUARD_REDIRECT", `${path}.guard.redirectRouteID`, "Guard redirects cannot require path parameters.");
      else if (target.guard) add("GUARD_REDIRECT_TARGET_GUARDED", `${path}.guard.redirectRouteID`, "A guard redirect target must not declare another guard.");
    }
  });
  if (value.routes.length && !ids.has(value.shell.homeRouteID)) add("INVALID_HOME_ROUTE", "shell.homeRouteID", "Choose an existing home route.");
  if (value.routes.find(route => route.id === value.shell.homeRouteID)?.path.includes(":")) add("PARAMETERIZED_HOME_ROUTE", "shell.homeRouteID", "Home routes must not require record parameters.");
  if (!value.routes.length && value.shell.homeRouteID !== null) add("INVALID_HOME_ROUTE", "shell.homeRouteID", "An empty application must have no home route.");
  if (value.shell.notFoundRouteID !== null) {
    const notFound = routesByID.get(value.shell.notFoundRouteID);
    if (!notFound) add("UNKNOWN_NOT_FOUND_ROUTE", "shell.notFoundRouteID", "Choose an existing not-found route.");
    else if (notFound.path.includes(":")) add("PARAMETERIZED_NOT_FOUND_ROUTE", "shell.notFoundRouteID", "The not-found route cannot require path parameters.");
  }
  if (value.shell.appearance.collapsedWidth > value.shell.appearance.width) {
    add("INVALID_SHELL_WIDTH", "shell.appearance.collapsedWidth", "Collapsed width must not exceed the expanded width.");
  }
  const navigationIDs = new Set();
  value.shell.navigation.forEach((item, index) => {
    if (!ids.has(item.routeID)) add("UNKNOWN_NAVIGATION_ROUTE", `shell.navigation.${index}.routeID`, "Navigation must reference an existing route.");
    if (value.routes.find(route => route.id === item.routeID)?.path.includes(":")) add("PARAMETERIZED_NAVIGATION_ROUTE", `shell.navigation.${index}.routeID`, "Record routes are reached by deep link, not parameterless navigation.");
    if (navigationIDs.has(item.routeID)) add("DUPLICATE_NAVIGATION_ROUTE", `shell.navigation.${index}.routeID`, "Navigation routes must be unique.");
    navigationIDs.add(item.routeID);
  });
  for (const [key, declaration] of Object.entries(value.state.application)) {
    if (!matchesApplicationType(declaration.default, declaration.type)) add("INVALID_VARIABLE_DEFAULT", `state.application.${key}.default`, "Default does not match the declared type.");
  }
  if (!value.localization.supportedLocales.includes(value.localization.defaultLocale)) add("INVALID_DEFAULT_LOCALE", "localization.defaultLocale", "Default locale must be supported.");
  return { valid: diagnostics.length === 0, diagnostics, definition: value };
}

export function validateApplicationRouteParams(route, params) {
  const keys = route.path.split("/").filter(part => part.startsWith(":")).map(part => part.slice(1));
  return keys.every(key => {
    const type = route.params?.[key] || "string";
    const value = params[key];
    if (typeof value !== "string" || !value || value.length > 512 || /[\x00-\x1f]/.test(value)) return false;
    return type === "uuid" ? z.string().uuid().safeParse(value).success : type === "integer" ? /^-?\d+$/.test(value) && Number.isSafeInteger(Number(value)) : true;
  });
}

export function collectPageWidgetIDs(config) {
  const ids = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 40) throw new Error("Page layout exceeds maximum depth");
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(item => visit(item, depth + 1)); return; }
    for (const [key, item] of Object.entries(value)) {
      const keys = key === "widgets" && Array.isArray(item) ? item : key === "widgetKey" ? [item] : [];
      for (const placement of keys) {
        const match = typeof placement === "string" && /^widget_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:_|$)/i.exec(placement);
        if (!match) throw new Error("Invalid widget placement reference");
        ids.add(match[1].toLowerCase());
      }
      visit(item, depth + 1);
    }
  };
  visit(config);
  return [...ids].sort();
}
