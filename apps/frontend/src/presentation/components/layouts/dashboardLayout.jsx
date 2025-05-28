import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DashboardsContextProvider } from "../../../logic/contexts/dashboardsContext";
import { DashboardDrawerList } from "../drawerList/dashboardDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DashboardLayout = () => {
  return (
    <DashboardsContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DASHBOARD_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DashboardDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DashboardsContextProvider>
  );
};
