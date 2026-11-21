import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Edit,
  Filter,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button, Spinner } from "@jet-admin/ui";
import { cn } from "@jet-admin/ui";

/**
 * Curated icon set for button widgets (by config `icon` name).
 * Unknown names render no icon rather than crashing the page.
 */
const ICONS = {
  play: Play,
  plus: Plus,
  download: Download,
  upload: Upload,
  trash: Trash2,
  delete: Trash2,
  edit: Edit,
  save: Save,
  search: Search,
  refresh: RefreshCw,
  sync: RefreshCw,
  arrowRight: ArrowRight,
  arrow: ArrowRight,
  check: Check,
  close: X,
  x: X,
  filter: Filter,
  settings: Settings,
  chevronDown: ChevronDown,
};

const ALIGNMENTS = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function isTruthyTemplate(value) {
  if (value === true) return true;
  if (value === false || value == null) return false;
  const str = String(value).trim().toLowerCase();
  return str !== "" && str !== "false" && str !== "0" && str !== "no" && str !== "off";
}

export const ButtonWidget = ({
  widgetTitle,     // Title of the widget (optional usage here)
  widgetType,      // Type of widget (e.g., 'button')
  widgetConfig,    // Widget-level config (text, variant, size, icon, alignment, ...)
  onClick,         // Callback to execute the attached event/workflow
  isLoadingWorkflows, // Loading state of the workflow
  onWidgetInit,    // Runtime method registration (exposes click/focus)
}) => {
  const [loading, setLoading] = useState(false);
  const text = widgetConfig?.text ?? widgetConfig?.label ?? "Click Me";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";
  const align = ALIGNMENTS[widgetConfig?.alignment] ? widgetConfig?.alignment : "center";
  const fullWidth = isTruthyTemplate(widgetConfig?.fullWidth);
  const iconName = typeof widgetConfig?.icon === "string" ? widgetConfig.icon.trim() : "";
  const iconPosition = widgetConfig?.iconPosition === "right" ? "right" : "left";
  const Icon = iconName ? ICONS[iconName] || ICONS[iconName.toLowerCase()] || null : null;

  // Dual-read: canonical isLoading, legacy loading fallback (F04).
  const configLoading = isTruthyTemplate(widgetConfig?.isLoading ?? widgetConfig?.loading);
  const configDisabled = isTruthyTemplate(widgetConfig?.disabled);
  const busy = loading || isLoadingWorkflows || configLoading;
  const disabled = busy || configDisabled;

  const handleClick = async (e) => {
    if (disabled) {
      e?.preventDefault?.();
      return;
    }
    if (onClick) {
      setLoading(true);
      try {
        await onClick(e);
      } finally {
        setLoading(false);
      }
    }
  };

  // Advertised `click`/`focus` methods (B17/E03): programmatic clicks run the
  // same guarded path as mouse/keyboard (disabled/busy blocks all routes,
  // exactly one execution). Method calls never fire unsupported onSubmit.
  const buttonRef = useRef(null);
  const guardedRef = useRef(handleClick);
  guardedRef.current = handleClick;
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      click: () => guardedRef.current(undefined),
      focus: () => buttonRef.current?.focus?.(),
    };
  }

  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  return (
    <div
      className={cn(
        "flex h-full w-full items-center p-1",
        ALIGNMENTS[align],
        fullWidth && "items-stretch"
      )}
    >
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        aria-busy={busy}
        aria-live="polite"
        title={typeof text === "string" ? text : undefined}
        className={cn(
          "relative inline-flex max-w-full min-w-0 items-center justify-center gap-1.5 text-center",
          fullWidth && "w-full"
        )}
      >
        {/* Loading overlay */}
        {configLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-background/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
              <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
              Updating...
            </div>
          </div>
        )}
        {(loading || isLoadingWorkflows) && <Spinner className="h-4 w-4 shrink-0" />}
        {Icon && iconPosition === "left" && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span className="min-w-0 truncate">{text}</span>
        {Icon && iconPosition === "right" && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </Button>
    </div>
  );
};

ButtonWidget.propTypes = {
  widgetTitle: PropTypes.string,
  widgetType: PropTypes.string,
  widgetConfig: PropTypes.object,
  onClick: PropTypes.func,
  isLoadingWorkflows: PropTypes.bool,
  onWidgetInit: PropTypes.func,
};

export default ButtonWidget;
