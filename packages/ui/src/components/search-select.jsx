import * as React from "react";
import { Check, ChevronDown, Search, Loader2 } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { Input } from "./input";
import { cn } from "../lib/utils";

const searchSelectVariants = cva(
  "flex w-full items-center justify-between rounded border border-input-custom bg-input-custom text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-border/80 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5 py-1.5 text-sm",
        sm: "h-7 px-2 py-1 text-xs",
        lg: "h-10 px-3 py-2 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export const SearchSelect = React.forwardRef(
  (
    {
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
      selectedLabel,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [localQuery, setLocalQuery] = React.useState("");
    const searchInputRef = React.useRef(null);

    // Reset local search query when select closes
    React.useEffect(() => {
      if (!open) {
        setLocalQuery("");
        if (onSearchChange) {
          onSearchChange("");
        }
      } else {
        // Auto-focus search input when opened
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

    // Filter options locally if no external search handler is provided
    const filteredOptions = React.useMemo(() => {
      if (onSearchChange) {
        return options;
      }
      if (!localQuery) {
        return options;
      }
      return options.filter((option) =>
        option.label.toLowerCase().includes(localQuery.toLowerCase())
      );
    }, [options, localQuery, onSearchChange]);

    const selectedOption = React.useMemo(() => {
      return options.find((opt) => opt.value === value);
    }, [options, value]);

    return (
      <SelectPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        value={value === "" ? "___EMPTY___" : (value || undefined)}
        onValueChange={(val) => {
          onChange(val === "___EMPTY___" ? "" : val);
        }}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(searchSelectVariants({ size }), className)}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : (selectedLabel || placeholder)}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </button>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchInputRef.current?.focus();
            }}
            className="relative z-[1200] max-h-96 min-w-[200px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded border border-border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
          >
            <div
              className="border-b border-border/50 p-2"
              onKeyDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
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

            <SelectPrimitive.Viewport
              onScroll={handleScroll}
              className="max-h-[220px] overflow-y-auto p-1 space-y-0.5"
            >
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
                <>
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    const itemValue = option.value === "" ? "___EMPTY___" : option.value;
                    return (
                      <SelectPrimitive.Item
                        key={option.value}
                        value={itemValue}
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm text-left outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                          isSelected && "font-medium"
                        )}
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4 text-primary" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                          <span className="truncate">{option.label}</span>
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    );
                  })}
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center p-2 text-[10px] text-muted-foreground animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Loading more...
                    </div>
                  )}
                </>
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

SearchSelect.displayName = "SearchSelect";
