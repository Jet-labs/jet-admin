import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Textarea } from "@jet-admin/ui";
import {
  normalizeFieldBoolean,
  normalizeOptions,
  coerceFieldValue,
  validateFieldValue,
  buildFieldDefaults,
  mergeDefaultsPreservingDirty,
  normalizeFormLayout,
} from "../_shared/fieldContracts";
import { buildFieldId, buildFieldA11y, resolveInstanceKey, useInstanceSuffix, focusFirstInvalid } from "../_shared/fieldA11y";

/**
 * FormWidget (E08 + F01/F05).
 *
 * Canonical config: fields[], submitLabel, resetLabel, layout
 * (vertical|horizontal|grid), columns, size (sm|default|lg), showReset,
 * isLoading. Legacy resetLabel implies showReset (normalizeFormLayout).
 *
 * State (exposed via widgetState for sibling bindings, B16):
 * { values, errors, touched, dirty, isDirty, isValid, isSubmitting,
 *   submitCount, lastSubmitError }
 * Draft lives in widgetState when setWidgetState exists, with a local
 * fallback for standalone preview. Dirty keys survive unrelated
 * query/config refresh: fresh defaults merge only into untouched fields.
 *
 * Validation reuses fieldContracts (same coercion as standalone inputs):
 * numeric values stay numbers, required select/checkbox block submit,
 * email/pattern/min/max enforced. Submit awaits fireWidgetEvent outcomes;
 * failure retains the draft and surfaces submitError with focus.
 */
export const FormWidget = ({
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
  const layoutCfg = useMemo(() => normalizeFormLayout(widgetConfig || {}), [widgetConfig]);
  const fields = useMemo(() => (Array.isArray(widgetConfig?.fields) ? widgetConfig.fields : []), [widgetConfig?.fields]);
  const instanceKey = useInstanceSuffix(resolveInstanceKey({ instanceID, widgetID, resourceID, placementKey }));
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  // Local fallback draft for standalone preview (no setWidgetState).
  const [localDraft, setLocalDraft] = useState(() => ({
    values: buildFieldDefaults(fields),
    errors: {},
    touched: {},
    dirty: [],
    isSubmitting: false,
    submitCount: 0,
    lastSubmitError: null,
  }));
  const liveState = widgetState && (widgetState.values !== undefined || widgetState.dirty !== undefined)
    ? {
        values: widgetState.values || {},
        errors: widgetState.errors || {},
        touched: widgetState.touched || {},
        dirty: widgetState.dirty || [],
        isSubmitting: !!widgetState.isSubmitting,
        submitCount: widgetState.submitCount || 0,
        lastSubmitError: widgetState.lastSubmitError || null,
      }
    : localDraft;

  const writeState = (patchOrUpdater) => {
    if (setWidgetState) {
      if (typeof patchOrUpdater === "function") {
        setWidgetState((prev) => {
          const cur = {
            values: prev?.values || {},
            errors: prev?.errors || {},
            touched: prev?.touched || {},
            dirty: prev?.dirty || [],
            isSubmitting: !!prev?.isSubmitting,
            submitCount: prev?.submitCount || 0,
            lastSubmitError: prev?.lastSubmitError || null,
          };
          const patch = patchOrUpdater(cur);
          return { ...cur, ...patch };
        });
      } else {
        setWidgetState(patchOrUpdater);
      }
    } else {
      setLocalDraft((prev) => (typeof patchOrUpdater === "function" ? { ...prev, ...patchOrUpdater(prev) } : { ...prev, ...patchOrUpdater }));
    }
  };

  // Merge fresh defaults into untouched fields only (B16 dirty preservation).
  const defaults = useMemo(() => buildFieldDefaults(fields), [fields]);
  const defaultsKey = useMemo(() => JSON.stringify({ defaults, keys: fields.map((f) => f?.key) }), [defaults, fields]);
  const lastDefaultsKeyRef = useRef(null);
  useEffect(() => {
    if (lastDefaultsKeyRef.current === defaultsKey) return;
    lastDefaultsKeyRef.current = defaultsKey;
    writeState((prev) => ({
      values: mergeDefaultsPreservingDirty(prev.values, defaults, prev.dirty),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsKey]);

  const fieldRefs = useRef({});
  const summaryRef = useRef(null);
  const liveRef = useRef(null);
  liveRef.current = { fields, layoutCfg, liveState, fireWidgetEvent, setWidgetState };

  const setFieldValue = (key, raw, fieldDef) => {
    const typed = coerceFieldValue(fieldDef?.type, raw);
    const opts = fieldDef?.type === "select" || fieldDef?.type === "radio" ? normalizeOptions(fieldDef.options) : null;
    const error = validateFieldValue(fieldDef || { key }, typed, opts);
    writeState((prev) => {
      const dirty = Array.from(new Set([...(prev.dirty || []), key]));
      const values = { ...prev.values, [key]: typed };
      const errors = { ...prev.errors };
      if (error) errors[key] = error;
      else delete errors[key];
      return {
        values,
        errors,
        touched: { ...prev.touched, [key]: true },
        dirty,
        isDirty: dirty.length > 0,
        isValid: Object.keys(errors).length === 0,
      };
    });
    if (fireWidgetEvent) {
      const nextValues = { ...(liveRef.current.liveState.values || {}), [key]: typed };
      fireWidgetEvent("onFieldChange", { field: key, value: typed, formData: nextValues, values: nextValues });
    }
  };

  const validateAll = () => {
    const errors = {};
    const order = [];
    for (const f of fields) {
      if (!f?.key) continue;
      order.push(f.key);
      const opts = f.type === "select" || f.type === "radio" ? normalizeOptions(f.options) : null;
      const err = validateFieldValue(f, liveRef.current.liveState.values?.[f.key], opts);
      if (err) errors[f.key] = err;
    }
    return { errors, order: order.filter((k) => errors[k]) };
  };

  const doSubmit = async () => {
    const { errors, order } = validateAll();
    writeState(() => ({
      errors,
      touched: Object.fromEntries((fields || []).map((f) => [f?.key, true])),
      isValid: Object.keys(errors).length === 0,
    }));
    if (Object.keys(errors).length > 0) {
      if (fireWidgetEvent) fireWidgetEvent("onSubmit", { formData: liveRef.current.liveState.values, values: liveRef.current.liveState.values, errors, isValid: false });
      // Focus first invalid for keyboard users (F05).
      const focusInvalid = () => {
        focusFirstInvalid(fieldRefs.current, order);
        summaryRef.current?.focus?.();
      };
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusInvalid);
      else focusInvalid();
      return { ok: false, errors };
    }
    writeState(() => ({ isSubmitting: true, lastSubmitError: null }));
    const payload = { formData: liveRef.current.liveState.values, values: liveRef.current.liveState.values };
    try {
      const outcomes = fireWidgetEvent ? await fireWidgetEvent("onSubmit", payload) : [];
      const failed = Array.isArray(outcomes) ? outcomes.find((o) => o && o.success === false) : null;
      if (failed) {
        const msg = failed.error?.message || failed.error || "Submit action failed.";
        writeState((prev) => ({ isSubmitting: false, lastSubmitError: String(msg), submitCount: (prev.submitCount || 0) + 1 }));
        const focusSummary = () => summaryRef.current?.focus?.();
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusSummary);
        else focusSummary();
        return { ok: false, error: msg };
      }
      writeState((prev) => ({ isSubmitting: false, lastSubmitError: null, submitCount: (prev.submitCount || 0) + 1 }));
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Submit failed.";
      writeState((prev) => ({ isSubmitting: false, lastSubmitError: String(msg), submitCount: (prev.submitCount || 0) + 1 }));
      const focusSummary = () => summaryRef.current?.focus?.();
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusSummary);
      else focusSummary();
      return { ok: false, error: msg };
    }
  };

  const doReset = (source = "user") => {
    writeState(() => ({
      values: { ...defaults },
      errors: {},
      touched: {},
      dirty: [],
      isDirty: false,
      isValid: true,
      isSubmitting: false,
      lastSubmitError: null,
    }));
    if (fireWidgetEvent) fireWidgetEvent("onReset", { formData: { ...defaults }, values: { ...defaults }, source });
    else if (fireWidgetEvent) fireWidgetEvent("onFieldChange", { field: "__reset", value: null, formData: { ...defaults } });
  };

  // Methods (F02/B05 live refs, atomic via functional updates).
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      validate: () => {
        const { errors } = validateAll();
        writeState(() => ({ errors, isValid: Object.keys(errors).length === 0 }));
        return { valid: Object.keys(errors).length === 0, errors };
      },
      reset: () => doReset("method"),
      clear: () => doReset("method"),
      setValues: (obj) => {
        const patch = obj && typeof obj === "object" ? obj : {};
        writeState((prev) => {
          const dirty = Array.from(new Set([...(prev.dirty || []), ...Object.keys(patch)]));
          return { values: { ...prev.values, ...patch }, dirty, isDirty: dirty.length > 0 };
        });
      },
      submit: () => doSubmit(),
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  // Keep derived flags in sync for bindings (isDirty/isValid).
  const isDirty = (liveState.dirty || []).length > 0;
  const errorEntries = Object.entries(liveState.errors || {});
  const submitLabel = widgetConfig?.submitLabel || "Submit";
  const resetLabel = layoutCfg.resetLabel || "Reset";
  const showReset = !!layoutCfg.showReset;
  const size = layoutCfg.size || "default";
  const layout = layoutCfg.layout || "vertical";
  const columns = layoutCfg.columns || 1;

  const formSizeClass = {
    sm: "space-y-2.5 p-3 text-xs",
    default: "space-y-4 p-4 text-sm",
    lg: "space-y-5 p-5 text-base",
  }[size] || "space-y-4 p-4 text-sm";

  const fieldsContainerStyle = layout === "grid"
    ? { display: "grid", gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`, gap: "0.875rem" }
    : layout === "horizontal"
      ? { display: "flex", flexWrap: "wrap", gap: "0.875rem" }
      : undefined;
  const fieldsContainerClass = layout === "grid" || layout === "horizontal" ? "" : "space-y-3.5";

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs text-center">
        No fields configured in form properties.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    doSubmit();
  };

  const setRef = (key) => (el) => {
    if (el) fieldRefs.current[key] = el;
    else delete fieldRefs.current[key];
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={widgetConfig?.title || "Form"}
      className={`w-full h-full overflow-auto flex flex-col justify-between ${formSizeClass} relative`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded" aria-hidden="true">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin motion-reduce:animate-none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {/* Error summary (F05 live feedback, focus on submit failure). */}
      {(errorEntries.length > 0 || liveState.lastSubmitError) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
        >
          {liveState.lastSubmitError ? (
            <div className="font-semibold">Submit failed: {liveState.lastSubmitError}</div>
          ) : (
            <div className="font-semibold">Fix {errorEntries.length} field{errorEntries.length === 1 ? "" : "s"} to submit.</div>
          )}
          {errorEntries.length > 0 && (
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              {errorEntries.map(([k, msg]) => {
                const f = fields.find((x) => x.key === k);
                return <li key={k}>{f?.label || k}: {msg}</li>;
              })}
            </ul>
          )}
        </div>
      )}
      <div className={fieldsContainerClass} style={fieldsContainerStyle} data-layout={layout} data-columns={columns}>
        {fields.map((field, idx) => {
          if (!field.key) return null;
          const fieldType = field.type || "text";
          const inputId = buildFieldId(instanceKey, field.key, idx);
          const value = liveState.values?.[field.key] ?? "";
          const error = liveState.errors?.[field.key] || null;
          const { helpId, errorId, describedBy } = buildFieldA11y(inputId, { help: !!field.help, error });
          const required = normalizeFieldBoolean(field.required, false);
          const disabled = normalizeFieldBoolean(field.disabled, false);
          const readOnly = normalizeFieldBoolean(field.readOnly, false);
          const label = field.label || field.key;

          const commonA11y = {
            id: inputId,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": describedBy,
            "aria-required": required || undefined,
            disabled,
          };

          if (fieldType === "select") {
            const opts = normalizeOptions(field.options);
            return (
              <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "space-y-1"}>
                <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
                  {label}{required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
                </Label>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                <Select
                  value={value === "" || value === null || value === undefined ? "" : String(value)}
                  onValueChange={(val) => { if (!disabled && !readOnly) setFieldValue(field.key, val, field); }}
                  disabled={disabled}
                >
                  <SelectTrigger id={inputId} ref={setRef(field.key)} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className="w-full text-xs">
                    <SelectValue placeholder={field.placeholder || "Select option..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(opts || [])
                      // Radix Select.Item throws on an empty-string value.
                      // Skip unfinished option rows instead of crashing the page.
                      .filter((opt) => String(opt.value ?? "") !== "")
                      .map((opt, oIdx) => (
                        <SelectItem key={`${String(opt.value)}-${oIdx}`} value={String(opt.value)} disabled={opt.disabled}>
                          {opt.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }
          if (fieldType === "checkbox") {
            const checked = normalizeFieldBoolean(value, false);
            return (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center gap-2 py-1">
                  <Checkbox
                    id={inputId}
                    ref={setRef(field.key)}
                    checked={checked}
                    disabled={disabled}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    aria-required={required || undefined}
                    onCheckedChange={(c) => { if (!disabled && !readOnly) setFieldValue(field.key, !!c, field); }}
                  />
                  <Label htmlFor={inputId} className="text-xs text-muted-foreground cursor-pointer">
                    {label}{required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
                  </Label>
                </div>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }
          if (fieldType === "textarea") {
            return (
              <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "space-y-1"}>
                <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
                  {label}{required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
                </Label>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                <Textarea
                  {...commonA11y}
                  ref={setRef(field.key)}
                  placeholder={field.placeholder || ""}
                  required={required}
                  readOnly={readOnly}
                  value={value ?? ""}
                  rows={field.rows || 3}
                  maxLength={field.maxLength}
                  onChange={(e) => { if (!readOnly) setFieldValue(field.key, e.target.value, field); }}
                  className="text-xs bg-background border border-input focus:border-primary w-full"
                />
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }
          return (
            <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "space-y-1"}>
              <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
                {label}{required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
              </Label>
              {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
              <Input
                {...commonA11y}
                ref={setRef(field.key)}
                type={fieldType === "number" ? "number" : fieldType}
                className="text-xs h-8 bg-background border border-input focus:border-primary w-full"
                placeholder={field.placeholder || ""}
                required={required}
                readOnly={readOnly}
                value={value ?? ""}
                min={field.validation?.min}
                max={field.validation?.max}
                maxLength={field.validation?.maxLength ?? field.maxLength}
                onChange={(e) => {
                  if (readOnly) return;
                  const raw = fieldType === "number" ? e.target.value : e.target.value;
                  setFieldValue(field.key, raw, field);
                }}
              />
              {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
            </div>
          );
        })}
      </div>

      {/* Buttons Panel */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-4">
        {liveState.isSubmitting && (
          <span className="text-[11px] text-muted-foreground mr-auto" role="status" aria-live="polite">Submitting…</span>
        )}
        {showReset && (
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs font-semibold px-4"
            onClick={() => doReset("user")}
            disabled={liveState.isSubmitting}
          >
            {resetLabel}
          </Button>
        )}
        <Button
          type="submit"
          className="h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
          disabled={liveState.isSubmitting || isLoading}
        >
          {liveState.isSubmitting ? "Submitting…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};

FormWidget.propTypes = {
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

export default FormWidget;
