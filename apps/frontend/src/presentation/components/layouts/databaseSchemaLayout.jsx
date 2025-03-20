import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { DatabaseSchemaDrawerList } from "../drawerList/databaseSchemaDrawerList";
export const DatabaseSchemaLayout = () => {
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const location = useLocation();

  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
      <div class="flex w-full flex-grow flex-row justify-start items-start overflow-hidden">
        <DatabaseSchemaDrawerList />
        <div class="w-full  overflow-y-auto bg-white h-[calc(100vh-50px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
