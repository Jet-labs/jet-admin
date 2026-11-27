import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Label, RadioGroup, RadioGroupItem, WidgetBusy, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const normalizeOptions = (widgetConfig) => {
  const raw = Array.isArray(widgetConfig?.optionsTemplate) ? widgetConfig.optionsTemplate : (widgetConfig?.options || []);
  const labelKey = widgetConfig?.labelKey || "label";
  const valueKey = widgetConfig?.valueKey || "value";
  return raw.map((option) => {
    if (option && typeof option === "object") {
      return {
        label: String(option[labelKey] ?? option.label ?? ""),
        value: String(option[valueKey] ?? option.value ?? ""),
        description: option.description || "",
        disabled: normalizeFieldBoolean(option.disabled, false),
      };
    }
    return { label: String(option), value: String(option), description: "", disabled: false };
  });
};

export const RadioGroupWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const orientation = widgetConfig?.orientation || "vertical";
  const variant = widgetConfig?.variant || "plain";
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const required = normalizeFieldBoolean(widgetConfig?.required, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const reactId = useId();
  const id = `radio-${reactId.replace(/:/g, "")}`;
  const labelId = `${id}-label`;
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const options = useMemo(() => normalizeOptions(widgetConfig), [widgetConfig]);
  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: v }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: v });
      },
      clear: () => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: "" }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: "" });
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const handleChange = (nextValue) => {
    if (disabled || readOnly) return;
    setTouched(true);
    setError("");
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: nextValue }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: nextValue });
  };

  const errorId = error ? `${id}-error` : undefined;
  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col gap-1.5" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Updating…" />}
      {label && (
        <Label id={labelId} className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
        </Label>
      )}
      <RadioGroup
        value={String(value ?? "")}
        onValueChange={handleChange}
        disabled={disabled || readOnly}
        aria-labelledby={label ? labelId : undefined}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onBlur={() => {
          setTouched(true);
          if (required && !value) setError("Select an option.");
        }}
        className={cn(
          orientation === "horizontal" ? "flex flex-row flex-wrap gap-3" : "flex flex-col gap-2",
          variant === "cards" && "gap-2"
        )}
      >
        {options.length === 0 && <span className="text-xs text-muted-foreground">No options configured</span>}
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          const selected = String(value) === option.value;
          return (
            <label
              key={`${option.value}-${index}`}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-start gap-2",
                variant === "cards" && "min-w-[160px] flex-1 rounded-card border p-2 transition-colors",
                variant === "cards" && (selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"),
                variant === "cards" && option.disabled && "cursor-not-allowed opacity-50",
                variant === "plain" && option.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <RadioGroupItem value={option.value} id={optionId} disabled={option.disabled} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-foreground">{option.label}</span>
                {option.description && <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </RadioGroup>
      {error && touched && (
        <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>
      )}
    </WidgetSurface>
  );
};

RadioGroupWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default RadioGroupWidget;
