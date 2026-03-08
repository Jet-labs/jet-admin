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
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_API_KEY_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <APIKeyDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </APIKeysContextProvider>
  );
};