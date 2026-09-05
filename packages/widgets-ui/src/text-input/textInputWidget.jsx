import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Label, Textarea } from "@jet-admin/ui";

/**
 * TextInputWidget
 * Single-line or multi-line text entry. Value lives in widgetState.value
 * so queries can bind via {{ state.widgets.<id>.value }}.
 */
export const TextInputWidget = ({
  widgetConfig,
  widgetState,
  setWidgetState,
  fireWidgetEvent,
  onWidgetInit,
}) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "";
  const inputType = widgetConfig?.inputType || "text";
  const required = !!widgetConfig?.required;
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const maxLength = widgetConfig?.maxLength;
  const rows = widgetConfig?.rows || 3;
  const isTextarea = inputType === "textarea";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const inputRef = useRef(null);

  // Init default value once
  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  // Expose methods
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: v }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v });
      },
      clear: () => {
        if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: "" }));
        if (fireWidgetEvent) fireWidgetEvent("onClear", { value: "" });
      },
      focus: () => inputRef.current?.focus?.(),
    };
  }

  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const handleChange = (e) => {
    const v = e.target.value;
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: v }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v });
  };

  return (
    <div className="flex flex-col gap-1.5 w-full h-full min-h-0 p-2 relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {label && <Label className="text-xs font-medium text-foreground">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</Label>}
      {isTextarea ? (
        <Textarea
          ref={inputRef}
          value={value ?? ""}
          onChange={handleChange}
          onFocus={() => fireWidgetEvent?.("onFocus", { value })}
          onBlur={() => fireWidgetEvent?.("onBlur", { value })}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className="text-sm bg-background resize-y"
        />
      ) : (
        <Input
          ref={inputRef}
          type={inputType === "number" ? "number" : inputType}
          value={value ?? ""}
          onChange={handleChange}
          onFocus={() => fireWidgetEvent?.("onFocus", { value })}
          onBlur={() => fireWidgetEvent?.("onBlur", { value })}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className="text-sm"
        />
      )}
    </div>
  );
};

TextInputWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default TextInputWidget;
