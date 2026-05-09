import * as React from "react";
import { cn } from "../lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-brand-border bg-brand-black p-2 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus-visible:outline-none focus-visible:border-brand-border-mid focus-visible:ring-2 focus-visible:ring-brand-green-border disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
