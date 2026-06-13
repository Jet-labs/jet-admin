import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "../lib/utils";

const Callout = React.forwardRef(({ className, children, icon: Icon = Info, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-sm border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary flex gap-2",
        className
      )}
      {...props}
    >
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span className="flex-1">{children}</span>
    </div>
  );
});
Callout.displayName = "Callout";

export { Callout };
