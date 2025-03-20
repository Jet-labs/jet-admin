import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserManagementContextProvider } from "../../../logic/contexts/userManagementContext";

export const UserManagementLayout = () => {
  return (
    <UserManagementContextProvider>
      <Outlet />
    </UserManagementContextProvider>
  );
};
