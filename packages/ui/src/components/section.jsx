import * as React from "react";
import { cn } from "../lib/utils";

const Section = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-border bg-card p-4 space-y-3",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div>
            {title && (
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                {title}
              </p>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
Section.displayName = "Section";

export { Section };
