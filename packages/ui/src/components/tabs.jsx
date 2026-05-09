import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-end justify-start rounded-none border-b border-brand-border bg-transparent p-0 text-brand-text-muted w-full",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-3 border-b-2 border-transparent -mb-px text-[14px] font-medium tracking-[0.2px] ring-offset-brand-dark transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-brand-green data-[state=active]:border-brand-green data-[state=active]:shadow-none hover:text-brand-text-primary",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-border focus-visible:ring-offset-2 text-brand-text-primary",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
