import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Checkbox, Label, WidgetBusy, WidgetSurface, cn } from "@jet-admin/ui";
import { buildFieldId, resolveInstanceKey, useInstanceSuffix } from "../_shared/fieldA11y";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const CheckboxWidget = ({
  widgetConfig,
  widgetState,
  setWidgetState,
  fireWidgetEvent,
  onWidgetInit,
  widgetID,
  resourceID,
  placementKey,
  instanceID,
}) => {
  const label = widgetConfig?.label || "Checkbox";
  const description = widgetConfig?.description || "";
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const required = normalizeFieldBoolean(widgetConfig?.required, false);
  const indeterminate = normalizeFieldBoolean(widgetConfig?.indeterminate, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const size = widgetConfig?.size || "default";
  const density = widgetConfig?.properties?.density || "comfortable";
  const checked = widgetState?.value ?? widgetConfig?.defaultChecked ?? false;
  const boolChecked = normalizeFieldBoolean(checked, false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const instanceKey = useInstanceSuffix(resolveInstanceKey({ instanceID, widgetID, resourceID, placementKey }));
  const controlId = buildFieldId(instanceKey, label, 0);
  const descriptionId = description ? `${controlId}-desc` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultChecked !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: !!widgetConfig.defaultChecked }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultChecked]);

  const liveRef = useRef(null);
  liveRef.current = { checked: boolChecked, setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        const b = normalizeFieldBoolean(v, false);
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: b }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: b });
      },
      clear: () => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: false }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: false });
      },
      toggle: () => {
        const rt = liveRef.current;
        const next = !rt.checked;
        if (rt.setWidgetState) rt.setWidgetState(() => ({ value: next }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: next });
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const handleChange = (nextChecked) => {
    if (disabled || readOnly) return;
    const b = !!nextChecked;
    setTouched(true);
    if (required && !b) setError("This field is required.");
    else setError("");
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: b }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: b });
  };

  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col justify-center" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className="flex items-start gap-2">
        <Checkbox
          checked={indeterminate && !boolChecked ? "indeterminate" : boolChecked}
          disabled={disabled}
          onCheckedChange={handleChange}
          onBlur={() => {
            setTouched(true);
            if (required && !boolChecked) setError("This field is required.");
          }}
          id={controlId}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-readonly={readOnly || undefined}
          className={cn(sizeClass, "mt-0.5")}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Label htmlFor={controlId} className="cursor-pointer text-xs font-medium leading-snug text-foreground">
            {label}
            {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          </Label>
          {description && (
            <span id={descriptionId} className="text-xs leading-snug text-muted-foreground">
              {description}
            </span>
          )}
          {error && touched && (
            <span id={errorId} role="alert" className="text-[11px] text-destructive">
              {error}
            </span>
          )}
        </div>
      </div>
    </WidgetSurface>
  );
};

CheckboxWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  resourceID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placementKey: PropTypes.string,
  instanceID: PropTypes.string,
};

export default CheckboxWidget;
