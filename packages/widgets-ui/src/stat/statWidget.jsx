import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * StatWidget
 *
 * Displays a single KPI/metric value with label, prefix/suffix,
 * and an optional trend indicator.
 */
export const StatWidget = ({
    widgetConfig,
    data,
}) => {
    const label = widgetConfig?.label || "Metric";
    const rawValue = widgetConfig?.valueTemplate ?? "";
    const prefix = widgetConfig?.prefix || "";
    const suffix = widgetConfig?.suffix || "";
    const rawTrend = widgetConfig?.trendTemplate ?? "";
    const trendDirection = widgetConfig?.trendDirection || "up-is-good"; // "up-is-good" | "down-is-good"
    const align = widgetConfig?.textAlign || "center";

    // Parse the display value — could be number or string after template resolution
    const displayValue = useMemo(() => {
        if (rawValue === "" || rawValue === null || rawValue === undefined) return "—";
        const num = Number(rawValue);
        if (!isNaN(num) && typeof rawValue !== "boolean") {
            // Format large numbers with locale grouping
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return String(rawValue);
    }, [rawValue]);

    // Parse trend
    const trend = useMemo(() => {
        if (rawTrend === "" || rawTrend === null || rawTrend === undefined) return null;
        const num = parseFloat(rawTrend);
        if (isNaN(num)) return { value: rawTrend, direction: "neutral" };
        return {
            value: `${num >= 0 ? "+" : ""}${num.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
            direction: num > 0 ? "up" : num < 0 ? "down" : "neutral",
        };
    }, [rawTrend]);

    // Determine trend color based on direction semantics
    const trendColor = useMemo(() => {
        if (!trend) return "";
        const { direction } = trend;
        if (direction === "neutral") return "text-muted-foreground";
        if (trendDirection === "up-is-good") {
            return direction === "up" ? "text-emerald-500" : "text-red-500";
        }
        // down-is-good (e.g., error rate, latency)
        return direction === "down" ? "text-emerald-500" : "text-red-500";
    }, [trend, trendDirection]);

    const TrendIcon = trend?.direction === "up"
        ? TrendingUp
        : trend?.direction === "down"
            ? TrendingDown
            : Minus;

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full p-4 gap-1"
            style={{ textAlign: align, alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}
        >
            {/* Label */}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                {label}
            </span>

            {/* Value */}
            <div className="flex items-baseline gap-1">
                {prefix && (
                    <span className="text-lg font-medium text-muted-foreground">{prefix}</span>
                )}
                <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                    {displayValue}
                </span>
                {suffix && (
                    <span className="text-lg font-medium text-muted-foreground">{suffix}</span>
                )}
            </div>

            {/* Trend */}
            {trend && (
                <div className={`flex items-center gap-1 mt-0.5 ${trendColor}`}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">{trend.value}</span>
                </div>
            )}
        </div>
    );
};

StatWidget.propTypes = {
    widgetConfig: PropTypes.object,
    data: PropTypes.any,
};

export default StatWidget;