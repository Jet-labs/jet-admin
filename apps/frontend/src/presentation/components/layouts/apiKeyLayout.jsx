import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { APIKeysContextProvider } from "../../../logic/contexts/apiKeysContext";
import { APIKeyDrawerList } from "../drawerList/apiKeyDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const APIKeyLayout = () => {
  return (
    <APIKeysContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_NOTIFICATION_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <APIKeyDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </APIKeysContextProvider>
  );
};