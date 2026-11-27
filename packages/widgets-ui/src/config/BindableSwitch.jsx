import React, { useState } from "react";
import { Braces } from "lucide-react";
import { Switch, cn } from "@jet-admin/ui";
import { BindableInput, hasBinding } from "./BindableInput";

/**
 * BindableSwitch — boolean control that can flip between a literal value and
 * a template/JS expression without changing the stored config shape.
 */
export const BindableSwitch = ({
  id,
  value = false,
  onChange,
  liveStateTree,
  disabled = false,
  ariaLabel,
}) => {
  const bound = hasBinding(value);
  const [expressionMode, setExpressionMode] = useState(bound);
  const isExpression = bound || expressionMode;
  const truthy = value === true || value === "true";

  if (isExpression) {
    return (
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <BindableInput
            value={typeof value === "string" ? value : String(!!value)}
            onChange={onChange}
            placeholder="e.g. {{ state.variables.canEdit }}"
            liveStateTree={liveStateTree}
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (bound) return;
            setExpressionMode(false);
            onChange?.(truthy);
          }}
          className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control border border-border bg-background text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Use a literal boolean"
          title={bound ? "Remove braces to return to a literal boolean" : "Use a literal boolean"}
        >
          <Braces className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Switch
        id={id}
        checked={truthy}
        onCheckedChange={(checked) => onChange?.(!!checked)}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={() => {
          setExpressionMode(true);
          onChange?.("{{ false }}");
        }}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-control border border-border bg-background text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        )}
        aria-label="Use an expression"
        title="Use an expression"
      >
        <Braces className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default BindableSwitch;
