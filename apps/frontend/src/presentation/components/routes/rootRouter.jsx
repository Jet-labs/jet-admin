import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../layouts/rootLayout";
import { CONSTANTS } from "../../../constants";
import { ProtectedLayout } from "../layouts/protectedLayout";
import { DatabaseSchemaLayout } from "../layouts/databaseSchemaLayout";
import { DatabaseTableLayout } from "../layouts/databaseTableLayout";
import { DatabaseTriggerLayout } from "../layouts/databaseTriggerLayout";
import { DataQueryLayout } from "../layouts/dataQueryLayout";
import { UserManagementLayout } from "../layouts/userManagementLayout";
import { RoleManagementLayout } from "../layouts/roleManagementLayout";
import { DashboardLayout } from "../layouts/dashboardLayout";
import { WidgetLayout } from "../layouts/widgetLayout";
import { DatabaseNotificationLayout } from "../layouts/databaseNotificationLayout";
import { APIKeyLayout } from "../layouts/apiKeyLayout";
import { CronJobLayout } from "../layouts/cronJobLayout";
import { DatasourceLayout } from "../layouts/datasourceLayout";
const SignInPage = lazy(() => import("../../pages/signInPage"));
const SignUpPage = lazy(() => import("../../pages/signUpPage"));
const HomePage = lazy(() => import("../../pages/homePage"));
const AccountPage = lazy(() => import("../../pages/accountPage"));
const AddTenantPage = lazy(() => import("../../pages/addTenantPage"));
const UpdateTenantPage = lazy(() => import("../../pages/updateTenantPage"));
const AddSchemaPage = lazy(() => import("../../pages/addSchemaPage"));
const TenantLayoutLandingPage = lazy(() =>
  import("../../pages/tenantLayoutLandingPage")
);
const AddDatabaseTablePage = lazy(() =>
  import("../../pages/addDatabaseTablePage")
);
const AddDatabaseTriggerPage = lazy(() =>
  import("../../pages/addDatabaseTriggerPage")
);
const TableLayoutLandingPage = lazy(() =>
  import("../../pages/tableLayoutLandingPage")
);
const ViewDatabaseTablePage = lazy(() =>
  import("../../pages/viewDatabaseTablePage")
);
const UpdateDatabaseTablePage = lazy(() =>
  import("../../pages/updateDatabaseTablePage")
);
const ViewDatabaseTriggerPage = lazy(() =>
  import("../../pages/viewDatabaseTriggerPage")
);
const TriggerLayoutLandingPage = lazy(() =>
  import("../../pages/triggerLayoutLandingPage")
);
const AddDataQueryPage = lazy(() => import("../../pages/addDataQueryPage"));
const UpdateDataQueryPage = lazy(() =>
  import("../../pages/updateDataQueryPage")
);
const DataQueryLayoutLandingPage = lazy(() =>
  import("../../pages/dataQueryLayoutLandingPage")
);
const DashboardLayoutLandingPage = lazy(() =>
  import("../../pages/dashboardLayoutLandingPage")
);
const AddWidgetPage = lazy(() => import("../../pages/addWidgetPage"));
const UpdateWidgetPage = lazy(() => import("../../pages/updateWidgetPage"));
const WidgetLayoutLandingPage = lazy(() =>
  import("../../pages/widgetLayoutLandingPage")
);
const AddDashboardPage = lazy(() => import("../../pages/addDashboardPage"));
const UpdateDashboardPage = lazy(() =>
  import("../../pages/updateDashboardPage")
);
const UserManagementPage = lazy(() => import("../../pages/userManagementPage"));
const UpdateTenantUserByIDPage = lazy(() =>
  import("../../pages/updateTenantUserByIDPage")
);
const RoleManagementPage = lazy(() => import("../../pages/roleManagementPage"));
const AddTenantRolePage = lazy(() => import("../../pages/addTenantRolePage"));
const UpdateTenantRolePage = lazy(() =>
  import("../../pages/updateTenantRolePage")
);
const AddDatabaseNotificationPage = lazy(() =>
  import("../../pages/addDatabaseNotificationPage")
);
const UpdateDatabaseNotificationPage = lazy(() =>
  import("../../pages/updateDatabaseNotificationPage")
);
const AddAPIKeyPage = lazy(() => import("../../pages/addAPIKeyPage"));
const APIKeyLayoutLandingPage = lazy(() =>
  import("../../pages/apiKeyLayoutLandingPage")
);
const UpdateAPIKeyPage = lazy(() => import("../../pages/updateAPIKeyPage"));
const RawSqlQueryPage = lazy(() => import("../../pages/rawSqlQueryPage"));
const AddCronJobPage = lazy(() => import("../../pages/addCronJobPage"));
const UpdateCronJobPage = lazy(() => import("../../pages/updateCronJobPage"));
const ViewCronJobHistoryPage = lazy(() =>
  import("../../pages/viewCronJobHistoryPage")
);
const CronJobLayoutLandingPage = lazy(() =>
  import("../../pages/cronJobLayoutLandingPage")
);
const DatabaseSchemaLandingPage = lazy(() =>
  import("../../pages/databaseSchemaLandingPage")
);
const ViewAuditLogsPage = lazy(() => import("../../pages/viewAuditLogsPage"));

const DatasourceLayoutLandingPage = lazy(() =>
  import("../../pages/datasourceLayoutLandingPage")
);
const AddDatasourcePage = lazy(() => import("../../pages/addDatasourcePage"));
const UpdateDatasourcePage = lazy(() =>
  import("../../pages/updateDatasourcePage")
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: CONSTANTS.ROUTES.SIGN_IN.code, element: <SignInPage /> },
      { path: CONSTANTS.ROUTES.SIGN_UP.code, element: <SignUpPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: CONSTANTS.ROUTES.HOME.code, element: <HomePage /> },
          {
            path: CONSTANTS.ROUTES.ACCOUNT.code,
            element: <AccountPage />,
          },
          {
            path: CONSTANTS.ROUTES.VIEW_TENANT.code,
            element: <TenantLayoutLandingPage />,
          },
          {
            path: CONSTANTS.ROUTES.ADD_TENANT.code,
            element: <AddTenantPage />,
          },
          {
            path: CONSTANTS.ROUTES.UPDATE_TENANT.code,
            element: <UpdateTenantPage />,
          },
          {
            path: CONSTANTS.ROUTES.ADD_SCHEMA.code,
            element: <AddSchemaPage />,
          },

          {
            element: <DatabaseSchemaLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_SCHEMA.code,
                element: <DatabaseSchemaLandingPage />,
              },
              {
                element: <DatabaseTableLayout />,
                children: [
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.code,
                    element: <TableLayoutLandingPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.ADD_DATABASE_TABLE.code,
                    element: <AddDatabaseTablePage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.code,
                    element: <ViewDatabaseTablePage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.UPDATE_DATABASE_TABLE_BY_NAME.code,
                    element: <UpdateDatabaseTablePage />,
                  },
                ],
              },
              {
                element: <DatabaseTriggerLayout />,
                children: [
                  {
                    path: CONSTANTS.ROUTES.ADD_DATABASE_TRIGGER.code,
                    element: <AddDatabaseTriggerPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGERS.code,
                    element: <TriggerLayoutLandingPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGER_BY_NAME.code,
                    element: <ViewDatabaseTriggerPage />,
                  },
                ],
              },
            ],
          },
          {
            element: <DatasourceLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATASOURCES.code,
                element: <DatasourceLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATASOURCE.code,
                element: <AddDatasourcePage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.code,
                element: <UpdateDatasourcePage />,
              },
            ],
          },
          {
            element: <DataQueryLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_QUERIES.code,
                element: <DataQueryLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATA_QUERY.code,
                element: <AddDataQueryPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.code,
                element: <UpdateDataQueryPage />,
              },
            ],
          },

          {
            element: <WidgetLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_WIDGETS.code,
                element: <WidgetLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_WIDGET.code,
                element: <AddWidgetPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.code,
                element: <UpdateWidgetPage />,
              },
            ],
          },
          {
            element: <DatabaseNotificationLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_NOTIFICATIONS.code,
                element: <AddDatabaseNotificationPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATABASE_NOTIFICATION.code,
                element: <AddDatabaseNotificationPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATABASE_NOTIFICATION_BY_ID.code,
                element: <UpdateDatabaseNotificationPage />,
              },
            ],
          },
          {
            element: <APIKeyLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_API_KEYS.code,
                element: <APIKeyLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_API_KEY.code,
                element: <AddAPIKeyPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_API_KEY_BY_ID.code,
                element: <UpdateAPIKeyPage />,
              },
            ],
          },
          {
            element: <CronJobLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_CRON_JOBS.code,
                element: <CronJobLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_CRON_JOB.code,
                element: <AddCronJobPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.code,
                element: <UpdateCronJobPage />,
              },
              {
                path: CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.code,
                element: <ViewCronJobHistoryPage />,
              },
            ],
          },
          {
            path: CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.code,
            element: <ViewAuditLogsPage />,
          },
          {
            element: <DashboardLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DASHBOARDS.code,
                element: <DashboardLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DASHBOARD.code,
                element: <AddDashboardPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DASHBOARD_BY_ID.code,
                element: <UpdateDashboardPage />,
              },
            ],
          },
          {
            path: CONSTANTS.ROUTES.RAW_SQL_QUERY.code,
            element: <RawSqlQueryPage />,
          },
          {
            element: <UserManagementLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.code,
                element: <UserManagementPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_TENANT_USER_BY_ID.code,
                element: <UpdateTenantUserByIDPage />,
              },
            ],
          },
          {
            element: <RoleManagementLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.code,
                element: <RoleManagementPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_TENANT_ROLE.code,
                element: <AddTenantRolePage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.code,
                element: <UpdateTenantRolePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
export const RootRouter = () => {
  return <RouterProvider router={router} />;
};
