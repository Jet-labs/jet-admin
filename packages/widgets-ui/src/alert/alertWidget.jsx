import React, { useState } from "react";
import PropTypes from "prop-types";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";
import { Button } from "@jet-admin/ui";

/**
 * AlertWidget
 *
 * Displays styled banner notices (info, success, warning, error)
 * that can be dismissed. Dismisall triggers an optional onDismiss event.
 */
export const AlertWidget = ({
  widgetConfig,
  fireWidgetEvent,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const message = widgetConfig?.message || "Something requires your attention.";
  const title = widgetConfig?.title || "";
  const variant = widgetConfig?.variant || "info"; // "info" | "success" | "warning" | "error"
  const dismissible = widgetConfig?.dismissible ?? true;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (fireWidgetEvent) {
      fireWidgetEvent("onDismiss");
    }
  };

  // Icon mapping
  const IconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = IconMap[variant] || Info;

  // Visual style configurations
  const styles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  }[variant] || "bg-blue-500/10 border-blue-500/20 text-blue-400";

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border rounded-none w-full h-full min-h-0 overflow-auto relative ${styles}`}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="text-sm font-semibold mb-1 leading-none text-current">
            {title}
          </h5>
        )}
        <p className="text-xs leading-relaxed text-current/80">
          {message}
        </p>
      </div>

      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-current hover:bg-current/10 -mt-1 -mr-1"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

AlertWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
};

export default AlertWidget;
