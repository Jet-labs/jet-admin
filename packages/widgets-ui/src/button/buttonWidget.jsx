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
      disabled={loading || isLoadingWorkflows}
      className="!w-[calc(100%+1rem)] !h-[calc(100%+0.75rem)] -ml-2 -mr-2 -mb-2 -mt-1 rounded-none flex items-center justify-center text-center px-4 border-0"
    >
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
