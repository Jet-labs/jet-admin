import React from "react";
import { Outlet } from "react-router-dom";

import { CONSTANTS } from "../../../constants";
import { SubscriptionsContextProvider } from "../../../logic/contexts/subscriptionContext";
import { DataQueriesContextProvider } from "../../../logic/contexts/dataQueriesContext";
import { SubscriptionDrawerList } from "../drawerList/subscriptionDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const SubscriptionLayout = () => {
  return (
    <DataQueriesContextProvider>
      <SubscriptionsContextProvider>
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={
              CONSTANTS.RESIZABLE_PANEL_KEYS.SUBSCRIPTION_LAYOUT_SEPARATION
            }
            className="h-full w-full"
          >
            <ResizablePanel defaultSize={20}>
              <SubscriptionDrawerList />
            </ResizablePanel>
            <ResizableHandle withHandle={true} />
            <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
              <Outlet />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SubscriptionsContextProvider>
    </DataQueriesContextProvider>
  );
};
