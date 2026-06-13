import * as React from "react";
import { cn } from "../lib/utils";

const EmptyState = React.forwardRef(({ className, icon: Icon, message, action, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-sm border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-8 w-8 text-muted-foreground/40" />}
      <p className="text-sm text-muted-foreground text-center">{message}</p>
      {action}
    </div>
  );
});
EmptyState.displayName = "EmptyState";

export { EmptyState };
