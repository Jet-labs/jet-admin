const constants = {
  BACKEND_NODE_ID:
    process.env.NODE_ENV === "development" ? "dev_node_1" : "prod_node_1",

  // strings
  STRINGS: {
    REFRESH_TOKEN_COOKIE_STRING: "refreshToken",
    PM_USER_TABLE: "tbl_pm_users",
    PM_POLICY_OBJECTS_TABLE: "tbl_pm_policy_objects",
  },

  // thresholds

  // defaults
  ACCESS_TOKEN_TIMEOUT: 900, // in sec
  REFRESH_TOKEN_TIMEOUT: 864000, // in sec

  ROW_PAGE_SIZE: 100,

  DUMMY_PERMISSION: {
    tables: {
      tbl_pm_users: true,
      tbl_pm_policy_objects: true,
    },
  },

  // error codes
  ERROR_CODES: {
    PERMISSION_DENIED: {
      code: "PERMISSION_DENIED",
      message: "Permission denied",
    },
    SERVER_ERROR: {
      code: "SERVER_ERROR",
      message: "Server error",
    },
    USER_AUTH_TOKEN_EXPIRED: {
      code: "USER_AUTH_TOKEN_EXPIRED",
      message: "User auth token expired",
    },
    USER_REFRESH_TOKEN_EXPIRED: {
      code: "USER_REFRESH_TOKEN_EXPIRED",
      message: "User refresh token expired",
    },
    USER_AUTH_TOKEN_NOT_FOUND: {
      code: "USER_AUTH_TOKEN_NOT_FOUND",
      message: "User auth token not found",
    },
    INVALID_USER: {
      code: "INVALID_USER",
      message: "User not found",
    },
    USERNAME_TAKEN: {
      code: "USERNAME_TAKEN",
      message: "Please use different username",
    },
    INVALID_LOGIN: {
      code: "INVALID_LOGIN",
      message: "User login invalid",
    },
    INVALID_REQUEST: {
      code: "INVALID_REQUEST",
      message: "Invalid request",
    },
    NOT_A_DML_DQL_QUERY: {
      code: "NOT_A_DML_DQL_QUERY",
      message: "Only data manupulation and data fetching queries are allowed",
    },
  },

  // events
  SOCKET_EVENTS: {
    ON_USER_UPDATE: "ON_USER_UPDATE",
  },
  VARIABLE_DETECTION_REGEX: /{{(.*?)}}/g,
  PM_QUERY_DETECTION_REGEX: /\[pm_query_id:\d+\]/g,
  PM_QUERY_EXTRACTION_REGEX: /\[pm_query_id:(\d+)\]/,

  PM_APP_CONSTANT_DETECTION_REGEX: /\[pm_app_constant_id:\d+\]/g,
  PM_APP_CONSTANT_EXTRACTION_REGEX: /\[pm_app_constant_id:(\d+)\]/,
};

module.exports = constants;
