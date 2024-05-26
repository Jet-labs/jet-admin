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
  REFRESH_TOKEN_TIMEOUT: 86400, // in sec

  ROW_PAGE_SIZE: 10,

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
    INVALID_LOGIN: {
      code: "INVALID_LOGIN",
      message: "User login invalid",
    },
    INVALID_REQUEST: {
      code: "INVALID_REQUEST",
      message: "Invalid request",
    },
  },

  // events
  SOCKET_EVENTS: {
    ON_USER_UPDATE: "ON_USER_UPDATE",
  },

  GRAPH_TYPES: {
    CHART: { label: "Chart", value: "CHART" },
    BAR: {
      label: "Bar",
      value: "BAR",
      fields: ["x_axis", "y_axis", "index_axis"],
    },
    LINE: { label: "Line", value: "LINE", fields: ["x_axis", "y_axis"] },
    PIE: { label: "Pie", value: "PIE" },
  },
};

module.exports = constants;
