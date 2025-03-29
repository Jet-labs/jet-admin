import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { DatabaseWidgetsContextProvider } from "../../../logic/contexts/databaseWidgetsContext";
import { DatabaseWidgetDrawerList } from "../drawerList/databaseWidgetDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DatabaseWidgetLayout = () => {
  return (
    <DatabaseWidgetsContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_WIDGET_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatabaseWidgetDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatabaseWidgetsContextProvider>
  );
};
