import { Outlet } from "react-router-dom";
import { RoleManagementContextProvider } from "../../../logic/contexts/roleManagementContext";
import React from "react";

export const RoleManagementLayout = () => {
  return (
    <RoleManagementContextProvider>
      <Outlet />
    </RoleManagementContextProvider>
  );
};
