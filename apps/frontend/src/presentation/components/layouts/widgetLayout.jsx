import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import { WidgetsContextProvider } from "../../../logic/contexts/widgetsContext";
import { WidgetDrawerList } from "../drawerList/widgetDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const WidgetLayout = () => {
  return (
    <WidgetsContextProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_LAYOUT_SEPARATION}
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <WidgetDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WidgetsContextProvider>
  );
};
