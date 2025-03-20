import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DatabaseQueriesContextProvider } from "../../../logic/contexts/databaseQueriesContext";
import { DatabaseQueryDrawerList } from "../drawerList/databaseQueryDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DatabaseQueryLayout = () => {
  return (
    <DatabaseQueriesContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_QUERY_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatabaseQueryDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatabaseQueriesContextProvider>
  );
};
