import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { CronJobDrawerList } from "../drawerList/cronJobDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const CronJobLayout = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_CRON_JOB_LAYOUT_SEPARATION
          }
          className="h-full w-full"
        >
          <ResizablePanel defaultSize={20} className="max-md:hidden">
            <CronJobDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} className="max-md:hidden" />
          <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
  );
};