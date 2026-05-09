import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { DashboardDrawerList } from "../drawerList/dashboardDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DashboardLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark relative">
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
        <ResizablePanel defaultSize={80} className="overflow-hidden bg-brand-dark">
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
