import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "../contexts/authContext";
import { MainLayout } from "./Layouts/MainLayout";

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
    <MainLayout>
      <SuccessComponent />
    </MainLayout>
  ) : (
    <Navigate to={fallbackPath} />
  );
};

export default ProtectedRoute;
