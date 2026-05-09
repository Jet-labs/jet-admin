import * as React from "react";
import { cn } from "../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-sm border border-brand-border bg-brand-black px-2 py-1.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus-visible:outline-none focus-visible:border-brand-border-mid focus-visible:ring-2 focus-visible:ring-brand-green-border disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
