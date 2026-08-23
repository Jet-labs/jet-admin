import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../layouts/rootLayout";
import { CONSTANTS } from "../../../constants";
import { ProtectedLayout } from "../layouts/protectedLayout";
import { DataQueryLayout } from "../layouts/dataQueryLayout";
import { UserManagementLayout } from "../layouts/userManagementLayout";
import { RoleManagementLayout } from "../layouts/roleManagementLayout";
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
const AddWidgetPage = lazy(() => import("../../pages/addWidgetPage"));
const UpdateWidgetPage = lazy(() => import("../../pages/updateWidgetPage"));
const WidgetLayoutLandingPage = lazy(() =>
  import("../../pages/widgetLayoutLandingPage")
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
const ViewWorkflowRunsPage = lazy(() =>
  import("../../pages/viewWorkflowRunsPage")
);
const ViewWorkflowRunDetailsPage = lazy(() =>
  import("../../pages/viewWorkflowRunDetailsPage")
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
      {
        path: CONSTANTS.ROUTES.SIGN_IN.code,
        element: <SignInPage />,
        handle: { title: CONSTANTS.ROUTES.SIGN_IN.title },
      },
      {
        path: CONSTANTS.ROUTES.SIGN_UP.code,
        element: <SignUpPage />,
        handle: { title: CONSTANTS.ROUTES.SIGN_UP.title },
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: CONSTANTS.ROUTES.HOME.code,
            element: <HomePage />,
            handle: { title: CONSTANTS.ROUTES.HOME.title },
          },
          {
            path: CONSTANTS.ROUTES.ACCOUNT.code,
            element: <AccountPage />,
            handle: { title: CONSTANTS.ROUTES.ACCOUNT.title },
          },
          {
            path: CONSTANTS.ROUTES.VIEW_TENANT.code,
            element: <TenantLayoutLandingPage />,
            handle: { title: CONSTANTS.ROUTES.VIEW_TENANT.title },
          },
          {
            path: CONSTANTS.ROUTES.ADD_TENANT.code,
            element: <AddTenantPage />,
            handle: { title: CONSTANTS.ROUTES.ADD_TENANT.title },
          },
          {
            path: CONSTANTS.ROUTES.UPDATE_TENANT.code,
            element: <UpdateTenantPage />,
            handle: { title: CONSTANTS.ROUTES.UPDATE_TENANT.title },
          },

          {
            element: <DatasourceLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATASOURCES.code,
                element: <DatasourceLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_DATASOURCES.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATASOURCE.code,
                element: <AddDatasourcePage />,
                handle: { title: CONSTANTS.ROUTES.ADD_DATASOURCE.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.code,
                element: <UpdateDatasourcePage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.title },
              },
            ],
          },
          {
            element: <DataQueryLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_QUERIES.code,
                element: <DataQueryLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_QUERIES.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_DATA_QUERY.code,
                element: <AddDataQueryPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_DATA_QUERY.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.code,
                element: <UpdateDataQueryPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.title },
              },
            ],
          },
          {
            path: CONSTANTS.ROUTES.VIEW_ENGINES.code,
            element: <EngineDashboardPage />,
            handle: { title: CONSTANTS.ROUTES.VIEW_ENGINES.title },
          },

          {
            element: <WidgetLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_WIDGETS.code,
                element: <WidgetLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_WIDGETS.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_WIDGET.code,
                element: <AddWidgetPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_WIDGET.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.code,
                element: <UpdateWidgetPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.title },
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
                handle: { title: CONSTANTS.ROUTES.VIEW_API_KEYS.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_API_KEY.code,
                element: <AddAPIKeyPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_API_KEY.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_API_KEY_BY_ID.code,
                element: <UpdateAPIKeyPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_API_KEY_BY_ID.title },
              },
            ],
          },
          {
            element: <CronJobLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_CRON_JOBS.code,
                element: <CronJobLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_CRON_JOBS.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_CRON_JOB.code,
                element: <AddCronJobPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_CRON_JOB.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.code,
                element: <UpdateCronJobPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.title },
              },
              {
                path: CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.code,
                element: <ViewCronJobHistoryPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.title },
              },
            ],
          },
          {
            path: CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.code,
            element: <ViewAuditLogsPage />,
            handle: { title: CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.title },
          },
          {
            element: <AppPageLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_APP_PAGES.code,
                element: <AppPageLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_APP_PAGES.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_APP_PAGE.code,
                element: <AddAppPagePage />,
                handle: { title: CONSTANTS.ROUTES.ADD_APP_PAGE.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.code,
                element: <UpdateAppPagePage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.title },
              },
            ],
          },
          {
            element: <WorkflowLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_WORKFLOWS.code,
                element: <WorkflowLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_WORKFLOWS.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_WORKFLOW.code,
                element: <AddWorkflowPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_WORKFLOW.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.code,
                element: <UpdateWorkflowPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.title },
              },
              {
                path: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_DETAILS_BY_ID.code,
                element: <ViewWorkflowRunDetailsPage />,
                handle: {
                  title: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_DETAILS_BY_ID.title,
                },
              },
              {
                path: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_HISTORY_BY_ID.code,
                element: <ViewWorkflowRunsPage />,
                handle: {
                  title: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_HISTORY_BY_ID.title,
                },
              },
              {
                path: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUNS.code,
                element: <ViewWorkflowRunsPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_WORKFLOW_RUNS.title },
              },
            ],
          },
          {
            element: <UserManagementLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.code,
                element: <UserManagementPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_TENANT_USERS.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_TENANT_USER_BY_ID.code,
                element: <UpdateTenantUserByIDPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_TENANT_USER_BY_ID.title },
              },
            ],
          },
          {
            element: <ListenerLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_LISTENERS.code,
                element: <ListenerLayoutLandingPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_LISTENERS.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_LISTENER.code,
                element: <AddListenerPage />,
                handle: { title: CONSTANTS.ROUTES.ADD_LISTENER.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.code,
                element: <UpdateListenerPage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.title },
              },
            ],
          },
          {
            element: <RoleManagementLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.code,
                element: <RoleManagementPage />,
                handle: { title: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.title },
              },
              {
                path: CONSTANTS.ROUTES.ADD_TENANT_ROLE.code,
                element: <AddTenantRolePage />,
                handle: { title: CONSTANTS.ROUTES.ADD_TENANT_ROLE.title },
              },
              {
                path: CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.code,
                element: <UpdateTenantRolePage />,
                handle: { title: CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.title },
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
