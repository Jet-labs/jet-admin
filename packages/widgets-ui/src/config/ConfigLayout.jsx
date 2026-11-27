import React from "react";
import { cn } from "@jet-admin/ui";

const COLUMN_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** Two/three related fields on one line. Collapses to one column when narrow. */
export const ConfigRow = ({ columns = 2, className, children }) => (
  <div className={cn("grid gap-2", COLUMN_CLASS[columns] || COLUMN_CLASS[2], className)}>{children}</div>
);

/** A visually grouped sub-panel inside a config section. */
export const ConfigGroup = ({ title, description, className, children }) => (
  <div className={cn("space-y-2 rounded-control border border-border/70 bg-muted/20 p-2", className)}>
    {(title || description) && (
      <div className="space-y-0.5">
        {title && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>}
        {description && <p className="text-[10px] leading-snug text-muted-foreground">{description}</p>}
      </div>
    )}
    {children}
  </div>
);

export default ConfigRow;
