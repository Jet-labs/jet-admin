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
import GraphView from "../pages/GraphView";
import SignIn from "../pages/SignIn";



const PolicyManagement = lazy(() => import("../pages/PolicyManagement"));
const PolicySettings = lazy(() => import("../pages/PolicySettings"));
const AddPolicy = lazy(() => import("../pages/AddPolicy"));
const AccountManagement = lazy(() => import("../pages/AccountManagement"));
const AccountSettings = lazy(() => import("../pages/AccountSettings"));
const AddAccount = lazy(() => import("../pages/AddAccount"));
const TableLayout = lazy(() => import("./layouts/TableLayout"));
const GraphLayout = lazy(() => import("./layouts/GraphLayout"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const DataSourceLayout = lazy(() => import("./layouts/DataSourceLayout"));
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
                  <Navigate to={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code} />
                  // <GraphView />
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
            path={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code}
            element={
              <ProtectedRoute
                successComponent={DashboardLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ALL_DATASOURCES.code}
            element={
              <ProtectedRoute
                successComponent={DataSourceLayout}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading fullScreen />}
              />
            }
          ></Route>

          <Route path={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT}>
            <Route
              index
              element={
                <ProtectedRoute
                  successComponent={PolicyManagement}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.POLICY_SETTINGS.code}
              element={
                <ProtectedRoute
                  successComponent={PolicySettings}
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
                  successComponent={AccountManagement}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ACCOUNT_SETTINGS.code}
              element={
                <ProtectedRoute
                  successComponent={AccountSettings}
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
