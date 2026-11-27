import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";
import { getIconComponent } from "../config/IconPicker";
import { resolveConditionalStyle } from "../config/conditionalStyle";

const clampDecimals = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 2;
  return Math.max(0, Math.min(6, Math.trunc(number)));
};

const formatNumeric = (numeric, widgetConfig) => {
  const decimals = clampDecimals(widgetConfig?.decimals);
  const locale = widgetConfig?.locale || undefined;
  const format = widgetConfig?.format || "number";
  const minimumFractionDigits = widgetConfig?.decimals === undefined ? 0 : decimals;
  try {
    if (format === "compact") {
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: decimals,
      }).format(numeric);
    }
    if (format === "currency") {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: widgetConfig?.currency || "USD",
        minimumFractionDigits,
        maximumFractionDigits: decimals,
      }).format(numeric);
    }
    const base = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits: decimals,
    }).format(numeric);
    return format === "percent" ? `${base}%` : base;
  } catch {
    return String(numeric);
  }
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handleChange = (event) => setReduced(event.matches);
    query.addEventListener?.("change", handleChange);
    return () => query.removeEventListener?.("change", handleChange);
  }, []);
  return reduced;
};

const useAnimatedNumber = (target, animate) => {
  const reduced = usePrefersReducedMotion();
  const numeric = typeof target === "number" && Number.isFinite(target);
  const [display, setDisplay] = useState(numeric ? target : 0);
  const displayRef = useRef(numeric ? target : 0);

  useEffect(() => {
    if (!numeric) return undefined;
    if (!animate || reduced) {
      displayRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = displayRef.current;
    if (from === target) return undefined;
    const duration = 420;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animate, reduced, numeric]);

  return numeric ? display : 0;
};

const parseSparkline = (value) => {
  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => Number.isFinite(item));
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(Number).filter((item) => Number.isFinite(item));
    } catch {
      return value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
    }
  }
  return [];
};

/**
 * StatWidget — single KPI/metric value with token-backed formatting,
 * direction-aware trend, optional icon and sparkline.
 */
export const StatWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const label = widgetConfig?.label || "";
  const rawValue = widgetConfig?.valueTemplate ?? widgetConfig?.value ?? "";
  const prefix = widgetConfig?.prefix || "";
  const suffix = widgetConfig?.suffix || "";
  const rawTrend = widgetConfig?.trendTemplate ?? widgetConfig?.trend ?? "";
  const trendDirection = widgetConfig?.trendDirection || "up-is-good";
  const align = widgetConfig?.textAlign || "center";
  const valueSize = widgetConfig?.valueSize || "default";
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";

  const parsedValue = useMemo(() => {
    if (rawValue === "" || rawValue === null || rawValue === undefined) return { text: "—", numeric: null };
    if (typeof rawValue === "boolean") return { text: String(rawValue), numeric: null };
    const numeric = Number(rawValue);
    if (Number.isFinite(numeric)) return { text: formatNumeric(numeric, widgetConfig), numeric };
    return { text: String(rawValue), numeric: null };
  }, [rawValue, widgetConfig]);

  const animated = useAnimatedNumber(parsedValue.numeric ?? 0, normalizeFieldBoolean(widgetConfig?.animateValue, false));
  const animate = normalizeFieldBoolean(widgetConfig?.animateValue, false);
  const displayText = parsedValue.numeric !== null ? formatNumeric(animated, widgetConfig) : parsedValue.text;

  const trend = useMemo(() => {
    if (rawTrend === "" || rawTrend === null || rawTrend === undefined) return null;
    const numeric = typeof rawTrend === "number" ? rawTrend : parseFloat(rawTrend);
    if (!Number.isFinite(numeric)) {
      return { text: String(rawTrend), direction: "neutral", positive: null, label: "" };
    }
    const direction = numeric > 0 ? "up" : numeric < 0 ? "down" : "neutral";
    const positive = direction === "up" ? trendDirection === "up-is-good" : direction === "down" ? trendDirection === "down-is-good" : null;
    return {
      text: `${numeric >= 0 ? "+" : ""}${numeric.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
      direction,
      positive,
    };
  }, [rawTrend, trendDirection]);

  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendColor =
    !trend || trend.direction === "neutral"
      ? "text-muted-foreground"
      : trend.positive
        ? "text-success"
        : "text-danger";

  const Icon = getIconComponent(widgetConfig?.icon);
  const iconColor = widgetConfig?.iconColor || "";
  const sparkline = useMemo(() => parseSparkline(widgetConfig?.sparklineTemplate), [widgetConfig?.sparklineTemplate]);
  const thresholdColor = useMemo(() => {
    if (parsedValue.numeric === null) return "";
    const thresholds = Array.isArray(widgetConfig?.thresholds) ? widgetConfig.thresholds : [];
    const matched = thresholds
      .filter((threshold) => Number.isFinite(Number(threshold?.min)) && Number(threshold.min) <= parsedValue.numeric)
      .sort((a, b) => Number(b.min) - Number(a.min))[0];
    if (!matched) return "text-foreground";
    if (matched.status === "success") return "text-success";
    if (matched.status === "warning") return "text-warning";
    if (matched.status === "danger") return "text-danger";
    if (matched.status === "neutral") return "text-muted-foreground";
    return "text-foreground";
  }, [parsedValue.numeric, widgetConfig?.thresholds]);
  const valueClass = {
    sm: "text-xl",
    default: "text-3xl",
    lg: "text-4xl",
  }[valueSize] || "text-3xl";
  const alignClass =
    align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right" : "items-center text-center";
  const clickable = Array.isArray(widgetConfig?.events?.onClick) && widgetConfig.events.onClick.length > 0;
  const conditional = resolveConditionalStyle(widgetConfig?.styleRules, {
    value: parsedValue.numeric ?? parsedValue.text,
    numeric: parsedValue.numeric,
    text: parsedValue.text,
    ...widgetConfig,
  });

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="relative flex h-full w-full flex-col justify-center gap-2" aria-busy="true">
        <span className="sr-only" role="status" aria-live="polite">Loading metric</span>
        <Skeleton className={cn("h-2.5 w-20", align === "left" ? "self-start" : align === "right" ? "self-end" : "self-center")} />
        <Skeleton className={cn("h-8 w-28", align === "left" ? "self-start" : align === "right" ? "self-end" : "self-center")} />
        <Skeleton className={cn("h-2.5 w-16", align === "left" ? "self-start" : align === "right" ? "self-end" : "self-center")} />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full flex-col justify-center gap-1", alignClass, conditional?.bgClass, clickable && "cursor-pointer")}
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : undefined}
      aria-label={label || "Metric"}
      onClick={clickable ? () => fireWidgetEvent?.("onClick", { value: parsedValue.numeric ?? parsedValue.text }) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fireWidgetEvent?.("onClick", { value: parsedValue.numeric ?? parsedValue.text });
              }
            }
          : undefined
      }
    >
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wider leading-none text-muted-foreground">
          {label}
        </span>
      )}

      <div className="flex min-w-0 max-w-full items-center gap-2">
        {Icon && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control border border-border bg-muted/30"
            style={iconColor ? { color: iconColor } : undefined}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="flex min-w-0 items-baseline gap-1">
          {prefix && <span className="text-base font-medium text-muted-foreground">{prefix}</span>}
          <span
            className={cn("max-w-full truncate font-medium tabular-nums tracking-tight", conditional?.className || thresholdColor || "text-foreground", valueClass)}
            aria-hidden={animate || undefined}
            title={`${prefix}${displayText}${suffix}`}
          >
            {displayText}
          </span>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {`${prefix}${parsedValue.text}${suffix}`}
          </span>
          {suffix && <span className="text-base font-medium text-muted-foreground">{suffix}</span>}
        </span>
      </div>

      {trend && (
        <div className={cn("flex flex-wrap items-center gap-1 text-xs", trendColor)}>
          <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="font-medium tabular-nums">{trend.text}</span>
          <span className="sr-only">
            {trend.direction === "up" ? "up" : trend.direction === "down" ? "down" : "unchanged"}
          </span>
          {widgetConfig?.comparisonLabel && <span className="text-[11px] text-muted-foreground">{widgetConfig.comparisonLabel}</span>}
        </div>
      )}

      {sparkline.length > 1 && (() => {
        const min = Math.min(...sparkline);
        const max = Math.max(...sparkline);
        const range = max - min || 1;
        return (
          <svg
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            className="mt-0.5 h-6 w-full max-w-[220px] text-primary/70"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline
                .map((value, index) => {
                  const x = (index / (sparkline.length - 1)) * 100;
                  const y = 22 - ((value - min) / range) * 20;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        );
      })()}
    </WidgetSurface>
  );
};

StatWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
};

export default StatWidget;
