import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { StoredProceduresContextProvider } from "../../../logic/contexts/storedProceduresContext";
import { StoredProcedureDrawerList } from "../drawerList/storedProcedureDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const StoredProcedureLayout = () => {
  return (
    <StoredProceduresContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.STORED_PROCEDURE_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <StoredProcedureDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </StoredProceduresContextProvider>
  );
};
