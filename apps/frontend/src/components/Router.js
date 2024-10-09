import React, { Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { LOCAL_CONSTANTS } from "../constants";

import { lazy } from "react";
import SignIn from "../pages/SignIn";
import { ProtectedLayout } from "./Layouts/ProtectedLayout";
import { RootLayout } from "./Layouts/RootLayout";
import { Loading } from "../pages/Loading";

const AllPolicies = lazy(() => import("../pages/AllPolicies"));
const UpdatePolicy = lazy(() => import("../pages/UpdatePolicy"));
const AddPolicy = lazy(() => import("../pages/AddPolicy"));
const AllAccounts = lazy(() => import("../pages/AllAccounts"));
const UpdateAccount = lazy(() => import("../pages/UpdateAccount"));
const AddAccount = lazy(() => import("../pages/AddAccount"));
const TableLayout = lazy(() => import("./Layouts/TableLayout"));
const GraphLayout = lazy(() => import("./Layouts/GraphLayout"));
const DashboardLayout = lazy(() => import("./Layouts/DashboardLayout"));
const QueryLayout = lazy(() => import("./Layouts/QueryLayout"));
const JobLayout = lazy(() => import("./Layouts/JobLayout"));
const AppConstantLayout = lazy(() => import("./Layouts/AppConstantLayout"));
const TriggerLayout = lazy(() => import("./Layouts/TriggerLayout"));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: LOCAL_CONSTANTS.ROUTES.SIGNIN, element: <SignIn /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
                replace
              />
            ),
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code,
            element: <DashboardLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code,
            element: <TableLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.code,
            element: <QueryLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_JOBS.code,
            element: <JobLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code,
            element: <GraphLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_APP_CONSTANTS.code,
            element: <AppConstantLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ALL_TRIGGERS.code,
            element: <TriggerLayout />,
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT.code,
            children: [
              { index: true, element: <AllPolicies /> },
              {
                path: LOCAL_CONSTANTS.ROUTES.POLICY_SETTINGS.code,
                element: <UpdatePolicy />,
              },
              {
                path: LOCAL_CONSTANTS.ROUTES.ADD_POLICY.code,
                element: <AddPolicy />,
              },
            ],
          },
          {
            path: LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT,
            children: [
              { index: true, element: <AllAccounts /> },
              {
                path: LOCAL_CONSTANTS.ROUTES.ACCOUNT_SETTINGS.code,
                element: <UpdateAccount />,
              },
              {
                path: LOCAL_CONSTANTS.ROUTES.ADD_ACCOUNT.code,
                element: <AddAccount />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};


export default AppRouter;
