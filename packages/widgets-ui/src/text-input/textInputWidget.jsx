import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { Input, Label, Textarea, WidgetBusy, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const applyMask = (raw, mask) => {
  if (!mask) return raw;
  let output = "";
  let cursor = 0;
  for (const token of String(mask)) {
    if (cursor >= String(raw).length) break;
    const char = String(raw)[cursor];
    if (token === "9" && /\d/.test(char)) {
      output += char;
      cursor += 1;
    } else if (token === "A" && /[a-zA-Z]/.test(char)) {
      output += char;
      cursor += 1;
    } else if (token === "*" && /[a-zA-Z0-9]/.test(char)) {
      output += char;
      cursor += 1;
    } else if (token === "9" || token === "A" || token === "*") {
      cursor += 1;
    } else {
      output += token;
    }
  }
  return output;
};

/**
 * TextInputWidget
 * Single-line or multi-line text entry. Value lives in widgetState.value so
 * queries can bind via {{ state.widgets.<id>.value }}.
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
  const required = normalizeFieldBoolean(widgetConfig?.required, false);
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const maxLength = widgetConfig?.maxLength;
  const minLength = widgetConfig?.minLength;
  const pattern = widgetConfig?.pattern;
  const errorMessage = widgetConfig?.errorMessage;
  const rows = widgetConfig?.rows || 3;
  const isTextarea = inputType === "textarea";
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const prefix = widgetConfig?.prefix || "";
  const suffix = widgetConfig?.suffix || "";
  const labelPosition = widgetConfig?.labelPosition || "top";
  const size = widgetConfig?.size || "default";
  const variant = widgetConfig?.variant || "outline";
  const showCount = normalizeFieldBoolean(widgetConfig?.showCount, false);
  const autosize = normalizeFieldBoolean(widgetConfig?.autosize, false);
  const allowPasswordReveal = widgetConfig?.allowPasswordReveal !== false;
  const validateOn = widgetConfig?.validateOn || "blur";
  const help = widgetConfig?.help || "";
  const density = widgetConfig?.properties?.density || "comfortable";

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const reactId = useId();
  const fieldId = `text-input-${reactId.replace(/:/g, "")}`;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const validate = (nextValue) => {
    const text = String(nextValue ?? "");
    if (required && text.trim() === "") return "This field is required.";
    if (minLength !== undefined && minLength !== "" && text.length < Number(minLength)) {
      return `Enter at least ${minLength} characters.`;
    }
    if (pattern) {
      try {
        if (!new RegExp(pattern).test(text)) return errorMessage || "Enter a valid value.";
      } catch {
        /* Invalid authoring patterns should not block the user. */
      }
    }
    return "";
  };

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  useEffect(() => {
    if (!isTextarea || !autosize || !textareaRef.current) return;
    const node = textareaRef.current;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [value, isTextarea, autosize]);

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
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onClear", { value: "" });
      },
      focus: () => (textareaRef.current || inputRef.current)?.focus?.(),
    };
  }

  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const handleChange = (event) => {
    const masked = applyMask(event.target.value, widgetConfig?.mask);
    const nextValue = masked.slice(0, maxLength > 0 ? maxLength : undefined);
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: nextValue }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: nextValue });
    if (touched) setError(validate(nextValue));
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOn === "blur") setError(validate(value));
    if (fireWidgetEvent) fireWidgetEvent("onBlur", { value });
  };

  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const sizeClass = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const variantClass =
    variant === "filled"
      ? "border-transparent bg-muted/50 focus-visible:border-border"
      : variant === "underline"
        ? "rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
        : "";
  const fieldClass = cn("w-full", sizeClass, variantClass);

  const control = isTextarea ? (
    <Textarea
      ref={(node) => {
        textareaRef.current = node;
        inputRef.current = node;
      }}
      id={fieldId}
      value={value ?? ""}
      onChange={handleChange}
      onFocus={() => fireWidgetEvent?.("onFocus", { value })}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      rows={rows}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(fieldClass, "min-h-[72px] resize-y bg-background")}
      style={autosize ? { overflow: "hidden" } : undefined}
    />
  ) : (
    <Input
      ref={inputRef}
      id={fieldId}
      type={reveal ? "text" : inputType === "number" ? "number" : inputType}
      value={value ?? ""}
      onChange={handleChange}
      onFocus={() => fireWidgetEvent?.("onFocus", { value })}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      size={size}
      autoComplete={widgetConfig?.autoComplete || undefined}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={fieldClass}
    />
  );

  const field = prefix || suffix || (inputType === "password" && allowPasswordReveal) ? (
    <div
      className={cn(
        "flex w-full items-center rounded-control border border-input-custom bg-input-custom transition-shadow focus-within:border-border/80 focus-within:ring-2 focus-within:ring-primary/30",
        variant === "filled" && "border-transparent bg-muted/50",
        variant === "underline" && "rounded-none border-0 border-b border-border bg-transparent px-0"
      )}
    >
      {prefix && <span className="shrink-0 border-r border-border/60 px-2 text-xs text-muted-foreground">{prefix}</span>}
      <div className="min-w-0 flex-1">
        {isTextarea ? (
          <Textarea
            ref={(node) => {
              textareaRef.current = node;
              inputRef.current = node;
            }}
            id={fieldId}
            value={value ?? ""}
            onChange={handleChange}
            onFocus={() => fireWidgetEvent?.("onFocus", { value })}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            rows={rows}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn("min-h-[72px] resize-y border-0 bg-transparent focus-visible:ring-0", sizeClass)}
          />
        ) : (
          <Input
            ref={inputRef}
            id={fieldId}
            type={reveal ? "text" : inputType === "number" ? "number" : inputType}
            value={value ?? ""}
            onChange={handleChange}
            onFocus={() => fireWidgetEvent?.("onFocus", { value })}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn("border-0 bg-transparent focus-visible:ring-0", sizeClass)}
          />
        )}
      </div>
      {inputType === "password" && allowPasswordReveal && (
        <button
          type="button"
          onClick={() => setReveal((prev) => !prev)}
          className="mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={reveal ? "Hide password" : "Show password"}
          title={reveal ? "Hide password" : "Show password"}
        >
          {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      )}
      {suffix && <span className="shrink-0 border-l border-border/60 px-2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  ) : (
    control
  );

  const labelNode = label ? (
    <Label
      htmlFor={fieldId}
      className={cn(
        "text-xs font-medium text-foreground",
        labelPosition === "hidden" && "sr-only",
        labelPosition === "left" && "w-1/3 shrink-0 text-right"
      )}
    >
      {label}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  ) : null;

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full min-h-0 flex-col", labelPosition === "left" ? "gap-2" : "gap-1.5")}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className={cn("flex w-full min-w-0 flex-1 flex-col gap-1.5", labelPosition === "left" && "flex-row items-start")}>
        {labelNode}
        <div className="min-w-0 flex-1 space-y-1">
          {field}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {help && !error && (
                <p id={helpId} className="text-[11px] leading-snug text-muted-foreground">
                  {help}
                </p>
              )}
              {error && (
                <p id={errorId} role="alert" className="text-[11px] leading-snug text-destructive">
                  {error}
                </p>
              )}
            </div>
            {showCount && (
              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                {String(value ?? "").length}
                {maxLength ? `/${maxLength}` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </WidgetSurface>
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
