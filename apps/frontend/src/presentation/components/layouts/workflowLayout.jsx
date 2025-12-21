import React from "react";
import { Outlet } from "react-router-dom";
import { WorkflowContextProvider } from "../../../logic/contexts/workflowContext";
import { WorkflowDrawerList } from "../drawerList/workflowDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { CONSTANTS } from "../../../constants";

export const WorkflowLayout = () => {
  return (
    <WorkflowContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <WorkflowDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WorkflowContextProvider>
    );
};