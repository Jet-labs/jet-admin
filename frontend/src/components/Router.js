import React, { Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../constants";

import { Loading } from "../pages/Loading";
import ProtectedRoute from "./ProtectedRoute";

import { lazy } from "react";
import SignIn from "../pages/SignIn";



const Home = lazy(() => import("../pages/Home"));
const TableView = lazy(() => import("../pages/TableView"));
const RowView = lazy(() => import("../pages/RowView"));
const AddRow = lazy(() => import("../pages/AddRow"));
const PolicyManagement = lazy(() => import("../pages/PolicyManagement"));
const PolicySettings = lazy(() => import("../pages/PolicySettings"));
const AccountManagement = lazy(() => import("../pages/AccountManagement"));
const AccountSettings = lazy(() => import("../pages/AccountSettings"));
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
                successComponent={Home}
                fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                loadingComponent={() => <Loading />}
              />
            }
          />

          <Route path={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.code}>
            <Route
              index
              element={
                <ProtectedRoute
                  successComponent={TableView}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            ></Route>
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ROW_VIEW.code}
              element={
                <ProtectedRoute
                  successComponent={RowView}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />

            <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_ROW.code}
              element={
                <ProtectedRoute
                  successComponent={AddRow}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            />
          </Route>

          {/* <Route path={LOCAL_CONSTANTS.ROUTES.ACTIONS.code}>
            <Route
              index
              element={
                <ProtectedRoute
                  successComponent={ActionsView}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            ></Route> */}
          {/* <Route
              path={LOCAL_CONSTANTS.ROUTES.ROW_VIEW.code}
              element={
                <ProtectedRoute
                  successComponent={RowView}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            /> */}

          {/* <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_ROW.code}
              element={
                <ProtectedRoute
                  successComponent={AddRow}
                  fallbackPath={LOCAL_CONSTANTS.ROUTES.SIGNIN}
                  loadingComponent={() => <Loading fullScreen />}
                />
              }
            /> */}
          {/* </Route> */}

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
