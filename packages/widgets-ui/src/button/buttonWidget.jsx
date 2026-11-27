import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Check,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  WidgetSurface,
  cn,
} from "@jet-admin/ui";
import { getIconComponent } from "../config/IconPicker";

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

const parseShortcut = (shortcut) => {
  if (!shortcut || typeof shortcut !== "string") return null;
  const parts = shortcut
    .split("+")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (!parts.length) return null;
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("cmd") || parts.includes("meta"),
    alt: parts.includes("alt") || parts.includes("option"),
    shift: parts.includes("shift"),
    key: parts[parts.length - 1],
  };
};

/**
 * ButtonWidget — action button with guarded execution, optional confirmation,
 * tooltip, shortcut, loading and success feedback.
 */
export const ButtonWidget = ({
  widgetConfig,
  onClick,
  isLoadingWorkflows,
  onWidgetInit,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const successTimer = useRef(null);
  const text = widgetConfig?.text ?? widgetConfig?.label ?? "Click Me";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";
  const align = ALIGNMENTS[widgetConfig?.alignment] ? widgetConfig?.alignment : "center";
  const fullWidth = isTruthyTemplate(widgetConfig?.fullWidth);
  const iconName = typeof widgetConfig?.icon === "string" ? widgetConfig.icon.trim() : "";
  const iconPosition = widgetConfig?.iconPosition === "right" ? "right" : "left";
  const Icon = getIconComponent(iconName);
  const density = widgetConfig?.properties?.density || "comfortable";
  const tooltipText = widgetConfig?.tooltip ? String(widgetConfig.tooltip) : "";
  const confirm = widgetConfig?.confirm || {};
  const confirmEnabled = !!confirm.enabled;
  const configLoading = isTruthyTemplate(widgetConfig?.isLoading ?? widgetConfig?.loading);
  const configDisabled = isTruthyTemplate(widgetConfig?.disabled);
  const busy = loading || isLoadingWorkflows || configLoading;
  const disabled = busy || configDisabled;
  const iconOnly = !String(text || "").trim() || ((size === "icon" || size === "circle") && !!Icon);
  const accessibleName =
    widgetConfig?.properties?.ariaLabel ||
    tooltipText ||
    String(text || "").trim() ||
    (iconOnly ? iconName || "Button" : undefined);
  const loadingText = widgetConfig?.loadingText || "";
  const successText = widgetConfig?.successText || "";
  const shortcut = parseShortcut(widgetConfig?.shortcut);

  const buttonRef = useRef(null);
  const runClick = async (event) => {
    if (disabled) {
      event?.preventDefault?.();
      return;
    }
    if (!onClick) return;
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      await onClick(event);
      setSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 1400);
    } catch (clickError) {
      setError(clickError?.message || "Action failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    if (disabled) {
      event?.preventDefault?.();
      return;
    }
    if (confirmEnabled && !confirmOpen) {
      event?.preventDefault?.();
      setConfirmOpen(true);
      return;
    }
    runClick(event);
  };

  // Advertised click/focus methods run the same guarded path.
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

  useEffect(() => {
    const cleanup = () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
    return cleanup;
  }, []);

  useEffect(() => {
    if (!shortcut) return undefined;
    const handleKeyDown = (event) => {
      if (disabled) return;
      const target = event.target;
      const editable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (editable && !(shortcut.ctrl || shortcut.meta || shortcut.alt)) return;
      const ctrl = event.ctrlKey || event.metaKey;
      if (
        shortcut.ctrl === event.ctrlKey &&
        shortcut.meta === event.metaKey &&
        shortcut.alt === event.altKey &&
        shortcut.shift === event.shiftKey &&
        (shortcut.ctrl || shortcut.meta ? ctrl : true) &&
        event.key.toLowerCase() === shortcut.key
      ) {
        event.preventDefault();
        handleClick(event);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.shortcut, disabled, confirmEnabled]);

  const displayText = busy && loadingText ? loadingText : success && successText ? successText : text;
  const LeadingIcon = success ? (successText ? null : Check) : Icon && iconPosition === "left" ? Icon : null;
  const TrailingIcon = success && successText ? Check : Icon && iconPosition === "right" ? Icon : null;

  const button = (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      aria-busy={busy}
      aria-label={accessibleName}
      aria-keyshortcuts={widgetConfig?.shortcut || undefined}
      title={tooltipText || (typeof text === "string" ? text : undefined)}
      className={cn(
        "relative inline-flex max-w-full min-w-0 items-center justify-center gap-1.5 text-center",
        fullWidth && "w-full",
        iconOnly && "px-0"
      )}
    >
      {(busy || (loading && !configLoading)) && <Spinner className="h-4 w-4 shrink-0" />}
      {LeadingIcon && <LeadingIcon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {!iconOnly && (
        <span className="min-w-0 truncate" aria-live="polite" aria-atomic="true">
          {displayText}
        </span>
      )}
      {TrailingIcon && <TrailingIcon className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </Button>
  );

  const wrappedButton = tooltipText ? (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );

  return (
    <WidgetSurface
      density={density}
      className={cn("flex h-full w-full p-1", error ? "flex-col items-stretch justify-center gap-1" : cn("items-center", ALIGNMENTS[align], fullWidth && "items-stretch"))}
    >
      {wrappedButton}
      {error && (
        <p role="alert" className="w-full px-1 text-[10px] leading-snug text-destructive">
          {error}
        </p>
      )}

      {confirmEnabled && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title || "Please confirm"}</AlertDialogTitle>
              <AlertDialogDescription>{confirm.message || "This action will run immediately."}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{confirm.cancelLabel || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={(event) => runClick(event)}>{confirm.confirmLabel || "Confirm"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WidgetSurface>
  );
};

ButtonWidget.propTypes = {
  widgetConfig: PropTypes.object,
  onClick: PropTypes.func,
  isLoadingWorkflows: PropTypes.bool,
  onWidgetInit: PropTypes.func,
};

export default ButtonWidget;
