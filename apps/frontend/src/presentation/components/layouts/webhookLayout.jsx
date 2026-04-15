import React from "react";
import { Outlet } from "react-router-dom";

import { CONSTANTS } from "../../../constants";
import { WebhooksContextProvider } from "../../../logic/contexts/webhookContext";
import { WebhookDrawerList } from "../drawerList/webhookDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const WebhookLayout = () => {
  return (
    <WebhooksContextProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.WEBHOOK_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <WebhookDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WebhooksContextProvider>
  );
};
