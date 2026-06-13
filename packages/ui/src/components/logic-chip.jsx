import * as React from "react";
import { cn } from "../lib/utils";

const LogicChip = React.forwardRef(({ className, value, onChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onChange(value === "AND" ? "OR" : "AND")}
      className={cn(
        "text-[9px] font-bold px-2 py-0.5 rounded border transition-colors",
        value === "AND"
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-amber-50 text-amber-600 border-amber-200",
        className
      )}
      {...props}
    >
      {value}
    </button>
  );
});
LogicChip.displayName = "LogicChip";

export { LogicChip };
