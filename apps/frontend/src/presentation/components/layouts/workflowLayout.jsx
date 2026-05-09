import React from "react";
import { Outlet } from "react-router-dom";

import { WorkflowDrawerList } from "../drawerList/workflowDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { CONSTANTS } from "../../../constants";



export const WorkflowLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={
              CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_LAYOUT_SEPARATION
            }
            className="h-full w-full"
          >
            <ResizablePanel defaultSize={20}>
              <WorkflowDrawerList />
            </ResizablePanel>
            <ResizableHandle withHandle={true} />
            <ResizablePanel defaultSize={80} className="overflow-hidden bg-brand-dark">
              <Outlet />
            </ResizablePanel>
          </ResizablePanelGroup>
      </div>
  );
};