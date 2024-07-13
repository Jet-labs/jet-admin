import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { LOCAL_CONSTANTS } from "../constants";

import { Loading } from "../pages/Loading";
import ProtectedRoute from "./ProtectedRoute";

import { lazy } from "react";
import SignIn from "../pages/SignIn";

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
/**
 *
 * @param {object} param0
 * @returns
 */
const AppRouter = ({}) => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Routes>
          <Route
            exact={true}
            path={LOCAL_CONSTANTS.ROUTES.HOME}
            element={
              <ProtectedRoute
                successComponent={() => (
                  <Navigate
                    to={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
                  />
                  // <UpdateGraph />
                )}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading />}
              />
            }
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code}
            element={
              <ProtectedRoute
                successComponent={TableLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>
          <Route
            path={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code}
            element={
              <ProtectedRoute
                successComponent={GraphLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>
          <Route
            path={LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.code}
            element={
              <ProtectedRoute
                successComponent={QueryLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>
          <Route
            path={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code}
            element={
              <ProtectedRoute
                successComponent={DashboardLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>

          <Route path={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT.code}>
            <Route
              index
              element={
                <ProtectedRoute
                  successComponent={AllPolicies}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.POLICY_SETTINGS.code}
              element={
                <ProtectedRoute
                  successComponent={UpdatePolicy}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_POLICY.code}
              element={
                <ProtectedRoute
                  successComponent={AddPolicy}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
          </Route>

          <Route path={LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT}>
            <Route
              index
              element={
                <ProtectedRoute
                  successComponent={AllAccounts}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ACCOUNT_SETTINGS.code}
              element={
                <ProtectedRoute
                  successComponent={UpdateAccount}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_ACCOUNT.code}
              element={
                <ProtectedRoute
                  successComponent={AddAccount}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
          </Route>

          <Route
            exact={true}
            path={LOCAL_CONSTANTS.ROUTES.SIGNIN}
            element={<SignIn />}
          />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default AppRouter;
