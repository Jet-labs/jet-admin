import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  WidgetBusy,
  WidgetSurface,
  cn,
} from "@jet-admin/ui";
import { normalizeFieldBoolean, normalizeOptions } from "../_shared/fieldContracts";

const coerce = (value) => (value === null || value === undefined ? "" : String(value));

const normalizeSelectOptions = (widgetConfig) => {
  const raw = Array.isArray(widgetConfig?.optionsTemplate)
    ? widgetConfig.optionsTemplate
    : Array.isArray(widgetConfig?.options)
      ? widgetConfig.options
      : [];
  const labelKey = widgetConfig?.labelKey || "label";
  const valueKey = widgetConfig?.valueKey || "value";
  return raw
    .map((option) => {
      if (option && typeof option === "object") {
        return {
          label: String(option[labelKey] ?? option.label ?? option.value ?? ""),
          value: option[valueKey] ?? option.value ?? option,
          description: option.description || "",
          group: option.group || "",
          disabled: normalizeFieldBoolean(option.disabled, false),
        };
      }
      const normalized = normalizeOptions([option])[0];
      return { label: normalized.label, value: normalized.value, description: "", group: "", disabled: false };
    })
    .filter((option) => coerce(option.value) !== "");
};

const groupOptions = (options) => {
  const groups = new Map();
  for (const option of options) {
    const key = option.group || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(option);
  }
  return Array.from(groups.entries());
};

const SearchableSelect = ({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  required,
  size,
  onSelect,
  onOpenChange,
  labelId,
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef(null);
  const selected = options.find((option) => coerce(option.value) === coerce(value));

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.description} ${option.group}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [options, filter]);

  useEffect(() => {
    if (open) {
      setFilter("");
      const firstEnabled = options.findIndex((option) => !option.disabled);
      setActiveIndex(firstEnabled < 0 ? 0 : firstEnabled);
    }
  }, [open, options]);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const choose = (option) => {
    if (!option || option.disabled) return;
    onSelect?.(option.value);
    handleOpenChange(false);
    requestAnimationFrame(() => triggerRef.current?.focus?.());
  };

  const enabledIndexes = filtered.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
  const moveActive = (direction) => {
    if (!enabledIndexes.length) return;
    const currentPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition = currentPosition < 0 ? 0 : (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const sizeClass = size === "sm" ? "h-7 px-2 text-xs" : size === "lg" ? "h-10 px-3 text-base" : "h-8 px-2.5 text-sm";
  const grouped = groupOptions(filtered);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby={labelId ? `${labelId} ${id}` : undefined}
            aria-required={required || undefined}
            disabled={disabled || options.length === 0}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-control border border-input-custom bg-input-custom text-left text-foreground transition-shadow focus-visible:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
              sizeClass
            )}
          >
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected?.label || (options.length === 0 ? emptyText || "No options" : placeholder)}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="relative mb-1">
          <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          <Input
            autoFocus
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActive(1);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActive(-1);
              } else if (event.key === "Enter") {
                event.preventDefault();
                choose(filtered[activeIndex]);
              } else if (event.key === "Escape") {
                event.preventDefault();
                handleOpenChange(false);
              }
            }}
            placeholder={searchPlaceholder || "Search…"}
            aria-label={searchPlaceholder || "Search options"}
            className="h-7 pl-7 text-xs"
          />
        </div>

        <div role="listbox" className="max-h-56 overflow-auto" aria-label="Options">
          {filtered.length === 0 && <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">{emptyText || "No options"}</p>}
          {grouped.map(([group, groupItems]) => (
            <div key={group || "__ungrouped"}>
              {group && <p className="px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>}
              {groupItems.map((option) => {
                const index = filtered.indexOf(option);
                const isSelected = coerce(option.value) === coerce(value);
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${coerce(option.value)}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    onClick={() => choose(option)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-control px-2 py-1.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
                      isActive ? "bg-muted" : "hover:bg-muted/60",
                      isSelected && "text-primary"
                    )}
                  >
                    <span className="mt-0.5 w-3 shrink-0">{isSelected ? <Check className="h-3 w-3" /> : null}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && <span className="block truncate text-[10px] text-muted-foreground">{option.description}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * SelectWidget — single-choice dropdown.
 * State: widgetState.value
 */
export const SelectWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Select option...";
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const required = normalizeFieldBoolean(widgetConfig?.required, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const clearable = normalizeFieldBoolean(widgetConfig?.clearable, false);
  const searchable = normalizeFieldBoolean(widgetConfig?.searchable, false);
  const size = widgetConfig?.size || "default";
  const labelPosition = widgetConfig?.labelPosition || "top";
  const density = widgetConfig?.properties?.density || "comfortable";
  const reactId = useId();
  const id = `select-${reactId.replace(/:/g, "")}`;
  const labelId = `${id}-label`;

  const options = useMemo(() => normalizeSelectOptions(widgetConfig), [widgetConfig]);
  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const selected = options.find((option) => coerce(option.value) === coerce(value));

  const handleOpenChange = (open) => {
    if (liveRef.current.fireWidgetEvent) liveRef.current.fireWidgetEvent(open ? "onOpen" : "onClose", { value });
  };

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent };
  const emitChange = (nextValue) => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: nextValue }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: nextValue });
  };
  const emitClear = () => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: "" }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onClear", { value: "" });
  };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (nextValue) => emitChange(nextValue),
      clear: () => emitClear(),
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const sizeClass = size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-10 text-base" : "h-8 text-sm";
  const labelNode = label ? (
    <Label
      id={labelId}
      htmlFor={id}
      className={cn(
        "text-xs font-medium text-foreground",
        labelPosition === "hidden" && "sr-only",
        labelPosition === "left" && "w-1/3 shrink-0 text-right"
      )}
    >
      {label}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  ) : null;

  const clearButton =
    clearable && coerce(value) !== "" ? (
      <button
        type="button"
        onClick={emitClear}
        disabled={disabled}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
        aria-label="Clear selection"
        title="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    ) : null;

  const control = searchable ? (
    <SearchableSelect
      id={id}
      value={value}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={widgetConfig?.searchPlaceholder}
      emptyText={widgetConfig?.emptyText}
      disabled={disabled}
      required={required}
      size={size}
      onSelect={emitChange}
      onOpenChange={handleOpenChange}
      labelId={labelId}
    />
  ) : (
    <Select
      value={coerce(value)}
      onValueChange={emitChange}
      onOpenChange={handleOpenChange}
      disabled={disabled || options.length === 0}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-required={required || undefined}
        aria-labelledby={label ? labelId : undefined}
        className={cn(sizeClass, options.length === 0 && "opacity-60")}
      >
        <SelectValue placeholder={options.length === 0 ? widgetConfig?.emptyText || "No options" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">{widgetConfig?.emptyText || "No options"}</div>}
        {groupOptions(options).map(([group, groupItems]) => (
          <SelectGroup key={group || "__ungrouped"}>
            {group && <SelectLabel className="text-[9px] uppercase tracking-wider">{group}</SelectLabel>}
            {groupItems.map((option, index) => (
              <SelectItem key={`${coerce(option.value)}-${index}`} value={coerce(option.value)} disabled={option.disabled}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.description && <span className="truncate text-[10px] text-muted-foreground">{option.description}</span>}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full flex-col", labelPosition === "left" ? "gap-2" : "gap-1.5")}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className={cn("flex w-full min-w-0", labelPosition === "left" ? "flex-row items-center gap-2" : "flex-col gap-1.5")}>
        {labelNode}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <div className="min-w-0 flex-1">{control}</div>
          {clearButton}
        </div>
      </div>
    </WidgetSurface>
  );
};

SelectWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default SelectWidget;
