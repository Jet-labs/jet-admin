export const CONSTANTS = {
  APP_NAME: "Jet Admin",

  SERVER_HOST:
    import.meta.env.VITE_SERVER_HOST ||
    (import.meta.env.DEV ? "http://localhost:8090" : "https://jet-admin-1.onrender.com"),

  SOCKET_HOST:
    import.meta.env.VITE_SOCKET_HOST ||
    (import.meta.env.DEV ? "http://localhost:8090" : "https://jet-admin-1.onrender.com"),

  SUPABASE: {
    TENANT_ASSET_DIRECTORY: "tenant-assets",
    TENANT_LOGO_DIRECTORY: "logos",
  },

  ROLES: {
    PRIMARY: {
      ADMIN: { name: "Admin", value: "ADMIN" },
      MEMBER: { name: "Member", value: "MEMBER" },
    },
  },

  APP_PAGE_ITEM_TYPES: {
    WIDGET: "widget",
  },

  SOCKET_EMIT_EVENTS: {
    // Widget-Workflow integration events (send to server)
    WIDGET_WORKFLOW_CONNECT: "widget_workflow_connect",
    WIDGET_SEND_INPUT: "widget_send_input",
    WIDGET_REFRESH: "widget_refresh",
    WIDGET_WORKFLOW_DISCONNECT: "widget_workflow_disconnect",
  },

  SOCKET_RECEIVE_EVENTS: {

    // Widget-Workflow integration events (receive from server)
    WIDGET_WORKFLOW_CONNECTED: "widget_workflow_connected",
    WIDGET_CONTEXT_UPDATE: "widget_context_update",
    WIDGET_WORKFLOW_STATUS: "widget_workflow_status",
    WIDGET_WORKFLOW_ERROR: "widget_workflow_error",
    WIDGET_WORKFLOW_DISCONNECTED: "widget_workflow_disconnected",
    WIDGET_INPUT_RECEIVED: "widget_input_received",
  },
  STRINGS: {
    UPDATING: "Updating...",
    ADD_WORKFLOW_FORM_WORKFLOW_ADDITION_SUCCESS: "Workflow added successfully!",
    WORKFLOW_EDITOR_DATA_QUERY_TITLE_LABEL: "Query name",
    WORKFLOW_EDITOR_DATA_QUERY_TITLE_PLACEHOLDER: "Your query's name",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_SELECT_LABEL: "Select query",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_ARGUMENTS_LABEL: "Query arguments",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON: "Save",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_TEST_BUTTON: "Test",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_TESTING_SUCCESS: "Query run successfully!",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_PLACEHOLDER: "Select query dataset",
    WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL: "Data Query",
    WORKFLOW_EDITOR_JAVASCRIPT_NODE_LABEL: "Javascript",
    WORKFLOW_EDITOR_CONDITION_NODE_LABEL: "Condition",
    WORKFLOW_EDITOR_ADD_DATA_QUERY_BUTTON_TEXT: "Add data query",
    WORKFLOW_EDITOR_ADD_JAVASCRIPT_BUTTON_TEXT: "Add javascript",
    WORKFLOW_EDITOR_ADD_CONDITION_BUTTON_TEXT: "Add condition",
    ADD_WORKFLOW_BUTTON_TEXT: "Add workflow",
    ADD_WORKFLOW_FORM_NAME_FIELD_LABEL: "Workflow name",
    ADD_WORKFLOW_FORM_NAME_FIELD_PLACEHOLDER: "Your workflow's name",
    ADD_WORKFLOW_FORM_TITLE: "Create workflow",
    DATAGRID_JSON_POPUP_CANCEL_BUTTON: "Cancel",
    DATAGRID_JSON_POPUP_SAVE_BUTTON: "Save",
    DATAGRID_JSON_POPUP_TITLE: "Edit JSON",
    WORKFLOW_ADDITION_FORM_TITLE: "Create workflow",
    WORKFLOW_ADDITION_FORM_NAME_FIELD_LABEL: "Workflow name",
    WORKFLOW_ADDITION_FORM_NAME_FIELD_PLACEHOLDER: "Your workflow's name",
    WORKFLOW_ADDITION_FORM_SUBMIT_BUTTON: "Add workflow",
    WORKFLOW_ADDITION_FORM_TEST_BUTTON: "Test workflow",
    UPDATE_WORKFLOW_FORM_TITLE: "Update workflow",
    UPDATE_WORKFLOW_BUTTON_TEXT: "Update workflow",
    UPDATE_WORKFLOW_FORM_WORKFLOW_UPDATION_SUCCESS: "Workflow updated successfully!",
    VIEW_WORKFLOW_RUNS_TITLE: "Workflow runs",
    VIEW_WORKFLOW_RUN_DETAILS_TITLE: "Run details",
    WORKFLOW_RUNS_NO_RUNS: "No workflow runs yet. Runs appear here whenever this workflow executes.",
    WORKFLOW_RUNS_SEARCH_PLACEHOLDER: "Search by run ID…",
    NO_DATABASE_URL: "Please add database URL in the tenant settings",
    APP_PAGE_DROPPING_ELEMENT_TAG: "__dropping-elem__",
    HIDE_QUERY_META_CONTENT_BUTTON_TEXT: "Hide metadata",
    SHOW_QUERY_META_CONTENT_BUTTON_TEXT: "Show metadata",
    MAIN_DRAWER_DASHBOARD_TITLE: "Dashboard",
    MAIN_DRAWER_DATASOURCE_TITLE: "Data sources",
    MAIN_DRAWER_APP_PAGES_TITLE: "App Pages",
    MAIN_DRAWER_WIDGETS_TITLE: "Widgets",
    MAIN_DRAWER_API_KEYS_TITLE: "API Keys",
    MAIN_DRAWER_CRON_JOBS_TITLE: "Scheduled jobs",
    MAIN_DRAWER_WORKFLOWS_TITLE: "Workflows",
    MAIN_DRAWER_QUERIES_TITLE: "Queries",
    MAIN_DRAWER_USER_MANAGEMENT_TITLE: "User management",
    MAIN_DRAWER_AUDIT_LOGS_TITLE: "Audit logs",
    NO_TENANT_CREATED_TILL_NOW: "Please create a tenant",
    MAIN_DRAWER_LISTENERS_TITLE: "Listeners",
    ADD_LISTENER_BUTTON_TEXT: "Add listener",
    LISTENER_DRAWER_LIST_NO_LISTENER_FOUND: "No listeners found",
    NO_PERMISSION_TO_VIEW_TENANT_TITLE: "Permission denied!",
    NO_PERMISSION_TO_VIEW_TENANT_DESCRIPTION:
      "You do not have permissions to view the tenant details",
    SIGN_IN_FORM_TITLE: "Log in to your account",
    SIGN_IN_FORM_EMAIL_FIELD_LABEL: "Email",
    SIGN_IN_FORM_EMAIL_FIELD_PLACEHOLDER: "yourname@org.com",
    SIGN_IN_FORM_PASSWORD_FIELD_LABEL: "Password",
    SIGN_IN_FORM_PASSWORD_FIELD_PLACEHOLDER: "",
    SIGN_IN_FORM_SUBMIT_BUTTON: "Sign in",
    SIGN_IN_FORM_GOOGLE_SIGN_IN_LABEL: "Sign in with Google",
    SIGN_IN_FORM_TO_SIGN_UP_MESSAGE: "Don’t have an account yet?",

    SIGN_UP_FORM_TITLE: "Create your account",
    SIGN_UP_FORM_EMAIL_FIELD_LABEL: "Email",
    SIGN_UP_FORM_EMAIL_FIELD_PLACEHOLDER: "yourname@org.com",
    SIGN_UP_FORM_PASSWORD_FIELD_LABEL: "Password",
    SIGN_UP_FORM_PASSWORD_FIELD_PLACEHOLDER: "",
    SIGN_UP_FORM_CONFIRM_PASSWORD_FIELD_LABEL: "Confirm password",
    SIGN_UP_FORM_CONFIRM_PASSWORD_FIELD_PLACEHOLDER: "",
    SIGN_UP_FORM_TO_SIGN_IN_MESSAGE: "Already have an account yet?",
    SIGN_UP_FORM_SUBMIT_BUTTON: "Sign up",

    ADD_TENANT_FORM_TITLE: "Add tenant",
    ADD_TENANT_FORM_NAME_FIELD_LABEL: "Tenant name",
    ADD_TENANT_FORM_NAME_FIELD_PLACEHOLDER: "Your tenant's name",
    ADD_TENANT_FORM_LOGO_FIELD_LABEL: "Logo",
    ADD_TENANT_FORM_SUBMIT_BUTTON: "Submit",
    ADD_TENANT_SUCCESS_TOAST: "Tenant added successfully!",
    ADD_TENANT_LOGO_UPLOAD_SUCCESS_TOAST: "Logo uploaded successfully!",
    ADD_TENANT_LOGO_UPLOAD_ERROR_MESSAGE: "Logo upload error!",
    ADD_TENANT_LOGO_UPLOAD_ERROR_TOAST: "Logo uploaded error!",

    DELETE_TENANT_CONFIRMATION_TITLE: "Delete tenant",
    DELETE_TENANT_CONFIRMATION_DESCRIPTION:
      "Are you sure you want to delete this tenant? All related assets will be deleted and this operation cannot be undone!",
    DELETE_TENANT_CONFIRM_BUTTON: "Delete",
    DELETE_TENANT_CANCEL_BUTTON: "Cancel",
    DELETE_TENANT_SUCCESS_TOAST: "Tenant deleted successfully!",

    UPDATE_TENANT_FORM_TITLE: "Edit tenant",
    UPDATE_TENANT_FORM_NAME_FIELD_LABEL: "Tenant name",
    UPDATE_TENANT_FORM_DB_FIELD_LABEL: "Database URL",
    UPDATE_TENANT_FORM_NAME_FIELD_PLACEHOLDER: "Your tenant's name",
    UPDATE_TENANT_FORM_DB_FIELD_PLACEHOLDER: "Your PostgreSQL database URL",
    UPDATE_TENANT_FORM_LOGO_FIELD_LABEL: "Logo",
    UPDATE_TENANT_FORM_SUBMIT_BUTTON: "Submit",
    UPDATE_TENANT_SUCCESS_TOAST: "Tenant updated successfully!",
    UPDATE_TENANT_LOGO_UPLOAD_SUCCESS_TOAST: "Logo uploaded successfully!",
    UPDATE_TENANT_LOGO_UPLOAD_ERROR_MESSAGE: "Logo uploaded error!",
    UPDATE_TENANT_LOGO_UPLOAD_ERROR_TOAST: "Logo uploaded error!",
    UPDATE_TENANT_MEMBERS_TITLE: "Tenant members",
    UPDATE_TENANT_CREATOR_TITLE: "Tenant creator",
    UPDATE_TENANT_ADD_MEMBERS_BUTTON: "Add member",

    UPDATE_TENANT_MEMBER_ACTION_REMOVE: "Remove",
    UPDATE_TENANT_MEMBER_ACTION_PROMOTE: "Promote to owner",

    TENANT_EDITOR_FORM_NAME_FIELD_LABEL: "Tenant name",
    TENANT_EDITOR_FORM_NAME_FIELD_PLACEHOLDER: "Your tenant's name",
    TENANT_EDITOR_FORM_LOGO_FIELD_LABEL: "Logo",
    TENANT_EDITOR_FORM_DB_TYPE_FIELD_LABEL: "Database type",
    TENANT_EDITOR_FORM_DB_FIELD_LABEL: "Database URL",
    TENANT_EDITOR_FORM_DB_FIELD_PLACEHOLDER: "Your PostgreSQL database URL",
    TENANT_EDITOR_FORM_DB_URL_TEST: "Test connection",
    TENANT_EDITOR_DB_URL_TEST_SUCCESS_TOAST: "DB connection successfull!",
    TENANT_EDITOR_DB_URL_TEST_FAILED_TOAST: "DB connection failed!",
    TENANT_EDITOR_LOGO_UPLOAD_SUCCESS_TOAST: "Logo uploaded successfully!",
    TENANT_EDITOR_LOGO_UPLOAD_ERROR_MESSAGE: "Logo upload error!",
    TENANT_EDITOR_LOGO_UPLOAD_ERROR_TOAST: "Logo uploaded error!",

    TENANT_SELECTION_DROPDOWN_NO_TENANT_SELECTED: "Select tenant",
    TENANT_SELECTION_DROPDOWN_ADD_TENANT: "Add tenant",

    ADD_MEMBER_TO_TENANT_DIALOG_TITLE: "Add member",
    ADD_MEMBER_TO_TENANT_DIALOG_DESCRIPTION:
      "The user must register first in order to be added to tenant.",
    ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_LABEL: "Member email",
    ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_PLACEHOLDER:
      "member@someorg.com",
    ADD_MEMBER_TO_TENANT_DIALOG_FORM_SUBMIT_BUTTON: "Add",
    ADD_MEMBER_TO_TENANT_SUCCESS_TOAST: "Member added successfully!",
    ADD_MEMBER_TO_TENANT_DIALOG_FORM_CANCEL_BUTTON: "Cancel",

    MEMBER_ACTION_MENU_REMOVE_MEMBER_DIALOG_TITLE: "Remove member from tenant?",
    MEMBER_ACTION_MENU_REMOVE_MEMBER_DIALOG_DESCRIPTION:
      "Are you sure you want to remove member from tenant?.This action cannot be undone.",

    MEMBER_ACTION_MENU_PROMOTE_MEMBER_DIALOG_TITLE: "Promote to owner?",
    MEMBER_ACTION_MENU_PROMOTE_MEMBER_DIALOG_DESCRIPTION:
      "Are you sure you want to promote the member to owner?.This action cannot be undone.",
    MEMBER_ACTION_MEMBER_PROMOTED_SUCCESS_TOAST:
      "Member promoted successfully!",
    MEMBER_ACTION_MEMBER_REMOVED_SUCCESS_TOAST: "Member removed successfully!",

    DATASOURCE_DRAWER_LIST_NO_DATASOURCE: "No data sources found",
    QUERY_DRAWER_LIST_NO_QUERY: "No queries found",
    API_KEY_DRAWER_LIST_NO_API_KEY: "No API Keys found",
    CRON_JOB_DRAWER_LIST_NO_CRON_JOB_FOUND: "No scheduled jobs found",
    WIDGET_DRAWER_LIST_NO_WIDGET: "No widgets found",
    APP_PAGE_DRAWER_LIST_NO_APP_PAGE: "No app pages found",

    UNTITLED: "Untitled",



    ADD_QUERY_BUTTON_TEXT: "Add query",

    ADD_WIDGET_BUTTON_TEXT: "Add widget",

    ADD_DATASOURCE_BUTTON_TEXT: "Add datasource",
    ADD_DATASOURCE_FORM_TITLE: "Add data source",
    ADD_DATASOURCE_FORM_DATASOURCE_ADDITION_SUCCESS:
      "Data source added successfully!",
    ADD_DATASOURCE_FORM_DATASOURCE_TESTING_SUCCESS:
      "Data source run successfully!",
    ADD_DATASOURCE_FORM_SUBMIT_BUTTON: "Add data source",

    UPDATE_DATASOURCE_FORM_TITLE: "Update data source",
    UPDATE_DATASOURCE_FORM_DATASOURCE_ADDITION_SUCCESS:
      "Data source updated successfully!",
    UPDATE_DATASOURCE_FORM_DATASOURCE_TESTING_SUCCESS:
      "Data source run successfully!",
    UPDATE_DATASOURCE_FORM_SUBMIT_BUTTON: "Update data source",

    DATASOURCE_EDITOR_FORM_TITLE_FIELD_LABEL: "Data source name",
    DATASOURCE_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER: "Your data source's name",
    DATASOURCE_EDITOR_FORM_DESCRIPTION_FIELD_LABEL: "Description",
    DATASOURCE_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Your data source description (optional)",
    DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL: "Data source type",
    DATASOURCE_EDITOR_FORM_TYPE_FIELD_PLACEHOLDER: "Select data source type",
    DATASOURCE_EDITOR_FORM_CONNECTION_DETAILS_FIELD_LABEL: "Connection details",

    DELETE_DATASOURCE_DIALOG_TITLE: "Delete datasource",
    DELETE_DATASOURCE_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    TEST_QUERY_FORM_TEST_BUTTON: "Test query",
    TEST_QUERY_FORM_QUERY_TESTING_SUCCESS: "Query run successfully!",

    // Labels
    ADD_QUERY_FORM_TITLE: "Add query",
    ADD_QUERY_FORM_QUERY_ADDITION_SUCCESS: "Query added successfully!",
    ADD_QUERY_FORM_QUERY_TESTING_SUCCESS: "Query run successfully!",
    ADD_QUERY_FORM_SUBMIT_BUTTON: "Add query",
    ADD_QUERY_FORM_TEST_BUTTON: "Test query",
    ADD_QUERY_FORM_NAME_FIELD_LABEL: "Query name",
    ADD_QUERY_FORM_NAME_FIELD_PLACEHOLDER: "Your query's name",
    ADD_QUERY_FORM_DESCRIPTION_FIELD_LABEL: "Description",
    ADD_QUERY_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Your query description (optional)",
    ADD_QUERY_FORM_PARAMS_FIELD_LABEL: "Query params",
    ADD_QUERY_FORM_RUN_ON_LOAD_FIELD_LABEL: "Run on load",

    UPDATE_QUERY_FORM_TITLE: "Update query",
    UPDATE_QUERY_FORM_QUERY_UPDATION_SUCCESS: "Query updated successfully!",

    UPDATE_QUERY_FORM_QUERY_TESTING_SUCCESS: "Query run successfully!",
    UPDATE_QUERY_FORM_SUBMIT_BUTTON: "Update query",
    UPDATE_QUERY_FORM_TEST_BUTTON: "Test query",
    UPDATE_QUERY_FORM_NAME_FIELD_LABEL: "Query name",
    UPDATE_QUERY_FORM_NAME_FIELD_PLACEHOLDER: "Your query's name",
    UPDATE_QUERY_FORM_DESCRIPTION_FIELD_LABEL: "Description",
    UPDATE_QUERY_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Your query description (optional)",
    UPDATE_QUERY_FORM_PARAMS_FIELD_LABEL: "Query params",
    UPDATE_QUERY_FORM_RUN_ON_LOAD_FIELD_LABEL: "Run on load",
    UPDATE_QUERY_FORM_UPDATE_DIALOG_TITLE: "Update query",
    UPDATE_QUERY_FORM_UPDATE_DIALOG_MESSAGE:
      "Are you sure you want to update this item? This action cannot be undone.",

    TEST_DATASOURCE_FORM_TEST_BUTTON: "Test",
    TEST_DATASOURCE_FORM_TESTING_SUCCESS: "Datasource connection success!",

    DELETE_DATASOURCE_DELETION_SUCCESS: "Datasource deleted successfully!",

    CLONE_DATASOURCE_CLONING_SUCCESS: "Datasource cloned successfully!",
    CLONE_DATASOURCE_DIALOG_TITLE: "Clone datasource",
    CLONE_DATASOURCE_DIALOG_MESSAGE:
      "Are you sure you want to clone this item? This action cannot be undone.",

    DELETE_QUERY_DELETION_SUCCESS: "Query deleted successfully!",
    DELETE_QUERY_DIALOG_TITLE: "Delete query",
    DELETE_QUERY_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    CLONE_QUERY_CLONING_SUCCESS: "Query cloned successfully!",
    CLONE_QUERY_DIALOG_TITLE: "Clone query",
    CLONE_QUERY_DIALOG_MESSAGE:
      "Are you sure you want to clone this item? This action cannot be undone.",

    DATA_QUERY_INPUTS_FORM_TITLE: "Query arguments",
    DATA_QUERY_INPUTS_FORM_DESCRIPTION: "Enter the query arguments",
    DATA_QUERY_INPUTS_FORM_CONFIRM_BUTTON: "Confirm",
    DATA_QUERY_INPUTS_FORM_CANCEL_BUTTON: "Cancel",

    DATABASE_TABLES_STATS_TITLE: "Database Stats",
    DATABASE_TABLES_STATS_TOTAL_TABLES_LABEL: "Total Tables",
    DATABASE_TABLES_STATS_TOTAL_COLUMNS_LABEL: "Total Columns",
    DATABASE_TABLES_STATS_TABLES_WITH_PRIMARY_KEYS_LABEL:
      "Tables with Primary Keys",
    DATABASE_TABLES_STATS_TOTAL_CONSTRAINTS_LABEL: "Total Constraints",

    UPDATE_TENANT_USER_BY_ID_FORM_TITLE: "Update user",
    UPDATE_TENANT_USER_BY_ID_EMAIL_LABEL: "Email",
    UPDATE_TENANT_USER_BY_ID_PROFILE_TITLE: "Profile",
    UPDATE_TENANT_USER_BY_ID_ASSIGNED_ROLES_TITLE: "Assigned roles",
    UPDATE_TENANT_USER_BY_ID_MANAGE_ROLES: "Manage roles",
    UPDATE_TENANT_USER_BY_ID_REMOVE_ROLE_DIALOG_TITLE: "Remove role?",
    UPDATE_TENANT_USER_BY_ID_REMOVE_ROLE_DIALOG_MESSAGE:
      "Are you sure you want to remove this role from user? This action cannot be undone.",
    UPDATE_TENANT_USER_BY_ID_NO_ROLES: "No roles assigned to user",
    UPDATE_TENANT_USER_BY_ID_USER_ADMIN_NO_ROLES: "User is tenant admin",
    UPDATE_TENANT_USER_BY_ID_USER_ROLES_UPDATED_SUCCESSFULLY:
      "Roles updated succedssfully",
    UPDATE_TENANT_USER_BY_ID_REMOVE_USER_FROM_TENANT: "Remove user from tenant",
    UPDATE_TENANT_USER_BY_ID_REMOVE_USER_FROM_TENANT_SUCCESS:
      "User removed successfully",
    UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_TITLE: "Remove user?",
    UPDATE_TENANT_USER_BY_ID_REMOVE_USER_DIALOG_MESSAGE:
      "Are you sure you want to remove user from tenant? This action cannot be undone.",
    TENANT_ROLE_SELECTION_TITLE: "User roles",
    TENANT_ROLE_SELECTION_MEMBERSHIP_LABEL: "Tenant admin",
    TENANT_ROLE_SELECTION_MEMBERSHIP_INFO:
      "Making a user tenant admin removes are the roles assigned to user.",
    TENANT_ROLE_SELECTION_SELECT_ROLES_LABEL: "Select roles",
    TENANT_PERMISSION_SELECTION_LABEL: "Select permissions",
    TENANT_ROLE_SELECTION_SELECTED_ROLES_TITLE: "Selected roles",
    TENANT_ROLE_SELECTION_CANCEL: "Cancel",
    TENANT_ROLE_SELECTION_SUBMIT: "Update roles",

    TENANT_USER_MANAGEMENT_TITLE: "User management",
    TENANT_USER_MANAGEMENT_ADD_MEMBER_BUTTON: "Add member",

    TENANT_ROLE_MANAGEMENT_TITLE: "Role management",
    TENANT_ROLE_MANAGEMENT_ADD_ROLE_BUTTON: "Add role",

    TENANT_ROLE_ADDITION_TITLE: "Add role",
    TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_LABEL: "Role name",
    TENANT_ROLE_ADDITION_FORM_ROLE_NAME_FIELD_PLACEHOLDER: "Role name",

    TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_LABEL: "Role description",
    TENANT_ROLE_ADDITION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER:
      "Role description",

    TENANT_ROLE_ADDITION_FORM_ROLE_PERMISSIONS_FIELD_LABEL:
      "Select permissions",

    TENANT_ROLE_ADDITION_FORM_SUBMIT_BUTTON: "Add role",
    TENANT_ROLE_ADDITION_SUCCESS_TOAST: "Role added successfully",

    TENANT_ROLE_UPDATION_TITLE: "Update role",
    TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_LABEL: "Role name",
    TENANT_ROLE_UPDATION_FORM_ROLE_NAME_FIELD_PLACEHOLDER: "Role name",

    TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_LABEL: "Role description",
    TENANT_ROLE_UPDATION_FORM_ROLE_DESCRIPTION_FIELD_PLACEHOLDER:
      "Role description",

    TENANT_ROLE_UPDATION_FORM_ROLE_PERMISSIONS_FIELD_LABEL:
      "Select permissions",

    TENANT_ROLE_UPDATION_FORM_SUBMIT_BUTTON: "Update role",
    TENANT_ROLE_UPDATION_SUCCESS_TOAST: "Role added successfully",

    TENANT_ROLE_DELETION_SUCCESS: "Role deleted successfully!",
    TENANT_ROLE_DELETION_DIALOG_TITLE: "Delete role?",
    TENANT_ROLE_DELETION_DIALOG_MESSAGE:
      "Are you sure you want to delete this role? This action cannot be undone.",

    ADD_WIDGET_FORM_TITLE: "Add widget",
    ADD_WIDGET_FORM_WIDGET_ADDITION_SUCCESS: "Widget added successfully!",
    ADD_WIDGET_FORM_WIDGET_TESTING_SUCCESS: "Widget run successfully!",
    ADD_WIDGET_FORM_SUBMIT_BUTTON: "Add widget",

    UPDATE_WIDGET_FORM_TITLE: "Update widget",
    UPDATE_WIDGET_FORM_WIDGET_UPDATION_SUCCESS: "Widget updated successfully!",
    UPDATE_WIDGET_FORM_WIDGET_TESTING_SUCCESS: "Widget run successfully!",
    UPDATE_WIDGET_FORM_SUBMIT_BUTTON: "Update widget",

    DELETE_WIDGET_DELETION_SUCCESS: "Widget deleted successfully!",
    DELETE_WIDGET_DIALOG_TITLE: "Delete widget",
    DELETE_WIDGET_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    CLONE_WIDGET_CLONING_SUCCESS: "Widget cloned successfully!",
    CLONE_WIDGET_DIALOG_TITLE: "Clone widget",
    CLONE_WIDGET_DIALOG_MESSAGE:
      "Are you sure you want to clone this item? This action cannot be undone.",

    APP_PAGE_WIDGET_LIST_TITLE: "Widgets",
    APP_PAGE_WIDGET_LIST_WIDGETS_TITLE: "Widgets",
    APP_PAGE_WIDGET_LIST_QUERIES_TITLE: "Queries",
    APP_PAGE_WIDGET_LIST_HELPER_TEXT:
      "Drag a widget into the canvas or click Add. You can place the same widget more than once.",
    APP_PAGE_WIDGET_LIST_SEARCH_PLACEHOLDER: "Search widgets",
    APP_PAGE_WIDGET_LIST_NO_MATCHING_WIDGETS: "No matching widgets found",

    APP_PAGE_DROPZONE_TITLE: "Canvas",
    APP_PAGE_DROPZONE_HELPER_TEXT:
      "Drag widgets into the canvas, drag placed widgets to reposition them, and resize them from the corners.",
    APP_PAGE_DROPZONE_SELECTION_HINT:
      "Select a widget on the canvas to fine-tune its position and size.",
    APP_PAGE_DROPZONE_SELECTION_HELPER:
      "Fine-tuning applies to the current responsive breakpoint only.",
    APP_PAGE_DROPZONE_EMPTY_MESSAGE:
      "Drag a widget here to start building your app page",
    APP_PAGE_DROPZONE_EMPTY_HELPER:
      "Widgets snap to the responsive grid so layouts stay aligned across screen sizes.",

    APP_PAGE_WIDGET_CUSTOM_CSS_BUTTON: "Custom CSS",
    APP_PAGE_WIDGET_CUSTOM_CSS_FORM_TITLE: "Custom CSS",
    APP_PAGE_WIDGET_CUSTOM_CSS_FORM_DESCRIPTION:
      "Enter the custom CSS to be applied to the widget",
    APP_PAGE_WIDGET_CUSTOM_CSS_FORM_CONFIRM: "Save changes",
    APP_PAGE_WIDGET_CUSTOM_CSS_FORM_CANCEL: "Discard",

    APP_PAGE_VIEWER_NO_PINNED_APP_PAGE_TITLE: "No pinned app page",
    APP_PAGE_VIEWER_NO_PINNED_APP_PAGE_DESCRIPTION:
      "Pin an app page to quickly access it from this page.",

    ADD_APP_PAGE_BUTTON_TEXT: "Add app page",
    ADD_APP_PAGE_FORM_TITLE: "Add app page",
    ADD_APP_PAGE_FORM_APP_PAGE_ADDITION_SUCCESS:
      "App page added successfully!",

    UPDATE_APP_PAGE_BUTTON_TEXT: "Update app page",
    UPDATE_APP_PAGE_FORM_TITLE: "Update app page",
    UPDATE_APP_PAGE_FORM_APP_PAGE_UPDATION_SUCCESS:
      "App page updated successfully!",
    UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_TITLE: "Update app page",
    UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_MESSAGE:
      "Are you sure you want to update this item? This action cannot be undone.",

    DELETE_APP_PAGE_DELETION_SUCCESS: "App page deleted successfully!",
    DELETE_APP_PAGE_DIALOG_TITLE: "Delete app page",
    DELETE_APP_PAGE_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    CLONE_APP_PAGE_CLONING_SUCCESS: "App page cloned successfully!",
    CLONE_APP_PAGE_DIALOG_TITLE: "Clone app page",
    CLONE_APP_PAGE_DIALOG_MESSAGE:
      "Are you sure you want to clone this item? This action cannot be undone.",

    APP_PAGE_EDITOR_FORM_NAME_FIELD_LABEL: "App page name",
    APP_PAGE_EDITOR_FORM_NAME_FIELD_PLACEHOLDER: "Your app page's name",
    APP_PAGE_EDITOR_FORM_DESCRIPTION_FIELD_LABEL: "Description",
    APP_PAGE_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Description (Optional)",

    WIDGET_DATASET_FIELD_MAPPING_BUTTON: "Mappings",
    WIDGET_DATASET_FIELD_MAPPING_TITLE: "Dataset field options",
    WIDGET_DATASET_FIELD_MAPPING_NO_META: "Dataset metadata not available",
    WIDGET_DATASET_FIELD_MAPPING_CONFIRM: "Save changes",
    WIDGET_DATASET_FIELD_MAPPING_CANCEL: "Discard",

    WIDGET_DATASET_ARGUMENTS_TITLE: "Workflow Input Parameters",
    WIDGET_DATASET_ARGUMENTS_CONFIRM: "Save changes",
    WIDGET_DATASET_ARGUMENTS_CANCEL: "Discard",

    WIDGET_TYPE_INVALID_ERROR: "Invalid widget type",

    ACCOUNT_PAGE_TITLE: "Accounts",
    ACCOUNT_PAGE_USER_EMAIL_TITLE: "Email",
    ACCOUNT_PAGE_USER_PROFILE_TITLE: "Profile",
    ACCOUNT_PAGE_LOGOUT_BUTTON: "Logout",
    ACCOUNT_PAGE_LOGOUT_CONFIRMATION_TITLE: "Logout",
    ACCOUNT_PAGE_LOGOUT_CONFIRMATION_MESSAGE:
      "Are you sure you want to logout?",
    ACCOUNT_PAGE_LOGOUT_SUCCESS: "Logged out successfully",
    ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_TITLE: "Reset password",
    ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_MESSAGE:
      "A password reset link will be sent to your registered email.",
    ACCOUNT_PAGE_PASSWORD_RESET_LINK_SENT_SUCCESS:
      "Password reset link sent successfully ",
    USER_NOTIFICATIONS_TITLE: "Notifications",

    WIDGET_EDITOR_FORM_NAME_FIELD_LABEL: "Widget name",
    WIDGET_EDITOR_FORM_WORKFLOW_LABEL: "Workflow",
    WIDGET_EDITOR_FORM_NAME_FIELD_PLACEHOLDER: "Your widget's name",
    WIDGET_EDITOR_FORM_WORKFLOW_PLACEHOLDER: "Select workflow",
    TEST_WORKFLOW_BUTTON: "Test workflow",
    TEST_WORKFLOW_BUTTON_RUNNING: "Running...",
    TEST_WORKFLOW_BUTTON_STOP: "Stop",
    WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
    WIDGET_EDITOR_FORM_DATASOURCE_LABEL: "Datasource",
    WIDGET_EDITOR_FORM_TYPE_FIELD_LABEL: "Widget type",
    WIDGET_EDITOR_FORM_ADVANCED_BUTTON: "Advanced config",
    WIDGET_EDITOR_FORM_TITLE_ENABLED_FIELD_LABEL: "Title enabled",
    WIDGET_EDITOR_FORM_LEGEND_ENABLED_FIELD_LABEL: "Legend enabled",
    WIDGET_EDITOR_FORM_LEGEND_POSITION_FIELD_LABEL: "Legend position",
    WIDGET_EDITOR_FORM_X_STACKED_FIELD_LABEL: "X stacked",
    WIDGET_EDITOR_FORM_Y_STACKED_FIELD_LABEL: "Y stacked",
    WIDGET_EDITOR_FORM_INDEX_AXIS_LABEL: "Index axis",
    WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval",
    WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL: "Datasets",
    WIDGET_EDITOR_FORM_ADD_DATASET_BUTTON: "Add dataset",

    WIDGET_EDITOR_FORM_DESCRIPTION_FIELD_LABEL: "Widget description",
    WIDGET_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Your widget's description",

    WIDGET_EDITOR_FORM_DATASET_TITLE_LABEL: "Dataset title",
    WIDGET_EDITOR_FORM_DATASET_QUERY_LABEL: "Dataset query",
    WIDGET_EDITOR_FORM_DATASET_UI_CONFIG_LABEL: "UI options",
    WIDGET_EDITOR_FORM_DATASET_FIELD_MAPPINGS_LABEL: "Mappings",
    WIDGET_EDITOR_FORM_DATASET_ARGUMENTS_LABEL: "Workflow Inputs",
    WIDGET_EDITOR_FORM_DATASET_COLOR_LABEL: "Dataset color",
    WIDGET_EDITOR_FORM_DATASET_BORDER_WIDTH_LABEL: "Border width",
    WIDGET_EDITOR_FORM_DATASET_FIELD_TEXT_LABEL: "Text content",
    WIDGET_EDITOR_FORM_DATASET_FIELD_X_AXIS_LABEL: "X axis",
    WIDGET_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL: "Y axis",
    WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL: "Label",
    WIDGET_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL: "Value",
    WIDGET_EDITOR_FORM_DATASET_FIELD_RADIUS_LABEL: "Radius",

    WIDGET_DATASET_ADV_TITLE: "Dataset advanced options",
    WIDGET_DATASET_ADV_CONFIRM: "Save changes",
    WIDGET_DATASET_ADV_CANCEL: "Discard",

    ADD_NOTIFICATION_BUTTON_TEXT: "Add Notification",
    ADD_NOTIFICATION_FORM_TITLE: "Create New Notification",
    NOTIFICATION_ADDED_SUCCESS: "Notification created successfully",
    NOTIFICATION_DELETED_SUCCESS: "Notification deleted successfully",
    ADD_NOTIFICATION_FORM_SUBMIT: "Save notification",
    ADD_NOTIFICATION_FORM_NOTIFICATION_CREATED:
      "Notification created successfully",
    NOTIFICATION_EDITOR_FORM_NAME_FIELD_LABEL: "Notification name",
    NOTIFICATION_EDITOR_FORM_NAME_FIELD_PLACEHOLDER: "Your notification's name",

    DELETE_NOTIFICATION_DELETION_SUCCESS: "Notification deleted successfully!",
    DELETE_NOTIFICATION_DIALOG_TITLE: "Delete notification",
    DELETE_NOTIFICATION_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    UPDATE_NOTIFICATION_FORM_TITLE: "Update notification",
    UPDATE_NOTIFICATION_FORM_NOTIFICATION_UPDATION_SUCCESS:
      "Notification updated successfully!",

    UPDATE_NOTIFICATION_FORM_NOTIFICATION_TESTING_SUCCESS:
      "Notification run successfully!",
    UPDATE_NOTIFICATION_FORM_SUBMIT_BUTTON: "Update notification",
    UPDATE_NOTIFICATION_FORM_NAME_FIELD_LABEL: "Notification name",
    UPDATE_NOTIFICATION_FORM_NAME_FIELD_PLACEHOLDER: "Your notification's name",
    UPDATE_NOTIFICATION_FORM_UPDATE_DIALOG_TITLE: "Update notification",
    UPDATE_NOTIFICATION_FORM_UPDATE_DIALOG_MESSAGE:
      "Are you sure you want to update this item? This action cannot be undone.",

    ADD_API_KEY_BUTTON_TEXT: "Add API Key",
    ADD_API_KEY_FORM_TITLE: "Create New API Key",
    API_KEY_ADDED_SUCCESS: "API Key created successfully",
    API_KEY_DELETED_SUCCESS: "API Key deleted successfully",
    ADD_API_KEY_FORM_SUBMIT: "Save API key",
    ADD_API_KEY_FORM_API_KEY_CREATED: "API Key created successfully",
    API_KEY_EDITOR_FORM_NAME_FIELD_LABEL: "API Key name",
    API_KEY_EDITOR_FORM_NAME_FIELD_PLACEHOLDER: "Your API key's name",

    DELETE_API_KEY_DELETION_SUCCESS: "API Key deleted successfully!",
    DELETE_API_KEY_DIALOG_TITLE: "Delete API key",
    DELETE_API_KEY_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    UPDATE_API_KEY_FORM_TITLE: "Update API key",
    UPDATE_API_KEY_FORM_API_KEY_UPDATION_SUCCESS:
      "API Key updated successfully!",

    UPDATE_API_KEY_FORM_API_KEY_TESTING_SUCCESS: "API Key run successfully!",
    UPDATE_API_KEY_FORM_SUBMIT_BUTTON: "Update API key",
    UPDATE_API_KEY_FORM_NAME_FIELD_LABEL: "API Key name",
    UPDATE_API_KEY_FORM_NAME_FIELD_PLACEHOLDER: "Your API key's name",
    UPDATE_API_KEY_FORM_UPDATE_DIALOG_TITLE: "Update API key",
    UPDATE_API_KEY_FORM_UPDATE_DIALOG_MESSAGE:
      "Are you sure you want to update this item? This action cannot be undone.",

    UPDATE_TENANT_API_KEY_BY_ID_ASSIGNED_ROLES_TITLE: "Assigned roles",
    UPDATE_TENANT_API_KEY_BY_ID_MANAGE_ROLES: "Manage roles",

    API_KEY_ROLE_SELECTION_SELECT_ROLES_LABEL: "Select roles",
    API_KEY_ROLE_SELECTION_TITLE: "API Key roles",
    API_KEY_PERMISSION_SELECTION_LABEL: "Select permissions",
    API_KEY_ROLE_SELECTION_SELECTED_ROLES_TITLE: "Selected roles",
    API_KEY_ROLE_SELECTION_CANCEL: "Cancel",
    API_KEY_ROLE_SELECTION_SUBMIT: "Update roles",

    ADD_CRON_JOB_BUTTON_TEXT: "Add job",

    ADD_CRON_JOB_SUBMIT_BUTTON_TEXT: "Add scheduled job",
    ADD_CRON_JOB_FORM_TITLE: "Create new scheduled job",
    UPDATE_CRON_JOB_FORM_TITLE: "Update scheduled job",
    VIEW_CRON_JOB_HISTORY_TITLE: "Scheduled job history",    UPDATE_CRON_JOB_SUBMIT_BUTTON_TEXT: "Update job",
    CRON_JOB_ADDED_SUCCESS: "Scheduled job created successfully",
    CRON_JOB_UPDATED_SUCCESS: "Scheduled job updated successfully",
    CRON_JOB_DELETED_SUCCESS: "Scheduled job deleted successfully",

    DELETE_CRON_JOB_DIALOG_TITLE: "Delete scheduled job",
    DELETE_CRON_JOB_DIALOG_MESSAGE:
      "Are you sure you want to delete this item? This action cannot be undone.",

    CRON_JOB_EDITOR_FORM_TITLE_FIELD_LABEL: "Scheduled job title",

    CRON_JOB_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER: "Your scheduled job's title",

    CRON_JOB_EDITOR_FORM_QUERY_ID_FIELD_LABEL: "Select query",

    CRON_JOB_EDITOR_FORM_SCHEDULE_FIELD_LABEL: "Select schedule",

    CRON_JOB_EDITOR_FORM_DESCRIPTION_FIELD_LABEL: "Scheduled job description",
    CRON_JOB_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER:
      "Your scheduled job's description",

    CRON_JOB_EDITOR_FORM_CRON_EXPRESSION_FIELD_LABEL: "Schedule (Cron) expression",
    CRON_JOB_EDITOR_FORM_CRON_EXPRESSION_FIELD_PLACEHOLDER:
      "Your scheduled job's cron expression",

    CRON_JOB_EDITOR_FORM_QUERY_ARGUMENTS_LABEL: "Arguments",

    TENANTS_STATS_TITLE: "Tenant Stats",
    TENANTS_STATS_ADD_TENANT_BUTTON: "Add tenant",
    QUERIES_STATS_TITLE: "Queries Stats",
    QUERY_EXECUTED_SUCCESSFULLY: "Query executed successfully",

    WIDGETS_STATS_TITLE: "Widgets Stats",
    RAW_QUERY_EXCECUTOR_TITLE: "Raw SQL Query Executor",
    RAW_QUERY_EXCECUTOR_DESCRIPTION:
      "Execute raw SQL queries against your database",
    RAW_QUERY_EXCECUTOR_QUERY_LABEL: "SQL query",
    RAW_QUERY_EXCECUTOR_EXECUTE_BUTTON: "Execute",
    RAW_QUERY_EXCECUTOR_CLEAR_BUTTON: "Clear",
    RAW_QUERY_EXCECUTOR_PLACEHOLDER: "Enter your SQL query here",
    RAW_QUERY_EXCECUTOR_RESULT_TITLE: "Query result",
    RAW_QUERY_EXCECUTOR_RESULT_PLACEHOLDER: "No results to display",
    RAW_QUERY_EXCECUTOR_RESULT_PLACEHOLDER_ERROR: "Error executing query",

    VIEW_AUDIT_LOGS_TITLE: "Audit logs",

    ADD_LISTENER_FORM_TITLE: "Create new listener",
    UPDATE_LISTENER_FORM_TITLE: "Update listener",
    ADD_LISTENER_SUBMIT_BUTTON_TEXT: "Save",
    UPDATE_LISTENER_SUBMIT_BUTTON_TEXT: "Update listener",
    LISTENER_ADDED_SUCCESS: "Listener created successfully",
    LISTENER_UPDATED_SUCCESS: "Listener updated successfully",
    LISTENER_DELETED_SUCCESS: "Listener deleted successfully",
    DELETE_LISTENER_DIALOG_TITLE: "Delete listener",
    DELETE_LISTENER_DIALOG_MESSAGE:
      "Are you sure you want to delete this listener? This action cannot be undone.",

    CLONE_LISTENER_CLONING_SUCCESS: "Listener cloned successfully!",
    CLONE_LISTENER_DIALOG_TITLE: "Clone listener",
    CLONE_LISTENER_DIALOG_MESSAGE:
      "Are you sure you want to clone this listener? This action cannot be undone.",
    LISTENER_EDITOR_FORM_TITLE_FIELD_LABEL: "Listener name",
    LISTENER_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER: "Your listener's name",
    LISTENER_EDITOR_FORM_DATASOURCE_FIELD_LABEL: "Target data source",
    LISTENER_EDITOR_FORM_TYPE_FIELD_LABEL: "Listener type",
    LISTENER_EDITOR_FORM_STATUS_FIELD_LABEL: "Status",
    LISTENER_EDITOR_FORM_CONFIG_FIELD_LABEL: "Configuration",
    VIEW_CRON_JOB_HISTORY_BUTTON_TEXT: "History",

    DELETE_WORKFLOW_DIALOG_TITLE: "Delete workflow",
    DELETE_WORKFLOW_DIALOG_MESSAGE:
      "Are you sure you want to delete this workflow? This action cannot be undone.",
    WORKFLOW_DELETED_SUCCESS: "Workflow deleted successfully",

    CLONE_WORKFLOW_CLONING_SUCCESS: "Workflow cloned successfully!",
    CLONE_WORKFLOW_DIALOG_TITLE: "Clone workflow",
    CLONE_WORKFLOW_DIALOG_MESSAGE:
      "Are you sure you want to clone this workflow? This action cannot be undone.",

    CLONE_CRON_JOB_CLONING_SUCCESS: "Scheduled job cloned successfully!",
    CLONE_CRON_JOB_DIALOG_TITLE: "Clone scheduled job",
    CLONE_CRON_JOB_DIALOG_MESSAGE:
      "Are you sure you want to clone this scheduled job? This action cannot be undone.",

    CLONE_API_KEY_CLONING_SUCCESS: "API key cloned successfully!",
    CLONE_API_KEY_DIALOG_TITLE: "Clone API key",
    CLONE_API_KEY_DIALOG_MESSAGE:
      "Are you sure you want to clone this API key? This action cannot be undone.",

    UPDATE_WORKFLOW_FORM_TITLE: "Update workflow",
    UPDATE_WORKFLOW_BUTTON_TEXT: "Update workflow",
    MAIN_DRAWER_ENGINES_TITLE: "Engines",
  },

  LOCAL_STORAGE_KEYS: {
    TENANT: "TENANT",
  },

  ROUTES: {
    SIGN_UP: {
      code: "/sign-up/*",
      path: () => "/sign-up",
      title: "Sign Up",
    },
    SIGN_IN: {
      code: "/sign-in/*",
      path: () => "/sign-in",
      title: "Sign In",
    },
    HOME: {
      code: "/",
      path: () => "/",
      title: "Home",
    },
    VIEW_TENANT: {
      code: "/tenants/:tenantID/",
      path: (tenantID) => `/tenants/${tenantID}/`,
      title: "Tenant",
    },
    ADD_TENANT: {
      code: "/tenants/add",
      path: () => "/tenants/add",
      title: "Add Tenant",
    },
    UPDATE_TENANT: {
      code: "/tenants/:tenantID/settings",
      path: (tenantID) => `/tenants/${tenantID}/settings`,
      title: "Tenant Settings",
    },
    VIEW_WORKFLOWS: {
      code: "/tenants/:tenantID/workflows",
      path: (tenantID) => `/tenants/${tenantID}/workflows`,
      title: "Workflows",
    },
    ADD_WORKFLOW: {
      code: "/tenants/:tenantID/workflows/add",
      path: (tenantID) => `/tenants/${tenantID}/workflows/add`,
      title: "Add Workflow",
    },
    WORKFLOW_BUILDER: {
      code: "/tenants/:tenantID/workflows/:workflowID/editor",
      path: (tenantID, workflowID) =>
        `/tenants/${tenantID}/workflows/${workflowID}/editor`,
      title: "Workflow Editor",
    },
    UPDATE_WORKFLOW_BY_ID: {
      code: "/tenants/:tenantID/workflows/:workflowID",
      path: (tenantID, workflowID) =>
        `/tenants/${tenantID}/workflows/${workflowID}`,
      title: "Edit Workflow",
    },
    VIEW_WORKFLOW_RUNS: {
      code: "/tenants/:tenantID/workflows/history",
      path: (tenantID) => `/tenants/${tenantID}/workflows/history`,
      title: "Workflow Runs",
    },
    VIEW_WORKFLOW_RUN_HISTORY_BY_ID: {
      code: "/tenants/:tenantID/workflows/:workflowID/history",
      path: (tenantID, workflowID) =>
        `/tenants/${tenantID}/workflows/${workflowID}/history`,
      title: "Run History",
    },
    VIEW_WORKFLOW_RUN_DETAILS_BY_ID: {
      code: "/tenants/:tenantID/workflows/runs/:runID",
      path: (tenantID, runID) =>
        `/tenants/${tenantID}/workflows/runs/${runID}`,
      title: "Run Details",
    },
    VIEW_LISTENERS: {
      code: "/tenants/:tenantID/listeners",
      path: (tenantID) => `/tenants/${tenantID}/listeners`,
      title: "Listeners",
    },
    ADD_LISTENER: {
      code: "/tenants/:tenantID/listeners/add",
      path: (tenantID) => `/tenants/${tenantID}/listeners/add`,
      title: "Add Listener",
    },
    UPDATE_LISTENER_BY_ID: {
      code: "/tenants/:tenantID/listeners/:listenerID",
      path: (tenantID, listenerID) =>
        `/tenants/${tenantID}/listeners/${listenerID}`,
      title: "Edit Listener",
    },
    ADD_DATASOURCE: {
      code: "/tenants/:tenantID/datasources/add",
      path: (tenantID) => `/tenants/${tenantID}/datasources/add`,
      title: "Add Datasource",
    },
    VIEW_DATASOURCES: {
      code: "/tenants/:tenantID/datasources",
      path: (tenantID) => `/tenants/${tenantID}/datasources`,
      title: "Datasources",
    },
    UPDATE_DATASOURCE_BY_ID: {
      code: "/tenants/:tenantID/datasources/:datasourceID",
      path: (tenantID, datasourceID) =>
        `/tenants/${tenantID}/datasources/${datasourceID}`,
      title: "Edit Datasource",
    },
    ADD_DATA_QUERY: {
      code: "/tenants/:tenantID/queries/add",
      path: (tenantID) => `/tenants/${tenantID}/queries/add`,
      title: "Add Query",
    },
    VIEW_QUERIES: {
      code: "/tenants/:tenantID/queries",
      path: (tenantID) => `/tenants/${tenantID}/queries`,
      title: "Data Queries",
    },
    UPDATE_DATA_QUERY_BY_ID: {
      code: "/tenants/:tenantID/queries/:dataQueryID",
      path: (tenantID, dataQueryID) =>
        `/tenants/${tenantID}/queries/${dataQueryID}`,
      title: "Edit Query",
    },
    ADD_WIDGET: {
      code: "/tenants/:tenantID/widgets/add",
      path: (tenantID) => `/tenants/${tenantID}/widgets/add`,
      title: "Add Widget",
    },
    VIEW_WIDGETS: {
      code: "/tenants/:tenantID/widgets",
      path: (tenantID) => `/tenants/${tenantID}/widgets`,
      title: "Widgets",
    },
    UPDATE_WIDGET_BY_ID: {
      code: "/tenants/:tenantID/widgets/:widgetID",
      path: (tenantID, widgetID) => `/tenants/${tenantID}/widgets/${widgetID}`,
      title: "Edit Widget",
    },
    ADD_APP_PAGE: {
      code: "/tenants/:tenantID/app-pages/add",
      path: (tenantID) => `/tenants/${tenantID}/app-pages/add`,
      title: "Add App Page",
    },
    VIEW_APP_PAGES: {
      code: "/tenants/:tenantID/app-pages",
      path: (tenantID) => `/tenants/${tenantID}/app-pages`,
      title: "App Pages",
    },
    UPDATE_APP_PAGE_BY_ID: {
      code: "/tenants/:tenantID/app-pages/:appPageID",
      path: (tenantID, appPageID) =>
        `/tenants/${tenantID}/app-pages/${appPageID}`,
      title: "Edit App Page",
    },
    VIEW_TENANT_USERS: {
      code: "/tenants/:tenantID/users/",
      path: (tenantID) => `/tenants/${tenantID}/users`,
      title: "User Management",
    },
    UPDATE_TENANT_USER_BY_ID: {
      code: "/tenants/:tenantID/users/:tenantUserID",
      path: (tenantID, tenantUserID) =>
        `/tenants/${tenantID}/users/${tenantUserID}`,
      title: "Edit User",
    },
    VIEW_TENANT_ROLES: {
      code: "/tenants/:tenantID/roles/",
      path: (tenantID) => `/tenants/${tenantID}/roles`,
      title: "Role Management",
    },
    ADD_TENANT_ROLE: {
      code: "/tenants/:tenantID/roles/add",
      path: (tenantID) => `/tenants/${tenantID}/roles/add`,
      title: "Add Role",
    },
    UPDATE_TENANT_ROLE_BY_ID: {
      code: "/tenants/:tenantID/roles/:tenantRoleID",
      path: (tenantID, tenantRoleID) =>
        `/tenants/${tenantID}/roles/${tenantRoleID}`,
      title: "Edit Role",
    },
    ACCOUNT: {
      code: "/account",
      path: () => "/account",
      title: "Account",
    },
    CONTACT: {
      code: "/contact-us",
      path: () => "/contact-us",
      title: "Contact Us",
    },
    LEGAL: {
      code: "/terms",
      path: () => "/terms",
      title: "Terms",
    },
    VIEW_DATABASE_NOTIFICATIONS: {
      code: "/tenants/:tenantID/notifications",
      path: (tenantID) => `/tenants/${tenantID}/notifications`,
      title: "Notifications",
    },
    ADD_DATABASE_NOTIFICATION: {
      code: "/tenants/:tenantID/notifications/add",
      path: (tenantID) => `/tenants/${tenantID}/notifications/add`,
      title: "Add Notification",
    },
    UPDATE_DATABASE_NOTIFICATION_BY_ID: {
      code: "/tenants/:tenantID/notifications/:databaseNotificationID",
      path: (tenantID, databaseNotificationID) =>
        `/tenants/${tenantID}/notifications/${databaseNotificationID}`,
      title: "Edit Notification",
    },
    VIEW_API_KEYS: {
      code: "/tenants/:tenantID/apikeys",
      path: (tenantID) => `/tenants/${tenantID}/apikeys`,
      title: "API Keys",
    },
    ADD_API_KEY: {
      code: "/tenants/:tenantID/apikeys/add",
      path: (tenantID) => `/tenants/${tenantID}/apikeys/add`,
      title: "Add API Key",
    },
    UPDATE_API_KEY_BY_ID: {
      code: "/tenants/:tenantID/apikeys/:apiKeyID",
      path: (tenantID, apiKeyID) => `/tenants/${tenantID}/apikeys/${apiKeyID}`,
      title: "Edit API Key",
    },
    VIEW_CRON_JOBS: {
      code: "/tenants/:tenantID/cronjobs",
      path: (tenantID) => `/tenants/${tenantID}/cronjobs`,
      title: "Scheduled Jobs",
    },
    ADD_CRON_JOB: {
      code: "/tenants/:tenantID/cronjobs/add",
      path: (tenantID) => `/tenants/${tenantID}/cronjobs/add`,
      title: "Add Scheduled Job",
    },
    UPDATE_CRON_JOB_BY_ID: {
      code: "/tenants/:tenantID/cronjobs/:cronJobID",
      path: (tenantID, cronJobID) =>
        `/tenants/${tenantID}/cronjobs/${cronJobID}`,
      title: "Edit Scheduled Job",
    },
    VIEW_CRON_JOB_HISTORY_BY_ID: {
      code: "/tenants/:tenantID/cronjobs/:cronJobID/history",
      path: (tenantID, cronJobID) =>
        `/tenants/${tenantID}/cronjobs/${cronJobID}/history`,
      title: "Job History",
    },
    VIEW_AUDIT_LOGS: {
      code: "/tenants/:tenantID/audit",
      path: (tenantID) => `/tenants/${tenantID}/audit`,
      title: "Audit Logs",
    },
    VIEW_ENGINES: {
      code: "/tenants/:tenantID/engines",
      path: (tenantID) => `/tenants/${tenantID}/engines`,
      title: "Engines",
    },
  },

  APIS: {
    LISTENER: {
      getAllListenersAPI: (tenantID) => `/api/v1/tenants/${tenantID}/listeners`,
      createListenerAPI: (tenantID) => `/api/v1/tenants/${tenantID}/listeners`,
      getListenerByIDAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}`,
      updateListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}`,
      deleteListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}`,
      activateListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/activate`,
      deactivateListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/deactivate`,
      cloneListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/clone`,
      addListenerActionAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions`,
      updateListenerActionAPI: (tenantID, listenerID, actionID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions/${actionID}`,
      deleteListenerActionAPI: (tenantID, listenerID, actionID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions/${actionID}`,
      getConnectionStatusAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/listeners/status/connections`,
    },
    WORKFLOW: {
      getAllWorkflowsAPI: (tenantID) => `/api/v1/tenants/${tenantID}/workflows`,
      createWorkflowAPI: (tenantID) => `/api/v1/tenants/${tenantID}/workflows`,
      getWorkflowByIDAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}`,
      updateWorkflowAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}`,
      deleteWorkflowAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}`,
      cloneWorkflowAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}/clone`,
      executeWorkflowAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}/execute`,
      getWorkflowRunHistoryAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/workflows/instances`,
      testWorkflowAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/workflows/test`,
      getWorkflowRunStatusAPI: (tenantID, instanceID) =>
        `/api/v1/tenants/${tenantID}/workflows/instances/${instanceID}`,
      stopTestWorkflowAPI: (tenantID, instanceID) =>
        `/api/v1/tenants/${tenantID}/workflows/instances/${instanceID}/stop`,
      getWorkflowRunStatusForWidgetAPI: (tenantID, instanceID) =>
        `/api/v1/tenants/${tenantID}/workflows/instances/${instanceID}/widget`,
      getDataCollectionRequestAPI: (tenantID, collectionRequestID) =>
        `/api/v1/tenants/${tenantID}/workflows/data-collection/${collectionRequestID}`,
      submitDataCollectionAPI: (tenantID, collectionRequestID) =>
        `/api/v1/tenants/${tenantID}/workflows/data-collection/${collectionRequestID}/submit`,
    },
    BUNDLE: {
      exportAppPageAPI: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}/export`,
      exportWorkflowAPI: (tenantID, workflowID) =>
        `/api/v1/tenants/${tenantID}/workflows/${workflowID}/export`,
      exportDataQueryAPI: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}/export`,
      exportWidgetAPI: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}/export`,
      exportListenerAPI: (tenantID, listenerID) =>
        `/api/v1/tenants/${tenantID}/listeners/${listenerID}/export`,
      exportDatasourceAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}/export`,
      previewImportAPI: (tenantID) => `/api/v1/tenants/${tenantID}/import/preview`,
      executeImportAPI: (tenantID) => `/api/v1/tenants/${tenantID}/import/execute`,
    },
    FOLDER: {
      getAllFoldersAPI: (tenantID, entityType) =>
        `/api/v1/tenants/${tenantID}/folders?entityType=${entityType}`,
      createFolderAPI: (tenantID) => `/api/v1/tenants/${tenantID}/folders`,
      updateFolderAPI: (tenantID, folderID) => `/api/v1/tenants/${tenantID}/folders/${folderID}`,
      deleteFolderAPI: (tenantID, folderID) => `/api/v1/tenants/${tenantID}/folders/${folderID}`,
      moveEntitiesAPI: (tenantID) => `/api/v1/tenants/${tenantID}/folders/move`,
    },
    WIDGET_LIBRARY: {
      getAllWidgetsAPI: (tenantID) => `/api/v1/tenants/${tenantID}/widget-library`,
      publishWidgetAPI: (tenantID) => `/api/v1/tenants/${tenantID}/widget-library`,
      unpublishWidgetAPI: (tenantID, libraryEntryID) =>
        `/api/v1/tenants/${tenantID}/widget-library/${libraryEntryID}`,
      previewInstallAPI: (tenantID, libraryEntryID) =>
        `/api/v1/tenants/${tenantID}/widget-library/${libraryEntryID}/preview`,
      installWidgetAPI: (tenantID, libraryEntryID) =>
        `/api/v1/tenants/${tenantID}/widget-library/${libraryEntryID}/install`,
    },
    AUTH: {
      getUserInfoAPI: () => "/api/v1/auth",
      getUserConfigAPI: (tenantID) => `/api/v1/auth/config/${tenantID}`,
      updateUserConfigAPI: (tenantID) => `/api/v1/auth/config/${tenantID}`,
      regenerateAPIKey: () => "/api/auth/api_key",
    },
    TENANT: {
      getUserTenantByIDAPI: (tenantID) => `/api/v1/tenants/${tenantID}`,
      testTenantDatabaseConnectionAPI: () => `/api/v1/tenants/dbtest`,
      getAllUserTenantsAPI: () => "/api/v1/tenants",
      createNewTenantAPI: () => "/api/v1/tenants",
      updateTenantAPI: (tenantID) => `/api/v1/tenants/${tenantID}`,
      getAllTenantUsersAPI: (tenantID) => `/api/v1/tenants/${tenantID}/users`,
      deleteUserTenantByIDAPI: (tenantID) => `/api/v1/tenants/${tenantID}`,
      uploadTenantLogoAPI: () => "/api/v1/tenants/upload-logo",
      getTenantAIConfigAPI: (tenantID) => `/api/v1/tenants/${tenantID}/ai-config`,
      updateTenantAIConfigAPI: (tenantID) => `/api/v1/tenants/${tenantID}/ai-config`,
    },
    TENANT_ROLE: {
      getAllTenantRolesAPI: (tenantID) => `/api/v1/tenants/${tenantID}/roles`,
      getAllTenantPermissionsAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/roles/permissions`,
      addTenantRoleAPI: (tenantID) => `/api/v1/tenants/${tenantID}/roles`,
      getTenantRoleByIDAPI: (tenantID, tenantRoleID) =>
        `/api/v1/tenants/${tenantID}/roles/${tenantRoleID}`,
      updateTenantRoleByIDAPI: (tenantID, tenantRoleID) =>
        `/api/v1/tenants/${tenantID}/roles/${tenantRoleID}`,
      deleteTenantRoleByIDAPI: (tenantID, tenantRoleID) =>
        `/api/v1/tenants/${tenantID}/roles/${tenantRoleID}`,
    },
    USER_MANAGEMENT: {
      getAllTenantUsersAPI: (tenantID, page, pageSize) =>
        `/api/v1/tenants/${tenantID}/users?page=${page}&pageSize=${pageSize}`,
      addUserToTenantAPI: (tenantID) => `/api/v1/tenants/${tenantID}/users`,
      getTenantUserByIDAPI: (tenantID, tenantUserID) =>
        `/api/v1/tenants/${tenantID}/users/${tenantUserID}`,
      updateTenantUserByIDAPI: (tenantID, tenantUserID) =>
        `/api/v1/tenants/${tenantID}/users/${tenantUserID}`,
      updateTenantUserRolesByIDAPI: (tenantID, tenantUserID) =>
        `/api/v1/tenants/${tenantID}/users/${tenantUserID}/roles`,
      removeTenantUserByIDAPI: (tenantID, tenantUserID) =>
        `/api/v1/tenants/${tenantID}/users/${tenantUserID}`,
    },
    API_KEY: {
      getAllAPIKeysAPI: (tenantID, page, pageSize) =>
        `/api/v1/tenants/${tenantID}/apikeys?page=${page}&pageSize=${pageSize}`,
      createAPIKeyAPI: (tenantID) => `/api/v1/tenants/${tenantID}/apikeys/`,
      getAPIKeyByIDAPI: (tenantID, apiKeyID) =>
        `/api/v1/tenants/${tenantID}/apikeys/${apiKeyID}`,
      updateAPIKeyByIDAPI: (tenantID, apiKeyID) =>
        `/api/v1/tenants/${tenantID}/apikeys/${apiKeyID}`,
      updateAPIKeyRolesByIDAPI: (tenantID, apiKeyID) =>
        `/api/v1/tenants/${tenantID}/apikeys/${apiKeyID}/roles`,
      deleteAPIKeyByIDAPI: (tenantID, apiKeyID) =>
        `/api/v1/tenants/${tenantID}/apikeys/${apiKeyID}`,
      cloneAPIKeyAPI: (tenantID, apiKeyID) =>
        `/api/v1/tenants/${tenantID}/apikeys/${apiKeyID}/clone`,
    },
    CRON_JOB: {
      getAllCronJobsAPI: (tenantID, page, pageSize) =>
        `/api/v1/tenants/${tenantID}/cronjobs?page=${page}&pageSize=${pageSize}`,
      createCronJobAPI: (tenantID) => `/api/v1/tenants/${tenantID}/cronjobs/`,
      getCronJobByIDAPI: (tenantID, jobID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}`,
      getCronJobHistoryByIDAPI: (tenantID, jobID, page, pageSize) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}/history?page=${page}&pageSize=${pageSize}`,
      updateCronJobByIDAPI: (tenantID, jobID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}`,
      updateCronJobRolesByIDAPI: (tenantID, jobID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}/roles`,
      deleteCronJobByIDAPI: (tenantID, jobID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}`,
      cloneCronJobAPI: (tenantID, jobID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/${jobID}/clone`,
      getConnectionStatusAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/cronjobs/status/connections`,
    },
    AUDIT_LOG: {
      getAuditLogsAPI: (tenantID, page, pageSize, dateFrom, dateTo) => {
        let url = `/api/v1/tenants/${tenantID}/audit?page=${page}&pageSize=${pageSize}`;
        if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
        if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;
        return url;
      },
      exportAuditLogsAPI: (tenantID, dateFrom, dateTo) => {
        let url = `/api/v1/tenants/${tenantID}/audit/export`;
        const params = [];
        if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
        if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
        if (params.length) url += `?${params.join("&")}`;
        return url;
      },
    },
    OAUTH: {
      getAuthUrlAPI: (provider, tenantID) =>
        `/api/v1/oauth/${provider}/auth/${tenantID}`,
    },
    DATASOURCE: {
      getAllDatasourcesAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/datasources`,
      createDatasourceAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/datasources`,
      getDatasourceByIDAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}`,
      updateDatasourceByIDAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}`,
      deleteDatasourceByIDAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}`,
      testDatasourceConnectionAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/datasources/test`,
      cloneDatasourceByIDAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}/clone`,
      uploadDatasourceFileAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/datasources/upload`,
      proxyDatasourceActionAPI: (tenantID, datasourceID) =>
        `/api/v1/tenants/${tenantID}/datasources/${datasourceID}/proxy`,
    },
    DATABASE: {
      getAllDataQueriesAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/queries/`,

      createDataQueryAPI: (tenantID) => `/api/v1/tenants/${tenantID}/queries/`,
      createBulkDataQueryAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/queries/bulk`,

      testDataQueryAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/queries/queryTest`,
      getDataQueryByID: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}`,
      cloneDataQueryByID: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}/clone`,
      testDataQueryByIDAPI: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}/queryTest`,
      runDataQueryByIDAPI: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}/run`,
      testDataQueryByDataAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/queries/queryTest`,
      generateAIPromptBasedQueryAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/queries/aigenerate`,
      updateDataQueryByID: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}`,
      deleteDataQueryByID: (tenantID, dataQueryID) =>
        `/api/v1/tenants/${tenantID}/queries/${dataQueryID}`,

      getAllWidgetsAPI: (tenantID) => `/api/v1/tenants/${tenantID}/widgets/`,

      createWidgetAPI: (tenantID) => `/api/v1/tenants/${tenantID}/widgets/`,
      getWidgetByIDAPI: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}`,
      cloneWidgetByIDAPI: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}/clone`,
      updateWidgetByIDAPI: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}`,
      getWidgetDataByIDAPI: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}/data`,
      getWidgetDataUsingWidgetAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/widgets/data`,
      deleteWidgetByID: (tenantID, widgetID) =>
        `/api/v1/tenants/${tenantID}/widgets/${widgetID}`,
      uploadWidgetFileAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/widgets/upload`,

      getAllAppPagesAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/app-pages/`,
      createAppPageAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/app-pages/`,
      getAppPageByIDAPI: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}`,
      cloneAppPageByIDAPI: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}/clone`,
      updateAppPageByIDAPI: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}`,
      deleteAppPageByID: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}`,
      getAppPageVersionsAPI: (tenantID, appPageID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}/versions`,
      getAppPageVersionByIDAPI: (tenantID, appPageID, versionID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}/versions/${versionID}`,
      restoreAppPageVersionAPI: (tenantID, appPageID, versionID) =>
        `/api/v1/tenants/${tenantID}/app-pages/${appPageID}/versions/${versionID}/restore`,
      getAllDatabaseNotificationsAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/database/notifications`,
      getDatabaseNotificationByIDAPI: (tenantID, databaseNotificationID) =>
        `/api/v1/tenants/${tenantID}/database/notifications/${databaseNotificationID}`,
      createDatabaseNotificationAPI: (tenantID) =>
        `/api/v1/tenants/${tenantID}/database/notifications`,
      deleteDatabaseNotificationByIDAPI: (tenantID, databaseNotificationID) =>
        `/api/v1/tenants/${tenantID}/database/notifications/${databaseNotificationID}`,
      updateDatabaseNotificationByID: (tenantID, databaseNotificationID) =>
        `/api/v1/tenants/${tenantID}/database/notifications/${databaseNotificationID}`,
    },
    AI: {
      chat: (tenantID) => `/api/v1/tenants/${tenantID}/ai/chat`,
      chatStream: (tenantID) => `/api/v1/tenants/${tenantID}/ai/chat/stream`,
      session: (tenantID) => `/api/v1/tenants/${tenantID}/ai/session`,
      action: (tenantID) => `/api/v1/tenants/${tenantID}/ai/action`,
    },
  },

  ERROR_CODES: {
    CANNOT_EDIT_ROW_WHILE_ADDING: {
      code: "CANNOT_EDIT_ROW_WHILE_ADDING",
      message: "Cannot edit other rows while adding row",
    },
    PERMISSION_DENIED: {
      code: "PERMISSION_DENIED",
      message: "Permission denied",
    },
    SERVER_ERROR: {
      code: "SERVER_ERROR",
      message: "Server error",
    },
    INVALID_USER: {
      code: "INVALID_USER",
      message: "User not found",
    },
    USER_ALREADY_EXISTS: {
      code: "USER_ALREADY_EXISTS",
      message: "User already exists, please login instead",
    },

    PASSWORD_DOES_NOT_MATCH: {
      code: "PASSWORD_DOES_NOT_MATCH",
      message: "Password does not match",
    },

    INVALID_CREDENTIALS: {
      code: "INVALID_CREDENTIALS",
      message: "User credentials are not correct",
    },
    INVALID_REQUEST: {
      code: "INVALID_REQUEST",
      message: "Invalid request",
    },
    USER_AUTH_TOKEN_EXPIRED: {
      code: "USER_AUTH_TOKEN_EXPIRED",
      message: "User auth token expired",
    },
    USER_AUTH_TOKEN_NOT_FOUND: {
      code: "USER_AUTH_TOKEN_NOT_FOUND",
      message: "User auth token not found",
    },
  },

  USER_CONFIG_KEYS: {
    DEFAULT_APP_PAGE_ID: "DEFAULT_APP_PAGE_ID",
  },
  REACT_QUERY_KEYS: {
    DB_USER: "DB_USER",
    DB_USER_CONFIG: "DB_USER_CONFIG",
    TENANTS: "TENANTS",
    TENANT_USERS: (tenantID) => `${tenantID}-TENANT_USERS`,
    TENANT_ROLES: (tenantID) => `${tenantID}-TENANT_ROLES`,
    TENANT_PERMISSIONS: (tenantID) => `${tenantID}-TENANT_PERMISSIONS`,
    LISTENERS: (tenantID) => `${tenantID}-LISTENERS`,

    DATASOURCES: (tenantID) => `${tenantID}-DATASOURCES`,

    QUERIES: (tenantID) => `${tenantID}-QUERIES`,

    QUERIES_CHECK: (tenantID) => `${tenantID}-QUERIES_CHECK`,

    WIDGETS: (tenantID) => `${tenantID}-WIDGETS`,

    WORKFLOWS: (tenantID) => `${tenantID}-WORKFLOWS`,

    WORKFLOW_RUNS: (tenantID) => `${tenantID}-WORKFLOW_RUNS`,

    APP_PAGES: (tenantID) => `${tenantID}-APP_PAGES`,

    CUSTOMER_PLAN: "CUSTOMER_PLAN",
    FORMS: "FORMS",
    FORM_SUBMISSIONS: "FORM_SUBMISSIONS",
    DATABASE_API_KEYS: (tenantID) => `${tenantID}-DATABASE_API_KEYS`,
    DATABASE_CRON_JOBS: (tenantID) => `${tenantID}-DATABASE_CRON_JOBS`,
    AUDIT_LOGS: (tenantID) => `${tenantID}-AUDIT_LOGS`,
    FOLDERS: (tenantID, entityType) => `${tenantID}-FOLDERS-${entityType}`,
    WIDGET_LIBRARY: "WIDGET_LIBRARY",
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

  CRON_JOB_HISTORY_COLUMN_TYPES: {
    cronJobHistoryID: "number",
    cronJobID: "number",
    status: "string",
    scheduledAt: "date",
    startTime: "date",
    endTime: "date",
    durationMs: "number",
    result: "object",
    triggerType: "string",
    createdAt: "date",
    updatedAt: "date",
  },

  JS_DATA_TYPES: {
    STRING: "string",
    BOOLEAN: "boolean",
    NUMBER: "number",
    BIGINT: "bigint",
    DATE: "date",
    OBJECT: "object",
  },

  POSTGRE_SQL_DATA_TYPES: {
    bool: {
      name: "bool",
      value: "Boolean value (TRUE, FALSE, or NULL)",
      js_type: "boolean",
      normalizedType: "Boolean",
    },
    int2: {
      name: "int2",
      value: "Small integer (-32,768 to 32,767)",
      js_type: "number",
      normalizedType: "Int",
    },
    int4: {
      name: "int4",
      value: "Integer (-2,147,483,648 to 2,147,483,647)",
      js_type: "number",
      normalizedType: "Int",
    },
    int8: {
      name: "int8",
      value:
        "Large integer (-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807)",
      js_type: "bigint",
      normalizedType: "BigInt",
    },
    numeric: {
      name: "numeric",
      value: "Exact numeric of variable precision and scale",
      js_type: "number",
      normalizedType: "Decimal",
    },
    float4: {
      name: "float4",
      value:
        "Single-precision floating-point number (approximately ±1.18 x 10^-38 to ±3.4 x 10^38)",
      js_type: "number",
      normalizedType: "Float",
    },
    float8: {
      name: "float8",
      value:
        "Double-precision floating-point number (approximately ±2.23 x 10^-308 to ±1.8 x 10^308)",
      js_type: "number",
      normalizedType: "Float",
    },
    serial: {
      name: "serial",
      value: "Auto-incrementing integer (typically used for primary keys)",
      js_type: "number",
      normalizedType: "Int",
    },
    bigserial: {
      name: "bigserial",
      value: "Auto-incrementing big integer (typically used for primary keys)",
      js_type: "bigint",
      normalizedType: "BigInt",
    },
    money: {
      name: "money",
      value: "Currency amounts with a fixed decimal point",
      js_type: "number",
      normalizedType: "Decimal",
    },
    bpchar: {
      name: "bpchar",
      value: "Fixed-length character string with length n",
      js_type: "string",
      normalizedType: "String",
    },
    varchar: {
      name: "varchar",
      value: "Variable-length character string with maximum length n",
      js_type: "string",
      normalizedType: "String",
    },
    text: {
      name: "text",
      value: "Variable-length character string with no maximum length",
      js_type: "string",
      normalizedType: "String",
    },
    _text: {
      name: "_text",
      value: "Array of values (e.g., text[])",
      js_type: "array",
      normalizedType: "String",
    },
    _varchar: {
      name: "_varchar",
      value: "Array of varchar values (e.g., varchar[])",
      js_type: "array",
      normalizedType: "String",
    },
    bytea: {
      name: "bytea",
      value: "Binary data (byte array)",
      js_type: "Uint8Array",
      normalizedType: "Bytes",
    },
    date: {
      name: "date",
      value: "Calendar date (YYYY-MM-DD)",
      js_type: "date",
      normalizedType: "DateTime",
    },
    time: {
      name: "time",
      value: "Time of day without time zone (HH:MM:SS)",
      js_type: "string",
      normalizedType: "DateTime",
    },
    timetz: {
      name: "timetz",
      value: "Time of day with time zone (HH:MM:SS+/-TZ)",
      js_type: "string",
      normalizedType: "DateTime",
    },
    timestamp: {
      name: "timestamp",
      value: "Date and time without time zone (YYYY-MM-DD HH:MM:SS)",
      js_type: "date",
      normalizedType: "DateTime",
    },
    timestamptz: {
      name: "timestamptz",
      value: "Date and time with time zone (YYYY-MM-DD HH:MM:SS+/-TZ)",
      js_type: "date",
      normalizedType: "DateTime",
    },
    interval: {
      name: "interval",
      value: "Time span (e.g., '1 year 2 months 3 days')",
      js_type: "string",
      normalizedType: "String",
    },
    uuid: {
      name: "uuid",
      value: "Universally unique identifier (128-bit number)",
      js_type: "string",
      normalizedType: "String",
    },
    json: {
      name: "json",
      value: "JSON data (text format)",
      js_type: "object",
      normalizedType: "Json",
    },
    jsonb: {
      name: "jsonb",
      value: "Binary JSON data (more efficient storage and querying)",
      js_type: "object",
      normalizedType: "Json",
    },
    xml: {
      name: "xml",
      value: "XML data",
      js_type: "string",
      normalizedType: "String",
    },
    _array: {
      name: "array",
      value: "Array of values (e.g., integer[], text[])",
      js_type: "Array",
      normalizedType: "String",
    },
    hstore: {
      name: "hstore",
      value: "Key-value pairs (used for storing sets of key-value pairs)",
      js_type: "object",
      normalizedType: "Json",
    },
    point: {
      name: "point",
      value: "Geometric point (x, y)",
      js_type: "string",
      normalizedType: "String",
    },
    line: {
      name: "line",
      value: "Geometric line",
      js_type: "string",
      normalizedType: "String",
    },
    lseg: {
      name: "lseg",
      value: "Geometric line segment",
      js_type: "string",
      normalizedType: "String",
    },
    box: {
      name: "box",
      value: "Geometric box",
      js_type: "string",
      normalizedType: "String",
    },
    path: {
      name: "path",
      value: "Geometric path",
      js_type: "string",
      normalizedType: "String",
    },
    polygon: {
      name: "polygon",
      value: "Geometric polygon",
      js_type: "string",
      normalizedType: "String",
    },
    circle: {
      name: "circle",
      value: "Geometric circle",
      js_type: "string",
      normalizedType: "String",
    },
    cidr: {
      name: "cidr",
      value: "CIDR notation for IP addresses",
      js_type: "string",
      normalizedType: "String",
    },
    inet: {
      name: "inet",
      value: "IP address",
      js_type: "string",
      normalizedType: "String",
    },
    macaddr: {
      name: "macaddr",
      value: "MAC address",
      js_type: "string",
      normalizedType: "String",
    },
    network: {
      name: "network",
      value: "Network address",
      js_type: "string",
      normalizedType: "String",
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

  TABLE_COLUMN_SORT: {
    asc: "asc",
    desc: "desc",
    none: "none",
  },

  TABLE_FOREIGN_KEY_ACTIONS: [
    "NO ACTION",
    "RESTRICT",
    "CASCADE",
    "SET NULL",
    "SET DEFAULT",
  ],

  RESIZABLE_PANEL_KEYS: {
    WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION:
      "WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION",
    MAIN_DRAWER_LIST_SEPARATION: "MAIN_DRAWER_LIST_SEPARATION",
    WORKFLOW_LAYOUT_SEPARATION: "WORKFLOW_LAYOUT_SEPARATION",
    QUERY_ADDITION_FORM_RESULT_SEPARATION:
      "QUERY_ADDITION_FORM_RESULT_SEPARATION",
    QUERY_UPDATION_FORM_RESULT_SEPARATION:
      "QUERY_UPDATION_FORM_RESULT_SEPARATION",
    DATASOURCE_ADDITION_FORM_RESULT_SEPARATION:
      "DATASOURCE_ADDITION_FORM_RESULT_SEPARATION",
    DATASOURCE_UPDATION_FORM_RESULT_SEPARATION:
      "DATASOURCE_UPDATION_FORM_RESULT_SEPARATION",
    RAW_QUERY_EXECUTION_FORM_RESULT_SEPARATION:
      "RAW_QUERY_EXECUTION_FORM_RESULT_SEPARATION",
    QUERY_ADDITION_FORM_QUERY_EDITOR_SEPARATION:
      "QUERY_ADDITION_FORM_QUERY_EDITOR_SEPARATION",
    DATABASE_TRIGGER_LAYOUT_SEPARATION: "DATABASE_TRIGGER_LAYOUT_SEPARATION",
    DATABASE_TABLE_LAYOUT_SEPARATION: "DATABASE_TABLE_LAYOUT_SEPARATION",
    DATA_QUERY_LAYOUT_SEPARATION: "DATA_QUERY_LAYOUT_SEPARATION",
    DATASOURCE_LAYOUT_SEPARATION: "DATASOURCE_LAYOUT_SEPARATION",
    WIDGET_LAYOUT_SEPARATION: "WIDGET_LAYOUT_SEPARATION",
    DASHBOARD_LAYOUT_SEPARATION: "DASHBOARD_LAYOUT_SEPARATION",
    WIDGET_ADDITION_FORM_RESULT_SEPARATION:
      "WIDGET_ADDITION_FORM_RESULT_SEPARATION",
    WIDGET_UPDATION_FORM_RESULT_SEPARATION:
      "WIDGET_UPDATION_FORM_RESULT_SEPARATION",
    WIDGET_IDE_MODAL_SEPARATION:
      "WIDGET_IDE_MODAL_SEPARATION",
    QUERY_TESTING_FORM_QUERY_SEPARATION: "QUERY_TESTING_FORM_QUERY_SEPARATION",
    DASHBOARD_ADDITION_FORM_RESULT_SEPARATION:
      "DASHBOARD_ADDITION_FORM_RESULT_SEPARATION",
    DASHBOARD_UPDATION_FORM_RESULT_SEPARATION:
      "DASHBOARD_UPDATION_FORM_RESULT_SEPARATION",
    APP_PAGE_LAYOUT_SEPARATION: "APP_PAGE_LAYOUT_SEPARATION",
    APP_PAGE_ADDITION_FORM_RESULT_SEPARATION:
      "APP_PAGE_ADDITION_FORM_RESULT_SEPARATION",
    APP_PAGE_UPDATION_FORM_RESULT_SEPARATION:
      "APP_PAGE_UPDATION_FORM_RESULT_SEPARATION",
    DATABASE_NOTIFICATION_LAYOUT_SEPARATION:
      "DATABASE_NOTIFICATION_LAYOUT_SEPARATION",
    DATABASE_CRON_JOB_LAYOUT_SEPARATION: "DATABASE_CRON_JOB_LAYOUT_SEPARATION",
    DATABASE_API_KEY_LAYOUT_SEPARATION: "DATABASE_API_KEY_LAYOUT_SEPARATION",
    LISTENER_LAYOUT_SEPARATION: "LISTENER_LAYOUT_SEPARATION",
    WORKFLOW_EDITOR_CANVAS_TERMINAL_SPLIT:
      "WORKFLOW_EDITOR_CANVAS_TERMINAL_SPLIT",
    WORKFLOW_EDITOR_CONSOLE_CONTEXT_SPLIT:
      "WORKFLOW_EDITOR_CONSOLE_CONTEXT_SPLIT",
    LISTENER_UPDATION_PANEL_LAYOUT:
      "LISTENER_UPDATION_PANEL_LAYOUT",
  },

  RESIZABLE_PANEL_IDS: {
    DATA_QUERY_EDITOR_PANEL: "data-query-editor-panel",
    DATA_QUERY_RESULT_PANEL: "data-query-result-panel",
    DATASOURCE_EDITOR_PANEL: "datasource-editor-panel",
    DATASOURCE_RESULT_PANEL: "datasource-result-panel",
    WORKFLOW_SIDEBAR_PANEL: "workflow-sidebar-panel",
    WORKFLOW_MAIN_PANEL: "workflow-main-panel",
    WORKFLOW_CANVAS_PANEL: "workflow-canvas-panel",
    WORKFLOW_BOTTOM_PANEL: "workflow-bottom-panel",
    WORKFLOW_CONSOLE_PANEL: "workflow-console-panel",
    WORKFLOW_CONTEXT_PANEL: "workflow-context-panel",
    WIDGET_ADDITION_SIDEBAR: "widget-addition-sidebar",
    WIDGET_ADDITION_PREVIEW: "widget-addition-preview",
    WIDGET_EDITOR_SIDEBAR: "widget-editor-sidebar",
    WIDGET_PREVIEW_PANEL: "widget-preview-panel",
    APP_PAGE_ADD_TOP_PANEL: "app-page-add-top-panel",
    APP_PAGE_ADD_EDITOR_PANEL: "app-page-add-editor-panel",
    APP_PAGE_ADD_DROPZONE_PANEL: "app-page-add-dropzone-panel",
    APP_PAGE_ADD_CONSOLE_PANEL: "app-page-add-console-panel",
    APP_PAGE_UPDATE_TOP_PANEL: "app-page-update-top-panel",
    APP_PAGE_UPDATE_EDITOR_PANEL: "app-page-update-editor-panel",
    APP_PAGE_UPDATE_DROPZONE_PANEL: "app-page-update-dropzone-panel",
    APP_PAGE_UPDATE_CONSOLE_PANEL: "app-page-update-console-panel",
  },

  PG_TRIGGER_FORM_TIMING_OPTIONS: ["BEFORE", "AFTER", "INSTEAD OF"],

  PG_TRIGGER_FORM_EVENT_OPTIONS: ["INSERT", "UPDATE", "DELETE", "TRUNCATE"],

  PG_TRIGGER_FORM_FOR_EACH_OPTIONS: ["ROW", "STATEMENT"],

  WIDGET_TYPES: {
    TEXT_WIDGET: {
      name: "Text widget",
      value: "text",
    },
  },
};
