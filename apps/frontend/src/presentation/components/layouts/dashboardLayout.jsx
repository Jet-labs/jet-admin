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
import { AIChatButton } from "../aiChatComponents/aiChatButton";

export const DashboardLayout = () => {
  return (
    <DashboardsContextProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background relative">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DASHBOARD_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <DashboardDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Global Agent Chat UI */}
        {/* <AIChatButton /> */}
      </div>
    </DashboardsContextProvider>
  );
};

