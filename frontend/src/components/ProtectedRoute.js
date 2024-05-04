import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "../contexts/authContext";
import { Layout } from "./Layout";

/**
 *
 * @param {object} param0
 * @param {function} param0.successComponent
 * @param {String} param0.fallbackPath
 * @param {function} param0.loadingComponent
 * @returns
 */
const ProtectedRoute = ({
  successComponent: SuccessComponent,
  fallbackPath,
  loadingComponent: LoadingComponent,
}) => {
  const { pmUser, isLoadingPMUser, isLoggingIn } = useAuthState();
  const location = useLocation();

  return isLoadingPMUser || isLoggingIn ? (
    <LoadingComponent />
  ) : pmUser ? (
    <Layout>
      <SuccessComponent />
    </Layout>
  ) : (
    <Navigate to={fallbackPath} />
  );
};

export default ProtectedRoute;
