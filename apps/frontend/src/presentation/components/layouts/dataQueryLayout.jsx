import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";

import { DataQueryDrawerList } from "../drawerList/dataQueryDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DataQueryLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATA_QUERY_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <DataQueryDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-brand-dark">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
  );
};
