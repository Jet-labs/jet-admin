import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "destructive-ghost":
          "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600",
        "primary-ghost":
          "bg-primary/10 text-primary hover:bg-primary/20",
        "primary-outline":
          "border border-primary bg-background text-primary hover:bg-primary/10",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 px-3",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-10 px-5 text-base",
      },
      square: {
        true: "px-0",
      },
    },
    compoundVariants: [
      { square: true, size: "default", className: "w-7" },
      { square: true, size: "sm", className: "w-7" },
      { square: true, size: "lg", className: "w-10" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      square: false,
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, square, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, square, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };