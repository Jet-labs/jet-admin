import * as React from "react";
import { Check, ChevronDown, Search, Loader2, X } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Input } from "./input";
import { Badge } from "./badge";
import { cn } from "../lib/utils";

/**
 * MultiSearchSelect — A multi-select input with search capability.
 *
 * Props:
 *  - value: string[]  — Array of currently selected option values.
 *  - onChange: (value: string[]) => void — Called with the updated array.
 *  - options: { value: string, label: string, description?: string }[] — The full option set.
 *  - placeholder?: string — Placeholder when nothing is selected.
 *  - searchPlaceholder?: string — Placeholder in the search input.
 *  - isLoading?: boolean — Show a loading spinner instead of options.
 *  - disabled?: boolean — Disable the entire control.
 *  - className?: string — Additional classes on the trigger button.
 *  - badgeVariant?: string — Variant for the selected item badges.
 *  - badgeClassName?: string — Additional classes for each badge.
 *  - renderLabel?: (option) => React.ReactNode — Custom option label renderer.
 *  - maxDisplayed?: number — Maximum badges to show before "+N more".
 */
export const MultiSearchSelect = React.forwardRef(
  (
    {
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
      maxDisplayed = 5,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [localQuery, setLocalQuery] = React.useState("");
    const searchInputRef = React.useRef(null);

    // Reset local search query when popover closes
    React.useEffect(() => {
      if (!open) {
        setLocalQuery("");
      }
    }, [open]);

    const handleSearchChange = (e) => {
      setLocalQuery(e.target.value);
    };

    // Filter options locally
    const filteredOptions = React.useMemo(() => {
      if (!localQuery) {
        return options;
      }
      const q = localQuery.toLowerCase();
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(q) ||
          (option.description && option.description.toLowerCase().includes(q))
      );
    }, [options, localQuery]);

    const toggleOption = React.useCallback(
      (optionValue) => {
        const newValue = value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue];
        onChange(newValue);
      },
      [value, onChange]
    );

    const removeOption = React.useCallback(
      (optionValue, e) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
      },
      [value, onChange]
    );

    // Build a label lookup map
    const optionMap = React.useMemo(() => {
      const map = {};
      options.forEach((opt) => {
        map[opt.value] = opt;
      });
      return map;
    }, [options]);

    const displayedValues = value.slice(0, maxDisplayed);
    const overflowCount = value.length - maxDisplayed;

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              "flex min-h-8 w-full items-center flex-wrap gap-1 rounded-sm border border-input-custom bg-input-custom px-2 py-1 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-border/80 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 text-left",
              className
            )}
          >
            {value.length > 0 ? (
              <>
                {displayedValues.map((v) => {
                  const opt = optionMap[v];
                  return (
                    <Badge
                      key={v}
                      variant={badgeVariant}
                      className={cn(
                        "shrink-0 gap-1 pr-1 text-xs font-normal",
                        badgeClassName
                      )}
                    >
                      <span className="truncate max-w-[120px]">
                        {opt ? opt.label : v}
                      </span>
                      <span
                        role="button"
                        tabIndex={-1}
                        className="rounded-sm p-0 hover:bg-muted-foreground/20 cursor-pointer"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => removeOption(v, e)}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  );
                })}
                {overflowCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    +{overflowCount} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground py-0.5">
                {placeholder}
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            className="z-[1200] w-[var(--radix-popover-trigger-width)] max-h-80 overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {/* Search input */}
            <div
              className="border-b border-border/50 p-2"
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  className="pl-8 w-full bg-background border-border/50 focus:border-primary/30"
                  value={localQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-[220px] overflow-y-auto p-1 space-y-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-start rounded-sm py-1.5 pl-8 pr-2 text-sm text-left outline-none hover:bg-muted",
                        isSelected && "font-medium"
                      )}
                      onClick={() => toggleOption(option.value)}
                    >
                      <span className="absolute left-2 top-2 flex h-3.5 w-3.5 items-center justify-center">
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </span>
                      {renderLabel ? (
                        renderLabel(option)
                      ) : (
                        <div className="flex flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: show count */}
            {value.length > 0 && (
              <div className="border-t border-border/50 px-2 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>{value.length} selected</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

MultiSearchSelect.displayName = "MultiSearchSelect";
