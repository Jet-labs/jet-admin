import React, { useRef } from "react";
import { cn } from "@jet-admin/ui";

/**
 * SegmentedControl — 2-4 mutually exclusive choices as one accessible radio group.
 * Arrow keys move selection; Tab enters/leaves the group once.
 */
export const SegmentedControl = ({
  value,
  onChange,
  options = [],
  size = "default",
  ariaLabel,
  className,
  disabled = false,
}) => {
  const refs = useRef([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => String(option.value) === String(value))
  );

  const selectAt = (index) => {
    if (disabled) return;
    const option = options[index];
    if (!option || option.disabled) return;
    onChange?.(option.value);
    refs.current[index]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
    else nextIndex = (index + 1) % options.length;
    // Skip disabled options in the direction of travel.
    let guard = 0;
    while (options[nextIndex]?.disabled && guard < options.length) {
      nextIndex = (nextIndex + 1) % options.length;
      guard += 1;
    }
    selectAt(nextIndex);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex w-full items-center gap-0.5 rounded-control border border-border bg-muted/20 p-0.5",
        size === "sm" && "h-7",
        size === "default" && "h-8",
        size === "lg" && "h-10",
        disabled && "opacity-50",
        className
      )}
    >
      {options.map((option, index) => {
        const selected = String(option.value) === String(value);
        const OptionIcon = option.icon;
        return (
          <button
            key={String(option.value)}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex < 0 && index === 0) ? 0 : -1}
            disabled={disabled || option.disabled}
            onClick={() => selectAt(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            title={option.title || option.label}
            className={cn(
              "inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1 rounded-[4px] px-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {OptionIcon && <OptionIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
