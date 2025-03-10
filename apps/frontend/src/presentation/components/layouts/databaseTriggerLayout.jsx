import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { DatabaseTriggersContextProvider } from "../../../logic/contexts/databaseTriggersContext";
import { DatabaseTriggerDrawerList } from "../drawerList/databaseTriggerDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
export const DatabaseTriggerLayout = () => {
  return (
    <DatabaseTriggersContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_TRIGGER_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <DatabaseTriggerDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DatabaseTriggersContextProvider>
  );
};

