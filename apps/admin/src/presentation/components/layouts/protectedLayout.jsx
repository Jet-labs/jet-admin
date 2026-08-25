import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOperator } from "../../../logic/hooks/useOperator";

/**
 * Auth gate only: requires a signed-in operator. The active-tenant gate
 * lives in AdminLayout — enforcing it here too would make /select-tenant
 * redirect to itself (it sits inside this layout).
 */
export const ProtectedLayout = () => {
  const operator = useOperator();

  if (operator === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!operator) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
