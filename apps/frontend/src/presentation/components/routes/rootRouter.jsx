import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "../layouts/rootLayout";
import { CONSTANTS } from "../../../constants";
import { ProtectedLayout } from "../layouts/protectedLayout";
import { DatabaseSchemaLayout } from "../layouts/databaseSchemaLayout";
import { DatabaseTableLayout } from "../layouts/databaseTableLayout";
import { DatabaseTriggerLayout } from "../layouts/databaseTriggerLayout";
import { DatabaseViewLayout } from "../layouts/databaseViewLayout";
import { StoredProcedureLayout } from "../layouts/storedProcedureLayout";
import { DatabaseFunctionLayout } from "../layouts/databaseFunctionLayout";
import { UserManagementLayout } from "../layouts/userManagementLayout";
import { RoleManagementLayout } from "../layouts/roleManagementLayout";
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
const UserManagementPage = lazy(() => import("../../pages/userManagementPage"));
const UpdateTenantUserByIDPage = lazy(() =>
  import("../../pages/updateTenantUserByIDPage")
);
const RoleManagementPage = lazy(() => import("../../pages/roleManagementPage"));
const AddTenantRolePage = lazy(() => import("../../pages/addTenantRolePage"));
const UpdateTenantRolePage = lazy(() =>
  import("../../pages/updateTenantRolePage")
);
const RawSqlQueryPage = lazy(() => import("../../pages/rawSqlQueryPage"));
const DatabaseChatPage = lazy(() => import("../../pages/databaseChatPage"));
const DatabaseSchemaLandingPage = lazy(() =>
  import("../../pages/databaseSchemaLandingPage")
);
const ViewAuditLogsPage = lazy(() => import("../../pages/viewAuditLogsPage"));
const ViewsLayoutLandingPage = lazy(() =>
  import("../../pages/viewsLayoutLandingPage")
);
const ViewDatabaseViewDetailPage = lazy(() =>
  import("../../pages/viewDatabaseViewDetailPage")
);
const AddDatabaseViewPage = lazy(() =>
  import("../../pages/addDatabaseViewPage")
);
const ProceduresLayoutLandingPage = lazy(() =>
  import("../../pages/proceduresLayoutLandingPage")
);
const ViewStoredProcedureDetailPage = lazy(() =>
  import("../../pages/viewStoredProcedureDetailPage")
);
const AddStoredProcedurePage = lazy(() =>
  import("../../pages/addStoredProcedurePage")
);
const FunctionsLayoutLandingPage = lazy(() =>
  import("../../pages/viewFunctionsPage")
);
const ViewFunctionDetailPage = lazy(() =>
  import("../../pages/viewFunctionDetailPage")
);
const AddFunctionPage = lazy(() =>
  import("../../pages/addFunctionPage")
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
              {
                element: <DatabaseViewLayout />,
                children: [
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_VIEWS.code,
                    element: <ViewsLayoutLandingPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.ADD_DATABASE_VIEW.code,
                    element: <AddDatabaseViewPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_DATABASE_VIEW_BY_NAME.code,
                    element: <ViewDatabaseViewDetailPage />,
                  },
                ],
              },
              {
                element: <StoredProcedureLayout />,
                children: [
                  {
                    path: CONSTANTS.ROUTES.VIEW_STORED_PROCEDURES.code,
                    element: <ProceduresLayoutLandingPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.ADD_STORED_PROCEDURE.code,
                    element: <AddStoredProcedurePage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_STORED_PROCEDURE_BY_NAME.code,
                    element: <ViewStoredProcedureDetailPage />,
                  },
                ],
              },
              {
                element: <DatabaseFunctionLayout />,
                children: [
                  {
                    path: CONSTANTS.ROUTES.VIEW_FUNCTIONS.code,
                    element: <FunctionsLayoutLandingPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.ADD_FUNCTION.code,
                    element: <AddFunctionPage />,
                  },
                  {
                    path: CONSTANTS.ROUTES.VIEW_FUNCTION_BY_NAME.code,
                    element: <ViewFunctionDetailPage />,
                  },
                ],
              },
            ],
          },
          {
            path: CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.code,
            element: <ViewAuditLogsPage />,
          },
          {
            path: CONSTANTS.ROUTES.RAW_SQL_QUERY.code,
            element: <RawSqlQueryPage />,
          },
          {
            path: CONSTANTS.ROUTES.DATABASE_CHAT.code,
            element: <DatabaseChatPage />,
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
