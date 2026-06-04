import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";

export const ButtonWidget = ({
  widgetTitle,     // Title of the widget (optional usage here)
  widgetType,      // Type of widget (e.g., 'button')
  widgetConfig,    // Widget-level config (text, variant, size)
  onClick,         // Callback to execute the attached event/workflow
  isLoadingWorkflows, // Loading state of the workflow
}) => {
  const [loading, setLoading] = useState(false);
  const text = widgetConfig?.text || "Click Me";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";

  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const handleClick = async (e) => {
    if (onClick) {
      setLoading(true);
      try {
        await onClick(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || isLoadingWorkflows || isLoading}
      className="!w-[calc(100%+1rem)] !h-[calc(100%+0.75rem)] -ml-2 -mr-2 -mb-2 -mt-1 rounded-none flex items-center justify-center text-center px-4 border-0 relative"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {(loading || isLoadingWorkflows) && <Spinner className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
};

ButtonWidget.propTypes = {
  widgetTitle: PropTypes.string,
  widgetType: PropTypes.string,
  widgetConfig: PropTypes.object,
  onClick: PropTypes.func,
  isLoadingWorkflows: PropTypes.bool,
};

export default ButtonWidget;
