import PropTypes from "prop-types";
import { GripVertical } from 'lucide-react';
import React from "react";
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

const ResizablePanel = ({ className, ...props }) => {
  ResizablePanel.propTypes = {
    className: PropTypes.string,
  };
  return <ResizablePrimitive.Panel className={className} {...props} />;
};

const ResizableHandle = ({ withHandle, className, ...props }) => {
  ResizableHandle.propTypes = {
    withHandle: PropTypes.bool,
    className: PropTypes.string,
  };

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={`group relative flex w-px items-center justify-center bg-brand-border transition-all duration-200 ease-in-out 
        hover:bg-primary 
        data-[panel-group-direction=vertical]:h-px 
        data-[panel-group-direction=vertical]:w-full 
        data-[panel-group-direction=vertical]:hover:h-0.5 
        data-[panel-group-direction=vertical]:hover:bg-primary 
        hover:w-0.5
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-1 
        ${className}`}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm bg-background border border-border">
          <GripVertical className="!text-lg text-muted-foreground" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};


export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
