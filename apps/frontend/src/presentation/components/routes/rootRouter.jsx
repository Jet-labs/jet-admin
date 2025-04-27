import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../layouts/rootLayout";
import { CONSTANTS } from "../../../constants";
import { ProtectedLayout } from "../layouts/protectedLayout";
import { DatabaseSchemaLayout } from "../layouts/databaseSchemaLayout";
import { DatabaseTableLayout } from "../layouts/databaseTableLayout";
import { DatabaseTriggerLayout } from "../layouts/databaseTriggerLayout";
import { DatabaseQueryLayout } from "../layouts/databaseQueryLayout";
import { UserManagementLayout } from "../layouts/userManagementLayout";
import { RoleManagementLayout } from "../layouts/roleManagementLayout";
import { DatabaseChartLayout } from "../layouts/databaseChartLayout";
import { DatabaseDashboardLayout } from "../layouts/databaseDashboardLayout";
import { DatabaseWidgetLayout } from "../layouts/databaseWidgetLayout";
import { DatabaseNotificationLayout } from "../layouts/databaseNotificationLayout";
import { APIKeyLayout } from "../layouts/apiKeyLayout";
import { CronJobLayout } from "../layouts/cronJobLayout";
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

const AddDatabaseQueryPage = lazy(() =>
  import("../../pages/addDatabaseQueryPage")
);

const UpdateDatabaseQueryPage = lazy(() =>
  import("../../pages/updateDatabaseQueryPage")
);

const DatabaseQueryLayoutLandingPage = lazy(() =>
  import("../../pages/databaseQueryLayoutLandingPage")
);

const AddDatabaseChartPage = lazy(() =>
  import("../../pages/addDatabaseChartPage")
);

const UpdateDatabaseChartPage = lazy(() =>
  import("../../pages/updateDatabaseChartPage")
);

const DatabaseChartLayoutLandingPage = lazy(() =>
  import("../../pages/databaseChartLayoutLandingPage")
);

const DatabaseDashboardLayoutLandingPage = lazy(() =>
  import("../../pages/databaseDashboardLayoutLandingPage")
);

const AddDatabaseWidgetPage = lazy(() =>
  import("../../pages/addDatabaseWidgetPage")
);

const UpdateDatabaseWidgetPage = lazy(() =>
  import("../../pages/updateDatabaseWidgetPage")
);

const DatabaseWidgetLayoutLandingPage = lazy(() =>
  import("../../pages/databaseWidgetLayoutLandingPage")
);

const AddDatabaseDashboardPage = lazy(() =>
  import("../../pages/addDatabaseDashboardPage")
);

const UpdateDatabaseDashboardPage = lazy(() =>
  import("../../pages/updateDatabaseDashboardPage")
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

const UpdateAPIKeyPage = lazy(() => import("../../pages/updateAPIKeyPage"));

const RawSqlQueryPage = lazy(() => import("../../pages/rawSqlQueryPage"));
const AddCronJobPage = lazy(() => import("../../pages/addCronJobPage"));
const UpdateCronJobPage = lazy(() => import("../../pages/updateCronJobPage"));
const ViewCronJobHistoryPage = lazy(() =>
  import("../../pages/viewCronJobHistoryPage")
);

const DatabaseSchemaLandingPage = lazy(() =>
  import("../../pages/databaseSchemaLandingPage")
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
            element: <DatabaseQueryLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.code,
                element: <DatabaseQueryLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATABASE_QUERY.code,
                element: <AddDatabaseQueryPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATABASE_QUERY_BY_ID.code,
                element: <UpdateDatabaseQueryPage />,
              },
            ],
          },
          {
            element: <DatabaseChartLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_CHARTS.code,
                element: <DatabaseChartLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATABASE_CHART.code,
                element: <AddDatabaseChartPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATABASE_CHART_BY_ID.code,
                element: <UpdateDatabaseChartPage />,
              },
            ],
          },
          {
            element: <DatabaseWidgetLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.code,
                element: <DatabaseWidgetLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATABASE_WIDGET.code,
                element: <AddDatabaseWidgetPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATABASE_WIDGET_BY_ID.code,
                element: <UpdateDatabaseWidgetPage />,
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
                element: <AddAPIKeyPage />,
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
                element: <AddCronJobPage />,
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
            element: <DatabaseDashboardLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.code,
                element: <DatabaseDashboardLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATABASE_DASHBOARD.code,
                element: <AddDatabaseDashboardPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATABASE_DASHBOARD_BY_ID.code,
                element: <UpdateDatabaseDashboardPage />,
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
