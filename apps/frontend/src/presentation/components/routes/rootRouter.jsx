import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../layouts/rootLayout";
import { CONSTANTS } from "../../../constants";
import { ProtectedLayout } from "../layouts/protectedLayout";
import { DataQueryLayout } from "../layouts/dataQueryLayout";
import { UserManagementLayout } from "../layouts/userManagementLayout";
import { RoleManagementLayout } from "../layouts/roleManagementLayout";
import { DashboardLayout } from "../layouts/dashboardLayout";
import { AppPageLayout } from "../layouts/appPageLayout";
import { WidgetLayout } from "../layouts/widgetLayout";
import { APIKeyLayout } from "../layouts/apiKeyLayout";
import { CronJobLayout } from "../layouts/cronJobLayout";
import { WorkflowLayout } from "../layouts/workflowLayout";
import { DatasourceLayout } from "../layouts/datasourceLayout";
const SignInPage = lazy(() => import("../../pages/signInPage"));
const SignUpPage = lazy(() => import("../../pages/signUpPage"));
const HomePage = lazy(() => import("../../pages/homePage"));
const AccountPage = lazy(() => import("../../pages/accountPage"));
const AddTenantPage = lazy(() => import("../../pages/addTenantPage"));
const UpdateTenantPage = lazy(() => import("../../pages/updateTenantPage"));
const TenantLayoutLandingPage = lazy(() =>
  import("../../pages/tenantLayoutLandingPage")
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
const AppPageLayoutLandingPage = lazy(() =>
  import("../../pages/appPageLayoutLandingPage")
);
const AddAppPagePage = lazy(() => import("../../pages/addAppPagePage"));
const UpdateAppPagePage = lazy(() =>
  import("../../pages/updateAppPagePage")
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
const AddAPIKeyPage = lazy(() => import("../../pages/addAPIKeyPage"));
const APIKeyLayoutLandingPage = lazy(() =>
  import("../../pages/apiKeyLayoutLandingPage")
);
const UpdateAPIKeyPage = lazy(() => import("../../pages/updateAPIKeyPage"));
const AddCronJobPage = lazy(() => import("../../pages/addCronJobPage"));
const UpdateCronJobPage = lazy(() => import("../../pages/updateCronJobPage"));
const ViewCronJobHistoryPage = lazy(() =>
  import("../../pages/viewCronJobHistoryPage")
);
const CronJobLayoutLandingPage = lazy(() =>
  import("../../pages/cronJobLayoutLandingPage")
);
const ViewAuditLogsPage = lazy(() => import("../../pages/viewAuditLogsPage"));

const DatasourceLayoutLandingPage = lazy(() =>
  import("../../pages/datasourceLayoutLandingPage")
);
const AddWorkflowPage = lazy(() => import("../../pages/addWorkflowPage"));
const WorkflowLayoutLandingPage = lazy(() =>
  import("../../pages/workflowLayoutLandingPage")
);
const UpdateWorkflowPage = lazy(() =>
  import("../../pages/updateWorkflowPage")
);
const AddDatasourcePage = lazy(() => import("../../pages/addDatasourcePage"));
const UpdateDatasourcePage = lazy(() =>
  import("../../pages/updateDatasourcePage")
);

const ListenerLayout = lazy(() => import("../layouts/listenerLayout"));
const ListenerLayoutLandingPage = lazy(() =>
  import("../../pages/listenerLayoutLandingPage")
);
const AddListenerPage = lazy(() => import("../../pages/addListenerPage"));
const UpdateListenerPage = lazy(() =>
  import("../../pages/updateListenerPage")
);
const EngineDashboardPage = lazy(() =>
  import("../../pages/engineDashboardPage")
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
            path: CONSTANTS.ROUTES.VIEW_ENGINES.code,
            element: <EngineDashboardPage />,
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
          /*
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
          */
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
            element: <AppPageLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_APP_PAGES.code,
                element: <AppPageLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_APP_PAGE.code,
                element: <AddAppPagePage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.code,
                element: <UpdateAppPagePage />,
              },
            ],
          },
          {
            element: <WorkflowLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_WORKFLOWS.code,
                element: <WorkflowLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_WORKFLOW.code,
                element: <AddWorkflowPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.code,
                element: <UpdateWorkflowPage />,
              },
            ],
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
            element: <ListenerLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_LISTENERS.code,
                element: <ListenerLayoutLandingPage />,
              },
              {
                path: CONSTANTS.ROUTES.ADD_LISTENER.code,
                element: <AddListenerPage />,
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.code,
                element: <UpdateListenerPage />,
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
