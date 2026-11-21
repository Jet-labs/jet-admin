import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverContent, PopoverTrigger, Label, Input } from '@jet-admin/ui';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseDateSafe, toDateKey, toDateTimeKey, toDisplayDate, toDisplayDateTime, validateDateValue, serializeDateValue } from '../_shared/dateContracts';
import { normalizeFieldBoolean } from '../_shared/fieldContracts';
import { buildFieldId, buildFieldA11y, resolveInstanceKey, useInstanceSuffix } from '../_shared/fieldA11y';
import { setMonth, setHours, setMinutes, setSeconds } from 'date-fns';

/**
 * DatePickerWidget (E11 + F01/F05).
 *
 * Timezone semantics (explicit): date-only values are calendar dates
 * "YYYY-MM-DD" with no timezone; datetime values are LOCAL wall time
 * "YYYY-MM-DDTHH:mm:ss" with no offset suffix. See dateContracts.
 *
 * State separation (B06): uninitialized (value===undefined, default applies
 * once) vs empty ("" after clear, never repopulated) vs reset (defaults
 * re-applied explicitly via method). Clearing stays empty across unrelated
 * query/config refresh.
 *
 * Entry routes (all enforce required/disabled/read-only/min/max/disabledDates):
 * calendar click, keyboard calendar nav, typed entry (blur/Enter), time edits,
 * methods. Disabled dates are aria-disabled + non-clickable.
 */
export function DatePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState, onWidgetInit, widgetID, resourceID, placementKey, instanceID }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typedDraft, setTypedDraft] = useState(null);
  const [typedError, setTypedError] = useState(null);
  const initializedRef = useRef(false);
  const triggerRef = useRef(null);
  const instanceKey = useInstanceSuffix(resolveInstanceKey({ instanceID, widgetID, resourceID, placementKey }));
  const fieldId = buildFieldId(instanceKey, widgetConfig.label || "date", 0);
  const popoverId = `${fieldId}-popover`;
  const helpId = widgetConfig.help ? `${fieldId}-help` : null;
  const errorId = (typedError || widgetState?.error) ? `${fieldId}-error` : null;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  const enableTime = !!widgetConfig.enableTime;
  const required = normalizeFieldBoolean(widgetConfig.required, false);
  const disabled = normalizeFieldBoolean(widgetConfig.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig.readOnly, false);
  const interactive = !disabled && !readOnly;
  const constraintOpts = useMemo(() => ({
    minDate: widgetConfig.minDate,
    maxDate: widgetConfig.maxDate,
    disabledDates: widgetConfig.disabledDates,
    enableTime,
    required,
  }), [widgetConfig.minDate, widgetConfig.maxDate, widgetConfig.disabledDates, enableTime, required]);

  const parsedValue = useMemo(() => parseDateSafe(widgetState?.value), [widgetState?.value]);

  // One-time default init: only when never initialized AND never interacted.
  useEffect(() => {
    if (initializedRef.current) return;
    if (widgetState?.value !== undefined) { initializedRef.current = true; return; }
    if (widgetConfig.defaultValue) {
      const parsed = parseDateSafe(widgetConfig.defaultValue);
      if (parsed) {
        initializedRef.current = true;
        emitCommitted(parsed, "init");
        return;
      }
    }
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig.defaultValue]);

  useEffect(() => {
    if (parsedValue) setCurrentDate(parsedValue);
  }, [parsedValue]);

  // Keep typed draft in sync when committed value changes externally.
  useEffect(() => {
    setTypedDraft(null);
    setTypedError(null);
  }, [widgetState?.value]);

  const emitCommitted = (date, source) => {
    if (!date) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: "", date: "", time: "", error: required ? "A date is required." : null, isOpen: false, lastSource: source }));
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear", { value: "", source });
        fireWidgetEvent("onChange", { value: "", date: "", time: "", source });
      }
      return;
    }
    const value = serializeDateValue(date, enableTime);
    const dateStr = toDateKey(date);
    const timeStr = enableTime ? toDateTimeKey(date).split('T')[1] : "";
    const constraintError = (() => {
      const { required: _r, ...rest } = constraintOpts;
      void _r;
      return validateDateValue(value, { ...constraintOpts });
    })();
    void constraintError;
    if (setWidgetState) setWidgetState((p) => ({ ...p, value, date: dateStr, time: timeStr, error: null, lastSource: source }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value, date: dateStr, time: timeStr, source });
  };

  const tryCommit = (date, source) => {
    if (!interactive) return;
    if (!date) { emitCommitted(null, source); return; }
    const err = validateDateValue(serializeDateValue(date, enableTime), constraintOpts);
    if (err) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, error: err, lastSource: source }));
      setTypedError(err);
      return;
    }
    setTypedError(null);
    emitCommitted(date, source);
  };

  const handleDayClick = (day) => {
    if (!interactive) return;
    initializedRef.current = true;
    let newDate = day;
    if (parsedValue && enableTime) {
      newDate = setHours(newDate, parsedValue.getHours());
      newDate = setMinutes(newDate, parsedValue.getMinutes());
      newDate = setSeconds(newDate, parsedValue.getSeconds());
    }
    tryCommit(newDate, "calendar");
    if (!enableTime) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false }));
      if (fireWidgetEvent) fireWidgetEvent("onClose", { source: "calendar" });
      triggerRef.current?.focus?.();
    }
  };

  const handleTimeChange = ({ hours, minutes, seconds }) => {
    if (!interactive) return;
    let newDate = parsedValue || new Date();
    newDate = setHours(newDate, hours);
    newDate = setMinutes(newDate, minutes);
    newDate = setSeconds(newDate, seconds);
    tryCommit(newDate, "time");
  };

  const commitTyped = () => {
    if (!interactive) return;
    const raw = (typedDraft ?? displayValue ?? "").trim();
    if (raw === "") {
      initializedRef.current = true;
      emitCommitted(null, "typed");
      setTypedDraft(null);
      setTypedError(null);
      return;
    }
    const parsed = parseDateSafe(raw);
    if (!parsed) {
      const msg = "Enter a valid date (YYYY-MM-DD).";
      setTypedError(msg);
      if (setWidgetState) setWidgetState((p) => ({ ...p, error: msg }));
      return;
    }
    initializedRef.current = true;
    tryCommit(parsed, "typed");
    setTypedDraft(null);
  };

  const displayValue = parsedValue ? (enableTime ? toDisplayDateTime(parsedValue) : toDisplayDate(parsedValue)) : "";
  const inputValue = typedDraft !== null ? typedDraft : displayValue;
  const visibleError = typedError || widgetState?.error || null;
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const isOpen = !!widgetState?.isOpen;

  const liveRef = useRef(null);
  liveRef.current = { parsedValue, enableTime, interactive, constraintOpts };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        if (!rt.interactive && v !== "" && v !== null) {
          // Disabled/read-only blocks method writes except explicit clear.
          return;
        }
        if (v === "" || v === null || v === undefined) { initializedRef.current = true; emitCommitted(null, "method"); return; }
        const d = parseDateSafe(v);
        if (!d) {
          if (setWidgetState) setWidgetState((p) => ({ ...p, error: "Enter a valid date (YYYY-MM-DD)." }));
          return;
        }
        const err = validateDateValue(serializeDateValue(d, rt.enableTime), rt.constraintOpts);
        if (err) { if (setWidgetState) setWidgetState((p) => ({ ...p, error: err })); return; }
        initializedRef.current = true;
        emitCommitted(d, "method");
      },
      clear: () => { initializedRef.current = true; emitCommitted(null, "method"); },
      reset: () => {
        const d = widgetConfig.defaultValue ? parseDateSafe(widgetConfig.defaultValue) : null;
        initializedRef.current = true;
        if (d) emitCommitted(d, "method-reset");
        else emitCommitted(null, "method-reset");
        if (fireWidgetEvent) fireWidgetEvent("onClear", { value: "", source: "method-reset" });
      },
      open: () => { if (!disabled && setWidgetState) setWidgetState((p) => ({ ...p, isOpen: true })); },
      close: () => { if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false })); triggerRef.current?.focus?.(); },
      focus: () => triggerRef.current?.focus?.(),
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const isDateDisabled = (day) => {
    const key = toDateKey(day);
    if (widgetConfig.minDate) {
      const min = parseDateSafe(widgetConfig.minDate);
      if (min && (enableTime ? day.getTime() < min.getTime() : toDateKey(day) < toDateKey(min))) return true;
    }
    if (widgetConfig.maxDate) {
      const max = parseDateSafe(widgetConfig.maxDate);
      if (max && (enableTime ? day.getTime() > max.getTime() : toDateKey(day) > toDateKey(max))) return true;
    }
    if (Array.isArray(widgetConfig.disabledDates) && widgetConfig.disabledDates.includes(key)) return true;
    return false;
  };

  return (
    <div className="relative flex flex-col gap-1.5 w-full h-full min-h-0">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded" aria-hidden="true">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin motion-reduce:animate-none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      {widgetConfig.label && (
        <Label htmlFor={fieldId}>
          {widgetConfig.label}{required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
        </Label>
      )}
      {widgetConfig.help && <p id={helpId} className="text-[11px] text-muted-foreground">{widgetConfig.help}</p>}

      <Popover open={isOpen} onOpenChange={(open) => {
        if (disabled || readOnly) return;
        if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: open }));
        if (fireWidgetEvent) fireWidgetEvent(open ? "onOpen" : "onClose", { source: "trigger" });
        if (!open) triggerRef.current?.focus?.();
      }}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={`${fieldId}-trigger`}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={popoverId}
            aria-describedby={describedBy}
            aria-label={widgetConfig.label ? `${widgetConfig.label}, ${inputValue || widgetConfig.placeholder || "Select date"}` : (inputValue || widgetConfig.placeholder || "Select date")}
            disabled={disabled}
            className="relative w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative block w-full pointer-events-none">
              <Input
                id={fieldId}
                value={inputValue}
                placeholder={widgetConfig.placeholder || "Select date... (YYYY-MM-DD)"}
                onChange={(e) => { if (interactive) { setTypedDraft(e.target.value); setTypedError(null); } }}
                onBlur={() => { if (typedDraft !== null) commitTyped(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitTyped(); }
                  else if (e.key === "Escape" && typedDraft !== null) { setTypedDraft(null); setTypedError(null); }
                }}
                readOnly={!interactive}
                disabled={disabled}
                required={required}
                aria-invalid={visibleError ? true : undefined}
                aria-describedby={describedBy}
                className="pl-9 pr-8 cursor-text"
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              {parsedValue && interactive && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear date"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); initializedRef.current = true; emitCommitted(null, "clear-button"); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); initializedRef.current = true; emitCommitted(null, "clear-button"); } }}
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center pointer-events-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent id={popoverId} role="dialog" aria-label={widgetConfig.label || "Choose date"} className="w-auto p-3" align="start">
          <CalendarGrid
            month={currentDate.getMonth()}
            year={currentDate.getFullYear()}
            selectedDate={parsedValue}
            onDayClick={handleDayClick}
            onMonthChange={(delta) => setCurrentDate(setMonth(currentDate, currentDate.getMonth() + delta))}
            isDateDisabled={isDateDisabled}
            instanceId={instanceKey}
          />
          {enableTime && (
            <TimeInput
              hours={parsedValue?.getHours() || 0}
              minutes={parsedValue?.getMinutes() || 0}
              seconds={parsedValue?.getSeconds() || 0}
              onChange={handleTimeChange}
              instanceId={instanceKey}
              labelPrefix={widgetConfig.label || "Selected"}
              disabled={disabled}
              readOnly={readOnly}
            />
          )}
          {visibleError && (
            <p role="alert" className="mt-2 text-[11px] text-destructive">{visibleError}</p>
          )}
        </PopoverContent>
      </Popover>
      {visibleError && !isOpen && (
        <p id={errorId} role="alert" className="text-[11px] text-destructive">{visibleError}</p>
      )}
      <span className="sr-only" aria-live="polite">
        {parsedValue ? `Selected ${displayValue}` : "No date selected"}
      </span>
    </div>
  );
}

DatePickerWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  onWidgetInit: PropTypes.func,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  resourceID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placementKey: PropTypes.string,
  instanceID: PropTypes.string,
};

export default DatePickerWidget;
