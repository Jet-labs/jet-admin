import React from "react";
import { Outlet } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DatasourceDrawerList } from "../drawerList/datasourceDrawerList";
import { DatasourcesContextProvider } from "../../../logic/contexts/datasourceContext";

export const DatasourceLayout = () => {
  return (
    <DatasourcesContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATASOURCE_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatasourceDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatasourcesContextProvider>
  );
};
