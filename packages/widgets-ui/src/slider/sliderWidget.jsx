import React, { useEffect, useId, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Label, WidgetBusy, WidgetSurface } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const clamp = (value, min, max) => (Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min);

const readRange = (raw, min, max) => {
  if (Array.isArray(raw)) {
    const start = clamp(Number(raw[0]), min, max);
    const end = clamp(Number(raw[1]), min, max);
    return start <= end ? [start, end] : [end, start];
  }
  if (raw && typeof raw === "object") {
    const start = clamp(Number(raw.start), min, max);
    const end = clamp(Number(raw.end), min, max);
    return start <= end ? [start, end] : [end, start];
  }
  return [min, max];
};

export const SliderWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const rawMin = Number(widgetConfig?.min ?? 0);
  const rawMax = Number(widgetConfig?.max ?? 100);
  const min = Number.isFinite(rawMin) ? rawMin : 0;
  const max = Number.isFinite(rawMax) && rawMax > min ? rawMax : min + 100;
  const rawStep = Number(widgetConfig?.step ?? 1);
  const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1;
  const rangeMode = normalizeFieldBoolean(widgetConfig?.range, false);
  const showValue = widgetConfig?.showValue !== false;
  const showMinMax = widgetConfig?.showMinMax !== false;
  const showInput = normalizeFieldBoolean(widgetConfig?.showInput, false);
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const decimals = Math.max(0, Math.min(6, Number(widgetConfig?.decimals) || 0));
  const unit = widgetConfig?.unit || "";
  const marks = useMemo(
    () =>
      (Array.isArray(widgetConfig?.marks) ? widgetConfig.marks : [])
        .map(Number)
        .filter((value) => Number.isFinite(value) && value >= min && value <= max),
    [widgetConfig?.marks, min, max]
  );
  const reactId = useId();
  const id = `slider-${reactId.replace(/:/g, "")}`;
  const raw = widgetState?.value ?? widgetConfig?.defaultValue ?? (rangeMode ? [min, max] : min);
  const numeric = Number(raw);
  const singleValue = clamp(Number.isFinite(numeric) ? numeric : min, min, max);
  const [rangeStart, rangeEnd] = readRange(raw, min, max);
  const startPct = max === min ? 0 : ((rangeStart - min) / (max - min)) * 100;
  const endPct = max === min ? 100 : ((rangeEnd - min) / (max - min)) * 100;
  const pct = max === min ? 0 : ((singleValue - min) / (max - min)) * 100;
  const displayValue = rangeMode
    ? `${rangeStart.toFixed(decimals)}${unit} – ${rangeEnd.toFixed(decimals)}${unit}`
    : `${singleValue.toFixed(decimals)}${unit}`;

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) {
        const nextValue = rangeMode ? readRange(widgetConfig.defaultValue, min, max) : Number(widgetConfig.defaultValue);
        setWidgetState((prev) => ({ ...prev, value: nextValue }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue, rangeMode]);

  const liveRef = useRef(null);
  liveRef.current = { min, max, rangeMode, setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (next) => {
        const rt = liveRef.current;
        const value = rt.rangeMode ? readRange(next, rt.min, rt.max) : clamp(Number(next), rt.min, rt.max);
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value });
      },
      clear: () => {
        const rt = liveRef.current;
        const value = rt.rangeMode ? [rt.min, rt.max] : rt.min;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value });
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const commit = (next) => {
    if (disabled || readOnly) return;
    const value = rangeMode ? readRange(next, min, max) : clamp(Number(next), min, max);
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value });
  };

  const commitRangeEdge = (edge, next) => {
    const numericNext = clamp(Number(next), min, max);
    if (edge === "start") {
      commit([Math.min(numericNext, rangeEnd), rangeEnd]);
    } else {
      commit([rangeStart, Math.max(numericNext, rangeStart)]);
    }
  };

  const trackStyle = {
    background: rangeMode
      ? `linear-gradient(to right, hsl(var(--muted)) ${startPct}%, ${widgetConfig?.trackColor || "hsl(var(--primary))"} ${startPct}%, ${widgetConfig?.trackColor || "hsl(var(--primary))"} ${endPct}%, hsl(var(--muted)) ${endPct}%)`
      : `linear-gradient(to right, ${widgetConfig?.trackColor || "hsl(var(--primary))"} ${pct}%, hsl(var(--muted)) ${pct}%)`,
  };

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col justify-center gap-2" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <Label htmlFor={`${id}-start`} className="text-xs font-medium text-foreground">
            {label}
          </Label>
        )}
        <div className="flex items-center gap-1.5">
          {showInput && (
            rangeMode ? (
              <>
                <Input
                  type="number"
                  value={rangeStart}
                  min={min}
                  max={rangeEnd}
                  step={step}
                  disabled={disabled || readOnly}
                  onChange={(event) => commitRangeEdge("start", event.target.value)}
                  aria-label={label ? `${label} minimum` : "Slider minimum"}
                  className="h-7 w-20 text-xs tabular-nums"
                />
                <span className="text-[10px] text-muted-foreground">–</span>
                <Input
                  type="number"
                  value={rangeEnd}
                  min={rangeStart}
                  max={max}
                  step={step}
                  disabled={disabled || readOnly}
                  onChange={(event) => commitRangeEdge("end", event.target.value)}
                  aria-label={label ? `${label} maximum` : "Slider maximum"}
                  className="h-7 w-20 text-xs tabular-nums"
                />
              </>
            ) : (
              <Input
                type="number"
                value={singleValue}
                min={min}
                max={max}
                step={step}
                disabled={disabled || readOnly}
                onChange={(event) => commit(event.target.value)}
                aria-label={label ? `${label} value` : "Slider value"}
                className="h-7 w-20 text-xs tabular-nums"
              />
            )
          )}
          {showValue && (
            <span className="rounded-control border border-border bg-muted/50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
              {displayValue}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {rangeMode ? (
          <div className="relative h-4">
            <div
              className="pointer-events-none absolute inset-x-0 top-1.5 h-2 rounded-full"
              style={trackStyle}
              aria-hidden="true"
            />
            <input
              id={`${id}-start`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={rangeStart}
              disabled={disabled || readOnly}
              onChange={(event) => commitRangeEdge("start", event.target.value)}
              aria-label={label ? `${label} minimum` : "Minimum value"}
              aria-valuetext={`${rangeStart.toFixed(decimals)}${unit}`}
              className="jet-range-input absolute inset-0 h-4 w-full"
            />
            <input
              id={`${id}-end`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={rangeEnd}
              disabled={disabled || readOnly}
              onChange={(event) => commitRangeEdge("end", event.target.value)}
              aria-label={label ? `${label} maximum` : "Maximum value"}
              aria-valuetext={`${rangeEnd.toFixed(decimals)}${unit}`}
              className="jet-range-input absolute inset-0 h-4 w-full"
            />
          </div>
        ) : (
          <input
            id={`${id}-start`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={singleValue}
            disabled={disabled || readOnly}
            onChange={(event) => commit(event.target.value)}
            aria-valuetext={`${displayValue}`}
            className="jet-slider h-2 w-full cursor-pointer appearance-none rounded-full border border-border bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            style={trackStyle}
          />
        )}
        {marks.length > 0 && (
          <div className="relative mt-1 h-3">
            {marks.map((mark) => (
              <span
                key={mark}
                className="absolute top-0 -translate-x-1/2 text-[9px] tabular-nums text-muted-foreground"
                style={{ left: `${max === min ? 0 : ((mark - min) / (max - min)) * 100}%` }}
              >
                {mark}
              </span>
            ))}
          </div>
        )}
      </div>

      {showMinMax && (
        <div className="flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>{`${min}${unit}`}</span>
          <span>{`${max}${unit}`}</span>
        </div>
      )}
    </WidgetSurface>
  );
};

SliderWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default SliderWidget;
