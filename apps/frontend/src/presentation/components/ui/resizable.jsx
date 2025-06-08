import PropTypes from "prop-types";
import React from "react";
import { GoGrabber } from "react-icons/go";
import * as ResizablePrimitive from "react-resizable-panels";

const ResizablePanelGroup = ({ className, ...props }) => {
  ResizablePanelGroup.propTypes = {
    className: PropTypes.string,
  };
  return (
    <ResizablePrimitive.PanelGroup
      className={`flex h-full w-full data-[panel-group-direction=vertical]:flex-col ${className}`}
      {...props}
    />
  );
};

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({ withHandle, className, ...props }) => {
  ResizableHandle.propTypes = {
    withHandle: PropTypes.bool,
    className: PropTypes.string,
  };

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={`group relative flex w-px items-center justify-center bg-slate-200 transition-all duration-200 ease-in-out 
        hover:bg-[#646cff] 
        data-[panel-group-direction=vertical]:h-px 
        data-[panel-group-direction=vertical]:w-full 
        data-[panel-group-direction=vertical]:hover:h-0.5 
        data-[panel-group-direction=vertical]:hover:bg-[#646cff] 
        hover:w-0.5
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 
        ${className}`}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-slate-200">
          <GoGrabber className="!text-lg bg-slate-100 text-slate-800" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};


export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
