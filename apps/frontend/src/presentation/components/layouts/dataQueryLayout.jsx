import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DataQueriesContextProvider } from "../../../logic/contexts/dataQueriesContext";
import { DataQueryDrawerList } from "../drawerList/dataQueryDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DataQueryLayout = () => {
  return (
    <DataQueriesContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATA_QUERY_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DataQueryDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DataQueriesContextProvider>
  );
};
