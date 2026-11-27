import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Textarea, Switch, RadioGroup, RadioGroupItem, WidgetBusy, cn } from "@jet-admin/ui";
import { evaluateConditions } from "../config/ConditionBuilder";
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
  const labelPosition = widgetConfig?.labelPosition || "top";
  const stickyActions = normalizeFieldBoolean(widgetConfig?.stickyActions, false);
  const successMessage = widgetConfig?.successMessage || "";
  const warnUnsaved = normalizeFieldBoolean(widgetConfig?.warnUnsaved, false);
  const stepper = normalizeFieldBoolean(widgetConfig?.stepper, false);
  const autosave = normalizeFieldBoolean(widgetConfig?.autosave, false);
  const autosaveDelay = Math.max(250, Number(widgetConfig?.autosaveDelay) || 900);
  const validationUrl = widgetConfig?.validationUrl || "";
  const density = widgetConfig?.properties?.density || "comfortable";
  const [success, setSuccess] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [asyncValidating, setAsyncValidating] = useState(false);
  const autosaveTimerRef = useRef(null);

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
    setSuccess(false);
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
      const visible = evaluateConditions(f.visibleWhen, { values: liveRef.current.liveState.values, row: liveRef.current.liveState.values, ...liveRef.current.liveState.values });
      if (!visible) continue;
      order.push(f.key);
      const opts = f.type === "select" || f.type === "radio" ? normalizeOptions(f.options) : null;
      const err = validateFieldValue(f, liveRef.current.liveState.values?.[f.key], opts);
      if (err) errors[f.key] = f?.validation?.message || err;
    }
    return { errors, order: order.filter((k) => errors[k]) };
  };

  const fetchAsyncErrors = async (values) => {
    if (!validationUrl) return {};
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), 15000);
    try {
      const response = await fetch(validationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values,
          formData: values,
          fields: (fields || []).map((field) => ({
            key: field.key,
            type: field.type,
            required: !!field.required,
            validation: field.validation || null,
          })),
        }),
        signal: controller?.signal,
      });
      if (!response.ok) throw new Error(`Validation failed (${response.status}).`);
      const payload = await response.json();
      if (payload && typeof payload === "object" && payload.errors && typeof payload.errors === "object") return payload.errors;
      return {};
    } finally {
      clearTimeout(timer);
    }
  };

  const validateKeys = (keys) => {
    const errors = {};
    const order = [];
    const keySet = new Set(keys || []);
    for (const f of fields) {
      if (!f?.key || (keySet.size && !keySet.has(f.key))) continue;
      const visible = evaluateConditions(f.visibleWhen, { values: liveRef.current.liveState.values, row: liveRef.current.liveState.values, ...liveRef.current.liveState.values });
      if (!visible) continue;
      const opts = f.type === "select" || f.type === "radio" ? normalizeOptions(f.options) : null;
      const err = validateFieldValue(f, liveRef.current.liveState.values?.[f.key], opts);
      if (err) {
        errors[f.key] = f?.validation?.message || err;
        order.push(f.key);
      }
    }
    return { errors, order };
  };

  const doSubmit = async () => {
    let { errors, order } = validateAll();
    if (validationUrl && Object.keys(errors).length === 0) {
      setAsyncValidating(true);
      try {
        const asyncErrors = await fetchAsyncErrors(liveRef.current.liveState.values || {});
        if (asyncErrors && Object.keys(asyncErrors).length) {
          errors = { ...errors, ...asyncErrors };
          order = Object.keys(asyncErrors);
        }
      } catch (validationError) {
        const message = validationError?.name === "AbortError" ? "Validation timed out." : validationError?.message || "Validation failed.";
        writeState(() => ({ isSubmitting: false, lastSubmitError: message }));
        setAsyncValidating(false);
        return { ok: false, error: message };
      }
      setAsyncValidating(false);
    }
    writeState(() => ({
      errors,
      touched: Object.fromEntries((fields || []).map((f) => [f?.key, true])),
      isValid: Object.keys(errors).length === 0,
    }));
    if (fireWidgetEvent) fireWidgetEvent("onValidate", { values: liveRef.current.liveState.values, formData: liveRef.current.liveState.values, errors, isValid: Object.keys(errors).length === 0 });
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
      setSuccess(true);
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
    setSuccess(false);
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
  useEffect(() => {
    if (!warnUnsaved || !isDirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [warnUnsaved, isDirty]);

  // Debounced autosave: fire only after real edits, not initial defaults.
  const valuesSignature = JSON.stringify(liveState.values || {});
  useEffect(() => {
    if (!autosave || !isDirty || !fireWidgetEvent) return undefined;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      fireWidgetEvent("onAutosave", {
        values: liveState.values || {},
        formData: liveState.values || {},
        dirty: liveState.dirty || [],
      });
    }, autosaveDelay);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave, autosaveDelay, isDirty, valuesSignature]);

  useEffect(() => () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
  }, []);
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

  const visibleEntries = fields
    .map((field, idx) => ({ field, idx }))
    .filter(({ field }) => field?.key && evaluateConditions(field.visibleWhen, { values: liveState.values, row: liveState.values, ...liveState.values }));
  const stepDefs = [];
  for (const entry of visibleEntries) {
    const label = String(entry.field.section || "").trim();
    const existing = stepDefs.find((step) => step.label === label);
    if (existing) existing.entries.push(entry);
    else stepDefs.push({ label, entries: [entry] });
  }
  const stepMode = stepper && stepDefs.length > 1;
  const activeStep = Math.min(stepIndex, Math.max(0, stepDefs.length - 1));
  const displayEntries = stepMode ? stepDefs[activeStep].entries : visibleEntries;

  const goNext = () => {
    if (!stepMode || activeStep >= stepDefs.length - 1) return;
    const keys = stepDefs[activeStep].entries.map((entry) => entry.field.key);
    const { errors, order } = validateKeys(keys);
    if (Object.keys(errors).length > 0) {
      writeState((prev) => ({ errors: { ...prev.errors, ...errors }, touched: { ...prev.touched, ...Object.fromEntries(keys.map((key) => [key, true])) } }));
      const focusInvalid = () => {
        focusFirstInvalid(fieldRefs.current, order);
        summaryRef.current?.focus?.();
      };
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusInvalid);
      else focusInvalid();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, stepDefs.length - 1));
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
      className={`widget-density-${density} w-full h-full overflow-auto flex flex-col justify-between ${formSizeClass} relative`}
    >
      {isLoading && <WidgetBusy label="Updating…" />}
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
      {success && successMessage && (
        <div role="status" aria-live="polite" className="rounded-control border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          {successMessage}
        </div>
      )}
      {stepMode && (
        <nav aria-label="Form steps" className="mb-2 flex flex-wrap items-center gap-1">
          {stepDefs.map((step, index) => {
            const active = index === activeStep;
            const complete = index < activeStep;
            return (
              <button
                key={step.label || index}
                type="button"
                onClick={() => setStepIndex(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-control border px-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  active ? "border-primary bg-primary/10 text-primary" : complete ? "border-success/30 bg-success/5 text-success" : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]", active ? "bg-primary text-primary-foreground" : complete ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")}>{index + 1}</span>
                {step.label || `Step ${index + 1}`}
              </button>
            );
          })}
        </nav>
      )}
      <div className={fieldsContainerClass} style={fieldsContainerStyle} data-layout={layout} data-columns={columns} data-step={stepMode ? activeStep : undefined}>
        {displayEntries.map(({ field, idx }) => {
          const fieldType = field.type || "text";
          const inputId = buildFieldId(instanceKey, field.key, idx);
          const value = liveState.values?.[field.key] ?? "";
          const error = liveState.errors?.[field.key] || null;
          const { helpId, errorId, describedBy } = buildFieldA11y(inputId, { help: !!field.help, error });
          const required = normalizeFieldBoolean(field.required, false);
          const disabled = normalizeFieldBoolean(field.disabled, false);
          const readOnly = normalizeFieldBoolean(field.readOnly, false);
          const label = field.label || field.key;
          const widthSpan = Math.max(1, Math.min(Number(columns) || 1, Number(field.width) || 1));
          const widthStyle = layout === "grid" && Number(columns) > 1 && field.width ? { gridColumn: `span ${widthSpan}` } : undefined;

          const commonA11y = {
            id: inputId,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": describedBy,
            "aria-required": required || undefined,
            disabled,
          };

          if (fieldType === "hidden") {
            return (
              <input
                key={field.key}
                type="hidden"
                value={value ?? ""}
                onChange={(event) => setFieldValue(field.key, event.target.value, field)}
              />
            );
          }

          if (fieldType === "radio") {
            const opts = normalizeOptions(field.options);
            return (
              <div key={field.key} className="min-w-0 space-y-1" style={widthStyle}>
                <Label id={`${inputId}-label`} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                  {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
                </Label>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                <RadioGroup
                  value={String(value ?? "")}
                  onValueChange={(next) => { if (!disabled && !readOnly) setFieldValue(field.key, next, field); }}
                  disabled={disabled}
                  aria-labelledby={`${inputId}-label`}
                  aria-required={required || undefined}
                  className="flex flex-wrap gap-2"
                >
                  {opts.map((opt, optionIndex) => (
                    <label key={`${String(opt.value)}-${optionIndex}`} className="flex items-center gap-1.5 text-xs text-foreground">
                      <RadioGroupItem value={String(opt.value)} id={`${inputId}-${optionIndex}`} />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }

          if (fieldType === "switch") {
            const checked = normalizeFieldBoolean(value, false);
            return (
              <div key={field.key} className="min-w-0 space-y-1" style={widthStyle}>
                <div className="flex items-center justify-between gap-2 py-1">
                  <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                    {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
                  </Label>
                  <Switch id={inputId} checked={checked} disabled={disabled} onCheckedChange={(next) => { if (!disabled && !readOnly) setFieldValue(field.key, !!next, field); }} aria-describedby={describedBy} />
                </div>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }

          if (fieldType === "date" || fieldType === "datetime") {
            return (
              <div key={field.key} className="min-w-0 space-y-1" style={widthStyle}>
                <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                  {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
                </Label>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                <Input
                  {...commonA11y}
                  ref={setRef(field.key)}
                  type={fieldType === "date" ? "date" : "datetime-local"}
                  value={value ?? ""}
                  readOnly={readOnly}
                  onChange={(event) => { if (!readOnly) setFieldValue(field.key, event.target.value, field); }}
                  className="text-xs"
                />
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }

          if (fieldType === "file") {
            return (
              <div key={field.key} className="min-w-0 space-y-1" style={widthStyle}>
                <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                  {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
                </Label>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                <Input
                  {...commonA11y}
                  ref={setRef(field.key)}
                  type="file"
                  onChange={(event) => setFieldValue(field.key, Array.from(event.target.files || []).map((file) => file.name), field)}
                  className="text-xs file:mr-2 file:rounded-control file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }

          if (fieldType === "select") {
            const opts = normalizeOptions(field.options);
            return (
              <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "min-w-0 space-y-1"} style={widthStyle}>
                <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                  {label}{required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
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
              <div key={field.key} className="min-w-0 space-y-1" style={widthStyle}>
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
                  <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs text-muted-foreground cursor-pointer"}>
                    {label}{required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
                  </Label>
                </div>
                {field.help && <p id={helpId} className="text-[11px] text-muted-foreground">{field.help}</p>}
                {error && <p id={errorId} role="alert" className="text-[11px] text-destructive">{error}</p>}
              </div>
            );
          }
          if (fieldType === "textarea") {
            return (
              <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "min-w-0 space-y-1"} style={widthStyle}>
                <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                  {label}{required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
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
            <div key={field.key} className={layout === "horizontal" ? "min-w-[180px] flex-1 space-y-1" : "min-w-0 space-y-1"} style={widthStyle}>
              <Label htmlFor={inputId} className={labelPosition === "hidden" ? "sr-only" : "text-xs font-semibold text-foreground"}>
                {label}{required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
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
      <div className={cn("mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-4", stickyActions && "sticky bottom-0 z-10 -mx-2 bg-background/95 px-2 pb-2 backdrop-blur")}>
        {(liveState.isSubmitting || asyncValidating) && (
          <span className="mr-auto text-[11px] text-muted-foreground" role="status" aria-live="polite">
            {asyncValidating ? "Validating…" : "Submitting…"}
          </span>
        )}
        {stepMode && activeStep > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-semibold"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            disabled={liveState.isSubmitting || asyncValidating}
          >
            Previous
          </Button>
        )}
        {showReset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-4 text-xs font-semibold"
            onClick={() => doReset("user")}
            disabled={liveState.isSubmitting || asyncValidating}
          >
            {resetLabel}
          </Button>
        )}
        {stepMode && activeStep < stepDefs.length - 1 ? (
          <Button
            type="button"
            size="sm"
            className="h-8 px-4 text-xs font-semibold"
            onClick={goNext}
            disabled={liveState.isSubmitting || asyncValidating || isLoading}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            className="h-8 px-4 text-xs font-semibold"
            disabled={liveState.isSubmitting || asyncValidating || isLoading}
          >
            {liveState.isSubmitting ? "Submitting…" : asyncValidating ? "Validating…" : submitLabel}
          </Button>
        )}
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
