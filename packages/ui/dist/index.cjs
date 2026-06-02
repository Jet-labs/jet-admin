var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  Accordion: () => Accordion,
  AccordionContent: () => AccordionContent,
  AccordionItem: () => AccordionItem,
  AccordionTrigger: () => AccordionTrigger,
  AlertDialog: () => AlertDialog,
  AlertDialogAction: () => AlertDialogAction,
  AlertDialogCancel: () => AlertDialogCancel,
  AlertDialogContent: () => AlertDialogContent,
  AlertDialogDescription: () => AlertDialogDescription,
  AlertDialogFooter: () => AlertDialogFooter,
  AlertDialogHeader: () => AlertDialogHeader,
  AlertDialogOverlay: () => AlertDialogOverlay,
  AlertDialogPortal: () => AlertDialogPortal,
  AlertDialogTitle: () => AlertDialogTitle,
  AlertDialogTrigger: () => AlertDialogTrigger,
  ArrayInput: () => ArrayInput,
  Avatar: () => Avatar,
  AvatarFallback: () => AvatarFallback,
  AvatarImage: () => AvatarImage,
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  CardContent: () => CardContent,
  CardDescription: () => CardDescription,
  CardFooter: () => CardFooter,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle,
  Checkbox: () => Checkbox,
  CodeEditor: () => CodeEditor,
  CollapseComponent: () => CollapseComponent,
  Dialog: () => Dialog,
  DialogClose: () => DialogClose,
  DialogContent: () => DialogContent,
  DialogDescription: () => DialogDescription,
  DialogFooter: () => DialogFooter,
  DialogHeader: () => DialogHeader,
  DialogOverlay: () => DialogOverlay,
  DialogPortal: () => DialogPortal,
  DialogTitle: () => DialogTitle,
  DialogTrigger: () => DialogTrigger,
  DropdownMenu: () => DropdownMenu,
  DropdownMenuCheckboxItem: () => DropdownMenuCheckboxItem,
  DropdownMenuContent: () => DropdownMenuContent,
  DropdownMenuGroup: () => DropdownMenuGroup,
  DropdownMenuItem: () => DropdownMenuItem,
  DropdownMenuLabel: () => DropdownMenuLabel,
  DropdownMenuPortal: () => DropdownMenuPortal,
  DropdownMenuRadioGroup: () => DropdownMenuRadioGroup,
  DropdownMenuSeparator: () => DropdownMenuSeparator,
  DropdownMenuShortcut: () => DropdownMenuShortcut,
  DropdownMenuSub: () => DropdownMenuSub,
  DropdownMenuSubContent: () => DropdownMenuSubContent,
  DropdownMenuSubTrigger: () => DropdownMenuSubTrigger,
  DropdownMenuTrigger: () => DropdownMenuTrigger,
  ErrorBoundary: () => ErrorBoundary,
  Input: () => Input,
  InputArgsForm: () => InputArgsForm,
  Label: () => Label2,
  PageHeader: () => PageHeader,
  Popover: () => Popover,
  PopoverContent: () => PopoverContent,
  PopoverTrigger: () => PopoverTrigger,
  RadioGroup: () => RadioGroup2,
  RadioGroupItem: () => RadioGroupItem,
  ScrollArea: () => ScrollArea,
  ScrollBar: () => ScrollBar,
  Section: () => Section,
  Select: () => Select,
  SelectContent: () => SelectContent,
  SelectGroup: () => SelectGroup,
  SelectItem: () => SelectItem,
  SelectLabel: () => SelectLabel,
  SelectScrollDownButton: () => SelectScrollDownButton,
  SelectScrollUpButton: () => SelectScrollUpButton,
  SelectSeparator: () => SelectSeparator,
  SelectTrigger: () => SelectTrigger,
  SelectValue: () => SelectValue,
  Separator: () => Separator3,
  Spinner: () => Spinner,
  Switch: () => Switch,
  Tabs: () => Tabs,
  TabsContent: () => TabsContent,
  TabsList: () => TabsList,
  TabsTrigger: () => TabsTrigger,
  TemplateAutocompleteInput: () => TemplateAutocompleteInput,
  Textarea: () => Textarea,
  Tooltip: () => Tooltip,
  TooltipContent: () => TooltipContent,
  TooltipProvider: () => TooltipProvider,
  TooltipTrigger: () => TooltipTrigger,
  badgeVariants: () => badgeVariants,
  buttonVariants: () => buttonVariants,
  cn: () => cn
});
module.exports = __toCommonJS(index_exports);

// src/lib/utils.js
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/components/accordion.jsx
var React = __toESM(require("react"));
var AccordionPrimitive = __toESM(require("@radix-ui/react-accordion"));
var import_lucide_react = require("lucide-react");
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
    /* @__PURE__ */ React.createElement(import_lucide_react.ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
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
var React3 = __toESM(require("react"));
var AlertDialogPrimitive = __toESM(require("@radix-ui/react-alert-dialog"));

// src/components/button.jsx
var React2 = __toESM(require("react"));
var import_react_slot = require("@radix-ui/react-slot");
var import_class_variance_authority = require("class-variance-authority");
var buttonVariants = (0, import_class_variance_authority.cva)(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary/50 text-primary-foreground font-semibold border border-primary/80 hover:border-primary hover:bg-primary/70",
        secondary: "bg-muted text-foreground border border-border/50 hover:bg-muted/80 hover:border-border",
        green: "bg-primary text-primary-foreground font-semibold border border-transparent hover:bg-primary/90",
        destructive: "bg-red-500/20 text-white hover:bg-red-500/40 border border-red-500/40",
        white: "bg-foreground text-background hover:opacity-90 border border-transparent",
        outline: "bg-transparent border border-border text-foreground hover:bg-white/5",
        ghost: "bg-transparent text-foreground hover:bg-white/5",
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
    const Comp = asChild ? import_react_slot.Slot : "button";
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
var React4 = __toESM(require("react"));
var AvatarPrimitive = __toESM(require("@radix-ui/react-avatar"));
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
var React5 = __toESM(require("react"));
var import_class_variance_authority2 = require("class-variance-authority");
var badgeVariants = (0, import_class_variance_authority2.cva)(
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
var React6 = __toESM(require("react"));
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
var React7 = __toESM(require("react"));
var CheckboxPrimitive = __toESM(require("@radix-ui/react-checkbox"));
var import_lucide_react2 = require("lucide-react");
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
    /* @__PURE__ */ React7.createElement(import_lucide_react2.Check, { className: "h-4 w-4" })
  )
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/components/dialog.jsx
var React8 = __toESM(require("react"));
var DialogPrimitive = __toESM(require("@radix-ui/react-dialog"));
var import_lucide_react3 = require("lucide-react");
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
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-md",
        className
      ),
      ...props
    },
    children,
    !hideCloseIcon && /* @__PURE__ */ React8.createElement(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-muted data-[state=open]:text-muted-foreground" }, /* @__PURE__ */ React8.createElement(import_lucide_react3.X, { className: "h-4 w-4" }), /* @__PURE__ */ React8.createElement("span", { className: "sr-only" }, "Close"))
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
      "text-lg font-semibold leading-none tracking-tight",
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
var React9 = __toESM(require("react"));
var DropdownMenuPrimitive = __toESM(require("@radix-ui/react-dropdown-menu"));
var import_lucide_react4 = require("lucide-react");
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
    /* @__PURE__ */ React9.createElement(import_lucide_react4.ChevronRight, { className: "ml-auto h-4 w-4" })
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
    /* @__PURE__ */ React9.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React9.createElement(DropdownMenuPrimitive.ItemIndicator, null, /* @__PURE__ */ React9.createElement(import_lucide_react4.Check, { className: "h-4 w-4" }))),
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
var React10 = __toESM(require("react"));
var import_class_variance_authority3 = require("class-variance-authority");
var inputVariants = (0, import_class_variance_authority3.cva)(
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
var React11 = __toESM(require("react"));
var LabelPrimitive = __toESM(require("@radix-ui/react-label"));
var import_class_variance_authority4 = require("class-variance-authority");
var labelVariants = (0, import_class_variance_authority4.cva)(
  "text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
var React12 = __toESM(require("react"));
var PopoverPrimitive = __toESM(require("@radix-ui/react-popover"));
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
var React13 = __toESM(require("react"));
var RadioGroupPrimitive = __toESM(require("@radix-ui/react-radio-group"));
var import_lucide_react5 = require("lucide-react");
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
    /* @__PURE__ */ React13.createElement(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center" }, /* @__PURE__ */ React13.createElement(import_lucide_react5.Circle, { className: "h-2.5 w-2.5 fill-current text-current" }))
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// src/components/scroll-area.jsx
var React14 = __toESM(require("react"));
var ScrollAreaPrimitive = __toESM(require("@radix-ui/react-scroll-area"));
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
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React14.createElement(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// src/components/select.jsx
var React15 = __toESM(require("react"));
var SelectPrimitive = __toESM(require("@radix-ui/react-select"));
var import_lucide_react6 = require("lucide-react");
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
    /* @__PURE__ */ React15.createElement(SelectPrimitive.Icon, { asChild: true }, /* @__PURE__ */ React15.createElement(import_lucide_react6.ChevronDown, { className: "h-4 w-4 opacity-50" }))
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
    /* @__PURE__ */ React15.createElement(import_lucide_react6.ChevronUp, { className: "h-4 w-4" })
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
    /* @__PURE__ */ React15.createElement(import_lucide_react6.ChevronDown, { className: "h-4 w-4" })
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
    /* @__PURE__ */ React15.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React15.createElement(SelectPrimitive.ItemIndicator, null, /* @__PURE__ */ React15.createElement(import_lucide_react6.Check, { className: "h-4 w-4" }))),
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
var React16 = __toESM(require("react"));
var SeparatorPrimitive = __toESM(require("@radix-ui/react-separator"));
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
var React17 = __toESM(require("react"));
var import_lucide_react7 = require("lucide-react");
var Spinner = React17.forwardRef(
  ({ className, size = 16, ...props }, ref) => /* @__PURE__ */ React17.createElement(
    import_lucide_react7.Loader2,
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
var React18 = __toESM(require("react"));
var SwitchPrimitives = __toESM(require("@radix-ui/react-switch"));
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
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )
    }
  )
));
Switch.displayName = SwitchPrimitives.Root.displayName;

// src/components/tabs.jsx
var React19 = __toESM(require("react"));
var TabsPrimitive = __toESM(require("@radix-ui/react-tabs"));
var Tabs = TabsPrimitive.Root;
var TabsList = React19.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React19.createElement(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex  items-end justify-start rounded-none border-b border-border bg-transparent p-0 text-muted-foreground w-full",
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
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-3 border-b-2 border-transparent -mb-px text-[14px] font-medium tracking-[0.2px] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:shadow-none hover:text-foreground",
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
var React20 = __toESM(require("react"));
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
var React21 = __toESM(require("react"));
var TooltipPrimitive = __toESM(require("@radix-ui/react-tooltip"));
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
var import_react = __toESM(require("react"));
var import_bi = require("react-icons/bi");
var import_prop_types = __toESM(require("prop-types"));
var import_ui = require("@jet-admin/ui");
var CollapseComponent = ({
  showButtonText,
  hideButtonText,
  containerClass,
  content
}) => {
  CollapseComponent.propTypes = {
    showButtonText: import_prop_types.default.string,
    hideButtonText: import_prop_types.default.string,
    containerClass: import_prop_types.default.string,
    content: import_prop_types.default.func.isRequired
  };
  const [isOpen, setIsOpen] = (0, import_react.useState)(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: `flex flex-col justify-start items-stretch ${containerClass}`
    },
    /* @__PURE__ */ import_react.default.createElement(
      import_ui.Button,
      {
        onClick: handleToggle,
        type: "button",
        variant: "ghost",
        className: "p-0 m-0 text-primary hover:text-primary"
      },
      isOpen ? /* @__PURE__ */ import_react.default.createElement(import_bi.BiChevronUp, { className: "text-base mr-1" }) : /* @__PURE__ */ import_react.default.createElement(import_bi.BiChevronDown, { className: "text-base mr-1" }),
      isOpen ? hideButtonText || "Hide" : showButtonText || "Show"
    ),
    /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        className: `grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`
      },
      /* @__PURE__ */ import_react.default.createElement("div", { className: "overflow-hidden" }, content())
    )
  );
};

// src/components/code-editor.jsx
var React23 = __toESM(require("react"));
var import_react2 = __toESM(require("@monaco-editor/react"));

// src/components/github-light.json
var github_light_default = {
  base: "vs",
  inherit: true,
  rules: [
    {
      background: "ffffff",
      token: ""
    },
    {
      foreground: "6a737d",
      token: "comment"
    },
    {
      foreground: "6a737d",
      token: "punctuation.definition.comment"
    },
    {
      foreground: "6a737d",
      token: "string.comment"
    },
    {
      foreground: "005cc5",
      token: "constant"
    },
    {
      foreground: "005cc5",
      token: "entity.name.constant"
    },
    {
      foreground: "005cc5",
      token: "variable.other.constant"
    },
    {
      foreground: "005cc5",
      token: "variable.language"
    },
    {
      foreground: "6f42c1",
      token: "entity"
    },
    {
      foreground: "6f42c1",
      token: "entity.name"
    },
    {
      foreground: "24292e",
      token: "variable.parameter.function"
    },
    {
      foreground: "22863a",
      token: "entity.name.tag"
    },
    {
      foreground: "d73a49",
      token: "keyword"
    },
    {
      foreground: "d73a49",
      token: "storage"
    },
    {
      foreground: "d73a49",
      token: "storage.type"
    },
    {
      foreground: "24292e",
      token: "storage.modifier.package"
    },
    {
      foreground: "24292e",
      token: "storage.modifier.import"
    },
    {
      foreground: "24292e",
      token: "storage.type.java"
    },
    {
      foreground: "032f62",
      token: "string"
    },
    {
      foreground: "032f62",
      token: "punctuation.definition.string"
    },
    {
      foreground: "032f62",
      token: "string punctuation.section.embedded source"
    },
    {
      foreground: "005cc5",
      token: "support"
    },
    {
      foreground: "005cc5",
      token: "meta.property-name"
    },
    {
      foreground: "e36209",
      token: "variable"
    },
    {
      foreground: "24292e",
      token: "variable.other"
    },
    {
      foreground: "b31d28",
      fontStyle: "bold italic underline",
      token: "invalid.broken"
    },
    {
      foreground: "b31d28",
      fontStyle: "bold italic underline",
      token: "invalid.deprecated"
    },
    {
      foreground: "fafbfc",
      background: "b31d28",
      fontStyle: "italic underline",
      token: "invalid.illegal"
    },
    {
      foreground: "fafbfc",
      background: "d73a49",
      fontStyle: "italic underline",
      token: "carriage-return"
    },
    {
      foreground: "b31d28",
      fontStyle: "bold italic underline",
      token: "invalid.unimplemented"
    },
    {
      foreground: "b31d28",
      token: "message.error"
    },
    {
      foreground: "24292e",
      token: "string source"
    },
    {
      foreground: "005cc5",
      token: "string variable"
    },
    {
      foreground: "032f62",
      token: "source.regexp"
    },
    {
      foreground: "032f62",
      token: "string.regexp"
    },
    {
      foreground: "032f62",
      token: "string.regexp.character-class"
    },
    {
      foreground: "032f62",
      token: "string.regexp constant.character.escape"
    },
    {
      foreground: "032f62",
      token: "string.regexp source.ruby.embedded"
    },
    {
      foreground: "032f62",
      token: "string.regexp string.regexp.arbitrary-repitition"
    },
    {
      foreground: "22863a",
      fontStyle: "bold",
      token: "string.regexp constant.character.escape"
    },
    {
      foreground: "005cc5",
      token: "support.constant"
    },
    {
      foreground: "005cc5",
      token: "support.variable"
    },
    {
      foreground: "005cc5",
      token: "meta.module-reference"
    },
    {
      foreground: "735c0f",
      token: "markup.list"
    },
    {
      foreground: "005cc5",
      fontStyle: "bold",
      token: "markup.heading"
    },
    {
      foreground: "005cc5",
      fontStyle: "bold",
      token: "markup.heading entity.name"
    },
    {
      foreground: "22863a",
      token: "markup.quote"
    },
    {
      foreground: "24292e",
      fontStyle: "italic",
      token: "markup.italic"
    },
    {
      foreground: "24292e",
      fontStyle: "bold",
      token: "markup.bold"
    },
    {
      foreground: "005cc5",
      token: "markup.raw"
    },
    {
      foreground: "b31d28",
      background: "ffeef0",
      token: "markup.deleted"
    },
    {
      foreground: "b31d28",
      background: "ffeef0",
      token: "meta.diff.header.from-file"
    },
    {
      foreground: "b31d28",
      background: "ffeef0",
      token: "punctuation.definition.deleted"
    },
    {
      foreground: "22863a",
      background: "f0fff4",
      token: "markup.inserted"
    },
    {
      foreground: "22863a",
      background: "f0fff4",
      token: "meta.diff.header.to-file"
    },
    {
      foreground: "22863a",
      background: "f0fff4",
      token: "punctuation.definition.inserted"
    },
    {
      foreground: "e36209",
      background: "ffebda",
      token: "markup.changed"
    },
    {
      foreground: "e36209",
      background: "ffebda",
      token: "punctuation.definition.changed"
    },
    {
      foreground: "f6f8fa",
      background: "005cc5",
      token: "markup.ignored"
    },
    {
      foreground: "f6f8fa",
      background: "005cc5",
      token: "markup.untracked"
    },
    {
      foreground: "6f42c1",
      fontStyle: "bold",
      token: "meta.diff.range"
    },
    {
      foreground: "005cc5",
      token: "meta.diff.header"
    },
    {
      foreground: "005cc5",
      fontStyle: "bold",
      token: "meta.separator"
    },
    {
      foreground: "005cc5",
      token: "meta.output"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.tag"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.curly"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.round"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.square"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.angle"
    },
    {
      foreground: "586069",
      token: "brackethighlighter.quote"
    },
    {
      foreground: "b31d28",
      token: "brackethighlighter.unmatched"
    },
    {
      foreground: "b31d28",
      token: "sublimelinter.mark.error"
    },
    {
      foreground: "e36209",
      token: "sublimelinter.mark.warning"
    },
    {
      foreground: "959da5",
      token: "sublimelinter.gutter-mark"
    },
    {
      foreground: "032f62",
      fontStyle: "underline",
      token: "constant.other.reference.link"
    },
    {
      foreground: "032f62",
      fontStyle: "underline",
      token: "string.other.link"
    }
  ],
  colors: {
    "editor.foreground": "#24292e",
    "editor.background": "#ffffff",
    "editor.selectionBackground": "#c8c8fa",
    "editor.inactiveSelectionBackground": "#fafbfc",
    "editor.lineHighlightBackground": "#fafbfc",
    "editorCursor.foreground": "#24292e",
    "editorWhitespace.foreground": "#959da5",
    "editorIndentGuide.background": "#959da5",
    "editorIndentGuide.activeBackground": "#24292e",
    "editor.selectionHighlightBorder": "#fafbfc"
  }
};

// src/components/code-editor.jsx
var import_lucide_react8 = require("lucide-react");
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
  // "valid" | "error" | null
  statusMessage,
  footerHint,
  onMount,
  beforeMount,
  editorOptions = {},
  ...props
}, ref) => {
  const [isExpanded, setIsExpanded] = React23.useState(false);
  const internalEditorRef = React23.useRef(null);
  const monacoRef = React23.useRef(null);
  const isReadOnly = disabled || readOnly;
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("github-light", github_light_default);
    if (beforeMount) {
      beforeMount(monaco);
    }
  };
  const handleEditorDidMount = (editor, monaco) => {
    internalEditorRef.current = editor;
    monacoRef.current = monaco;
    if (typeof ref === "function") {
      ref({ editor, monaco });
    } else if (ref) {
      ref.current = { editor, monaco };
    }
    if (onMount) {
      onMount(editor, monaco);
    }
  };
  const handleFormat = () => {
    if (internalEditorRef.current) {
      internalEditorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };
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
  return /* @__PURE__ */ React23.createElement(
    "div",
    {
      className: cn(
        "flex flex-col overflow-hidden rounded border text-sm shadow-sm transition-colors",
        status === "error" ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border hover:border-border/80",
        isExpanded ? "fixed inset-4 z-50 rounded shadow-2xl ring-1 ring-border/50 bg-background" : "relative bg-background",
        className
      ),
      ...props
    },
    showHeader && /* @__PURE__ */ React23.createElement("div", { className: "flex min-h-[36px] flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5" }, /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-3" }, (title || titleIcon) && /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-1.5 font-medium text-foreground" }, titleIcon ? titleIcon : /* @__PURE__ */ React23.createElement(import_lucide_react8.Code, { className: "h-3.5 w-3.5 text-primary" }), title && /* @__PURE__ */ React23.createElement("span", { className: "text-xs" }, title)), status && /* @__PURE__ */ React23.createElement("span", { className: cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
      status === "valid" ? "bg-green-950/40 text-green-400 border border-green-800" : status === "error" ? "bg-red-950/40 text-red-400 border border-red-800" : ""
    ) }, status === "valid" ? /* @__PURE__ */ React23.createElement(import_lucide_react8.CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ React23.createElement(import_lucide_react8.AlertTriangle, { className: "h-3 w-3" }), status === "valid" ? "Valid" : "Invalid"), headerLeft), /* @__PURE__ */ React23.createElement("div", { className: "flex items-center gap-1.5" }, headerExtra, showFormatButton && !isReadOnly && /* @__PURE__ */ React23.createElement(
      "button",
      {
        type: "button",
        onClick: handleFormat,
        className: "inline-flex h-6 items-center gap-1.5 rounded border border-transparent px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        title: "Format Code (Shift+Alt+F)"
      },
      /* @__PURE__ */ React23.createElement(import_lucide_react8.Braces, { className: "h-3 w-3" }),
      "Format"
    ), showExpandButton && /* @__PURE__ */ React23.createElement(
      "button",
      {
        type: "button",
        onClick: () => setIsExpanded(!isExpanded),
        className: "inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        title: isExpanded ? "Exit fullscreen (Esc)" : "Fullscreen"
      },
      isExpanded ? /* @__PURE__ */ React23.createElement(import_lucide_react8.Minimize2, { className: "h-3 w-3" }) : /* @__PURE__ */ React23.createElement(import_lucide_react8.Maximize2, { className: "h-3 w-3" })
    ))),
    /* @__PURE__ */ React23.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ React23.createElement(
      import_react2.default,
      {
        height: isExpanded ? "calc(100vh - 80px)" : height,
        language,
        value,
        defaultValue,
        onChange,
        beforeMount: handleEditorWillMount,
        onMount: handleEditorDidMount,
        theme: "vs-dark",
        options: {
          readOnly: isReadOnly,
          minimap: { enabled: isExpanded },
          fontSize: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          lineNumbers: showLineNumbers ? "on" : "off",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingStrategy: "advanced",
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          snippetSuggestions: "inline",
          padding: { top: 8, bottom: 8 },
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "always",
          bracketPairColorization: { enabled: true },
          lineNumbersMinChars: 3,
          glyphMargin: false,
          overviewRulerLanes: 0,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          },
          ...editorOptions
        }
      }
    ), footerHint && /* @__PURE__ */ React23.createElement("div", { className: "absolute bottom-2 right-4 z-10 pointer-events-none rounded border border-border bg-background/95 px-2 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm" }, footerHint)),
    status === "error" && statusMessage && /* @__PURE__ */ React23.createElement("div", { className: "flex items-start gap-2 border-t border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive" }, /* @__PURE__ */ React23.createElement(import_lucide_react8.AlertTriangle, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ React23.createElement("span", { className: "font-medium whitespace-pre-wrap leading-relaxed" }, statusMessage))
  );
});
CodeEditor.displayName = "CodeEditor";

// src/components/array-input.jsx
var import_react3 = __toESM(require("react"));
var import_prop_types2 = __toESM(require("prop-types"));
var import_lucide_react9 = require("lucide-react");
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
      return /* @__PURE__ */ import_react3.default.createElement("div", { key: index, className: "flex gap-2 w-full" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react3.default.createElement(
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
      )), /* @__PURE__ */ import_react3.default.createElement(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "text-[#1c1c1e] hover:text-red-500 flex-shrink-0 mt-1",
          onClick: () => handleRemoveItem(index),
          disabled: disabled || !canRemove
        },
        /* @__PURE__ */ import_react3.default.createElement(import_lucide_react9.Trash2, { className: "h-4 w-4" })
      ));
    }
    return /* @__PURE__ */ import_react3.default.createElement("div", { key: index, className: "flex items-center gap-2 w-full" }, /* @__PURE__ */ import_react3.default.createElement(
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
    ), /* @__PURE__ */ import_react3.default.createElement(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        className: "text-[#1c1c1e] hover:text-red-500 flex-shrink-0",
        onClick: () => handleRemoveItem(index),
        disabled: disabled || !canRemove
      },
      /* @__PURE__ */ import_react3.default.createElement(import_lucide_react9.Trash2, { className: "h-4 w-4" })
    ));
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-2 w-full" }, currentArray.length > 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-2" }, currentArray.map(renderItem)) : /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs text-[#1c1c1e] italic" }, "No items added to array."), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react3.default.createElement(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "default",
      className: "flex-1 text-xs",
      onClick: handleAddItem,
      disabled: disabled || !canAdd
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react9.Plus, { className: "mr-2 h-3.5 w-3.5" }),
    "Add Item"
  ), /* @__PURE__ */ import_react3.default.createElement(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0.5 h-5" }, currentArray.length, maxItems !== void 0 ? ` / ${maxItems}` : "")));
}
ArrayInput.propTypes = {
  value: import_prop_types2.default.array,
  onChange: import_prop_types2.default.func.isRequired,
  disabled: import_prop_types2.default.bool,
  placeholder: import_prop_types2.default.string,
  itemType: import_prop_types2.default.oneOf(["string", "number", "object"]),
  maxItems: import_prop_types2.default.number,
  minItems: import_prop_types2.default.number
};

// src/components/input-args-form.jsx
var import_react4 = __toESM(require("react"));
var import_prop_types3 = __toESM(require("prop-types"));
function InputArgsForm({
  args = [],
  values = {},
  onChange,
  errors = {},
  disabled = false,
  className
}) {
  if (!Array.isArray(args) || args.length === 0) {
    return /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-xs text-[#1c1c1e] italic" }, "No input parameters defined.");
  }
  const renderField = (arg) => {
    const argName = arg.key;
    const argType = arg.type || "string";
    const value = values[argName];
    switch (argType) {
      case "boolean":
        return /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react4.default.createElement(
          Checkbox,
          {
            id: `input-arg-${argName}`,
            checked: !!value,
            onCheckedChange: (checked) => onChange(argName, checked),
            disabled
          }
        ), /* @__PURE__ */ import_react4.default.createElement(
          Label2,
          {
            htmlFor: `input-arg-${argName}`,
            className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          },
          argName,
          arg.required && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-red-500 ml-1" }, "*"),
          /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-muted-foreground ml-1" }, "(", argType, ")")
        ));
      case "array":
        return /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement(Label2, { htmlFor: `input-arg-${argName}`, className: "text-xs" }, argName, " ", arg.required && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-muted-foreground" }, "(", argType, ")")), /* @__PURE__ */ import_react4.default.createElement(
          ArrayInput,
          {
            value: Array.isArray(value) ? value : [],
            onChange: (val) => onChange(argName, val),
            placeholder: `Add ${argName} item...`,
            disabled
          }
        ));
      case "object":
        return /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement(Label2, { htmlFor: `input-arg-${argName}`, className: "text-xs" }, argName, " ", arg.required && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-muted-foreground" }, "(", argType, ")")), /* @__PURE__ */ import_react4.default.createElement(
          CodeEditor,
          {
            language: "json",
            height: 120,
            title: "JSON Input",
            value: typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : value || "",
            onChange: (val) => onChange(argName, val),
            disabled
          }
        ));
      case "number":
        return /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement(Label2, { htmlFor: `input-arg-${argName}`, className: "text-xs" }, argName, " ", arg.required && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-red-500" }, "*"), " ", /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-muted-foreground" }, "(", argType, ")")), /* @__PURE__ */ import_react4.default.createElement(
          Input,
          {
            type: "number",
            id: `input-arg-${argName}`,
            className: "w-full text-xs",
            placeholder: `Value for ${argName}`,
            value: value ?? "",
            onChange: (e) => onChange(
              argName,
              e.target.value === "" ? "" : Number(e.target.value)
            ),
            disabled
          }
        ));
      // string & default
      default:
        return /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement(Label2, { htmlFor: `input-arg-${argName}`, className: "text-xs" }, argName, " ", arg.required && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-red-500" }, "*"), " ", argType !== "string" && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-muted-foreground" }, "(", argType, ")")), /* @__PURE__ */ import_react4.default.createElement(
          Input,
          {
            type: "text",
            id: `input-arg-${argName}`,
            className: "w-full text-xs",
            placeholder: `Value for ${argName}`,
            value: value || "",
            onChange: (e) => onChange(argName, e.target.value),
            disabled
          }
        ));
    }
  };
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: className || "space-y-3" }, args.map((arg) => /* @__PURE__ */ import_react4.default.createElement("div", { key: arg.key, className: "space-y-1" }, renderField(arg), errors[arg.key] && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-destructive text-xs" }, errors[arg.key]))));
}
InputArgsForm.propTypes = {
  args: import_prop_types3.default.arrayOf(
    import_prop_types3.default.shape({
      key: import_prop_types3.default.string.isRequired,
      type: import_prop_types3.default.string,
      required: import_prop_types3.default.bool
    })
  ).isRequired,
  values: import_prop_types3.default.object,
  onChange: import_prop_types3.default.func.isRequired,
  errors: import_prop_types3.default.object,
  disabled: import_prop_types3.default.bool,
  className: import_prop_types3.default.string
};

// src/components/pageHeader.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types4 = __toESM(require("prop-types"));
var import_lucide_react10 = require("lucide-react");
var import_react_router_dom = require("react-router-dom");
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
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background p-3 px-4" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-4" }, parentTitle && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(
    "h1",
    {
      className: "text-base font-semibold tracking-tight text-foreground leading-none"
    },
    parentTitle
  ), /* @__PURE__ */ import_react5.default.createElement(
    "span",
    {
      className: "text-base font-semibold tracking-tight text-foreground leading-none"
    },
    "/"
  )), /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("h1", { className: "text-base font-semibold tracking-tight text-foreground leading-none" }, title), id && /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-1.5 font-mono text-xs text-muted-foreground" }, "ID: ", id))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2" }, children, hasHistory && onHistory && /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "outline", size: "sm", onClick: onHistory }, "View History"), onClone && /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "outline", size: "sm", onClick: onClone, disabled: isCloning }, isCloning && /* @__PURE__ */ import_react5.default.createElement(Spinner, { size: 14, className: "mr-2" }), "Clone"), onDelete && /* @__PURE__ */ import_react5.default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: onDelete,
      disabled: isDeleting,
      className: "text-destructive hover:bg-destructive/10 border-destructive/20"
    },
    isDeleting && /* @__PURE__ */ import_react5.default.createElement(Spinner, { size: 14, className: "mr-2" }),
    "Delete"
  ), onSave && /* @__PURE__ */ import_react5.default.createElement(Button, { size: "sm", onClick: onSave, disabled: isSaving }, isSaving && /* @__PURE__ */ import_react5.default.createElement(Spinner, { size: 14, className: "mr-2" }), saveText)));
};
PageHeader.propTypes = {
  title: import_prop_types4.default.string.isRequired,
  id: import_prop_types4.default.string,
  onSave: import_prop_types4.default.func,
  onDelete: import_prop_types4.default.func,
  onClone: import_prop_types4.default.func,
  onHistory: import_prop_types4.default.func,
  isSaving: import_prop_types4.default.bool,
  isDeleting: import_prop_types4.default.bool,
  isCloning: import_prop_types4.default.bool,
  hasHistory: import_prop_types4.default.bool,
  saveText: import_prop_types4.default.string,
  children: import_prop_types4.default.node
};

// src/components/section.jsx
var React27 = __toESM(require("react"));
var Section = React27.forwardRef(
  ({ className, title, description, children, ...props }, ref) => {
    return /* @__PURE__ */ React27.createElement(
      "div",
      {
        ref,
        className: cn(
          "rounded-md border border-border bg-card p-4 space-y-3",
          className
        ),
        ...props
      },
      (title || description) && /* @__PURE__ */ React27.createElement("div", null, title && /* @__PURE__ */ React27.createElement("p", { className: "text-xs font-bold text-muted-foreground mb-0.5" }, title), description && /* @__PURE__ */ React27.createElement("p", { className: "text-[11px] text-muted-foreground" }, description)),
      children
    );
  }
);
Section.displayName = "Section";

// src/components/error-boundary.jsx
var import_react6 = __toESM(require("react"));
var import_lucide_react11 = require("lucide-react");
var import_prop_types5 = __toESM(require("prop-types"));
var ErrorBoundary = class extends import_react6.default.Component {
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
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex h-full w-full items-center justify-center p-4" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2 text-center" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex justify-center" }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react11.AlertTriangle, { className: "h-4 w-4 text-foreground/80" })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "font-medium text-xs text-foreground" }, this.props.title || "Component Error"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "max-w-xs break-words" }, this.state.error?.message || "Something went wrong while rendering this component.")));
    }
    return this.props.children;
  }
};
ErrorBoundary.propTypes = {
  children: import_prop_types5.default.node.isRequired,
  fallback: import_prop_types5.default.func,
  title: import_prop_types5.default.string
};

// src/components/template-autocomplete-input.jsx
var import_react7 = __toESM(require("react"));
function deriveContextSuggestions(obj, prefix = "", depth = 0, maxDepth = 5) {
  if (depth > maxDepth || obj === null || obj === void 0) return [];
  const suggestions = [];
  const addSuggestions = (newItems) => {
    for (let i = 0; i < newItems.length; i++) {
      suggestions.push(newItems[i]);
    }
  };
  if (Array.isArray(obj)) {
    if (prefix) {
      suggestions.push({ value: prefix, label: prefix, detail: `Array[${obj.length}]`, type: "array" });
      suggestions.push({ value: `${prefix}.length`, label: `${prefix}.length`, detail: "Number", type: "property" });
    }
    if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
      addSuggestions(deriveContextSuggestions(obj[0], prefix ? `${prefix}[0]` : "[0]", depth + 1, maxDepth));
    }
    return suggestions;
  }
  if (typeof obj === "object") {
    if (prefix) suggestions.push({ value: prefix, label: prefix, detail: "Object", type: "object" });
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "function") continue;
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (val === null || val === void 0) {
        suggestions.push({ value: childPath, label: childPath, detail: "null", type: "null" });
      } else if (Array.isArray(val)) {
        addSuggestions(deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
      } else if (typeof val === "object") {
        addSuggestions(deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
      } else {
        suggestions.push({ value: childPath, label: childPath, detail: inferType(val), type: "primitive" });
      }
    }
    return suggestions;
  }
  if (prefix) suggestions.push({ value: prefix, label: prefix, detail: inferType(obj), type: "primitive" });
  return suggestions;
}
function inferType(val) {
  if (val === null || val === void 0) return "null";
  if (typeof val === "boolean") return "Boolean";
  if (typeof val === "number") return Number.isInteger(val) ? "Integer" : "Float";
  if (typeof val === "string") return "String";
  return typeof val;
}
function typeIcon(type) {
  return { object: "{ }", array: "[ ]", primitive: "ab", null: "\u2205", property: "#", ctx: "\u2B1F", form: "\u25A3", widget: "\u25C8" }[type] || "\u25C6";
}
function highlightMatch(text, query) {
  if (!query) return /* @__PURE__ */ import_react7.default.createElement("span", null, text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return /* @__PURE__ */ import_react7.default.createElement("span", null, text);
  return /* @__PURE__ */ import_react7.default.createElement("span", null, text.slice(0, idx), /* @__PURE__ */ import_react7.default.createElement("mark", { className: "bg-primary/20 text-primary rounded-[2px] font-semibold px-[1px]" }, text.slice(idx, idx + query.length)), text.slice(idx + query.length));
}
function getFilterAtCaret(el) {
  const pos = el.selectionStart ?? 0;
  const before = (el.value ?? "").substring(0, pos);
  const match = before.match(/\{\{([^}]*)$/);
  return match ? match[1] : null;
}
function SuggestionDropdown({ items, totalItems, filterText, activeIdx, onSelect, onActiveChange, style }) {
  const listRef = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    if (!listRef.current || activeIdx < 0) return;
    listRef.current.querySelectorAll(".tpl-item")[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "absolute left-0 right-0 z-[9999] bg-background border border-border rounded-md shadow-lg flex flex-col overflow-hidden", style }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center justify-between px-2.5 py-1.5 border-b border-border bg-muted/50 shrink-0" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono" }, "Bindings"), filterText ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] text-muted-foreground font-mono truncate ml-2" }, "filtering ", /* @__PURE__ */ import_react7.default.createElement("code", { className: "font-mono text-[10px] bg-primary/10 px-1 py-[1.5px] rounded-[3px] border border-primary/20 text-primary" }, filterText), "\xA0\xB7\xA0", totalItems, " result", totalItems !== 1 ? "s" : "") : /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] text-muted-foreground font-mono" }, totalItems, " available")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "max-h-[200px] overflow-y-auto overflow-x-hidden", ref: listRef }, items.length === 0 ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "p-3 text-[11px] text-center text-muted-foreground font-mono" }, 'No bindings match "', filterText, '"') : items.map((s, i) => {
    const cleanVal = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
    const cleanLabel = (s.label || cleanVal).replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
    return /* @__PURE__ */ import_react7.default.createElement(
      "div",
      {
        key: i,
        className: `tpl-item flex items-center gap-2 px-2.5 py-1.5 cursor-pointer border-b border-border last:border-0 transition-colors ${i === activeIdx ? "bg-primary/10" : "hover:bg-muted/50"}`,
        onMouseDown: (e) => {
          e.preventDefault();
          onSelect(i);
        },
        onMouseEnter: () => onActiveChange(i)
      },
      /* @__PURE__ */ import_react7.default.createElement("div", { className: `w-5 h-5 rounded-[3px] flex items-center justify-center shrink-0 text-[9px] font-bold tracking-tighter font-mono ${s.type === "object" ? "bg-muted text-foreground border border-border/50" : s.type === "array" ? "bg-muted/50 text-foreground border border-border/50" : s.type === "null" ? "bg-transparent text-muted-foreground border border-dashed border-border/50" : "bg-primary/10 text-primary border border-primary/20"}` }, typeIcon(s.type)),
      /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-xs font-mono text-foreground whitespace-nowrap overflow-hidden text-ellipsis" }, highlightMatch(cleanLabel, filterText))),
      s.detail && /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] text-muted-foreground font-mono whitespace-nowrap shrink-0" }, s.detail),
      s.type && /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[9px] font-semibold uppercase tracking-[0.04em] px-1.5 py-px rounded-[3px] border border-border text-muted-foreground bg-muted shrink-0" }, s.type)
    );
  })), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center justify-between px-2.5 py-1 border-t border-border bg-muted/50 shrink-0" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] text-muted-foreground font-mono flex items-center gap-0.5" }, /* @__PURE__ */ import_react7.default.createElement("kbd", { className: "inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground" }, "\u2191"), /* @__PURE__ */ import_react7.default.createElement("kbd", { className: "inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground" }, "\u2193"), " navigate"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] text-muted-foreground font-mono flex items-center gap-0.5" }, /* @__PURE__ */ import_react7.default.createElement("kbd", { className: "inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground" }, "\u21B5"), " select \xB7 ", /* @__PURE__ */ import_react7.default.createElement("kbd", { className: "inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground" }, "Esc"), " close")));
}
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
  suggestions = [],
  context,
  isTextArea = false,
  isParagraph = false,
  rows = 4,
  className = ""
}) => {
  const multiline = isTextArea || isParagraph;
  const [showSuggestions, setShowSuggestions] = (0, import_react7.useState)(false);
  const [filterText, setFilterText] = (0, import_react7.useState)("");
  const [activeIdx, setActiveIdx] = (0, import_react7.useState)(-1);
  const [dropdownTop, setDropdownTop] = (0, import_react7.useState)(null);
  const fieldRef = (0, import_react7.useRef)(null);
  const effectiveSuggestions = (0, import_react7.useMemo)(() => {
    if (suggestions?.length > 0) return suggestions;
    if (context && typeof context === "object") return deriveContextSuggestions(context);
    return [];
  }, [suggestions, context]);
  const filteredSuggestions = (0, import_react7.useMemo)(() => {
    if (!filterText) return effectiveSuggestions;
    const lower = filterText.toLowerCase();
    return effectiveSuggestions.filter((s) => {
      const v = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
      const l = (s.label || v).replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
      return v.toLowerCase().includes(lower) || l.toLowerCase().includes(lower);
    });
  }, [effectiveSuggestions, filterText]);
  const displayedSuggestions = (0, import_react7.useMemo)(() => filteredSuggestions.slice(0, 100), [filteredSuggestions]);
  const boundTokens = (0, import_react7.useMemo)(() => extractTokens(value), [value]);
  const computeDropdownTop = (0, import_react7.useCallback)(() => {
    const el = fieldRef.current;
    if (!el || !multiline) return null;
    const pos = el.selectionStart ?? 0;
    const textBefore = (el.value ?? "").substring(0, pos);
    const linesBefore = textBefore.split("\n").length;
    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingTop = parseFloat(getComputedStyle(el).paddingTop) || 8;
    return paddingTop + linesBefore * lineH;
  }, [multiline]);
  const openWith = (0, import_react7.useCallback)((filter) => {
    setFilterText(filter);
    setActiveIdx(-1);
    setShowSuggestions(true);
    if (multiline) setDropdownTop(computeDropdownTop());
  }, [multiline, computeDropdownTop]);
  const close = (0, import_react7.useCallback)(() => {
    setShowSuggestions(false);
    setActiveIdx(-1);
  }, []);
  const handleSelect = (0, import_react7.useCallback)((idx) => {
    const s = displayedSuggestions[idx];
    if (!s) return;
    const el = fieldRef.current;
    const pos = el?.selectionStart ?? (value || "").length;
    const before = (value || "").substring(0, pos);
    const after = (value || "").substring(pos);
    const match = before.match(/\{\{([^}]*)$/);
    const cleanVal = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
    let newValue;
    if (match) {
      const strippedAfter = after.replace(/^\s*\}\}/, "");
      newValue = before.substring(0, match.index) + "{{" + cleanVal + "}}" + strippedAfter;
    } else {
      newValue = "{{" + cleanVal + "}}";
    }
    onChange(newValue);
    close();
    setTimeout(() => {
      if (el) {
        el.focus();
        const newPos = match ? match.index + 2 + cleanVal.length + 2 : newValue.length;
        el.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }, [displayedSuggestions, value, onChange, close]);
  const handleChange = (e) => {
    onChange(e.target.value);
    const filter = getFilterAtCaret(e.target);
    if (filter !== null) openWith(filter);
    else close();
  };
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, displayedSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(activeIdx);
    } else if (e.key === "Escape") {
      close();
    }
  };
  const handleClick = () => {
    const el = fieldRef.current;
    if (!el) return;
    const filter = getFilterAtCaret(el);
    if (filter !== null) openWith(filter);
  };
  const handleBlur = () => {
    setTimeout(close, 150);
  };
  const dropdownStyle = multiline && dropdownTop != null ? { top: dropdownTop } : { top: "calc(100% + 4px)" };
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: `relative w-full ${className}` }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-input-custom border border-input-custom rounded-sm overflow-hidden transition-shadow duration-150 focus-within:border-border/80 focus-within:ring-2 focus-within:ring-primary/30" }, multiline ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(
    "textarea",
    {
      ref: fieldRef,
      className: "block w-full p-2 text-xs leading-[1.6] font-mono text-foreground bg-transparent border-none outline-none resize-y min-h-[80px] placeholder:text-muted-foreground",
      value: value || "",
      rows,
      placeholder,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      onBlur: handleBlur,
      autoComplete: "off",
      spellCheck: false
    }
  ), boundTokens.length > 0 && /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center flex-wrap gap-1 px-2 py-1.5 border-t border-border bg-muted/50" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-0.5 shrink-0" }, "bound"), boundTokens.map((tok, i) => {
    const match = effectiveSuggestions.find(
      (s) => s.value.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "") === tok
    );
    return /* @__PURE__ */ import_react7.default.createElement("span", { key: i, className: "inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[3px] bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary cursor-default max-w-full", title: match?.detail || "" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "truncate min-w-0" }, tok), match?.detail && /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[9px] text-primary/70 shrink-0" }, match.detail));
  }))) : /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      ref: fieldRef,
      type: "text",
      className: "block w-full h-8 px-2 text-xs font-mono text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground",
      value: value || "",
      placeholder,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      onBlur: handleBlur,
      autoComplete: "off",
      spellCheck: false
    }
  )), showSuggestions && /* @__PURE__ */ import_react7.default.createElement(
    SuggestionDropdown,
    {
      items: displayedSuggestions,
      totalItems: filteredSuggestions.length,
      filterText,
      activeIdx,
      onSelect: handleSelect,
      onActiveChange: setActiveIdx,
      style: dropdownStyle
    }
  ));
};
//# sourceMappingURL=index.cjs.map
