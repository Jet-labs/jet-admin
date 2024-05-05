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
  APP_NAME: "PG Admin Web",
  APP_VERSION: "1.0.2",
  APP_VERSION_RELEASE: 1,

  // routes
  ROUTES: {
    HOME: "/",
    SIGNIN: "/signin",
    TABLE_VIEW: {
      code: "tables/:table_name",
      path: (table_name) => `/tables/${table_name}`,
    },
    ADD_ROW: {
      code: "add",
    },
    ROW_VIEW: {
      code: ":id",
      path: (id) => `${id}`,
    },
    POLICY_MANAGEMENT: "/policy_editor",
    POLICY_SETTINGS: {
      code: ":id",
      path: (id) => `${id}`,
    },
    ACCOUNT_MANAGEMENT: "/account_management",
    ACCOUNT_SETTINGS: {
      code: ":id",
      path: (id) => `${id}`,
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
    },

    ACTION: {
      sendAction: ({ action }) => `/admin_api/actions/${action}`,
    },
    GRAPH: {
      getGraphData: ({ id }) => `/admin_api/graphs/${id}`,
    },

    CONSTANTS: {
      fetchRemoteConstants: () => `/admin_api/constants/admin/`,
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

  STRINGS: {
    ACCESS_TOKEN_LOCAL_STORAGE: "access_token",
    REFRESH_TOKEN_LOCAL_STORAGE: "refresh_token",
    PM_USER_TABLE_NAME: "tbl_pm_users",
    POLICY_OBJECT_TABLE_NAME: "tbl_pm_policy_objects",
  },

  DATA_TYPES: {
    STRING: "String",
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

  CUSTOM_INT_MAPPINGS: {},

  CUSTOM_INT_COLOR_MAPPINGS: {},
};
