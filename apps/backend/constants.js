const constants = {
  // strings
  STRINGS: {
    REFRESH_TOKEN_COOKIE_STRING: "refreshToken",
  },

  // thresholds

  // defaults
  ROW_PAGE_SIZE: 100,

  SAMPLE_PLAN: {
    maxTenantCount: 3,
    maxMembersPerTenant: 2,
  },
  ROLES: {
    PRIMARY: {
      ADMIN: { name: "Admin", value: "ADMIN" },
      MEMBER: { name: "Member", value: "MEMBER" },
    },
  },
  // error codes
  ERROR_CODES: {
    INVALID_TENANT: {
      code: "INVALID_TENANT",
      message: "Invalid tenant",
    },
    ONLY_ONE_ADMIN_IN_TENANT: {
      code: "ONLY_ONE_ADMIN_IN_TENANT",
      message: "Additional admins are not there in tenant",
    },
    USER_ALREADY_ADMIN_OF_TENANT: {
      code: "USER_ALREADY_ADMIN_OF_TENANT",
      message: "User is already admin of tenant",
    },
    USER_NOT_ADMIN_OF_TENANT: {
      code: "USER_NOT_ADMIN_OF_TENANT",
      message: "Member cannot make changes to tenant",
    },
    TENANT_CREATION_LIMIT_EXCEED: {
      code: "TENANT_CREATION_LIMIT_EXCEED",
      message: "Tenant creation limit exceeded! Please upgrade your plan",
    },
    MEMBER_ADDITION_LIMIT_EXCEED: {
      code: "MEMBER_ADDITION_LIMIT_EXCEED",
      message: "Cannot add more members! Please upgrade your plan",
    },
    USER_ALREADY_MEMBER_OF_TENANT: {
      code: "USER_ALREADY_MEMBER_OF_TENANT",
      message: "User is already member of your tenant",
    },
    USER_NOT_MEMBER_OF_TENANT: {
      code: "USER_NOT_MEMBER_OF_TENANT",
      message:
        "User is not already member of your tenant or the user is owner/creator of tenant.",
    },
    NOT_ALLOWED_BY_CORS: {
      code: "NOT_ALLOWED_BY_CORS",
      message: "Not allowed by CORS",
    },
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
  TABLE_FILTERS: {
    "=": (a, b) => `${a} = ${b}`,
    "!=": (a, b) => `${a} != ${b}`,
    "<": (a, b) => `${a} < ${b}`,
    "<=": (a, b) => `${a} <= ${b}`,
    ">": (a, b) => `${a} > ${b}`,
    ">=": (a, b) => `${a} >= ${b}`,
    LIKE: (a, b) => `${a} LIKE '%${b}%'`,
    ILIKE: (a, b) => `${a} ILIKE '%${b}%'`,
  },
  DATABASE_CHART_TYPES: {
    BAR_CHART: {
      name: "Bar Chart",
      value: "bar",
    },
    LINE_CHART: {
      name: "Line Chart",
      value: "line",
    },
    PIE_CHART: {
      name: "Pie Chart",
      value: "pie",
    },
    SCATTER_CHART: {
      name: "Scatter Chart",
      value: "scatter",
    },
    BUBBLE_CHART: {
      name: "Bubble Chart",
      value: "bubble",
    },
    RADAR_CHART: {
      name: "Radar Chart",
      value: "radar",
    },
    RADIAL_CHART: {
      name: "Radial Bar Chart",
      value: "radial",
    },
  },
};

module.exports = constants;
