import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-brand-green text-brand-black font-semibold border border-transparent hover:bg-brand-green/90",
        secondary:
          "bg-brand-border-dark text-brand-text-primary border border-brand-border hover:bg-brand-border hover:border-brand-border-mid",
        green:
          "bg-brand-green text-brand-black font-semibold border border-transparent hover:bg-brand-green/90",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border border-transparent",
        white:
          "bg-brand-text-primary text-brand-black hover:opacity-90 border border-transparent",
        outline:
          "bg-transparent border border-brand-border text-brand-text-primary hover:bg-white/5 hover:border-brand-border-mid",
        ghost:
          "bg-transparent text-brand-text-primary hover:bg-white/5",
        link:
          "text-brand-green-link hover:text-brand-green underline-offset-4 hover:underline",
        pill:
          "bg-brand-border-dark text-brand-text-primary border border-brand-border hover:border-brand-border-mid",
      },
      size: {
        default: "px-[14px] py-[5px] text-[13px] rounded-sm",
        sm: "px-[10px] py-[3px] text-[12px] rounded-sm",
        lg: "px-[20px] py-[8px] text-[14px] rounded-sm",
        icon: "h-[28px] w-[28px] rounded-sm",
        circle: "h-[36px] w-[36px] p-0 rounded-pill",
        pill: "px-[24px] py-[5px] text-[13px] rounded-pill",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };