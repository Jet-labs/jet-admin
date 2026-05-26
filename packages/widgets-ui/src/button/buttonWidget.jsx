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
      className="!w-full !h-full rounded-none flex items-center justify-center text-center px-4 border-0"
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
