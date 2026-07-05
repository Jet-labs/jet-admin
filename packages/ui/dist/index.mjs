// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/accordion.jsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React.createElement(
  AccordionPrimitive.Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ React.createElement(AccordionPrimitive.Header, { className: "flex" }, /* @__PURE__ */ React.createElement(
    AccordionPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      ),
      ...props
    },
    children,
    /* @__PURE__ */ React.createElement(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
  ))
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ React.createElement(
    AccordionPrimitive.Content,
    {
      ref,
      className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      ...props
    },
    /* @__PURE__ */ React.createElement("div", { className: cn("pb-4 pt-0", className) }, children)
  )
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// src/components/alert-dialog.jsx
import * as React3 from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// src/components/button.jsx
import * as React2 from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary/50 text-primary-foreground font-semibold border border-primary/80 hover:border-primary hover:bg-primary/70",
        secondary: "bg-muted text-foreground border border-border/50 hover:bg-muted/80 hover:border-border",
        green: "bg-primary text-primary-foreground font-semibold border border-transparent hover:bg-primary/90",
        destructive: "bg-red-500/20 text-foreground hover:bg-red-500/40 border border-red-500/40",
        white: "bg-foreground text-background hover:opacity-90 border border-transparent",
        outline: "bg-transparent border border-border text-foreground hover:bg-background/5",
        ghost: "bg-transparent text-foreground hover:bg-background/5",
        link: "text-primary/90 hover:text-primary underline-offset-4 hover:underline",
        pill: "bg-muted text-foreground border border-border hover:border-border/80",
        "primary-ghost": "bg-primary/10 text-primary hover:bg-primary/20 border border-transparent",
        "destructive-ghost": "bg-transparent text-destructive hover:bg-destructive/10 border border-transparent",
        "primary-outline": "bg-transparent text-primary border border-primary/50 hover:bg-primary/10"
      },
      size: {
        default: "h-8 px-3 text-sm rounded-sm",
        sm: "h-7 px-2.5 text-xs rounded-sm",
        lg: "h-10 px-5 text-sm rounded-sm",
        icon: "h-7 w-7 rounded-sm",
        circle: "h-9 w-9 p-0 rounded-full",
        pill: "h-8 px-4 text-sm rounded-full"
      },
      square: {
        true: "aspect-square p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React2.forwardRef(
  ({ className, variant, size, square, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ React2.createElement(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, square, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/components/alert-dialog.jsx
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogPortal = AlertDialogPrimitive.Portal;
var AlertDialogOverlay = React3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
var AlertDialogContent = React3.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(AlertDialogPortal, null, /* @__PURE__ */ React3.createElement(AlertDialogOverlay, null), /* @__PURE__ */ React3.createElement(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-3 border border-border bg-background p-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-md",
        className
      ),
      ...props
    }
  ))
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ React3.createElement(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ React3.createElement(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = React3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
var AlertDialogDescription = React3.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(
    AlertDialogPrimitive.Description,
    {
      ref,
      className: cn("text-xs text-muted-foreground", className),
      ...props
    }
  )
);
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
var AlertDialogAction = React3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
var AlertDialogCancel = React3.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React3.createElement(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

// src/components/avatar.jsx
import * as React4 from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
var Avatar = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
var AvatarImage = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
var AvatarFallback = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// src/components/badge.jsx
import * as React5 from "react";
import { cva as cva2 } from "class-variance-authority";
var badgeVariants = cva2(
  "inline-flex items-center rounded-pill px-[8px] py-[4px] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-brand-black hover:opacity-90",
        secondary: "border border-border bg-background text-foreground",
        destructive: "border border-transparent bg-destructive text-foreground hover:opacity-90",
        outline: "border border-border text-foreground",
        success: "border border-transparent bg-primary text-brand-black",
        warning: "border border-transparent bg-brand-warning text-brand-black"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ React5.createElement("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

// src/components/card.jsx
import * as React6 from "react";
var Card = React6.forwardRef(({ className, variant = "default", ...props }, ref) => /* @__PURE__ */ React6.createElement(
  "div",
  {
    ref,
    className: cn(
      "rounded-md bg-background border border-border text-foreground",
      variant === "glass" && "bg-background/80 backdrop-blur-xl saturate-150",
      variant === "pastel" && "bg-muted",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React6.createElement(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React6.createElement(
  "h3",
  {
    ref,
    className: cn(
      "text-[24px] font-normal leading-[1.33] tracking-[-0.16px] text-foreground",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React6.createElement(
  "p",
  {
    ref,
    className: cn("text-[14px] font-normal text-muted-foreground leading-[1.5]", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React6.createElement("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React6.createElement(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/checkbox.jsx
import * as React7 from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
var Checkbox = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React7.createElement(
    CheckboxPrimitive.Indicator,
    {
      className: cn("flex items-center justify-center text-current")
    },
    /* @__PURE__ */ React7.createElement(Check, { className: "h-4 w-4" })
  )
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/components/dialog.jsx
import * as React8 from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogClose = DialogPrimitive.Close;
var DialogOverlay = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React8.createElement(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React8.forwardRef(
  ({ className, children, hideCloseIcon = false, ...props }, ref) => /* @__PURE__ */ React8.createElement(DialogPortal, null, /* @__PURE__ */ React8.createElement(DialogOverlay, null), /* @__PURE__ */ React8.createElement(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-md",
        className
      ),
      ...props
    },
    children,
    !hideCloseIcon && /* @__PURE__ */ React8.createElement(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-muted data-[state=open]:text-muted-foreground" }, /* @__PURE__ */ React8.createElement(X, { className: "h-4 w-4" }), /* @__PURE__ */ React8.createElement("span", { className: "sr-only" }, "Close"))
  ))
);
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ React8.createElement(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ React8.createElement(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React8.createElement(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-medium leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React8.createElement(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// src/components/dropdown-menu.jsx
import * as React9 from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check as Check2, ChevronRight, Circle } from "lucide-react";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuPortal = DropdownMenuPrimitive.Portal;
var DropdownMenuSub = DropdownMenuPrimitive.Sub;
var DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
var DropdownMenuSubTrigger = React9.forwardRef(
  ({ className, inset, children, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.SubTrigger,
    {
      ref,
      className: cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-muted data-[state=open]:bg-muted",
        inset && "pl-8",
        className
      ),
      ...props
    },
    children,
    /* @__PURE__ */ React9.createElement(ChevronRight, { className: "ml-auto h-4 w-4" })
  )
);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = React9.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.SubContent,
    {
      ref,
      className: cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-sm border border-border bg-background p-1 text-foreground shadow-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      ),
      ...props
    }
  )
);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
var DropdownMenuContent = React9.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ React9.createElement(DropdownMenuPrimitive.Portal, null, /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.Content,
    {
      ref,
      sideOffset,
      className: cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-sm border border-border bg-background p-1 text-foreground shadow-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      ),
      ...props
    }
  ))
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
var DropdownMenuItem = React9.forwardRef(
  ({ className, inset, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.Item,
    {
      ref,
      className: cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      ),
      ...props
    }
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
var DropdownMenuCheckboxItem = React9.forwardRef(
  ({ className, children, checked, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.CheckboxItem,
    {
      ref,
      className: cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      checked,
      ...props
    },
    /* @__PURE__ */ React9.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React9.createElement(DropdownMenuPrimitive.ItemIndicator, null, /* @__PURE__ */ React9.createElement(Check2, { className: "h-4 w-4" }))),
    children
  )
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuLabel = React9.forwardRef(
  ({ className, inset, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.Label,
    {
      ref,
      className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
      ...props
    }
  )
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
var DropdownMenuSeparator = React9.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React9.createElement(
    DropdownMenuPrimitive.Separator,
    {
      ref,
      className: cn("-mx-1 my-1 h-px bg-brand-border", className),
      ...props
    }
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
  return /* @__PURE__ */ React9.createElement("span", { className: cn("ml-auto text-xs tracking-widest opacity-60", className), ...props });
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/components/input.jsx
import * as React10 from "react";
import { cva as cva3 } from "class-variance-authority";
var inputVariants = cva3(
  "flex w-full rounded-sm border border-input-custom bg-input-custom text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5 py-1 text-sm",
        sm: "h-7 px-2 py-1 text-xs",
        lg: "h-10 px-3 py-2 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);
var Input = React10.forwardRef(({ className, type, size, ...props }, ref) => {
  return /* @__PURE__ */ React10.createElement(
    "input",
    {
      type,
      className: cn(inputVariants({ size, className })),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";

// src/components/label.jsx
import * as React11 from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva as cva4 } from "class-variance-authority";
var labelVariants = cva4(
  "text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label2 = React11.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React11.createElement(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label2.displayName = LabelPrimitive.Root.displayName;

// src/components/popover.jsx
import * as React12 from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverContent = React12.forwardRef(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ React12.createElement(PopoverPrimitive.Portal, null, /* @__PURE__ */ React12.createElement(
    PopoverPrimitive.Content,
    {
      ref,
      align,
      sideOffset,
      className: cn(
        "z-50 w-72 rounded-sm border border-border bg-background p-4 text-foreground shadow-none outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      ),
      ...props
    }
  ))
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// src/components/radio-group.jsx
import * as React13 from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle as Circle2 } from "lucide-react";
var RadioGroup2 = React13.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ React13.createElement(
    RadioGroupPrimitive.Root,
    {
      className: cn("grid gap-2", className),
      ...props,
      ref
    }
  );
});
RadioGroup2.displayName = RadioGroupPrimitive.Root.displayName;
var RadioGroupItem = React13.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ React13.createElement(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React13.createElement(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center" }, /* @__PURE__ */ React13.createElement(Circle2, { className: "h-2.5 w-2.5 fill-current text-current" }))
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// src/components/scroll-area.jsx
import * as React14 from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
var ScrollArea = React14.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ React14.createElement(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props
  },
  /* @__PURE__ */ React14.createElement(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]" }, children),
  /* @__PURE__ */ React14.createElement(ScrollBar, null),
  /* @__PURE__ */ React14.createElement(ScrollAreaPrimitive.Corner, null)
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
var ScrollBar = React14.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ React14.createElement(
    ScrollAreaPrimitive.ScrollAreaScrollbar,
    {
      ref,
      orientation,
      className: cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" && "h-full w-2 border-l border-l-transparent p-[2px]",
        orientation === "horizontal" && "h-2 flex-col border-t border-t-transparent p-[2px]",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React14.createElement(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors duration-150" })
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// src/components/select.jsx
import * as React15 from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check as Check3, ChevronDown as ChevronDown2, ChevronUp } from "lucide-react";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React15.forwardRef(
  ({ className, children, size = "default", ...props }, ref) => /* @__PURE__ */ React15.createElement(
    SelectPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex w-full items-center justify-between rounded-sm border border-input-custom bg-input-custom text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-border/80 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        size === "default" && "h-8 px-2.5 py-1.5 text-sm",
        size === "sm" && "h-7 px-2 text-xs",
        className
      ),
      ...props
    },
    children,
    /* @__PURE__ */ React15.createElement(SelectPrimitive.Icon, { asChild: true }, /* @__PURE__ */ React15.createElement(ChevronDown2, { className: "h-4 w-4 opacity-50" }))
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React15.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React15.createElement(
    SelectPrimitive.ScrollUpButton,
    {
      ref,
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React15.createElement(ChevronUp, { className: "h-4 w-4" })
  )
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React15.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ React15.createElement(
    SelectPrimitive.ScrollDownButton,
    {
      ref,
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React15.createElement(ChevronDown2, { className: "h-4 w-4" })
  )
);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React15.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ React15.createElement(SelectPrimitive.Portal, null, /* @__PURE__ */ React15.createElement(
    SelectPrimitive.Content,
    {
      ref,
      className: cn(
        "relative z-[1100] max-h-96 min-w-[8rem] overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props
    },
    /* @__PURE__ */ React15.createElement(SelectScrollUpButton, null),
    /* @__PURE__ */ React15.createElement(
      SelectPrimitive.Viewport,
      {
        className: cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )
      },
      children
    ),
    /* @__PURE__ */ React15.createElement(SelectScrollDownButton, null)
  ))
);
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React15.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React15.createElement(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React15.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ React15.createElement(
    SelectPrimitive.Item,
    {
      ref,
      className: cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React15.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React15.createElement(SelectPrimitive.ItemIndicator, null, /* @__PURE__ */ React15.createElement(Check3, { className: "h-4 w-4" }))),
    /* @__PURE__ */ React15.createElement(SelectPrimitive.ItemText, null, children)
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React15.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React15.createElement(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-brand-border", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/components/separator.jsx
import * as React16 from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
var Separator3 = React16.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ React16.createElement(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator3.displayName = SeparatorPrimitive.Root.displayName;

// src/components/spinner.jsx
import * as React17 from "react";
import { Loader2 } from "lucide-react";
var Spinner = React17.forwardRef(
  ({ className, size = 16, ...props }, ref) => /* @__PURE__ */ React17.createElement(
    Loader2,
    {
      ref,
      className: cn("animate-spin text-current", className),
      style: { width: size, height: size },
      ...props
    }
  )
);
Spinner.displayName = "Spinner";

// src/components/switch.jsx
import * as React18 from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
var Switch = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React18.createElement(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref
  },
  /* @__PURE__ */ React18.createElement(
    SwitchPrimitives.Thumb,
    {
      className: cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )
    }
  )
));
Switch.displayName = SwitchPrimitives.Root.displayName;

// src/components/tabs.jsx
import * as React19 from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
var Tabs = TabsPrimitive.Root;
var TabsList = React19.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React19.createElement(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-start border-b border-border bg-transparent p-0 h-9 w-full rounded-none gap-0 text-muted-foreground overflow-x-auto h-auto ",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React19.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React19.createElement(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 h-9 text-xs font-semibold rounded-none border-b-2 border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React19.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React19.createElement(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 text-foreground",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// src/components/textarea.jsx
import * as React20 from "react";
var Textarea = React20.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ React20.createElement(
    "textarea",
    {
      className: cn(
        "flex min-h-[80px] w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

// src/components/tooltip.jsx
import * as React21 from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React21.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ React21.createElement(
    TooltipPrimitive.Content,
    {
      ref,
      sideOffset,
      className: cn(
        "z-50 overflow-hidden rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      ),
      ...props
    }
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// src/components/collapseComponent.jsx
import React22, { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import PropTypes from "prop-types";
import { Button as Button2 } from "@jet-admin/ui";
var CollapseComponent = ({
  showButtonText,
  hideButtonText,
  containerClass,
  content
}) => {
  CollapseComponent.propTypes = {
    showButtonText: PropTypes.string,
    hideButtonText: PropTypes.string,
    containerClass: PropTypes.string,
    content: PropTypes.func.isRequired
  };
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  return /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: `flex flex-col justify-start items-stretch ${containerClass}`
    },
    /* @__PURE__ */ React22.createElement(
      Button2,
      {
        onClick: handleToggle,
        type: "button",
        variant: "ghost",
        className: "p-0 m-0 text-primary hover:text-primary"
      },
      isOpen ? /* @__PURE__ */ React22.createElement(BiChevronUp, { className: "text-base mr-1" }) : /* @__PURE__ */ React22.createElement(BiChevronDown, { className: "text-base mr-1" }),
      isOpen ? hideButtonText || "Hide" : showButtonText || "Show"
    ),
    /* @__PURE__ */ React22.createElement(
      "div",
      {
        className: `grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`
      },
      /* @__PURE__ */ React22.createElement("div", { className: "overflow-hidden" }, content())
    )
  );
};

// src/components/code-editor.jsx
import * as React23 from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { closeBrackets, closeBracketsKeymap, autocompletion } from "@codemirror/autocomplete";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { getCompletions, MODES } from "@jet-admin/expression-engine";
import { Maximize2, Minimize2, AlertTriangle, CheckCircle2, Code } from "lucide-react";
var languageCompartment = new Compartment();
var readOnlyCompartment = new Compartment();
var autocompleteCompartment = new Compartment();
var getLanguageExtension = (lang) => {
  switch (lang) {
    case "javascript":
      return javascript();
    case "sql":
      return sql();
    case "json":
      return json();
    case "html":
      return html();
    case "css":
      return css();
    default:
      return javascript();
  }
};
function engineTypeToCmType(type) {
  switch (type) {
    case "object":
    case "array":
      return "namespace";
    case "method":
      return "method";
    case "function":
      return "function";
    case "property":
      return "property";
    case "snippet":
      return "text";
    default:
      return "variable";
  }
}
function toCmOption(s) {
  return {
    label: s.label,
    apply: s.value ?? s.label,
    detail: s.detail,
    type: engineTypeToCmType(s.type),
    boost: s.category === "live-state" ? 2 : typeof s.category === "string" && s.category.endsWith("member") ? 1 : 0,
    info: s.detail ? `Value: ${s.detail}` : void 0
  };
}
var CodeEditor = React23.forwardRef(({
  value,
  defaultValue,
  onChange,
  language = "json",
  height = 300,
  disabled = false,
  readOnly = false,
  theme = "vs-dark",
  className,
  title,
  titleIcon,
  showHeader = true,
  showFormatButton = true,
  showExpandButton = true,
  showLineNumbers = true,
  headerExtra,
  headerLeft,
  status,
  statusMessage,
  footerHint,
  onMount,
  beforeMount,
  extensions = [],
  editorOptions = {},
  // Intellisense Props
  stateTree = null,
  templateMode,
  ...props
}, ref) => {
  const [isExpanded, setIsExpanded] = React23.useState(false);
  const containerRef = React23.useRef(null);
  const viewRef = React23.useRef(null);
  const internalChange = React23.useRef(false);
  const isReadOnly = disabled || readOnly;
  const effectiveTemplateMode = React23.useMemo(() => {
    if (templateMode) return templateMode;
    return language === "javascript" ? MODES.JS_TEMPLATE : MODES.SAFE_PATH;
  }, [templateMode, language]);
  const autocompletionExtension = React23.useMemo(() => {
    const completionSource = (ctx) => {
      const isSql = language === "sql";
      let inMustache = false;
      if (isSql) {
        const doc = ctx.state.doc.toString();
        let searchFrom = 0;
        while (searchFrom < doc.length) {
          const open = doc.indexOf("{{", searchFrom);
          if (open === -1) break;
          const close = doc.indexOf("}}", open + 2);
          if (close === -1) break;
          if (ctx.pos > open + 1 && ctx.pos <= close) {
            inMustache = true;
            break;
          }
          searchFrom = close + 2;
        }
        if (!inMustache) {
          const sqlWord = ctx.matchBefore(/[\w.]*/);
          if (!sqlWord) return null;
          if (sqlWord.from === sqlWord.to && !ctx.explicit) return null;
          const text = sqlWord.text;
          const suggestions = [];
          const sqlKeywords = [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "INNER JOIN",
            "ON",
            "GROUP BY",
            "ORDER BY",
            "ASC",
            "DESC",
            "AS",
            "DISTINCT",
            "LIMIT",
            "OFFSET",
            "INSERT INTO",
            "VALUES",
            "UPDATE",
            "SET",
            "DELETE",
            "CREATE TABLE",
            "ALTER TABLE",
            "DROP TABLE",
            "INDEX",
            "COUNT",
            "SUM",
            "AVG",
            "MAX",
            "MIN",
            "AND",
            "OR",
            "NOT",
            "NULL",
            "IS"
          ];
          sqlKeywords.forEach((kw) => suggestions.push({ label: kw, type: "keyword" }));
          const options2 = suggestions.filter((s) => {
            if (!text) return true;
            const matchQuery = text.includes(".") ? text.split(".").pop().toLowerCase() : text.toLowerCase();
            return s.label.toLowerCase().includes(matchQuery);
          });
          if (options2.length === 0 && !ctx.explicit) return null;
          return {
            from: text.includes(".") ? sqlWord.from + text.lastIndexOf(".") + 1 : sqlWord.from,
            options: options2,
            validFor: /^[\w]*$/
          };
        }
      }
      const word = ctx.matchBefore(/[\w.[\]"']*/);
      if (!word) return null;
      if (word.from === word.to && !ctx.explicit) return null;
      const filter = word.text;
      const query = filter.toLowerCase();
      let engineSuggestions = [];
      if (stateTree) {
        engineSuggestions = getCompletions({ filter, stateTree, mode: effectiveTemplateMode });
      } else if (language === "javascript") {
        const jsKeywords = [
          { label: "return", detail: "Return statement" },
          { label: "const", detail: "Constant declaration" },
          { label: "let", detail: "Variable declaration" },
          { label: "ctx", detail: "Workflow context object" },
          { label: "console.log", detail: "Log to console" },
          { label: "JSON.stringify", detail: "Convert to JSON string" },
          { label: "JSON.parse", detail: "Parse JSON string" },
          { label: "Array.isArray", detail: "Check if array" },
          { label: "Object.keys", detail: "Get object keys" },
          { label: "Object.values", detail: "Get object values" }
        ];
        engineSuggestions = jsKeywords.map((k) => ({ ...k, type: "keyword" }));
      }
      const options = engineSuggestions.filter((s) => {
        if (!query) return true;
        const value2 = (s.value || s.label || "").toLowerCase();
        const label = (s.label || "").toLowerCase();
        return value2.includes(query) || label.includes(query);
      }).map(toCmOption);
      if (options.length === 0 && !ctx.explicit) return null;
      return {
        from: word.from,
        options,
        validFor: /^[\w.[\]"']*$/
      };
    };
    return autocompletion({ override: [completionSource], activateOnTyping: true, maxRenderedOptions: 50 });
  }, [language, stateTree, effectiveTemplateMode]);
  React23.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isExpanded]);
  React23.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const baseExtensions = [
      history(),
      closeBrackets(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
        ...foldKeymap
      ]),
      languageCompartment.of(getLanguageExtension(language)),
      readOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
      autocompleteCompartment.of(autocompletionExtension),
      oneDark,
      ...extensions,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          internalChange.current = true;
          onChange?.(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize: "12px",
          height: "100%",
          backgroundColor: "transparent",
          color: "hsl(var(--foreground))"
        },
        ".cm-scroller": { overflow: "auto", maxHeight: "100%", scrollbarWidth: "thin" },
        ".cm-gutters": {
          backgroundColor: "transparent",
          borderRight: "1px solid hsl(var(--border))",
          color: "hsl(var(--muted-foreground))"
        },
        ".cm-content": {
          padding: "8px 0",
          caretColor: "hsl(var(--foreground))"
        },
        "&.cm-focused": { outline: "none" },
        ".cm-cursor": {
          borderLeftColor: "hsl(var(--foreground))"
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          background: "hsl(var(--primary) / 0.15) !important"
        },
        // Autocomplete dropdown — match design system
        ".cm-tooltip.cm-tooltip-autocomplete": {
          border: "1px solid hsl(var(--border))",
          borderRadius: "6px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          background: "hsl(var(--background))",
          fontSize: "11px",
          overflow: "hidden",
          maxHeight: "220px",
          zIndex: "9999"
        },
        ".cm-tooltip-autocomplete > ul": {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          maxHeight: "220px",
          scrollbarWidth: "thin"
        },
        ".cm-tooltip-autocomplete > ul > li": {
          padding: "4px 10px",
          lineHeight: "1.5",
          color: "hsl(var(--foreground))"
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          background: "hsl(var(--primary) / 0.12)",
          color: "hsl(var(--foreground))"
        },
        ".cm-completionLabel": {
          color: "hsl(var(--foreground))",
          fontSize: "11px"
        },
        ".cm-completionDetail": {
          color: "hsl(var(--muted-foreground))",
          fontSize: "10px",
          marginLeft: "8px"
        },
        ".cm-completionIcon": {
          marginRight: "4px",
          opacity: "0.7"
        }
      })
    ];
    if (showLineNumbers) {
      baseExtensions.push(lineNumbers());
    }
    baseExtensions.push(foldGutter());
    const state = EditorState.create({
      doc: value !== void 0 ? value : defaultValue || "",
      extensions: baseExtensions
    });
    const view = new EditorView({
      state,
      parent: containerRef.current
    });
    viewRef.current = view;
    if (typeof ref === "function") {
      ref({ editor: view, monaco: null });
    } else if (ref) {
      ref.current = { editor: view, monaco: null };
    }
    if (onMount) {
      onMount(view, null);
    }
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);
  React23.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    const current = view.state.doc.toString();
    const incoming = value || "";
    if (current !== incoming) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: incoming }
      });
    }
  }, [value]);
  React23.useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: [
          languageCompartment.reconfigure(getLanguageExtension(language)),
          readOnlyCompartment.reconfigure(EditorState.readOnly.of(isReadOnly))
        ]
      });
    }
  }, [language, isReadOnly]);
  React23.useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: autocompleteCompartment.reconfigure(autocompletionExtension)
      });
    }
  }, [autocompletionExtension]);
  return /* @__PURE__ */ React23.createElement(
    "div",
    {
      className: cn(
        "flex flex-col overflow-hidden rounded-md border text-sm shadow-sm transition-colors",
        status === "error" ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border hover:border-border/80",
        isExpanded ? "fixed inset-4 z-50 rounded-md shadow-2xl ring-1 ring-border/50 bg-background" : "relative bg-background",
        className
      ),
      ...props
    },
    showHeader && /* @__PURE__ */ React23.createElement("div", { className: "flex min-h-[36px] flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5" }, /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-3" }, (title || titleIcon) && /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-1.5 font-medium text-foreground" }, titleIcon ? titleIcon : /* @__PURE__ */ React23.createElement(Code, { className: "h-3.5 w-3.5 text-primary" }), title && /* @__PURE__ */ React23.createElement("span", { className: "text-xs" }, title)), status && /* @__PURE__ */ React23.createElement("span", { className: cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
      status === "valid" ? "bg-green-950/40 text-green-400 border border-green-800" : status === "error" ? "bg-red-950/40 text-red-400 border border-red-800" : ""
    ) }, status === "valid" ? /* @__PURE__ */ React23.createElement(CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ React23.createElement(AlertTriangle, { className: "h-3 w-3" }), status === "valid" ? "Valid" : "Invalid"), headerLeft), /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-1.5" }, headerExtra, showExpandButton && /* @__PURE__ */ React23.createElement(
      "button",
      {
        type: "button",
        onClick: () => setIsExpanded(!isExpanded),
        className: "inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        title: isExpanded ? "Exit fullscreen (Esc)" : "Fullscreen"
      },
      isExpanded ? /* @__PURE__ */ React23.createElement(Minimize2, { className: "h-3 w-3" }) : /* @__PURE__ */ React23.createElement(Maximize2, { className: "h-3 w-3" })
    ))),
    /* @__PURE__ */ React23.createElement("div", { className: "relative flex-1", style: { height: isExpanded ? "calc(100vh - 80px)" : typeof height === "number" ? `${height}px` : height } }, /* @__PURE__ */ React23.createElement("div", { ref: containerRef, className: "h-full w-full" }), footerHint && /* @__PURE__ */ React23.createElement("div", { className: "absolute bottom-2 right-4 z-10 pointer-events-none rounded border border-border bg-background/95 px-2 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm" }, footerHint)),
    status === "error" && statusMessage && /* @__PURE__ */ React23.createElement("div", { className: "flex items-start gap-2 border-t border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive" }, /* @__PURE__ */ React23.createElement(AlertTriangle, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ React23.createElement("span", { className: "font-medium whitespace-pre-wrap leading-relaxed" }, statusMessage))
  );
});
CodeEditor.displayName = "CodeEditor";

// src/components/array-input.jsx
import React24 from "react";
import PropTypes2 from "prop-types";
import { Trash2, Plus } from "lucide-react";
function ArrayInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Value",
  itemType = "string",
  maxItems,
  minItems
}) {
  const currentArray = Array.isArray(value) ? value : [];
  const handleItemChange = (index, newValue) => {
    const newArray = [...currentArray];
    newArray[index] = newValue;
    onChange(newArray);
  };
  const handleRemoveItem = (index) => {
    const newArray = currentArray.filter((_, i) => i !== index);
    onChange(newArray);
  };
  const handleAddItem = () => {
    if (maxItems !== void 0 && currentArray.length >= maxItems) return;
    const defaultValue = itemType === "number" ? 0 : itemType === "object" ? "{}" : "";
    onChange([...currentArray, defaultValue]);
  };
  const canAdd = maxItems === void 0 || currentArray.length < maxItems;
  const canRemove = minItems === void 0 || currentArray.length > minItems;
  const renderItem = (item, index) => {
    if (itemType === "object") {
      const displayValue = typeof item === "object" && item !== null ? JSON.stringify(item, null, 2) : typeof item === "string" ? item : JSON.stringify(item);
      return /* @__PURE__ */ React24.createElement("div", { key: index, className: "flex gap-2 w-full" }, /* @__PURE__ */ React24.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React24.createElement(
        CodeEditor,
        {
          language: "json",
          height: 80,
          showHeader: false,
          showExpandButton: false,
          showFormatButton: false,
          showLineNumbers: false,
          value: displayValue,
          onChange: (val) => handleItemChange(index, val),
          disabled
        }
      )), /* @__PURE__ */ React24.createElement(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "text-[#1c1c1e] hover:text-red-500 flex-shrink-0 mt-1",
          onClick: () => handleRemoveItem(index),
          disabled: disabled || !canRemove
        },
        /* @__PURE__ */ React24.createElement(Trash2, { className: "h-4 w-4" })
      ));
    }
    return /* @__PURE__ */ React24.createElement("div", { key: index, className: "flex items-center gap-2 w-full" }, /* @__PURE__ */ React24.createElement(
      Input,
      {
        className: "flex-1 text-xs",
        type: itemType === "number" ? "number" : "text",
        placeholder,
        value: typeof item === "string" || typeof item === "number" ? item : JSON.stringify(item),
        onChange: (e) => {
          const val = itemType === "number" ? e.target.value === "" ? "" : Number(e.target.value) : e.target.value;
          handleItemChange(index, val);
        },
        disabled
      }
    ), /* @__PURE__ */ React24.createElement(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        className: "text-[#1c1c1e] hover:text-red-500 flex-shrink-0",
        onClick: () => handleRemoveItem(index),
        disabled: disabled || !canRemove
      },
      /* @__PURE__ */ React24.createElement(Trash2, { className: "h-4 w-4" })
    ));
  };
  return /* @__PURE__ */ React24.createElement("div", { className: "space-y-2 w-full" }, currentArray.length > 0 ? /* @__PURE__ */ React24.createElement("div", { className: "space-y-2" }, currentArray.map(renderItem)) : /* @__PURE__ */ React24.createElement("p", { className: "text-xs text-[#1c1c1e] italic" }, "No items added to array."), /* @__PURE__ */ React24.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React24.createElement(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "default",
      className: "flex-1 text-xs",
      onClick: handleAddItem,
      disabled: disabled || !canAdd
    },
    /* @__PURE__ */ React24.createElement(Plus, { className: "mr-2 h-3.5 w-3.5" }),
    "Add Item"
  ), /* @__PURE__ */ React24.createElement(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0.5 h-5" }, currentArray.length, maxItems !== void 0 ? ` / ${maxItems}` : "")));
}
ArrayInput.propTypes = {
  value: PropTypes2.array,
  onChange: PropTypes2.func.isRequired,
  disabled: PropTypes2.bool,
  placeholder: PropTypes2.string,
  itemType: PropTypes2.oneOf(["string", "number", "object"]),
  maxItems: PropTypes2.number,
  minItems: PropTypes2.number
};

// src/components/input-values-form.jsx
import React26 from "react";
import PropTypes3 from "prop-types";

// src/components/template-autocomplete-input.jsx
import React25, { useEffect as useEffect2, useRef as useRef2, useMemo as useMemo3, useCallback } from "react";
import { EditorView as EditorView2, keymap as keymap2, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState as EditorState2, Compartment as Compartment2 } from "@codemirror/state";
import { defaultKeymap as defaultKeymap2, history as history2, historyKeymap as historyKeymap2 } from "@codemirror/commands";
import {
  autocompletion as autocompletion2,
  completionKeymap,
  closeBrackets as closeBrackets2,
  closeBracketsKeymap as closeBracketsKeymap2
} from "@codemirror/autocomplete";

// src/components/template-autocomplete/useMustacheCompletions.js
import { useMemo as useMemo2 } from "react";
import { getCompletions as getCompletions2, MODES as MODES2 } from "@jet-admin/expression-engine";
function engineTypeToCmType2(type) {
  switch (type) {
    case "object":
    case "array":
      return "namespace";
    case "method":
      return "method";
    case "function":
      return "function";
    case "property":
      return "property";
    case "snippet":
      return "text";
    default:
      return "variable";
  }
}
function toCmOption2(s) {
  return {
    label: s.label,
    apply: s.value ?? s.label,
    detail: s.detail,
    type: engineTypeToCmType2(s.type),
    // Live-state paths rank highest, then member methods, then built-ins.
    boost: s.category === "live-state" ? 2 : typeof s.category === "string" && s.category.endsWith("member") ? 1 : 0,
    info: s.detail ? `Value: ${s.detail}` : void 0
  };
}
function getCursorZone(state, pos) {
  const doc = state.doc.toString();
  let searchFrom = 0;
  while (searchFrom < doc.length) {
    const open = doc.indexOf("{{", searchFrom);
    if (open === -1) break;
    const close = doc.indexOf("}}", open + 2);
    if (close === -1) break;
    if (pos > open + 1 && pos <= close) {
      return {
        inZone: true,
        zoneStart: open + 2,
        zoneEnd: close,
        typed: doc.slice(open + 2, pos).trim()
      };
    }
    searchFrom = close + 2;
  }
  return { inZone: false };
}
function useMustacheCompletions(jsonContext, mode = MODES2.JS_TEMPLATE) {
  return useMemo2(() => {
    const stateTree = jsonContext && typeof jsonContext === "object" ? jsonContext : null;
    return (ctx) => {
      const zone = getCursorZone(ctx.state, ctx.pos);
      if (!zone.inZone) return null;
      const word = ctx.matchBefore(/[\w.[\]"']*/);
      if (!word) return null;
      if (word.from === word.to && !ctx.explicit) return null;
      const filter = word.text;
      const query = filter.toLowerCase();
      const suggestions = getCompletions2({ filter, stateTree, mode });
      const options = suggestions.filter((s) => {
        if (!query) return true;
        const value = (s.value || s.label || "").toLowerCase();
        const label = (s.label || "").toLowerCase();
        return value.includes(query) || label.includes(query);
      }).slice(0, 80).map(toCmOption2);
      if (options.length === 0 && !ctx.explicit) return null;
      return {
        from: word.from,
        options,
        validFor: /^[\w.[\]"']*$/
      };
    };
  }, [stateTreeKey(jsonContext), mode]);
}
function stateTreeKey(jsonContext) {
  return jsonContext && typeof jsonContext === "object" ? jsonContext : null;
}

// src/components/template-autocomplete/mustacheHighlighter.js
import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
var delimMark = Decoration.mark({ class: "cm-mustache-delim" });
var zoneMark = Decoration.mark({ class: "cm-mustache-zone" });
function buildDecorations(view) {
  const builder = new RangeSetBuilder();
  const doc = view.state.doc;
  const text = doc.toString();
  let searchFrom = 0;
  while (searchFrom < text.length) {
    const open = text.indexOf("{{", searchFrom);
    if (open === -1) break;
    const close = text.indexOf("}}", open + 2);
    if (close === -1) break;
    builder.add(open, open + 2, delimMark);
    if (close > open + 2) {
      builder.add(open + 2, close, zoneMark);
    }
    builder.add(close, close + 2, delimMark);
    searchFrom = close + 2;
  }
  return builder.finish();
}
var mustacheHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildDecorations(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

// src/components/template-autocomplete-input.jsx
function extractTokens(value) {
  const matches = [...(value || "").matchAll(/\{\{([^}]+)\}\}/g)];
  const seen = /* @__PURE__ */ new Set();
  return matches.reduce((acc, m) => {
    const key = m[1].trim();
    if (!seen.has(key)) {
      seen.add(key);
      acc.push(key);
    }
    return acc;
  }, []);
}
var TemplateAutocompleteInput = ({
  value,
  onChange,
  placeholder,
  context,
  jsonContext,
  liveStateTree,
  mode,
  isTextArea = false,
  isParagraph = false,
  rows = 4,
  readOnly = false,
  size = "sm",
  className = ""
}) => {
  const multiline = isTextArea || isParagraph;
  const containerRef = useRef2(null);
  const viewRef = useRef2(null);
  const internalChange = useRef2(false);
  const readOnlyCompartment2 = useRef2(new Compartment2()).current;
  const autocompleteCompartment2 = useRef2(new Compartment2()).current;
  const effectiveContext = useMemo3(() => {
    if (jsonContext && typeof jsonContext === "object") return jsonContext;
    if (context && typeof context === "object") return context;
    if (liveStateTree && typeof liveStateTree === "object") return liveStateTree;
    return {};
  }, [jsonContext, context, liveStateTree]);
  const mustacheSource = useMustacheCompletions(effectiveContext, mode);
  const mustacheSourceRef = useRef2(mustacheSource);
  mustacheSourceRef.current = mustacheSource;
  const stableCompletionSource = useCallback((ctx) => {
    return mustacheSourceRef.current(ctx);
  }, []);
  const boundTokens = useMemo3(() => extractTokens(value), [value]);
  let singleLineHeight = "26px";
  let fontSize = "12px";
  let px = "8px";
  if (size === "default") {
    singleLineHeight = "30px";
    fontSize = "14px";
    px = "10px";
  } else if (size === "lg") {
    singleLineHeight = "38px";
    fontSize = "16px";
    px = "12px";
  }
  const lineHeightPx = 20;
  const paddingPx = multiline ? 12 : 0;
  const minContentH = multiline ? `${Math.max(rows * lineHeightPx + paddingPx * 2, 80)}px` : singleLineHeight;
  const maxContentH = multiline ? "400px" : singleLineHeight;
  const baseExtensions = useMemo3(() => {
    const exts = [
      history2(),
      mustacheHighlighter,
      autocompleteCompartment2.of(
        autocompletion2({
          override: [stableCompletionSource],
          defaultKeymap: true,
          closeOnBlur: true,
          activateOnTyping: true,
          maxRenderedOptions: 50
        })
      ),
      closeBrackets2(),
      keymap2.of([
        ...defaultKeymap2,
        ...historyKeymap2,
        ...completionKeymap,
        ...closeBracketsKeymap2
      ]),
      // Update listener → propagate changes upward
      EditorView2.updateListener.of((update) => {
        if (update.docChanged) {
          internalChange.current = true;
          onChange?.(update.state.doc.toString());
        }
      }),
      // Theme — compact, blends with the @jet-admin/ui design system
      EditorView2.theme({
        "&": {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize,
          lineHeight: "1.6",
          outline: "none",
          background: "transparent",
          color: "hsl(var(--foreground))"
        },
        ".cm-content": {
          padding: multiline ? `8px ${px}` : `0 ${px}`,
          minHeight: minContentH,
          maxHeight: maxContentH,
          caretColor: "hsl(var(--foreground))",
          // Single-line: vertically center text
          ...multiline ? {} : {
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap"
          }
        },
        ".cm-line": {
          padding: "0",
          ...multiline ? {} : {
            // Force single-line: don't allow wrapping
          }
        },
        ".cm-scroller": {
          overflow: multiline ? "auto" : "hidden",
          maxHeight: maxContentH,
          scrollbarWidth: "thin"
        },
        ".cm-focused": { outline: "none" },
        ".cm-cursor": {
          borderLeftColor: "hsl(var(--foreground))"
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          background: "hsl(var(--primary) / 0.15)"
        },
        // {{ }} delimiter styling
        ".cm-mustache-delim": {
          color: "hsl(var(--primary))",
          fontWeight: "600",
          opacity: "0.9"
        },
        // Zone interior background tint
        ".cm-mustache-zone": {
          background: "hsl(var(--primary) / 0.06)",
          borderRadius: "2px"
        },
        // Autocomplete dropdown — match design system
        ".cm-tooltip.cm-tooltip-autocomplete": {
          border: "1px solid hsl(var(--border))",
          borderRadius: "6px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          background: "hsl(var(--background))",
          fontSize: "11px",
          overflow: "hidden",
          maxHeight: "220px",
          zIndex: "9999"
        },
        ".cm-tooltip-autocomplete > ul": {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          maxHeight: "220px",
          scrollbarWidth: "thin"
        },
        ".cm-tooltip-autocomplete > ul > li": {
          padding: "4px 10px",
          lineHeight: "1.5",
          color: "hsl(var(--foreground))"
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          background: "hsl(var(--primary) / 0.12)",
          color: "hsl(var(--foreground))"
        },
        ".cm-completionLabel": {
          color: "hsl(var(--foreground))",
          fontSize: "11px"
        },
        ".cm-completionDetail": {
          color: "hsl(var(--muted-foreground))",
          fontSize: "10px",
          marginLeft: "8px"
        },
        ".cm-completionIcon": {
          marginRight: "4px",
          opacity: "0.7"
        },
        // Placeholder
        ".cm-placeholder": {
          color: "hsl(var(--muted-foreground))",
          fontStyle: "normal",
          fontSize
        }
      })
    ];
    if (multiline) {
      exts.push(EditorView2.lineWrapping);
    }
    if (!multiline) {
      exts.push(
        keymap2.of([{
          key: "Enter",
          run: () => true
          // consume Enter — don't insert newline
        }])
      );
      exts.push(
        EditorState2.transactionFilter.of((tr) => {
          if (!tr.docChanged) return tr;
          let hasNewline = false;
          tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
            if (inserted.toString().includes("\n")) hasNewline = true;
          });
          return hasNewline ? [] : tr;
        })
      );
    }
    return exts;
  }, [multiline, minContentH, maxContentH, fontSize, px]);
  useEffect2(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const state = EditorState2.create({
      doc: value || "",
      extensions: [
        ...baseExtensions,
        cmPlaceholder(placeholder || ""),
        readOnlyCompartment2.of(EditorState2.readOnly.of(readOnly))
      ]
    });
    const view = new EditorView2({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [baseExtensions]);
  useEffect2(() => {
    const view = viewRef.current;
    if (!view) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    const current = view.state.doc.toString();
    const incoming = value || "";
    if (current !== incoming) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: incoming }
      });
    }
  }, [value]);
  useEffect2(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment2.reconfigure(EditorState2.readOnly.of(readOnly))
    });
  }, [readOnly]);
  return /* @__PURE__ */ React25.createElement("div", { className: `relative w-full ${className}` }, /* @__PURE__ */ React25.createElement(
    "div",
    {
      className: `bg-input-custom border border-input-custom rounded-sm transition-shadow duration-150 [&:has(.cm-focused)]:border-border/80 [&:has(.cm-focused)]:ring-2 [&:has(.cm-focused)]:ring-primary/30`
    },
    /* @__PURE__ */ React25.createElement(
      "div",
      {
        ref: containerRef,
        className: "tpl-cm-container",
        style: { cursor: "text" }
      }
    ),
    multiline && boundTokens.length > 0 && /* @__PURE__ */ React25.createElement("div", { className: "flex items-center flex-wrap gap-1 px-2 py-1.5 border-t border-border bg-muted/50 rounded-b-[2px]" }, /* @__PURE__ */ React25.createElement("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-0.5 shrink-0" }, "bound"), boundTokens.map((tok, i) => /* @__PURE__ */ React25.createElement("span", { key: i, className: "inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[3px] bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary cursor-default max-w-full", title: tok }, /* @__PURE__ */ React25.createElement("span", { className: "truncate min-w-0" }, tok))))
  ));
};

// src/components/input-values-form.jsx
function InputValuesForm({
  inputDefinitions = [],
  values = {},
  onChange,
  errors = {},
  disabled = false,
  className,
  stateTree = null,
  templateMode
}) {
  if (!Array.isArray(inputDefinitions) || inputDefinitions.length === 0) {
    return /* @__PURE__ */ React26.createElement("p", { className: "text-xs text-[#1c1c1e] italic" }, "No input parameters defined.");
  }
  const renderField = (inputDef) => {
    const inputName = inputDef.key;
    const inputType = inputDef.type || "string";
    const value = values[inputName];
    if (stateTree) {
      return /* @__PURE__ */ React26.createElement(React26.Fragment, null, /* @__PURE__ */ React26.createElement(Label2, { htmlFor: `input-def-${inputName}`, className: "text-xs" }, inputName, " ", inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500" }, "*"), " ", inputType !== "string" && /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground" }, "(", inputType, ")")), /* @__PURE__ */ React26.createElement(
        TemplateAutocompleteInput,
        {
          value: typeof value === "string" ? value : value == null ? "" : String(value),
          onChange: (val) => onChange(inputName, val),
          placeholder: `{{event.${inputName}}}`,
          context: stateTree,
          mode: templateMode,
          readOnly: disabled
        }
      ));
    }
    switch (inputType) {
      case "boolean":
        return /* @__PURE__ */ React26.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React26.createElement(
          Checkbox,
          {
            id: `input-def-${inputName}`,
            checked: !!value,
            onCheckedChange: (checked) => onChange(inputName, checked),
            disabled
          }
        ), /* @__PURE__ */ React26.createElement(
          Label2,
          {
            htmlFor: `input-def-${inputName}`,
            className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          },
          inputName,
          inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500 ml-1" }, "*"),
          /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground ml-1" }, "(", inputType, ")")
        ));
      case "array":
        return /* @__PURE__ */ React26.createElement(React26.Fragment, null, /* @__PURE__ */ React26.createElement(Label2, { htmlFor: `input-def-${inputName}`, className: "text-xs" }, inputName, " ", inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground" }, "(", inputType, ")")), /* @__PURE__ */ React26.createElement(
          ArrayInput,
          {
            value: Array.isArray(value) ? value : [],
            onChange: (val) => onChange(inputName, val),
            placeholder: `Add ${inputName} item...`,
            disabled
          }
        ));
      case "object":
        return /* @__PURE__ */ React26.createElement(React26.Fragment, null, /* @__PURE__ */ React26.createElement(Label2, { htmlFor: `input-def-${inputName}`, className: "text-xs" }, inputName, " ", inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground" }, "(", inputType, ")")), /* @__PURE__ */ React26.createElement(
          CodeEditor,
          {
            language: "json",
            height: 120,
            title: "JSON Input",
            value: typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : value || "",
            onChange: (val) => onChange(inputName, val),
            disabled
          }
        ));
      case "number":
        return /* @__PURE__ */ React26.createElement(React26.Fragment, null, /* @__PURE__ */ React26.createElement(Label2, { htmlFor: `input-def-${inputName}`, className: "text-xs" }, inputName, " ", inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground" }, "(", inputType, ")")), /* @__PURE__ */ React26.createElement(
          Input,
          {
            type: "number",
            id: `input-def-${inputName}`,
            className: "w-full text-xs",
            placeholder: `Value for ${inputName}`,
            value: value ?? "",
            onChange: (e) => onChange(
              inputName,
              e.target.value === "" ? "" : Number(e.target.value)
            ),
            disabled
          }
        ));
      // string & default
      default:
        return /* @__PURE__ */ React26.createElement(React26.Fragment, null, /* @__PURE__ */ React26.createElement(Label2, { htmlFor: `input-def-${inputName}`, className: "text-xs" }, inputName, " ", inputDef.required && /* @__PURE__ */ React26.createElement("span", { className: "text-red-500" }, "*"), " ", inputType !== "string" && /* @__PURE__ */ React26.createElement("span", { className: "text-muted-foreground" }, "(", inputType, ")")), /* @__PURE__ */ React26.createElement(
          Input,
          {
            type: "text",
            id: `input-def-${inputName}`,
            className: "w-full text-xs",
            placeholder: `Value for ${inputName}`,
            value: value || "",
            onChange: (e) => onChange(inputName, e.target.value),
            disabled
          }
        ));
    }
  };
  return /* @__PURE__ */ React26.createElement("div", { className: className || "space-y-3" }, inputDefinitions.map((inputDef) => /* @__PURE__ */ React26.createElement("div", { key: inputDef.key, className: "space-y-1" }, renderField(inputDef), errors[inputDef.key] && /* @__PURE__ */ React26.createElement("span", { className: "text-destructive text-xs" }, errors[inputDef.key]))));
}
InputValuesForm.propTypes = {
  inputDefinitions: PropTypes3.arrayOf(
    PropTypes3.shape({
      key: PropTypes3.string.isRequired,
      type: PropTypes3.string,
      required: PropTypes3.bool
    })
  ).isRequired,
  values: PropTypes3.object,
  onChange: PropTypes3.func.isRequired,
  errors: PropTypes3.object,
  disabled: PropTypes3.bool,
  className: PropTypes3.string,
  stateTree: PropTypes3.object,
  templateMode: PropTypes3.string
};

// src/components/pageHeader.jsx
import React27 from "react";
import PropTypes4 from "prop-types";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
var PageHeader = ({
  title,
  id,
  onSave,
  onDelete,
  onClone,
  onHistory,
  isSaving = false,
  isDeleting = false,
  isCloning = false,
  hasHistory = false,
  saveText = "Update",
  parentTitle,
  children
}) => {
  return /* @__PURE__ */ React27.createElement("div", { className: "flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background p-3 px-4" }, /* @__PURE__ */ React27.createElement("div", { className: "flex items-center gap-4" }, parentTitle && /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(
    "h1",
    {
      className: "text-base font-semibold tracking-tight text-foreground leading-none"
    },
    parentTitle
  ), /* @__PURE__ */ React27.createElement(
    "span",
    {
      className: "text-base font-semibold tracking-tight text-foreground leading-none"
    },
    "/"
  )), /* @__PURE__ */ React27.createElement("div", null, /* @__PURE__ */ React27.createElement("h1", { className: "text-base font-semibold tracking-tight text-foreground leading-none" }, title), id && /* @__PURE__ */ React27.createElement("p", { className: "mt-1.5 font-mono text-xs text-muted-foreground" }, "ID: ", id))), /* @__PURE__ */ React27.createElement("div", { className: "flex items-center gap-2" }, children, hasHistory && onHistory && /* @__PURE__ */ React27.createElement(Button, { variant: "outline", size: "sm", onClick: onHistory }, "View History"), onClone && /* @__PURE__ */ React27.createElement(Button, { variant: "outline", size: "sm", onClick: onClone, disabled: isCloning }, isCloning && /* @__PURE__ */ React27.createElement(Spinner, { size: 14, className: "mr-2" }), "Clone"), onDelete && /* @__PURE__ */ React27.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: onDelete,
      disabled: isDeleting,
      className: "text-destructive hover:bg-destructive/10 border-destructive/20"
    },
    isDeleting && /* @__PURE__ */ React27.createElement(Spinner, { size: 14, className: "mr-2" }),
    "Delete"
  ), onSave && /* @__PURE__ */ React27.createElement(Button, { size: "sm", onClick: onSave, disabled: isSaving }, isSaving && /* @__PURE__ */ React27.createElement(Spinner, { size: 14, className: "mr-2" }), saveText)));
};
PageHeader.propTypes = {
  title: PropTypes4.string.isRequired,
  id: PropTypes4.string,
  onSave: PropTypes4.func,
  onDelete: PropTypes4.func,
  onClone: PropTypes4.func,
  onHistory: PropTypes4.func,
  isSaving: PropTypes4.bool,
  isDeleting: PropTypes4.bool,
  isCloning: PropTypes4.bool,
  hasHistory: PropTypes4.bool,
  saveText: PropTypes4.string,
  children: PropTypes4.node
};

// src/components/section.jsx
import * as React28 from "react";
import { ChevronRight as ChevronRight2 } from "lucide-react";
var Section = React28.forwardRef(
  ({ className, title, description, children, collapsible = false, defaultOpen = true, ...props }, ref) => {
    const [isOpen, setIsOpen] = React28.useState(defaultOpen);
    return /* @__PURE__ */ React28.createElement(
      "div",
      {
        ref,
        className: cn(
          "rounded-md border border-border bg-card",
          className
        ),
        ...props
      },
      (title || description) && /* @__PURE__ */ React28.createElement(
        "div",
        {
          className: cn(
            "border-b border-border bg-muted/15 p-2",
            collapsible && "cursor-pointer select-none hover:bg-muted/25 transition-colors",
            !isOpen && "border-b-0"
          ),
          onClick: collapsible ? () => setIsOpen((prev) => !prev) : void 0
        },
        /* @__PURE__ */ React28.createElement("div", { className: "flex items-center gap-1.5" }, collapsible && /* @__PURE__ */ React28.createElement(
          ChevronRight2,
          {
            className: cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-90"
            )
          }
        ), /* @__PURE__ */ React28.createElement("div", { className: "flex-1 min-w-0" }, title && /* @__PURE__ */ React28.createElement("h3", { className: "text-xs font-semibold text-foreground" }, title), description && /* @__PURE__ */ React28.createElement("p", { className: "text-[11px] text-muted-foreground mt-0.5" }, description)))
      ),
      (!collapsible || isOpen) && /* @__PURE__ */ React28.createElement("div", { className: "p-2 space-y-2" }, children)
    );
  }
);
Section.displayName = "Section";

// src/components/error-boundary.jsx
import React29 from "react";
import { AlertTriangle as AlertTriangle2 } from "lucide-react";
import PropTypes5 from "prop-types";
var ErrorBoundary = class extends React29.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return /* @__PURE__ */ React29.createElement("div", { className: "flex h-full w-full items-center justify-center p-4" }, /* @__PURE__ */ React29.createElement("div", { className: "bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2 text-center" }, /* @__PURE__ */ React29.createElement("div", { className: "flex justify-center" }, /* @__PURE__ */ React29.createElement(AlertTriangle2, { className: "h-4 w-4 text-foreground/80" })), /* @__PURE__ */ React29.createElement("div", { className: "font-medium text-xs text-foreground" }, this.props.title || "Component Error"), /* @__PURE__ */ React29.createElement("div", { className: "max-w-xs break-words" }, this.state.error?.message || "Something went wrong while rendering this component.")));
    }
    return this.props.children;
  }
};
ErrorBoundary.propTypes = {
  children: PropTypes5.node.isRequired,
  fallback: PropTypes5.func,
  title: PropTypes5.string
};

// src/components/google-oauth-button.jsx
import React30 from "react";
import PropTypes6 from "prop-types";
import { CheckCircle2 as CheckCircle22, AlertCircle } from "lucide-react";
var GoogleIcon = () => /* @__PURE__ */ React30.createElement(
  "svg",
  {
    className: "mr-2 h-4 w-4",
    "aria-hidden": "true",
    focusable: "false",
    "data-prefix": "fab",
    "data-icon": "google",
    role: "img",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 488 512"
  },
  /* @__PURE__ */ React30.createElement(
    "path",
    {
      fill: "currentColor",
      d: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    }
  )
);
var GoogleOAuthButton = ({
  isConnected,
  credentialId,
  onClick,
  loading,
  disabled,
  label,
  description,
  hasErrors,
  errors
}) => {
  return /* @__PURE__ */ React30.createElement("div", { className: "space-y-1.5 w-full" }, /* @__PURE__ */ React30.createElement(
    Label2,
    {
      className: `block text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description || "Google Authentication"
  ), /* @__PURE__ */ React30.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-md bg-card text-card-foreground shadow-sm" }, isConnected ? /* @__PURE__ */ React30.createElement(React30.Fragment, null, /* @__PURE__ */ React30.createElement("div", { className: "flex items-center gap-2 flex-1" }, /* @__PURE__ */ React30.createElement(CheckCircle22, { className: "w-5 h-5 text-emerald-500 flex-shrink-0" }), /* @__PURE__ */ React30.createElement("div", null, /* @__PURE__ */ React30.createElement("p", { className: "text-sm font-semibold text-foreground" }, "Google Account Connected"), /* @__PURE__ */ React30.createElement("p", { className: "text-xs text-muted-foreground font-mono truncate max-w-xs sm:max-w-md" }, "Credential ID: ", credentialId))), /* @__PURE__ */ React30.createElement(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      disabled: disabled || loading,
      onClick
    },
    loading ? "Connecting..." : "Reconnect Account"
  )) : /* @__PURE__ */ React30.createElement(React30.Fragment, null, /* @__PURE__ */ React30.createElement("div", { className: "flex items-center gap-2 flex-1" }, /* @__PURE__ */ React30.createElement(AlertCircle, { className: "w-5 h-5 text-yellow-500 flex-shrink-0" }), /* @__PURE__ */ React30.createElement("div", null, /* @__PURE__ */ React30.createElement("p", { className: "text-sm font-semibold text-foreground" }, "Account authentication required"), /* @__PURE__ */ React30.createElement("p", { className: "text-xs text-muted-foreground" }, "Connect your Google Account to enable database query execution."))), /* @__PURE__ */ React30.createElement(
    Button,
    {
      type: "button",
      variant: "primary",
      size: "sm",
      disabled: disabled || loading,
      onClick,
      className: "bg-blue-600 hover:bg-blue-700 text-white flex items-center"
    },
    /* @__PURE__ */ React30.createElement(GoogleIcon, null),
    loading ? "Connecting..." : "Connect Google Account"
  ))), hasErrors && errors && /* @__PURE__ */ React30.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
};
GoogleOAuthButton.propTypes = {
  isConnected: PropTypes6.bool.isRequired,
  credentialId: PropTypes6.string,
  onClick: PropTypes6.func.isRequired,
  loading: PropTypes6.bool,
  disabled: PropTypes6.bool,
  label: PropTypes6.string,
  description: PropTypes6.string,
  hasErrors: PropTypes6.bool,
  errors: PropTypes6.oneOfType([PropTypes6.string, PropTypes6.array])
};

// src/components/callout.jsx
import * as React31 from "react";
import { Info } from "lucide-react";
var Callout = React31.forwardRef(({ className, children, icon: Icon2 = Info, ...props }, ref) => {
  return /* @__PURE__ */ React31.createElement(
    "div",
    {
      ref,
      className: cn(
        "rounded-sm border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary flex gap-2",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React31.createElement(Icon2, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
    /* @__PURE__ */ React31.createElement("span", { className: "flex-1" }, children)
  );
});
Callout.displayName = "Callout";

// src/components/empty-state.jsx
import * as React32 from "react";
var EmptyState = React32.forwardRef(({ className, icon: Icon2, message, action, ...props }, ref) => {
  return /* @__PURE__ */ React32.createElement(
    "div",
    {
      ref,
      className: cn(
        "rounded-sm border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2",
        className
      ),
      ...props
    },
    Icon2 && /* @__PURE__ */ React32.createElement(Icon2, { className: "h-8 w-8 text-muted-foreground/40" }),
    /* @__PURE__ */ React32.createElement("p", { className: "text-sm text-muted-foreground text-center" }, message),
    action
  );
});
EmptyState.displayName = "EmptyState";

// src/components/logic-chip.jsx
import * as React33 from "react";
var LogicChip = React33.forwardRef(({ className, value, onChange, ...props }, ref) => {
  return /* @__PURE__ */ React33.createElement(
    "button",
    {
      ref,
      type: "button",
      onClick: () => onChange(value === "AND" ? "OR" : "AND"),
      className: cn(
        "text-[9px] font-bold px-2 py-0.5 rounded border transition-colors",
        value === "AND" ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-50 text-amber-600 border-amber-200",
        className
      ),
      ...props
    },
    value
  );
});
LogicChip.displayName = "LogicChip";

// src/components/search-select.jsx
import * as React34 from "react";
import { Check as Check4, ChevronDown as ChevronDown3, Search, Loader2 as Loader22 } from "lucide-react";
import * as SelectPrimitive2 from "@radix-ui/react-select";
import { cva as cva5 } from "class-variance-authority";
var searchSelectVariants = cva5(
  "flex w-full items-center justify-between rounded-sm border border-input-custom bg-input-custom text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-border/80 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5 py-1.5 text-sm",
        sm: "h-7 px-2 py-1 text-xs",
        lg: "h-10 px-3 py-2 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);
var SearchSelect = React34.forwardRef(
  ({
    value,
    onChange,
    options = [],
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    onSearchChange,
    onLoadMore,
    hasNextPage = false,
    isFetchingNextPage = false,
    isLoading = false,
    className,
    size = "default",
    disabled = false,
    selectedLabel
  }, ref) => {
    const [open, setOpen] = React34.useState(false);
    const [localQuery, setLocalQuery] = React34.useState("");
    const searchInputRef = React34.useRef(null);
    React34.useEffect(() => {
      if (!open) {
        setLocalQuery("");
        if (onSearchChange) {
          onSearchChange("");
        }
      } else {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }, [open, onSearchChange]);
    const handleSearchChange = (e) => {
      const val = e.target.value;
      setLocalQuery(val);
      if (onSearchChange) {
        onSearchChange(val);
      }
    };
    const handleScroll = (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 20) {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
          onLoadMore();
        }
      }
    };
    const filteredOptions = React34.useMemo(() => {
      if (onSearchChange) {
        return options;
      }
      if (!localQuery) {
        return options;
      }
      return options.filter(
        (option) => option.label.toLowerCase().includes(localQuery.toLowerCase())
      );
    }, [options, localQuery, onSearchChange]);
    const selectedOption = React34.useMemo(() => {
      return options.find((opt) => opt.value === value);
    }, [options, value]);
    return /* @__PURE__ */ React34.createElement(
      SelectPrimitive2.Root,
      {
        open,
        onOpenChange: setOpen,
        value: value === "" ? "___EMPTY___" : value || void 0,
        onValueChange: (val) => {
          onChange(val === "___EMPTY___" ? "" : val);
        },
        disabled
      },
      /* @__PURE__ */ React34.createElement(SelectPrimitive2.Trigger, { asChild: true }, /* @__PURE__ */ React34.createElement(
        "button",
        {
          ref,
          type: "button",
          disabled,
          className: cn(searchSelectVariants({ size }), className)
        },
        /* @__PURE__ */ React34.createElement("span", { className: "truncate" }, selectedOption ? selectedOption.label : selectedLabel || placeholder),
        /* @__PURE__ */ React34.createElement(ChevronDown3, { className: "h-4 w-4 opacity-50 shrink-0 ml-2" })
      )),
      /* @__PURE__ */ React34.createElement(SelectPrimitive2.Portal, null, /* @__PURE__ */ React34.createElement(
        SelectPrimitive2.Content,
        {
          position: "popper",
          onOpenAutoFocus: (e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          },
          className: "relative z-[1200] max-h-96 min-w-[200px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
        },
        /* @__PURE__ */ React34.createElement(
          "div",
          {
            className: "border-b border-border/50 p-2",
            onKeyDown: (e) => e.stopPropagation(),
            onPointerDown: (e) => e.stopPropagation()
          },
          /* @__PURE__ */ React34.createElement("div", { className: "relative" }, /* @__PURE__ */ React34.createElement(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" }), /* @__PURE__ */ React34.createElement(
            Input,
            {
              ref: searchInputRef,
              type: "text",
              placeholder: searchPlaceholder,
              className: "pl-8 w-full bg-background border-border/50 focus:border-primary/30",
              value: localQuery,
              onChange: handleSearchChange
            }
          ))
        ),
        /* @__PURE__ */ React34.createElement(
          SelectPrimitive2.Viewport,
          {
            onScroll: handleScroll,
            className: "max-h-[220px] overflow-y-auto p-1 space-y-0.5"
          },
          isLoading ? /* @__PURE__ */ React34.createElement("div", { className: "flex items-center justify-center p-4 text-xs text-muted-foreground" }, /* @__PURE__ */ React34.createElement(Loader22, { className: "h-4 w-4 animate-spin mr-2" }), "Loading...") : filteredOptions.length === 0 ? /* @__PURE__ */ React34.createElement("div", { className: "p-4 text-center text-xs text-muted-foreground" }, "No options found") : /* @__PURE__ */ React34.createElement(React34.Fragment, null, filteredOptions.map((option) => {
            const isSelected = option.value === value;
            const itemValue = option.value === "" ? "___EMPTY___" : option.value;
            return /* @__PURE__ */ React34.createElement(
              SelectPrimitive2.Item,
              {
                key: option.value,
                value: itemValue,
                className: cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-left outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  isSelected && "font-medium"
                )
              },
              /* @__PURE__ */ React34.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React34.createElement(SelectPrimitive2.ItemIndicator, null, /* @__PURE__ */ React34.createElement(Check4, { className: "h-4 w-4 text-primary" }))),
              /* @__PURE__ */ React34.createElement(SelectPrimitive2.ItemText, null, /* @__PURE__ */ React34.createElement("span", { className: "truncate" }, option.label))
            );
          }), isFetchingNextPage && /* @__PURE__ */ React34.createElement("div", { className: "flex items-center justify-center p-2 text-[10px] text-muted-foreground animate-pulse" }, /* @__PURE__ */ React34.createElement(Loader22, { className: "h-3 w-3 animate-spin mr-1.5" }), "Loading more..."))
        )
      ))
    );
  }
);
SearchSelect.displayName = "SearchSelect";

// src/components/multi-search-select.jsx
import * as React35 from "react";
import { Check as Check5, ChevronDown as ChevronDown4, Search as Search2, Loader2 as Loader23, X as X2 } from "lucide-react";
import * as PopoverPrimitive2 from "@radix-ui/react-popover";
var MultiSearchSelect = React35.forwardRef(
  ({
    value = [],
    onChange,
    options = [],
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    isLoading = false,
    disabled = false,
    className,
    badgeVariant = "outline",
    badgeClassName,
    renderLabel,
    maxDisplayed = 5
  }, ref) => {
    const [open, setOpen] = React35.useState(false);
    const [localQuery, setLocalQuery] = React35.useState("");
    const searchInputRef = React35.useRef(null);
    React35.useEffect(() => {
      if (!open) {
        setLocalQuery("");
      }
    }, [open]);
    const handleSearchChange = (e) => {
      setLocalQuery(e.target.value);
    };
    const filteredOptions = React35.useMemo(() => {
      if (!localQuery) {
        return options;
      }
      const q = localQuery.toLowerCase();
      return options.filter(
        (option) => option.label.toLowerCase().includes(q) || option.description && option.description.toLowerCase().includes(q)
      );
    }, [options, localQuery]);
    const toggleOption = React35.useCallback(
      (optionValue) => {
        const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
        onChange(newValue);
      },
      [value, onChange]
    );
    const removeOption = React35.useCallback(
      (optionValue, e) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
      },
      [value, onChange]
    );
    const optionMap = React35.useMemo(() => {
      const map = {};
      options.forEach((opt) => {
        map[opt.value] = opt;
      });
      return map;
    }, [options]);
    const displayedValues = value.slice(0, maxDisplayed);
    const overflowCount = value.length - maxDisplayed;
    return /* @__PURE__ */ React35.createElement(PopoverPrimitive2.Root, { open, onOpenChange: setOpen }, /* @__PURE__ */ React35.createElement(PopoverPrimitive2.Trigger, { asChild: true }, /* @__PURE__ */ React35.createElement(
      "button",
      {
        ref,
        type: "button",
        disabled,
        className: cn(
          "flex min-h-8 w-full items-center flex-wrap gap-1 rounded-sm border border-input-custom bg-input-custom px-2 py-1 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-border/80 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 text-left",
          className
        )
      },
      value.length > 0 ? /* @__PURE__ */ React35.createElement(React35.Fragment, null, displayedValues.map((v) => {
        const opt = optionMap[v];
        return /* @__PURE__ */ React35.createElement(
          Badge,
          {
            key: v,
            variant: badgeVariant,
            className: cn(
              "shrink-0 gap-1 pr-1 text-xs font-normal",
              badgeClassName
            )
          },
          /* @__PURE__ */ React35.createElement("span", { className: "truncate max-w-[120px]" }, opt ? opt.label : v),
          /* @__PURE__ */ React35.createElement(
            "span",
            {
              role: "button",
              tabIndex: -1,
              className: "rounded-sm p-0 hover:bg-muted-foreground/20 cursor-pointer",
              onPointerDown: (e) => {
                e.preventDefault();
                e.stopPropagation();
              },
              onClick: (e) => removeOption(v, e)
            },
            /* @__PURE__ */ React35.createElement(X2, { className: "h-3 w-3" })
          )
        );
      }), overflowCount > 0 && /* @__PURE__ */ React35.createElement("span", { className: "text-xs text-muted-foreground" }, "+", overflowCount, " more")) : /* @__PURE__ */ React35.createElement("span", { className: "text-sm text-muted-foreground py-0.5" }, placeholder),
      /* @__PURE__ */ React35.createElement(ChevronDown4, { className: "h-4 w-4 opacity-50 shrink-0 ml-auto" })
    )), /* @__PURE__ */ React35.createElement(PopoverPrimitive2.Portal, null, /* @__PURE__ */ React35.createElement(
      PopoverPrimitive2.Content,
      {
        align: "start",
        sideOffset: 4,
        onOpenAutoFocus: (e) => {
          e.preventDefault();
          setTimeout(() => searchInputRef.current?.focus(), 0);
        },
        className: "z-[1200] w-[var(--radix-popover-trigger-width)] max-h-80 overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
      },
      /* @__PURE__ */ React35.createElement(
        "div",
        {
          className: "border-b border-border/50 p-2",
          onKeyDown: (e) => e.stopPropagation()
        },
        /* @__PURE__ */ React35.createElement("div", { className: "relative" }, /* @__PURE__ */ React35.createElement(Search2, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" }), /* @__PURE__ */ React35.createElement(
          Input,
          {
            ref: searchInputRef,
            type: "text",
            placeholder: searchPlaceholder,
            className: "pl-8 w-full bg-background border-border/50 focus:border-primary/30",
            value: localQuery,
            onChange: handleSearchChange
          }
        ))
      ),
      /* @__PURE__ */ React35.createElement("div", { className: "max-h-[220px] overflow-y-auto p-1 space-y-0.5" }, isLoading ? /* @__PURE__ */ React35.createElement("div", { className: "flex items-center justify-center p-4 text-xs text-muted-foreground" }, /* @__PURE__ */ React35.createElement(Loader23, { className: "h-4 w-4 animate-spin mr-2" }), "Loading...") : filteredOptions.length === 0 ? /* @__PURE__ */ React35.createElement("div", { className: "p-4 text-center text-xs text-muted-foreground" }, "No options found") : filteredOptions.map((option) => {
        const isSelected = value.includes(option.value);
        return /* @__PURE__ */ React35.createElement(
          "div",
          {
            key: option.value,
            role: "option",
            "aria-selected": isSelected,
            className: cn(
              "relative flex w-full cursor-pointer select-none items-start rounded-sm py-1.5 pl-8 pr-2 text-sm text-left outline-none hover:bg-muted",
              isSelected && "font-medium"
            ),
            onClick: () => toggleOption(option.value)
          },
          /* @__PURE__ */ React35.createElement("span", { className: "absolute left-2 top-2 flex h-3.5 w-3.5 items-center justify-center" }, isSelected && /* @__PURE__ */ React35.createElement(Check5, { className: "h-4 w-4 text-primary" })),
          renderLabel ? renderLabel(option) : /* @__PURE__ */ React35.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React35.createElement("span", { className: "truncate" }, option.label), option.description && /* @__PURE__ */ React35.createElement("span", { className: "text-xs text-muted-foreground truncate" }, option.description))
        );
      })),
      value.length > 0 && /* @__PURE__ */ React35.createElement("div", { className: "border-t border-border/50 px-2 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between" }, /* @__PURE__ */ React35.createElement("span", null, value.length, " selected"), /* @__PURE__ */ React35.createElement(
        "button",
        {
          type: "button",
          className: "text-xs text-muted-foreground hover:text-foreground transition-colors",
          onClick: () => onChange([])
        },
        "Clear all"
      ))
    )));
  }
);
MultiSearchSelect.displayName = "MultiSearchSelect";
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  ArrayInput,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Callout,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CodeEditor,
  CollapseComponent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EmptyState,
  ErrorBoundary,
  GoogleOAuthButton,
  Input,
  InputValuesForm,
  Label2 as Label,
  LogicChip,
  MultiSearchSelect,
  PageHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup2 as RadioGroup,
  RadioGroupItem,
  ScrollArea,
  ScrollBar,
  SearchSelect,
  Section,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator3 as Separator,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TemplateAutocompleteInput,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  badgeVariants,
  buttonVariants,
  cn
};
//# sourceMappingURL=index.mjs.map
