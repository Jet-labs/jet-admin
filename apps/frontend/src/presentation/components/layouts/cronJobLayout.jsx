import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { CronJobsContextProvider } from "../../../logic/contexts/cronJobsContext";
import { CronJobDrawerList } from "../drawerList/cronJobDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const CronJobLayout = () => {
  return (
    <CronJobsContextProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_CRON_JOB_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20}>
            <CronJobDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </CronJobsContextProvider>
  );
};