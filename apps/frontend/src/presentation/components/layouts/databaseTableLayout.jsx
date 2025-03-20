import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DatabaseTablesContextProvider } from "../../../logic/contexts/databaseTablesContext";
import { DatabaseTableDrawerList } from "../drawerList/databaseTableDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DatabaseTableLayout = () => {
  return (
    <DatabaseTablesContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_TABLE_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatabaseTableDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatabaseTablesContextProvider>
  );
};