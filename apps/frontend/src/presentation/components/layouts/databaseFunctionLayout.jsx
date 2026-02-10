import React from "react";
import { Outlet } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { FunctionsContextProvider } from "../../../logic/contexts/functionsContext";
import { FunctionDrawerList } from "../drawerList/functionDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export const DatabaseFunctionLayout = () => {
  return (
    <FunctionsContextProvider>
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.DATABASE_FUNCTION_LAYOUT_SEPARATION
          }
        >
          <ResizablePanel defaultSize={20}>
            <FunctionDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </FunctionsContextProvider>
  );
};
