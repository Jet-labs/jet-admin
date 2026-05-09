import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-[8px] py-[4px] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-border focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-brand-green text-brand-black hover:opacity-90",
        secondary:
          "border border-brand-border bg-brand-black text-brand-text-primary",
        destructive:
          "border border-transparent bg-destructive text-brand-text-primary hover:opacity-90",
        outline: "border border-brand-border text-brand-text-primary",
        success:
          "border border-transparent bg-brand-green text-brand-black",
        warning:
          "border border-transparent bg-brand-warning text-brand-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
