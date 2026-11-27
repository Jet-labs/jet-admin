import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { ApplicationDrawerList } from "../drawerList/applicationDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const ApplicationLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.APPLICATION_LAYOUT_SEPARATION}
      className="h-full w-full"
    >
      <ResizablePanel defaultSize={20} minSize={14} maxSize={32} className="max-md:hidden">
        <ApplicationDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle className="max-md:hidden" />
      <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);
