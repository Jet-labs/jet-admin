import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { DatabaseSchemaDrawerList } from "../drawerList/databaseSchemaDrawerList";
export const DatabaseSchemaLayout = () => {
  return (
    <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
      <div className="flex w-full flex-grow flex-row justify-start items-start overflow-hidden">
        <DatabaseSchemaDrawerList />
        <div className="w-full  overflow-y-auto bg-white h-[calc(100vh-50px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
