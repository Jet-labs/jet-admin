import * as React from "react";
import { cn } from "../lib/utils";
import { ChevronRight } from "lucide-react";

const Section = React.forwardRef(
  ({ className, title, description, children, collapsible = false, defaultOpen = true, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded border border-border bg-card",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div
            className={cn(
              "border-b border-border bg-muted/15 p-2",
              collapsible && "cursor-pointer select-none hover:bg-muted/25 transition-colors",
              !isOpen && "border-b-0"
            )}
            onClick={collapsible ? () => setIsOpen((prev) => !prev) : undefined}
          >
            <div className="flex items-center gap-1.5">
              {collapsible && (
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-xs font-semibold text-foreground">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {(!collapsible || isOpen) && (
          <div className="p-2 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  }
);
Section.displayName = "Section";

export { Section };
