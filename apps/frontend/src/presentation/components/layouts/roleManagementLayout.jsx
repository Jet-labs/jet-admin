import { Link, Outlet, useNavigate } from "react-router-dom";
import { RoleManagementContextProvider } from "../../../logic/contexts/roleManagementContext";

export const RoleManagementLayout = () => {
  return (
    <RoleManagementContextProvider>
      <Outlet />
    </RoleManagementContextProvider>
  );
};
