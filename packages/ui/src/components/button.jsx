import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary/50 text-primary-foreground font-semibold border border-primary/80 hover:border-primary hover:bg-primary/70",
        secondary:
          "bg-muted text-foreground border border-border/50 hover:bg-muted/80 hover:border-border",
        green:
          "bg-primary text-primary-foreground font-semibold border border-transparent hover:bg-primary/90",
        destructive:
          "bg-red-500/20 text-foreground hover:bg-red-500/40 border border-red-500/40",
        white:
          "bg-foreground text-background hover:opacity-90 border border-transparent",
        outline:
          "bg-transparent border border-border text-foreground hover:bg-background/5",
        ghost:
          "bg-transparent text-foreground hover:bg-background/5",
        link:
          "text-primary/90 hover:text-primary underline-offset-4 hover:underline",
        pill:
          "bg-muted text-foreground border border-border hover:border-border/80",
        "primary-ghost":
          "bg-primary/10 text-primary hover:bg-primary/20 border border-transparent",
        "destructive-ghost":
          "bg-transparent text-destructive hover:bg-destructive/10 border border-transparent",
        "primary-outline":
          "bg-transparent text-primary border border-primary/50 hover:bg-primary/10",
      },
      size: {
        default: "h-8 px-3 text-sm rounded-sm",
        sm: "h-7 px-2.5 text-xs rounded-sm",
        lg: "h-10 px-5 text-sm rounded-sm",
        icon: "h-7 w-7 rounded-sm",
        circle: "h-9 w-9 p-0 rounded-full",
        pill: "h-8 px-4 text-sm rounded-full",
      },
      square: {
        true: "aspect-square p-0",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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