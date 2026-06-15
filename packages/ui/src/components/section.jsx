import * as React from "react";
import { cn } from "../lib/utils";

const Section = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-border bg-card",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="border-b border-border bg-muted/15 p-2">
            {title && (
              <h3 className="text-xs font-semibold text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        )}
        <div className="p-2 space-y-2">
          {children}
        </div>
      </div>
    );
  }
);
Section.displayName = "Section";

export { Section };
