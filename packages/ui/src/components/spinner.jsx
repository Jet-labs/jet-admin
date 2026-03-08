import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const Spinner = React.forwardRef(
  ({ className, size = 16, ...props }, ref) => (
    <Loader2
      ref={ref}
      className={cn("animate-spin text-current", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };

