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
    TABLE_VIEW: {
      code: ":table_name",
      path: (table_name) => `${table_name}`,
    },
    ADD_ROW: {
      code: "add",
      path: (table_name) => `add`,
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
      getTableRows: ({ tableName, page, filterQuery, sortModel }) =>
        `/admin_api/tables/${tableName}/?page=${page}&q=${JSON.stringify(
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
