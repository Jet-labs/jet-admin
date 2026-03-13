import React from "react";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";

export const ButtonWidget = ({
  widgetTitle,     // Title of the widget (optional usage here)
  widgetType,      // Type of widget (e.g., 'button')
  widgetConfig,    // Widget-level config (text, variant, size)
  runWorkflow,     // Callback to execute the attached workflow
  isLoadingWorkflows, // Loading state of the workflow
}) => {
  const text = widgetConfig?.text || "Click Me";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";

  return (
    <div className="flex w-full h-full items-center justify-center p-4 text-center">
      <Button
        variant={variant}
        size={size}
        onClick={runWorkflow}
        disabled={isLoadingWorkflows}
      >
        {isLoadingWorkflows && <Spinner className="mr-2 h-4 w-4" />}
        {text}
      </Button>
    </div>
  );
};

ButtonWidget.propTypes = {
  widgetTitle: PropTypes.string,
  widgetType: PropTypes.string,
  widgetConfig: PropTypes.object,
  runWorkflow: PropTypes.func,
  isLoadingWorkflows: PropTypes.bool,
};

export default ButtonWidget;
