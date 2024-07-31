import { strHasQuotes } from "./utils/schemaBuilder";

const HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};
const intRegex = /^-?\d*$/;
const doubleRegex = /^-?\d*.?\d+$/;
const binaryRegex = /^[01]+$/;

export const LOCAL_CONSTANTS = {
  SERVER_HOST: "http://127.0.0.1:8090",
  APP_NAME: "Jet admin",
  APP_VERSION: "1.0.12",

  STRINGS: {
    ACCESS_TOKEN_LOCAL_STORAGE: "access_token",
    REFRESH_TOKEN_LOCAL_STORAGE: "refresh_token",
    PM_USER_TABLE_NAME: "tbl_pm_users",
    POLICY_OBJECT_TABLE_NAME: "tbl_pm_policy_objects",
    UNTITLED_CHART_TITLE: "Untitled chart",
    JOB_HISTORY_TABLE_NAME: "tbl_pm_job_history",
    APP_CONSTANTS_TABLE_NAME: "tbl_pm_app_constants",
  },

  // routes
  ROUTES: {
    HOME: "/",
    SIGNIN: "/signin",

    ALL_APP_CONSTANTS: {
      code: "/app_constants/*",
      path: () => "/app_constants",
    },
    ADD_APP_CONSTANT: {
      code: "add",
      path: () => "add",
    },
    APP_CONSTANT_VIEW: {
      code: ":id",
      path: (id) => `${id}`,
    },

    ALL_JOBS: {
      code: "/jobs/*",
      path: () => "/jobs",
    },
    ADD_JOB: {
      code: "add",
      path: () => "add",
    },
    JOB_HISTORY: {
      code: "history",
      path: () => "history",
    },
    JOB_VIEW: {
      code: ":id",
      path: (id) => `${id}`,
    },

    ALL_QUERIES: {
      code: "/queries/*",
      path: () => "/queries",
    },
    ADD_QUERY: {
      code: "add",
      path: () => "add",
    },
    QUERY_VIEW: {
      code: ":id",
      path: (id) => `${id}`,
    },

    ALL_GRAPHS: {
      code: "/graphs/*",
      path: () => "/graphs",
    },
    ADD_GRAPH: {
      code: "add",
      path: () => "add",
    },
    GRAPH_VIEW: {
      code: ":id",
      path: (id) => `${id}`,
    },

    ALL_DASHBOARD_LAYOUTS: {
      code: "/dashboard/*",
      path: () => "/dashboard",
    },
    ADD_DASHBOARD_LAYOUT: {
      code: "add",
      path: () => "add",
    },
    DASHBOARD_LAYOUT_VIEW: {
      code: ":id/*",
      path: (id) => `${id}`,
    },
    DASHBOARD_EDIT_VIEW: {
      code: "edit",
      path: (id) => `edit`,
    },
    ALL_TABLES: {
      code: "/tables/*",
      path: () => "/tables",
    },
    ADD_TABLE: {
      code: "add",
      path: () => `add`,
    },
    TABLE_VIEW: {
      code: ":table_name",
      path: (table_name) => `${table_name}`,
    },
    ADD_ROW: {
      code: "add",
      path: () => `add`,
    },
    ROW_VIEW: {
      code: ":id",
      path: (table_name, id) => `${id}`,
    },
    POLICY_MANAGEMENT: { code: "/policy_editor", path: () => `/policy_editor` },
    POLICY_SETTINGS: {
      code: ":id",
      path: (id) => `${id}`,
    },
    ADD_POLICY: {
      code: "add",
      path: (id) => `add`,
    },
    ACCOUNT_MANAGEMENT: "/account_management",
    ACCOUNT_SETTINGS: {
      code: ":id",
      path: (id) => `${id}`,
    },
    ADD_ACCOUNT: {
      code: "add",
      path: (id) => `add`,
    },
    ACTIONS: {
      code: "actions/:entity",
      path: (entity) => `/actions/${entity}`,
    },
  },

  // APIs
  APIS: {
    AUTH: {
      login: () => `/admin_api/auth/login`,
      refreshAccessToken: () => `/admin_api/auth/refresh_access_token`,
      getSelf: () => "/admin_api/auth/me",
    },
    TABLE: {
      getAllTables: () => `/admin_api/tables`,
      getAuthorizedColumnsForRead: ({ tableName }) =>
        `/admin_api/tables/${tableName}/read_columns`,
      getAuthorizedColumnsForEdit: ({ tableName }) =>
        `/admin_api/tables/${tableName}/edit_columns`,
      getAuthorizedColumnsForAdd: ({ tableName }) =>
        `/admin_api/tables/${tableName}/add_columns`,
      getTableRows: ({ tableName, page, pageSize, filterQuery, sortModel }) =>
        `/admin_api/tables/${tableName}/?page=${page}&page_size=${pageSize}&q=${JSON.stringify(
          filterQuery
        )}&sort=${JSON.stringify(sortModel)}`,
      getTableStats: ({ tableName, filterQuery }) =>
        `/admin_api/tables/${tableName}/stats/?q=${JSON.stringify(
          filterQuery
        )}`,
      getTableRowByID: ({ tableName, id }) =>
        `/admin_api/tables/${tableName}/${id}`,
      addTableRowByID: ({ tableName }) => `/admin_api/tables/${tableName}`,
      updateTableRowByID: ({ tableName, id }) =>
        `/admin_api/tables/${tableName}/${id}`,
      deleteTableRowByID: ({ tableName, id }) =>
        `/admin_api/tables/${tableName}/${id}`,
      deleteTableRowByMultipleIDs: ({ tableName }) =>
        `/admin_api/tables/${tableName}/delete`,
    },

    ACTION: {
      sendAction: ({ action }) => `/admin_api/actions/${action}`,
    },
    GRAPH: {
      getAllGraphs: () => `/admin_api/graphs`,
      addGraph: () => `/admin_api/graphs`,
      updateGraph: () => `/admin_api/graphs`,
      getGraphDataByID: ({ id }) => `/admin_api/graphs/${id}/data`,
      deleteGraphByID: ({ id }) => `/admin_api/graphs/${id}`,
    },
    ACCOUNT: {
      addAccount: () => `/admin_api/accounts`,
      updateAccount: () => `/admin_api/accounts`,
      updatePassword: () => `/admin_api/accounts/password`,
    },
    DASHBOARD_LAYOUT: {
      getAllDashboards: () => `/admin_api/dashboards`,
      getDashboardByID: ({ id }) => `/admin_api/dashboards/${id}`,
      addDashboard: () => `/admin_api/dashboards`,
      updateDashboard: () => `/admin_api/dashboards`,
      deleteDashboardByID: ({ id }) => `/admin_api/dashboards/${id}`,
    },

    JOB: {
      getAllJobs: () => `/admin_api/jobs`,
      getJobByID: ({ id }) => `/admin_api/jobs/${id}`,
      addJob: () => `/admin_api/jobs`,
      updateJob: () => `/admin_api/jobs`,
      deleteJobByID: ({ id }) => `/admin_api/jobs/${id}`,
    },

    QUERY: {
      getAllQueries: () => `/admin_api/queries`,
      runQuery: () => `/admin_api/queries/runner`,
      getQueryByID: ({ id }) => `/admin_api/queries/${id}`,
      addQuery: () => `/admin_api/queries`,
      duplicateQuery: () => `/admin_api/queries/duplicate`,
      updateQuery: () => `/admin_api/queries`,
      deleteQueryByID: ({ id }) => `/admin_api/queries/${id}`,
    },

    APP_CONSTANTS: {
      getDBModelAppConstant: () => `/admin_api/app_constants/db_model/`,
      getAllInternalAppConstants: () => `/admin_api/app_constants/internal`,
      getAllAppConstants: () => `/admin_api/app_constants`,
      getAppConstantByID: ({ id }) => `/admin_api/app_constants/${id}`,
      addAppConstant: () => `/admin_api/app_constants`,
      updateAppConstant: () => `/admin_api/app_constants`,
      deleteAppConstantByID: ({ id }) => `/admin_api/app_constants/${id}`,
    },
  },

  // errors
  ERROR_CODES: {
    PERMISSION_DENIED: {
      code: "PERMISSION_DENIED",
      message: "Permission denied",
      http_error_code: HttpStatusCode.Forbidden,
    },
    SERVER_ERROR: {
      code: "SERVER_ERROR",
      message: "Server error",
      http_error_code: HttpStatusCode.InternalServerError,
    },
    INVALID_USER: {
      code: "INVALID_USER",
      message: "User not found",
      http_error_code: HttpStatusCode.Unauthorized,
    },
    USER_ALREADY_EXISTS: {
      code: "USER_ALREADY_EXISTS",
      message: "User already exists, please login instead",
      http_error_code: HttpStatusCode.Conflict,
    },

    INVALID_CREDENTIALS: {
      code: "INVALID_CREDENTIALS",
      message: "User credentials are not correct",
      http_error_code: HttpStatusCode.Unauthorized,
    },
    INVALID_REQUEST: {
      code: "INVALID_REQUEST",
      message: "Invalid request",
      http_error_code: HttpStatusCode.BadRequest,
    },
    USER_AUTH_TOKEN_EXPIRED: {
      code: "USER_AUTH_TOKEN_EXPIRED",
      message: "User auth token expired",
      http_error_code: HttpStatusCode.Unauthorized,
    },
    USER_REFRESH_TOKEN_EXPIRED: {
      code: "USER_REFRESH_TOKEN_EXPIRED",
      message: "User refresh token expired",
    },
    USER_AUTH_TOKEN_NOT_FOUND: {
      code: "USER_AUTH_TOKEN_NOT_FOUND",
      message: "User auth token not found",
      http_error_code: HttpStatusCode.Unauthorized,
    },
  },

  // keys
  REACT_QUERY_KEYS: {
    DB_USER: "DB_USER",
    CONSTANTS: "CONSTANTS",
  },

  // events
  SOCKET_EVENTS: {
    ON_SERVER_SIDE_ERROR: "ON_SERVER_SIDE_ERROR",
  },

  DATA_TYPES: {
    STRING: "String",
    COLOR: "Color",
    CODE: "Code",
    BOOLEAN: "Boolean",
    INT: "Int",
    BIGINT: "BigInt",
    FLOAT: "Float",
    DECIMAL: "Decimal",
    DATETIME: "DateTime",
    JSON: "Json",
    BYTES: "Bytes",
    SINGLE_SELECT: "SINGLE_SELECT",
    MULTIPLE_SELECT: "MULTIPLE_SELECT",
  },
  PRISMA_DATA_TYPES: {
    STRING: { name: "String", value: "String" },
    DATETIME: { name: "DateTime", value: "DateTime" },
    BOOLEAN: { name: "Boolean", value: "Boolean" },
    INT: { name: "Int", value: "Int" },
    BIGINT: { name: "BigInt", value: "BigInt" },
    FLOAT: { name: "Float", value: "Float" },
    DECIMAL: { name: "Decimal", value: "Decimal" },
    JSON: { name: "DateTime", value: "DateTime" },
    BYTES: { name: "Bytes", value: "Bytes" },
    string: { name: "string", value: "string" },
  },

  TABLE_EDITOR_TABLE_THEME: [
    "#f03c3c",
    "#ff4f81",
    "#bc49c4",
    "#a751e8",
    "#7c4af0",
    "#6360f7",
    "#7d9dff",
    "#32c9b0",
    "#3cde7d",
    "#89e667",
    "#ffe159",
    "#ff9159",
  ],
  TABLE_EDITOR_NOTE_THEME: [
    "#ffdfd9",
    "#fcf7ac",
    "#cffcb1",
    "#c7d2ff",
    "#e7c7ff",
  ],
  TABLE_EDITOR_ACTIONS: {
    ADD: 0,
    MOVE: 1,
    DELETE: 2,
    EDIT: 3,
    PAN: 4,
  },
  TABLE_EDITOR_OBJECT_TYPES: {
    NONE: 0,
    TABLE: 1,
    AREA: 2,
    NOTE: 3,
    RELATIONSHIP: 4,
    TYPE: 5,
    ENUM: 6,
  },
  TABLE_EDITOR_TABS: {
    TABLES: "1",
    RELATIONSHIPS: "2",
    AREAS: "3",
    NOTES: "4",
    TYPES: "5",
    ENUMS: "6",
  },
  TABLE_EDITOR_TABLE_HEADER_HEIGHT: 50,
  TABLE_EDITOR_TABLE_WIDTH: 200,
  TABLE_EDITOR_TABLE_FIELD_HEIGHT: 36,
  TABLE_EDITOR_TABLE_COLOR_STRIP_HEIGHT: 7,
  POSTGRE_SQL_DATA_TYPES: {
    boolean: {
      value: "Boolean value (TRUE, FALSE, or NULL)",
      js_type: "boolean",
      prisma_type: "Boolean",
    },
    smallint: {
      value: "Small integer (-32,768 to 32,767)",
      js_type: "number",
      prisma_type: "Int",
    },
    integer: {
      value: "Integer (-2,147,483,648 to 2,147,483,647)",
      js_type: "number",
      prisma_type: "Int",
    },
    bigint: {
      value:
        "Large integer (-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807)",
      js_type: "bigint",
      prisma_type: "BigInt",
    },
    decimal: {
      value: "Exact numeric of variable precision and scale",
      js_type: "number",
      prisma_type: "Decimal",
    },
    numeric: {
      value: "Exact numeric of variable precision and scale",
      js_type: "number",
      prisma_type: "Decimal",
    },
    real: {
      value:
        "Single-precision floating-point number (approximately ±1.18 x 10^-38 to ±3.4 x 10^38)",
      js_type: "number",
      prisma_type: "Float",
    },
    "double precision": {
      value:
        "Double-precision floating-point number (approximately ±2.23 x 10^-308 to ±1.8 x 10^308)",
      js_type: "number",
      prisma_type: "Float",
    },
    serial: {
      value: "Auto-incrementing integer (typically used for primary keys)",
      js_type: "number",
      prisma_type: "Int",
    },
    bigserial: {
      value: "Auto-incrementing big integer (typically used for primary keys)",
      js_type: "bigint",
      prisma_type: "BigInt",
    },
    money: {
      value: "Currency amounts with a fixed decimal point",
      js_type: "number",
      prisma_type: "Decimal",
    },
    "char(n)": {
      value: "Fixed-length character string with length n",
      js_type: "string",
      prisma_type: "String",
    },
    "varchar(n)": {
      value: "Variable-length character string with maximum length n",
      js_type: "string",
      prisma_type: "String",
    },
    text: {
      value: "Variable-length character string with no maximum length",
      js_type: "string",
      prisma_type: "String",
    },
    bytea: {
      value: "Binary data (byte array)",
      js_type: "Uint8Array",
      prisma_type: "Bytes",
    },
    date: {
      value: "Calendar date (YYYY-MM-DD)",
      js_type: "Date",
      prisma_type: "DateTime",
    },
    time: {
      value: "Time of day without time zone (HH:MM:SS)",
      js_type: "string",
      prisma_type: "DateTime",
    },
    "time with time zone": {
      value: "Time of day with time zone (HH:MM:SS+/-TZ)",
      js_type: "string",
      prisma_type: "DateTime",
    },
    timestamp: {
      value: "Date and time without time zone (YYYY-MM-DD HH:MM:SS)",
      js_type: "Date",
      prisma_type: "DateTime",
    },
    "timestamp with time zone": {
      value: "Date and time with time zone (YYYY-MM-DD HH:MM:SS+/-TZ)",
      js_type: "Date",
      prisma_type: "DateTime",
    },
    interval: {
      value: "Time span (e.g., '1 year 2 months 3 days')",
      js_type: "string",
      prisma_type: "String",
    },
    uuid: {
      value: "Universally unique identifier (128-bit number)",
      js_type: "string",
      prisma_type: "String",
    },
    json: {
      value: "JSON data (text format)",
      js_type: "object",
      prisma_type: "Json",
    },
    jsonb: {
      value: "Binary JSON data (more efficient storage and querying)",
      js_type: "object",
      prisma_type: "Json",
    },
    xml: { value: "XML data", js_type: "string", prisma_type: "String" },
    array: {
      value: "Array of values (e.g., integer[], text[])",
      js_type: "Array",
      prisma_type: "String",
    },
    hstore: {
      value: "Key-value pairs (used for storing sets of key-value pairs)",
      js_type: "object",
      prisma_type: "Json",
    },
    point: {
      value: "Geometric point (x, y)",
      js_type: "string",
      prisma_type: "String",
    },
    line: { value: "Geometric line", js_type: "string", prisma_type: "String" },
    lseg: {
      value: "Geometric line segment",
      js_type: "string",
      prisma_type: "String",
    },
    box: { value: "Geometric box", js_type: "string", prisma_type: "String" },
    path: { value: "Geometric path", js_type: "string", prisma_type: "String" },
    polygon: {
      value: "Geometric polygon",
      js_type: "string",
      prisma_type: "String",
    },
    circle: {
      value: "Geometric circle",
      js_type: "string",
      prisma_type: "String",
    },
    cidr: {
      value: "CIDR notation for IP addresses",
      js_type: "string",
      prisma_type: "String",
    },
    inet: { value: "IP address", js_type: "string", prisma_type: "String" },
    macaddr: { value: "MAC address", js_type: "string", prisma_type: "String" },
    network: {
      value: "Network address",
      js_type: "string",
      prisma_type: "String",
    },
  },

  TABLE_FILTERS: {
    equals: "equals",
    not: "not",
    lt: "lt",
    lte: "lte",
    gt: "gt",
    gte: "gte",
    contains: "contains",
    startsWith: "startsWith",
    endsWith: "endsWith",
  },

  POSTGRE_SQL_CARDINALITY: {
    ONE_TO_ONE: "one_to_one",
    ONE_TO_MANY: "one_to_many",
    MANY_TO_ONE: "many_to_one",
  },
  POSTGRE_SQL_CONSTRAINTS: {
    NONE: "No action",
    RESTRICT: "Restrict",
    CASCADE: "Cascade",
    SET_NULL: "Set null",
    SET_DEFAULT: "Set default",
  },
  POSTGRE_SQL_TYPES_BASE: {
    SMALLINT: {
      type: "SMALLINT",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
      canIncrement: true,
    },
    INTEGER: {
      type: "INTEGER",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
      canIncrement: true,
    },
    BIGINT: {
      type: "BIGINT",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
      canIncrement: true,
    },
    DECIMAL: {
      type: "DECIMAL",
      checkDefault: (field) => {
        return doubleRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: true,
    },
    NUMERIC: {
      type: "NUMERIC",
      checkDefault: (field) => {
        return doubleRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: true,
    },
    REAL: {
      type: "REAL",
      checkDefault: (field) => {
        return doubleRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: true,
    },
    "DOUBLE PRECISION": {
      type: "DOUBLE PRECISION",
      checkDefault: (field) => {
        return doubleRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: true,
    },
    SMALLSERIAL: {
      type: "SMALLSERIAL",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
    },
    SERIAL: {
      type: "SERIAL",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
    },
    BIGSERIAL: {
      type: "BIGSERIAL",
      checkDefault: (field) => {
        return intRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: false,
    },
    MONEY: {
      type: "MONEY",
      checkDefault: (field) => {
        return doubleRegex.test(field.default);
      },
      hasCheck: true,
      isSized: false,
      hasPrecision: true,
    },
    CHAR: {
      type: "CHAR",
      checkDefault: (field) => {
        if (strHasQuotes(field.default)) {
          return field.default.length - 2 <= field.size;
        }
        return field.default.length <= field.size;
      },
      hasCheck: true,
      isSized: true,
      hasPrecision: false,
      defaultSize: 1,
      hasQuotes: true,
    },
    VARCHAR: {
      type: "VARCHAR",
      checkDefault: (field) => {
        if (strHasQuotes(field.default)) {
          return field.default.length - 2 <= field.size;
        }
        return field.default.length <= field.size;
      },
      hasCheck: true,
      isSized: true,
      hasPrecision: false,
      defaultSize: 255,
      hasQuotes: true,
    },
    TEXT: {
      type: "TEXT",
      checkDefault: (field) => {
        if (strHasQuotes(field.default)) {
          return field.default.length - 2 <= field.size;
        }
        return field.default.length <= field.size;
      },
      hasCheck: true,
      isSized: true,
      hasPrecision: false,
      defaultSize: 65535,
      hasQuotes: true,
    },
    BYTEA: {
      type: "BYTEA",
      checkDefault: (field) => {
        return /^[0-9a-fA-F]*$/.test(field.default);
      },
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      defaultSize: null,
      hasQuotes: true,
    },
    DATE: {
      type: "DATE",
      checkDefault: (field) => {
        return /^\d{4}-\d{2}-\d{2}$/.test(field.default);
      },
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    TIME: {
      type: "TIME",
      checkDefault: (field) => {
        return /^(?:[01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(field.default);
      },
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    TIMESTAMP: {
      type: "TIMESTAMP",
      checkDefault: (field) => {
        if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
          return true;
        }
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default)) {
          return false;
        }
        const content = field.default.split(" ");
        const date = content[0].split("-");
        return parseInt(date[0]) >= 1970 && parseInt(date[0]) <= 2038;
      },
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    TIMESTAMPTZ: {
      type: "TIMESTAMPTZ",
      checkDefault: (field) => {
        if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
          return true;
        }
        return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})?$/.test(
          field.default
        );
      },
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    INTERVAL: {
      type: "INTERVAL",
      checkDefault: (field) => /^['"\d\s\\-]+$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    BOOLEAN: {
      type: "BOOLEAN",
      checkDefault: (field) => /^(true|false)$/i.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    POINT: {
      type: "POINT",
      checkDefault: (field) => /^\(\d+,\d+\)$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    LINE: {
      type: "LINE",
      checkDefault: (field) =>
        /^(\(\d+,\d+\),)+\(\d+,\d+\)$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    LSEG: {
      type: "LSEG",
      checkDefault: (field) =>
        /^(\(\d+,\d+\),)+\(\d+,\d+\)$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    BOX: {
      type: "BOX",
      checkDefault: (field) =>
        /^\(\d+(\.\d+)?,\d+(\.\d+)?\),\(\d+(\.\d+)?,\d+(\.\d+)?\)$/.test(
          field.default
        ),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    PATH: {
      type: "PATH",
      checkDefault: (field) =>
        /^\((\d+(\.\d+)?,\d+(\.\d+)?(,\d+(\.\d+)?,\d+(\.\d+)?)*?)\)$/.test(
          field.default
        ),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    POLYGON: {
      type: "POLYGON",
      checkDefault: (field) =>
        /^\((\d+(\.\d+)?,\d+(\.\d+)?(,\d+(\.\d+)?,\d+(\.\d+)?)*?)\)$/.test(
          field.default
        ),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    CIRCLE: {
      type: "CIRCLE",
      checkDefault: (field) =>
        /^<\(\d+(\.\d+)?,\d+(\.\d+)?\),\d+(\.\d+)?\\>$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    CIDR: {
      type: "CIDR",
      checkDefault: (field) =>
        /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    INET: {
      type: "INET",
      checkDefault: (field) =>
        /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    MACADDR: {
      type: "MACADDR",
      checkDefault: (field) =>
        /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    MACADDR8: {
      type: "MACADDR8",
      checkDefault: (field) =>
        /^([A-Fa-f0-9]{2}:){7}[A-Fa-f0-9]{2}$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
    },
    BIT: {
      type: "BIT",
      checkDefault: (field) => /^[01]{1,}$/.test(field.default),
      hasCheck: true,
      isSized: true,
      hasPrecision: false,
      defaultSize: 1,
      hasQuotes: false,
    },
    VARBIT: {
      type: "VARBIT",
      checkDefault: (field) => /^[01]*$/.test(field.default),
      hasCheck: true,
      isSized: true,
      hasPrecision: false,
      defaultSize: 1,
      hasQuotes: false,
    },
    TSVECTOR: {
      type: "TSVECTOR",
      checkDefault: (field) => /^[A-Za-z0-9: ]*$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    TSQUERY: {
      type: "TSQUERY",
      checkDefault: (field) => /^[A-Za-z0-9: &|!()]*$/.test(field.default),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: false,
    },
    JSON: {
      type: "JSON",
      checkDefault: (field) => true,
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
      noDefault: true,
    },
    JSONB: {
      type: "JSONB",
      checkDefault: (field) => true,
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
      noDefault: true,
    },
    UUID: {
      type: "UUID",
      checkDefault: (field) =>
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          field.default
        ),
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
      noDefault: true,
    },
    XML: {
      type: "XML",
      checkDefault: (field) => true,
      hasCheck: false,
      isSized: false,
      hasPrecision: false,
      hasQuotes: true,
      noDefault: true,
    },
  },

  TABLE_COLUMN_SORT: {
    asc: "asc",
    desc: "desc",
    none: "none",
  },

  CUSTOM_INT_COLOR_MAPPINGS: {},

  GRAPH_LEGEND_POSITION: {
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
  },
};
