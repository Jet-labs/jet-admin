import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { AppPageDrawerList } from "../drawerList/appPageDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const AppPageLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background relative">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.APP_PAGE_LAYOUT_SEPARATION
        }
        className="h-full w-full"
      >
        <ResizablePanel defaultSize={20}>
          <AppPageDrawerList />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
