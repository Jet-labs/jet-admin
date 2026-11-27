import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Button, WidgetSurface, cn } from "@jet-admin/ui";
import { getIconComponent } from "../config/IconPicker";
import { resolveConditionalStyle } from "../config/conditionalStyle";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const DEFAULT_ICONS = { info: Info, success: CheckCircle, warning: AlertTriangle, error: AlertCircle, neutral: Info };
const STATUS_CLASS = { info: "status-info", success: "status-success", warning: "status-warning", error: "status-danger", neutral: "status-neutral" };

const dismissKey = (widgetID, title, message) => `jet.alert.dismissed.${widgetID || "alert"}.${encodeURIComponent(`${title}|${message}`).slice(0, 180)}`;

export const AlertWidget = ({ widgetID, widgetConfig, fireWidgetEvent }) => {
  const message = widgetConfig?.message || "Something requires your attention.";
  const title = widgetConfig?.title || "";
  const variant = widgetConfig?.variant || "info";
  const dismissible = widgetConfig?.dismissible !== false;
  const persistDismissal = normalizeFieldBoolean(widgetConfig?.persistDismissal, false);
  const layout = widgetConfig?.layout || "inline";
  const autoDismissMs = Number(widgetConfig?.autoDismissMs || 0);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const actions = Array.isArray(widgetConfig?.actions) ? widgetConfig.actions : [];
  const IconOverride = getIconComponent(widgetConfig?.icon);
  const conditional = resolveConditionalStyle(widgetConfig?.styleRules, { value: message, message, title, ...widgetConfig });
  const effectiveVariant = conditional?.tone && conditional.tone !== "neutral" ? conditional.tone : variant;
  const Icon = IconOverride || DEFAULT_ICONS[effectiveVariant] || Info;
  const key = useMemo(() => dismissKey(widgetID, title, message), [widgetID, title, message]);
  const [dismissed, setDismissed] = useState(() => {
    if (!persistDismissal || typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });
  const [mounted, setMounted] = useState(true);

  const dismiss = (source = "user") => {
    setDismissed(true);
    setMounted(false);
    if (persistDismissal && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }
    fireWidgetEvent?.("onDismiss", { title, message, source });
  };

  useEffect(() => {
    setDismissed(false);
    setMounted(true);
  }, [title, message]);

  useEffect(() => {
    if (!autoDismissMs || dismissed) return undefined;
    const timer = setTimeout(() => dismiss("timeout"), autoDismissMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDismissMs, dismissed]);

  if (dismissed || !mounted) return null;

  const role = effectiveVariant === "warning" || effectiveVariant === "error" || effectiveVariant === "danger" ? "alert" : "status";

  return (
    <WidgetSurface
      density={density}
      className={cn(
        "relative flex h-full w-full min-h-0 items-start gap-2 overflow-auto border p-2",
        STATUS_CLASS[effectiveVariant] || STATUS_CLASS.info,
        layout === "banner" ? "rounded-none border-x-0" : "rounded-card"
      )}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      aria-busy={isLoading || undefined}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 text-xs font-semibold leading-snug text-current">{title}</p>}
        <p className="text-xs leading-relaxed text-current/85">{message}</p>
        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {actions.map((action, index) => (
              <Button
                key={`${action.actionKey || action.label}-${index}`}
                type="button"
                variant={action.variant === "destructive" ? "destructive" : action.variant === "default" ? "default" : "outline"}
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => fireWidgetEvent?.("onAction", { actionKey: action.actionKey, label: action.label })}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => dismiss("user")}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-current/70 hover:bg-foreground/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Dismiss alert"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </WidgetSurface>
  );
};

AlertWidget.propTypes = {
  widgetID: PropTypes.string,
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
};

export default AlertWidget;
