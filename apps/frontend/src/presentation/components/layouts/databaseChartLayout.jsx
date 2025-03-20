import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DatabaseChartsContextProvider } from "../../../logic/contexts/databaseChartsContext";
import { DatabaseChartDrawerList } from "../drawerList/databaseChartDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DatabaseChartLayout = () => {
  return (
    <DatabaseChartsContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_CHART_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatabaseChartDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatabaseChartsContextProvider>
  );
};
