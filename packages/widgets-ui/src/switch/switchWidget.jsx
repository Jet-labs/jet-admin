import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Switch,
  WidgetBusy,
  WidgetSurface,
  cn,
} from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const SwitchWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "Toggle";
  const description = widgetConfig?.description || "";
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const checkedRaw = widgetState?.value ?? widgetConfig?.defaultChecked ?? false;
  const checked = checkedRaw === true || checkedRaw === "true";
  const confirm = widgetConfig?.confirm || {};
  const labelPlacement = widgetConfig?.labelPlacement || "left";
  const size = widgetConfig?.size || "default";
  const density = widgetConfig?.properties?.density || "comfortable";
  const reactId = useId();
  const id = `switch-${reactId.replace(/:/g, "")}`;
  const descriptionId = description ? `${id}-desc` : undefined;
  const [pendingValue, setPendingValue] = useState(null);

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultChecked !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: !!widgetConfig.defaultChecked }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultChecked]);

  const liveRef = useRef(null);
  liveRef.current = { checked, setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        const b = v === true || v === "true";
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: b }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: b });
      },
      toggle: () => {
        const rt = liveRef.current;
        const next = !rt.checked;
        if (rt.setWidgetState) rt.setWidgetState(() => ({ value: next }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: next });
      },
      clear: () => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: false }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: false });
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const commit = (next) => {
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: next }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: next });
  };

  const requestChange = (next) => {
    if (disabled || readOnly) return;
    if (confirm.enabled) {
      setPendingValue(next);
      return;
    }
    commit(next);
  };

  const sizeClass = size === "sm" ? "h-[14px] w-[26px] [&>span]:h-2.5 [&>span]:w-2.5 data-[state=checked]:[&>span]:translate-x-3" : size === "lg" ? "h-5 w-9 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4" : undefined;
  const labelNode = (
    <div className={cn("flex min-w-0 flex-col gap-0.5", labelPlacement === "right" && "order-2")}>
      <Label htmlFor={id} className="cursor-pointer text-xs font-medium leading-none text-foreground">
        {label}
      </Label>
      {description && (
        <span id={descriptionId} className="text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      )}
    </div>
  );

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full items-center" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className="flex w-full items-center justify-between gap-3">
        {labelNode}
        <div className={cn("flex shrink-0 items-center gap-1.5", labelPlacement === "right" && "order-1")}>
          {normalizeFieldBoolean(widgetConfig?.showStateLabels, false) && (
            <span className="text-[10px] text-muted-foreground">{checked ? widgetConfig?.onLabel || "On" : widgetConfig?.offLabel || "Off"}</span>
          )}
          <Switch
            id={id}
            checked={checked}
            disabled={disabled}
            aria-describedby={descriptionId}
            aria-readonly={readOnly || undefined}
            onCheckedChange={requestChange}
            className={sizeClass}
          />
        </div>
      </div>

      {confirm.enabled && (
        <AlertDialog open={pendingValue !== null} onOpenChange={(open) => { if (!open) setPendingValue(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title || "Change this setting?"}</AlertDialogTitle>
              <AlertDialogDescription>{confirm.message || "Please confirm the new state."}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingValue(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingValue !== null) commit(pendingValue);
                  setPendingValue(null);
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WidgetSurface>
  );
};

SwitchWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default SwitchWidget;
