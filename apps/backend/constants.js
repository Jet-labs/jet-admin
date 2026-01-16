const constants = {
  MODULES: {
    AI: "ai",
    AUTH: "auth",
    TENANT: "tenant",
    DATABASE: "database",
    DATASOURCE: "datasource",
    DATAQUERY: "dataQuery",
    DASHBOARD: "dashboard",
    WIDGET: "widget",
    USERMANAGEMENT: "userManagement",
    ROLE: "role",
    APIKEY: "apiKey",
    CRONJOB: "cronJob",
    NOTIFICATION: "notification",
    PERMISSION: "permission",
    WORKFLOW: "workflow",
  },
  STRINGS: {
    USER_TENANT_ADDITION_NOTIFICATION_TITLE: "Tenant addition notification",
    USER_TENANT_ADDITION_NOTIFICATION_DESCRIPTION:
      "You have been added to a new tenant",
  },

  ROW_PAGE_SIZE: 100,

  SUPPORTED_DATASOURCES: {
    postgresql: {
      name: "PostgreSQL",
      value: "postgresql",
    },
    mysql: {
      name: "MySQL",
      value: "mysql",
    },
    mssql: {
      name: "MSSQL",
      value: "mssql",
    },
    restapi: {
      name: "REST API",
      value: "restapi",
    },
  },

  SUPPORTED_DATABASES: {
    postgresql: {
      name: "PostgreSQL",
      value: "postgresql",
    },
    mysql: {
      name: "MySQL",
      value: "mysql",
    },
  },

  SOCKET_EMIT_EVENTS: {
    AI_CHAT_ROOM_JOIN: "ai_chat_room_join",
    AI_CHAT_ROOM_DISCONNECT: "ai_chat_room_disconnect",
    AI_CHAT_ROOM_ID: "ai_chat_room_id",
    AI_CHAT_BOT_MESSAGE: "ai_chat_bot_message",
    WORKFLOW_NODE_UPDATE: "workflow_node_update",
    WORKFLOW_STATUS_UPDATE: "workflow_status_update",
  },

  SOCKET_RECEIVE_EVENTS: {
    AI_CHAT_USER_MESSAGE: "ai_chat_user_message",
    WORKFLOW_RUN_JOIN: "workflow_run_join",
  },

  SAMPLE_PLAN: {
    maxTenantCount: Infinity,
    maxMembersPerTenant: Infinity,
  },

  ROLES: {
    PRIMARY: {
      ADMIN: { name: "Admin", value: "ADMIN" },
      MEMBER: { name: "Member", value: "MEMBER" },
    },
  },

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
    INVALID_API_KEY: {
      code: "INVALID_API_KEY",
      message: "Invalid or Inactive API key",
    },
    USER_AUTH_TOKEN_EXPIRED: {
      code: "USER_AUTH_TOKEN_EXPIRED",
      message: "User auth token expired",
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

  WIDGET_TYPES: {
    TEXT_WIDGET: {
      name: "Text widget",
      value: "text",
    },
  },

  CRON_JOB_STATUS: {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
  },

  // RabbitMQ reconnection interval (5 minutes in milliseconds)
  RABBITMQ_RECONNECT_INTERVAL_MS: 5 * 60 * 1000,
};

module.exports = constants;
