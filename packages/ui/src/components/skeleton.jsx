import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Skeleton — one token-backed loading primitive. Use skeletons instead of
 * spinners for first-load surfaces; keep WidgetBusy for in-place refresh.
 */
export const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn("animate-pulse rounded-control bg-muted/60 motion-reduce:animate-none", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn("space-y-1.5", className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("w-full space-y-1", className)} aria-hidden="true">
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex items-center gap-2">
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <Skeleton
            key={columnIndex}
            className={cn("h-7 flex-1", columnIndex === 0 && "max-w-[42%]")}
          />
        ))}
      </div>
    ))}
  </div>
);
