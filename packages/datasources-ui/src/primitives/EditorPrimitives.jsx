/**
 * Shared editor primitives.
 *
 * Reusable sub-components extracted from ExcelCSVQueryBuilder for use across
 * all dedicated datasource and query editors.
 */

import React from "react";
import { Info } from "lucide-react";

/**
 * Monospaced section label — used as dividers inside editor panels.
 */
export function MonoLabel({ children }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * Info callout box — highlights contextual help inside editor panels.
 */
export function InfoCallout({ children }) {
  return (
    <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary/80 flex gap-2">
      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/**
 * AND / OR toggle chip — used in filter condition editors.
 */
export function LogicChip({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === "AND" ? "OR" : "AND")}
      className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
        value === "AND"
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-amber-50 text-amber-600 border-amber-200"
      }`}
    >
      {value}
    </button>
  );
}

/**
 * Empty state placeholder — shown when a list/section has no items.
 *
 * @param {Object}   props
 * @param {React.ComponentType} props.icon — Lucide icon component
 * @param {string}   props.message        — Descriptive text
 * @param {React.ReactNode} [props.action] — Optional action button/element
 */
export function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className="rounded-md border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2">
      {Icon && <Icon className="h-8 w-8 text-muted-foreground/40" />}
      <p className="text-sm text-muted-foreground text-center">{message}</p>
      {action}
    </div>
  );
}
