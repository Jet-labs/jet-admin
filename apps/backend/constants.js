const constants = {
  MODULES: {
    AUTH: "auth",
    TENANT: "tenant",
    DATABASE: "database",
    DATASOURCE: "datasource",
    DATAQUERY: "dataQuery",
    APP_PAGE: "appPage",
    WIDGET: "widget",
    USERMANAGEMENT: "userManagement",
    ROLE: "role",
    APIKEY: "apiKey",
    CRONJOB: "cronJob",
    WORKFLOW: "workflow",
    LISTENER: "listener",
  },
  STRINGS: {
    USER_TENANT_ADDITION_NOTIFICATION_TITLE: "Tenant addition notification",
    USER_TENANT_ADDITION_NOTIFICATION_DESCRIPTION:
      "You have been added to a new tenant",
  },

  ROW_PAGE_SIZE: 100,

  SOCKET_EMIT_EVENTS: {
    WORKFLOW_DATA_COLLECTION_REQUEST: 'workflow_data_collection_request',
    WORKFLOW_NODE_UPDATE: "workflow_node_update",
    WORKFLOW_STATUS_UPDATE: "workflow_status_update",
    // Widget-Workflow integration events
    WIDGET_WORKFLOW_CONNECTED: "widget_workflow_connected",
    WIDGET_CONTEXT_UPDATE: "widget_context_update",
    WIDGET_WORKFLOW_STATUS: "widget_workflow_status",
  },

  SOCKET_RECEIVE_EVENTS: {
    WORKFLOW_RUN_JOIN: "workflow_run_join",
    // Widget-Workflow integration events
    WIDGET_WORKFLOW_CONNECT: "widget_workflow_connect",
    WIDGET_SEND_INPUT: "widget_send_input",
    WIDGET_REFRESH: "widget_refresh",
    WIDGET_WORKFLOW_DISCONNECT: "widget_workflow_disconnect",
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
    INVALID_LOGIN: {
      code: "INVALID_LOGIN",
      message: "User login invalid",
    },
    INVALID_REQUEST: {
      code: "INVALID_REQUEST",
      message: "Invalid request",
    },
    VALIDATION_ERROR: {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
    },
    DB_ERROR: {
      code: "DB_ERROR",
      message: "Database error",
    },
    INTERNAL_ERROR: {
      code: "INTERNAL_ERROR",
      message: "Internal error",
    },
    UNKNOWN_ERROR: {
      code: "UNKNOWN_ERROR",
      message: "Unknown error",
    },
  },

  POSTGRES_ERROR_CODES: {
    "23505": "A record with this unique identifier already exists.",
    "23503": "A foreign key constraint was violated.",
    "23502": "A required field was not provided.",
    "22001": "Provided string value exceeds length limits.",
  },

  CRON_JOB_STATUS: {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
  },

  WORKFLOW_LOG_EVENT_TYPES: {
    INPUT_SET: 'INPUT_SET',       // workflow input params — nodeID null
    NODE_COMPLETED: 'NODE_COMPLETED',  // node ran successfully — carries output payload
    NODE_FAILED: 'NODE_FAILED',     // node execution failed — carries errorMessage
    NODE_DISPATCHED: 'NODE_DISPATCHED', // orchestrator queued this node — no payload
    // written by the CAS winner before addNodeJob
    // loser checks this on retry to avoid re-dispatch
    SYSTEM_SET: 'SYSTEM_SET',      // orchestrator metadata — nodeID null
    NODE_SUSPENDED: 'NODE_SUSPENDED', // node is suspended — carries payload
  },

  STORAGE: {
    BUCKETS: {
      TENANT_ASSETS: "tenant-assets",
      DATASOURCE_FILE_UPLOADS: "jet-admin-datasource-file-uploads",
    },
    FOLDERS: {
      LOGOS: "logos",
      WIDGET_FILES: "widget-files",
      EXCEL_CSV_DATASOURCES: "excel-csv-datasources",
    },
  },

  AUTH_PREFIXES: {
    BEARER: "Bearer ",
    API_KEY: "api_key ",
  },

  WORKFLOW_STATUS: {
    PENDING: "PENDING",
    RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    SUCCESS: "success",
    ERROR: "error",
    SUSPENDED: "suspended",
  },

  WORKFLOW_NODE_TYPES: {
    START: "start",
    DATA_QUERY: "dataQuery",
    JAVASCRIPT: "javascript",
    CONDITION: "condition",
    LOOP: "loop",
    DELAY: "delay",
    END: "end",
    DATA_COLLECTION: "dataCollection",
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  ENVIRONMENTS: {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    TEST: "test",
  },

  DEFAULTS: {
    API_KEY_PREFIX_LENGTH: 8,
    TEST_USER_EMAIL: "test@test.com",
    QUERY_TIMEOUT_SECONDS: 60,
  },

  AI: {
    DEFAULT_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    DEFAULT_MODEL: "gemma-4-31b-it",
  },
};

module.exports = constants;

// Trigger nodemon restart

// Trigger nodemon restart 2
