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
import { DatabaseDashboardWidgetList } from "../ui/databaseDashboardWidgetList";
import { DatabaseDashboardAdditionForm } from "../ui/databaseDashboardAdditionForm";

const SignInPage = lazy(() => import("../../pages/signInPage"));
const SignUpPage = lazy(() => import("../../pages/signUpPage"));
// const AccountPage = lazy(() => import("../../pages/accountPage"));
// const ContactUsPage = lazy(() => import("../../pages/contactPage"));
const HomePage = lazy(() => import("../../pages/homePage"));
const AccountPage = lazy(() => import("../../pages/accountPage"));
const AddTenantPage = lazy(() => import("../../pages/addTenantPage"));
const UpdateTenantPage = lazy(() => import("../../pages/updateTenantPage"));
const AddSchemaPage = lazy(() => import("../../pages/addSchemaPage"));
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

const AddDatabaseQueryPage = lazy(() =>
  import("../../pages/addDatabaseQueryPage")
);

const UpdateDatabaseQueryPage = lazy(() =>
  import("../../pages/updateDatabaseQueryPage")
);

const AddDatabaseChartPage = lazy(() =>
  import("../../pages/addDatabaseChartPage")
);

const UpdateDatabaseChartPage = lazy(() =>
  import("../../pages/updateDatabaseChartPage")
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
          { path: CONSTANTS.ROUTES.VIEW_TENANT.code, element: <HomePage /> },
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
                element: () => {
                  return <div>placeholder page</div>;
                },
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
                    element: () => {
                      return <div>placeholder page</div>;
                    },
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
                element: () => {
                  return <div>placeholder page</div>;
                },
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
                element: () => {
                  return <div>placeholder page</div>;
                },
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
            element: <DatabaseDashboardLayout />,
            children: [
              {
                path: CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.code,
                element: <DatabaseDashboardAdditionForm />,
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
