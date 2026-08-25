export const CONSTANTS = {
  SERVER_HOST:
    import.meta.env.VITE_SERVER_HOST ||
    (import.meta.env.DEV ? "http://localhost:8090" : ""),

  APIS: {
    OPERATOR_AUTH: {
      login: () => "/api/v1/operator/auth/login",
      logout: () => "/api/v1/operator/auth/logout",
      me: () => "/api/v1/operator/auth/me",
    },
    OPERATOR_ADMIN: {
      getAllRolesAPI: () => "/api/v1/operator/roles",
      addRoleAPI: () => "/api/v1/operator/roles",
      updateRoleAPI: (roleID) => `/api/v1/operator/roles/${roleID}`,
      deleteRoleAPI: (roleID) => `/api/v1/operator/roles/${roleID}`,
      getAllPermissionsAPI: () => "/api/v1/operator/permissions",
      createPermissionAPI: () => "/api/v1/operator/permissions",
      getAllLibraryWidgetsAPI: () => "/api/v1/operator/widget-library",
      publishWidgetAPI: () => "/api/v1/operator/widget-library",
      unpublishWidgetAPI: (libraryEntryID) =>
        `/api/v1/operator/widget-library/${libraryEntryID}`,
    },
  },

  REACT_QUERY_KEYS: {
    ROLES: "ROLES",
    PERMISSIONS: "PERMISSIONS",
    WIDGET_LIBRARY: "WIDGET_LIBRARY",
  },

  STRINGS: {
    APP_TITLE: "Jet Admin · Platform Admin",
  },
};
