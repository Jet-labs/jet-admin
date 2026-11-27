import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverContent, PopoverTrigger, Label, Input, Button, WidgetBusy, WidgetSurface, cn } from '@jet-admin/ui';
import { CalendarRange, ArrowRight, X } from 'lucide-react';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseDateSafe, toDateKey, toDateTimeKey, toDisplayDate, toDisplayDateTime, validateRangeValues, resolvePresetRange, normalizeRangePlaceholders, serializeDateValue } from '../_shared/dateContracts';
import { normalizeFieldBoolean } from '../_shared/fieldContracts';
import { buildFieldId, resolveInstanceKey, useInstanceSuffix } from '../_shared/fieldA11y';
import { setMonth, setHours, setMinutes, setSeconds, differenceInCalendarDays, subDays } from 'date-fns';

/**
 * DateRangePickerWidget (E12 + F01/F05).
 *
 * Canonical placeholders: placeholderStart/placeholderEnd (legacy
 * startPlaceholder/endPlaceholder accepted, canonical wins).
 * Timezone: same wall-time contract as date-picker (date-only calendar dates,
 * datetime local wall time, no Z).
 *
 * State: applied { start, end, startDate, endDate } + draft
 * { draftStart, draftEnd } + isOpen. When requireApply=false (default) every
 * valid calendar/time/preset choice applies immediately (legacy behavior).
 * When requireApply=true the popover edits the draft and Apply commits
 * (validated, end>=start incl. times), Cancel discards the draft leaving
 * applied values unchanged.
 *
 * Clearing stays empty: defaults apply once at init, never after clear.
 * Partial ranges (only start) are valid drafts; onChange fires only when both
 * ends are present and valid. Same-day inverted times are rejected.
 */
export function DateRangePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState, onWidgetInit, widgetID, resourceID, placementKey, instanceID }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const initializedRef = useRef(false);
  const triggerRef = useRef(null);
  const instanceKey = useInstanceSuffix(resolveInstanceKey({ instanceID, widgetID, resourceID, placementKey }));
  const baseId = buildFieldId(instanceKey, widgetConfig.label || "range", 0);
  const startId = `${baseId}-start`;
  const endId = `${baseId}-end`;

  const placeholders = useMemo(() => normalizeRangePlaceholders(widgetConfig), [widgetConfig]);
  const enableTime = !!widgetConfig.enableTime;
  const required = normalizeFieldBoolean(widgetConfig.required, false);
  const disabled = normalizeFieldBoolean(widgetConfig.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig.readOnly, false);
  const requireApply = normalizeFieldBoolean(widgetConfig.requireApply, false);
  const comparePrevious = normalizeFieldBoolean(widgetConfig.comparePrevious, false);
  const interactive = !disabled && !readOnly;
  const constraintOpts = useMemo(() => ({
    minDate: widgetConfig.minDate,
    maxDate: widgetConfig.maxDate,
    disabledDates: widgetConfig.disabledDates,
    enableTime,
    required,
  }), [widgetConfig.minDate, widgetConfig.maxDate, widgetConfig.disabledDates, enableTime, required]);

  // Applied values (canonical) + draft (popover editing).
  const appliedStartRaw = widgetState?.start ?? "";
  const appliedEndRaw = widgetState?.end ?? "";
  const draftStartRaw = widgetState?.draftStart ?? appliedStartRaw;
  const draftEndRaw = widgetState?.draftEnd ?? appliedEndRaw;
  const parsedStart = useMemo(() => parseDateSafe(requireApply ? draftStartRaw : appliedStartRaw), [requireApply, draftStartRaw, appliedStartRaw]);
  const parsedEnd = useMemo(() => parseDateSafe(requireApply ? draftEndRaw : appliedEndRaw), [requireApply, draftEndRaw, appliedEndRaw]);
  const appliedParsedStart = useMemo(() => parseDateSafe(appliedStartRaw), [appliedStartRaw]);
  const appliedParsedEnd = useMemo(() => parseDateSafe(appliedEndRaw), [appliedEndRaw]);

  // One-time defaults (B06): only when both applied ends are undefined.
  useEffect(() => {
    if (initializedRef.current) return;
    if (widgetState?.start !== undefined || widgetState?.end !== undefined) { initializedRef.current = true; return; }
    if (widgetConfig.defaultStart || widgetConfig.defaultEnd) {
      const start = parseDateSafe(widgetConfig.defaultStart);
      const end = parseDateSafe(widgetConfig.defaultEnd);
      if (start || end) {
        initializedRef.current = true;
        commitApplied(start, end, "init");
        return;
      }
    }
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig.defaultStart, widgetConfig.defaultEnd]);

  useEffect(() => {
    const anchor = parsedStart || appliedParsedStart;
    if (anchor) setCurrentDate(anchor);
  }, [parsedStart, appliedParsedStart]);

  const comparisonFor = (start, end) => {
    if (!comparePrevious || !start || !end) return null;
    const days = Math.abs(differenceInCalendarDays(end, start)) + 1;
    return {
      start: toDateKey(subDays(start, days)),
      end: toDateKey(subDays(start, 1)),
    };
  };

  const commitApplied = (start, end, source) => {
    if (!start && !end) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, start: "", end: "", startDate: "", endDate: "", draftStart: "", draftEnd: "", rangeError: required ? "A date range is required." : null, isOpen: false, lastSource: source }));
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear", { start: "", end: "", source });
        fireWidgetEvent("onChange", { start: "", end: "", startDate: "", endDate: "", source });
      }
      return;
    }
    const startVal = start ? serializeDateValue(start, enableTime) : "";
    const endVal = end ? serializeDateValue(end, enableTime) : "";
    const startDateStr = start ? toDateKey(start) : "";
    const endDateStr = end ? toDateKey(end) : "";
    if (setWidgetState) {
      setWidgetState((p) => ({ ...p, start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr, draftStart: startVal, draftEnd: endVal, rangeError: null, lastSource: source }));
    }
    if (start && end && fireWidgetEvent) {
      fireWidgetEvent("onChange", { start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr, source, comparison: comparisonFor(start, end) });
    }
  };

  const setDraft = (start, end) => {
    const startVal = start ? serializeDateValue(start, enableTime) : "";
    const endVal = end ? serializeDateValue(end, enableTime) : "";
    if (setWidgetState) setWidgetState((p) => ({ ...p, draftStart: startVal, draftEnd: endVal }));
    return { startVal, endVal };
  };

  const handleDayClick = (day) => {
    if (!interactive) return;
    initializedRef.current = true;
    const curStart = parsedStart;
    const curEnd = parsedEnd;
    if (!curStart || (curStart && curEnd)) {
      let newStart = day;
      if (curStart && enableTime) {
        newStart = setHours(newStart, curStart.getHours());
        newStart = setMinutes(newStart, curStart.getMinutes());
        newStart = setSeconds(newStart, curStart.getSeconds());
      }
      const check = validateRangeValues(serializeDateValue(newStart, enableTime), "", constraintOpts);
      if (check.error && check.code !== "partial") {
        if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: check.error }));
        return;
      }
      if (requireApply) {
        setDraft(newStart, null);
        if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
      } else {
        // Immediate mode keeps partial start without firing onChange (draft).
        const startVal = serializeDateValue(newStart, enableTime);
        if (setWidgetState) setWidgetState((p) => ({ ...p, start: startVal, end: "", startDate: toDateKey(newStart), endDate: "", draftStart: startVal, draftEnd: "", rangeError: null, lastSource: "calendar" }));
      }
    } else {
      let newEnd = day;
      let newStart = curStart;
      if (day < curStart) {
        newEnd = curStart;
        newStart = day;
      }
      if (enableTime) {
        newEnd = setHours(newEnd, curEnd ? curEnd.getHours() : 23);
        newEnd = setMinutes(newEnd, curEnd ? curEnd.getMinutes() : 59);
        newEnd = setSeconds(newEnd, curEnd ? curEnd.getSeconds() : 59);
      }
      const validation = validateRangeValues(serializeDateValue(newStart, enableTime), serializeDateValue(newEnd, enableTime), constraintOpts);
      if (validation.error) {
        if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: validation.error }));
        return;
      }
      if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
      if (requireApply) {
        setDraft(newStart, newEnd);
      } else {
        commitApplied(newStart, newEnd, "calendar");
        if (!enableTime) {
          if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false }));
          if (fireWidgetEvent) fireWidgetEvent("onClose", { source: "calendar" });
          triggerRef.current?.focus?.();
        }
      }
    }
  };

  const handleTimeChange = (type, { hours, minutes, seconds }) => {
    if (!interactive) return;
    if (type === 'start' && parsedStart) {
      let newStart = setHours(parsedStart, hours);
      newStart = setMinutes(newStart, minutes);
      newStart = setSeconds(newStart, seconds);
      const validation = parsedEnd
        ? validateRangeValues(serializeDateValue(newStart, enableTime), serializeDateValue(parsedEnd, enableTime), constraintOpts)
        : { error: validateRangeValues(serializeDateValue(newStart, enableTime), "", constraintOpts).error };
      if (validation.error && validation.code !== "partial") {
        if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: validation.error }));
        return;
      }
      if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
      if (requireApply) setDraft(newStart, parsedEnd);
      else if (parsedEnd) commitApplied(newStart, parsedEnd, "time");
      else {
        const v = serializeDateValue(newStart, enableTime);
        if (setWidgetState) setWidgetState((p) => ({ ...p, start: v, startDate: toDateKey(newStart), draftStart: v, lastSource: "time" }));
      }
    } else if (type === 'end' && parsedEnd) {
      let newEnd = setHours(parsedEnd, hours);
      newEnd = setMinutes(newEnd, minutes);
      newEnd = setSeconds(newEnd, seconds);
      const validation = validateRangeValues(serializeDateValue(parsedStart, enableTime), serializeDateValue(newEnd, enableTime), constraintOpts);
      if (validation.error) {
        if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: validation.error }));
        return;
      }
      if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
      if (requireApply) setDraft(parsedStart, newEnd);
      else commitApplied(parsedStart, newEnd, "time");
    }
  };

  const handlePresetClick = (preset) => {
    if (!interactive) return;
    initializedRef.current = true;
    const { start, end } = resolvePresetRange(preset, new Date());
    let s = start;
    let e = end;
    if (e && enableTime) {
      e = setHours(e, 23); e = setMinutes(e, 59); e = setSeconds(e, 59);
    }
    const validation = validateRangeValues(s ? serializeDateValue(s, enableTime) : "", e ? serializeDateValue(e, enableTime) : "", constraintOpts);
    if (validation.error) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: validation.error }));
      return;
    }
    if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
    if (requireApply) {
      setDraft(s, e);
    } else {
      commitApplied(s, e, "preset");
      if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false }));
      if (fireWidgetEvent) fireWidgetEvent("onClose", { source: "preset" });
      triggerRef.current?.focus?.();
    }
  };

  const handleApply = () => {
    const s = parseDateSafe(draftStartRaw);
    const e = parseDateSafe(draftEndRaw);
    const validation = validateRangeValues(draftStartRaw, draftEndRaw, constraintOpts);
    if (validation.error) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: validation.error }));
      return;
    }
    if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: null }));
    commitApplied(s, e, "apply");
    if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false }));
    if (fireWidgetEvent) fireWidgetEvent("onClose", { source: "apply" });
    triggerRef.current?.focus?.();
  };

  const handleCancel = () => {
    // Discard draft, keep applied values unchanged.
    if (setWidgetState) setWidgetState((p) => ({ ...p, draftStart: p.start ?? "", draftEnd: p.end ?? "", rangeError: null, isOpen: false }));
    if (fireWidgetEvent) fireWidgetEvent("onClose", { source: "cancel" });
    triggerRef.current?.focus?.();
  };

  const clearAll = (source) => {
    initializedRef.current = true;
    commitApplied(null, null, source);
  };

  const liveRef = useRef(null);
  liveRef.current = { enableTime, interactive, constraintOpts, requireApply };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setRange: (start, end) => {
        const rt = liveRef.current;
        if (!rt.interactive) return;
        const s = start ? parseDateSafe(start) : null;
        const e = end ? parseDateSafe(end) : null;
        if ((start && !s) || (end && !e)) {
          if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: "Enter valid dates." }));
          return;
        }
        const v = validateRangeValues(start || "", end || "", rt.constraintOpts);
        if (v.error) { if (setWidgetState) setWidgetState((p) => ({ ...p, rangeError: v.error })); return; }
        initializedRef.current = true;
        if (rt.requireApply) setDraft(s, e);
        else commitApplied(s, e, "method");
      },
      clear: () => clearAll("method"),
      reset: () => {
        const s = widgetConfig.defaultStart ? parseDateSafe(widgetConfig.defaultStart) : null;
        const e = widgetConfig.defaultEnd ? parseDateSafe(widgetConfig.defaultEnd) : null;
        initializedRef.current = true;
        if (rt_requireApply()) setDraft(s, e);
        else commitApplied(s, e, "method-reset");
        function rt_requireApply() { return liveRef.current.requireApply; }
      },
      open: () => { if (!disabled && setWidgetState) setWidgetState((p) => ({ ...p, isOpen: true })); },
      close: () => { if (setWidgetState) setWidgetState((p) => ({ ...p, isOpen: false })); triggerRef.current?.focus?.(); },
      apply: () => handleApply(),
      cancel: () => handleCancel(),
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const isDateDisabled = (day) => {
    const key = toDateKey(day);
    if (widgetConfig.minDate) {
      const min = parseDateSafe(widgetConfig.minDate);
      if (min && (enableTime ? day.getTime() < min.getTime() : key < toDateKey(min))) return true;
    }
    if (widgetConfig.maxDate) {
      const max = parseDateSafe(widgetConfig.maxDate);
      if (max && (enableTime ? day.getTime() > max.getTime() : key > toDateKey(max))) return true;
    }
    if (Array.isArray(widgetConfig.disabledDates) && widgetConfig.disabledDates.includes(key)) return true;
    return false;
  };

  // Display uses draft in requireApply mode so the popover edits visibly.
  const displayStartDate = requireApply ? parseDateSafe(draftStartRaw) : appliedParsedStart;
  const displayEndDate = requireApply ? parseDateSafe(draftEndRaw) : appliedParsedEnd;
  const displayStart = displayStartDate ? (enableTime ? toDisplayDateTime(displayStartDate) : toDisplayDate(displayStartDate)) : "";
  const displayEnd = displayEndDate ? (enableTime ? toDisplayDateTime(displayEndDate) : toDisplayDate(displayEndDate)) : "";
  const nextMonthDate = setMonth(new Date(currentDate), currentDate.getMonth() + 1);
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const isOpen = !!widgetState?.isOpen;
  const rangeError = widgetState?.rangeError || null;
  const hasValue = !!(appliedParsedStart || appliedParsedEnd);
  const comparison = comparePrevious ? comparisonFor(appliedParsedStart, appliedParsedEnd) : null;
  const density = widgetConfig?.properties?.density || "comfortable";
  const size = widgetConfig?.size || "default";
  const sizeClass = size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-10 text-sm" : "h-8 text-sm";

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full min-h-0 flex-col gap-1.5" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Updating…" />}

      {widgetConfig.label && (
        <Label htmlFor={startId}>
          {widgetConfig.label}{required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
        </Label>
      )}
      {widgetConfig.help && <p id={`${baseId}-help`} className="text-[11px] text-muted-foreground">{widgetConfig.help}</p>}

      <Popover open={isOpen} onOpenChange={(open) => {
        if (disabled || readOnly) return;
        if (open && requireApply) {
          // Snapshot applied into draft on open.
          if (setWidgetState) setWidgetState((p) => ({ ...p, draftStart: p.start ?? "", draftEnd: p.end ?? "", rangeError: null, isOpen: true }));
        } else if (setWidgetState) {
          setWidgetState((p) => ({ ...p, isOpen: open }));
        }
        if (fireWidgetEvent) fireWidgetEvent(open ? "onOpen" : "onClose", { source: "trigger" });
        if (!open) triggerRef.current?.focus?.();
      }}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-label={widgetConfig.label ? `${widgetConfig.label}, ${displayStart || placeholders.placeholderStart} to ${displayEnd || placeholders.placeholderEnd}` : `Select date range, ${displayStart || placeholders.placeholderStart} to ${displayEnd || placeholders.placeholderEnd}`}
            disabled={disabled}
            className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2 pointer-events-none">
              <span className="relative flex-1 block">
                <Input
                  id={startId}
                  readOnly
                  tabIndex={-1}
                  placeholder={placeholders.placeholderStart}
                  value={displayStart}
                  aria-label="Range start date"
                  disabled={disabled}
                  className={cn("pl-9 cursor-pointer pointer-events-none", sizeClass)}
                />
                <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="relative flex-1 block">
                <Input
                  id={endId}
                  readOnly
                  tabIndex={-1}
                  placeholder={placeholders.placeholderEnd}
                  value={displayEnd}
                  aria-label="Range end date"
                  disabled={disabled}
                  className={cn("pl-9 pr-8 cursor-pointer pointer-events-none", sizeClass)}
                />
                <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                {hasValue && interactive && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Clear date range"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); clearAll("clear-button"); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); clearAll("clear-button"); } }}
                    className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center pointer-events-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </span>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 flex flex-col" align="start" role="dialog" aria-label={widgetConfig.label || "Choose date range"}>
          {/* Narrow containers stack to one calendar column (responsive, no overflow). */}
          <div className="flex flex-col min-[640px]:flex-row p-3 gap-4 max-h-[70vh] overflow-auto">
            <div className="flex flex-col">
              <CalendarGrid
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
                rangeStart={parsedStart}
                rangeEnd={parsedEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                onMonthChange={(delta) => setCurrentDate(setMonth(new Date(currentDate), currentDate.getMonth() + delta))}
                hideRightArrow={true}
                isDateDisabled={isDateDisabled}
                instanceId={`${instanceKey}-a`}
              />
              {enableTime && parsedStart && (
                <TimeInput
                  hours={parsedStart.getHours()}
                  minutes={parsedStart.getMinutes()}
                  seconds={parsedStart.getSeconds()}
                  onChange={(time) => handleTimeChange('start', time)}
                  instanceId={`${instanceKey}-start`}
                  labelPrefix="Range start"
                  disabled={disabled}
                  readOnly={readOnly}
                />
              )}
            </div>
            <div className="flex flex-col">
              <CalendarGrid
                month={nextMonthDate.getMonth()}
                year={nextMonthDate.getFullYear()}
                rangeStart={parsedStart}
                rangeEnd={parsedEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                onMonthChange={(delta) => setCurrentDate(setMonth(new Date(currentDate), currentDate.getMonth() + delta))}
                hideLeftArrow={true}
                isDateDisabled={isDateDisabled}
                instanceId={`${instanceKey}-b`}
              />
              {enableTime && parsedEnd && (
                <TimeInput
                  hours={parsedEnd.getHours()}
                  minutes={parsedEnd.getMinutes()}
                  seconds={parsedEnd.getSeconds()}
                  onChange={(time) => handleTimeChange('end', time)}
                  instanceId={`${instanceKey}-end`}
                  labelPrefix="Range end"
                  disabled={disabled}
                  readOnly={readOnly}
                />
              )}
            </div>
          </div>
          {rangeError && (
            <p role="alert" className="mx-3 mb-2 text-[11px] text-destructive">{rangeError}</p>
          )}
          {widgetConfig.presets && widgetConfig.presets.length > 0 && (
            <div className="border-t border-border p-3 flex flex-wrap gap-2 bg-muted/30" role="group" aria-label="Range presets">
              {widgetConfig.presets.map((preset, i) => (
                <Button key={i} variant="outline" size="sm" disabled={disabled} onClick={() => handlePresetClick(preset)}>
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          {requireApply && (
            <div className="border-t border-border p-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" onClick={handleApply} disabled={!parsedStart && !parsedEnd}>Apply</Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {rangeError && !isOpen && (
        <p role="alert" className="text-[11px] text-destructive">{rangeError}</p>
      )}
      {comparison && (
        <p className="text-[10px] text-muted-foreground">Compared with {comparison.start} – {comparison.end}</p>
      )}
      <span className="sr-only" aria-live="polite">
        {appliedParsedStart || appliedParsedEnd ? `Selected ${displayStart || "no start"} to ${displayEnd || "no end"}` : "No range selected"}
      </span>
    </WidgetSurface>
  );
}

DateRangePickerWidget.propTypes = {
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

export default DateRangePickerWidget;
