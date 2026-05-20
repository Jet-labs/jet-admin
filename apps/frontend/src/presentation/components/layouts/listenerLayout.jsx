import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ListenerDrawerList } from "../drawerList/listenerDrawerList";

export const ListenerLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.LISTENER_LAYOUT_SEPARATION}
        className="h-full w-full"
      >
        <ResizablePanel defaultSize={20}>
          <ListenerDrawerList />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel
          defaultSize={80}
          className="overflow-hidden bg-background"
        >
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ListenerLayout;
