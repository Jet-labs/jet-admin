import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import {
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  WidgetBusy,
  WidgetSurface,
  cn,
} from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const coerce = (value) => (value === null || value === undefined ? "" : String(value));

const normalizeOptions = (widgetConfig) => {
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
      return { label: String(option), value: option, description: "", group: "", disabled: false };
    })
    .filter((option) => coerce(option.value) !== "");
};

/**
 * MultiSelectWidget — pick N options. State: widgetState.value (array).
 */
export const MultiSelectWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Select options...";
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const required = normalizeFieldBoolean(widgetConfig?.required, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const showSelectAll = normalizeFieldBoolean(widgetConfig?.showSelectAll, false);
  const asyncOptions = normalizeFieldBoolean(widgetConfig?.asyncOptions, false);
  const optionsPageSize = Math.max(1, Number(widgetConfig?.optionsPageSize) || 50);
  const maxRenderedOptions = Math.max(20, Number(widgetConfig?.maxRenderedOptions) || 200);
  const maxSelected = Number(widgetConfig?.maxSelected) > 0 ? Number(widgetConfig.maxSelected) : null;
  const maxChips = Math.max(1, Number(widgetConfig?.maxChips) || 3);
  const size = widgetConfig?.size || "default";
  const labelPosition = widgetConfig?.labelPosition || "top";
  const density = widgetConfig?.properties?.density || "comfortable";
  const reactId = useId();
  const id = `multi-select-${reactId.replace(/:/g, "")}`;
  const labelId = `${id}-label`;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionPage, setOptionPage] = useState(1);
  const filterTimerRef = useRef(null);

  const options = useMemo(() => normalizeOptions(widgetConfig), [widgetConfig]);
  const value = useMemo(() => {
    const current = widgetState?.value ?? widgetConfig?.defaultValue ?? [];
    if (Array.isArray(current)) return current;
    if (typeof current === "string") return current.split(",").map((item) => item.trim()).filter(Boolean);
    return [];
  }, [widgetState?.value, widgetConfig?.defaultValue]);

  const selectedOptions = value.map((item) => options.find((option) => coerce(option.value) === coerce(item)) || {
    label: String(item),
    value: item,
    disabled: false,
  });
  const overflow = Math.max(0, selectedOptions.length - maxChips);
  const summary = selectedOptions.slice(0, maxChips);

  const loadOptions = async (page, term) => {
    if (!asyncOptions || !fireWidgetEvent) return;
    setLoadingOptions(true);
    try {
      await fireWidgetEvent("onLoadOptions", { searchTerm: term, page, pageSize: optionsPageSize });
      setOptionPage(page);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFilter("");
      setOptionPage(1);
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    } else if (asyncOptions) {
      loadOptions(1, "");
    }
    liveRef.current.fireWidgetEvent?.(nextOpen ? "onOpen" : "onClose", { value });
  };

  useEffect(() => () => {
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
  }, []);

  useEffect(() => {
    if (widgetState?.value === undefined && Array.isArray(widgetConfig?.defaultValue)) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent };
  const commit = (next) => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: next }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: next });
  };
  const clear = () => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: [] }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onClear", { value: [] });
  };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (nextValue) => {
        const arr = Array.isArray(nextValue) ? nextValue : [nextValue];
        commit(maxSelected ? arr.slice(0, maxSelected) : arr);
      },
      clear,
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const toggle = (option) => {
    if (disabled || readOnly || option.disabled) return;
    const exists = value.map(coerce).includes(coerce(option.value));
    if (exists) {
      commit(value.filter((item) => coerce(item) !== coerce(option.value)));
      return;
    }
    if (maxSelected && value.length >= maxSelected) return;
    commit([...value, option.value]);
  };

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => `${option.label} ${option.description} ${option.group}`.toLowerCase().includes(term));
  }, [options, filter]);
  const visibleOptions = filtered.slice(0, maxRenderedOptions);
  const hiddenOptionCount = Math.max(0, filtered.length - visibleOptions.length);

  const enabledValues = filtered.filter((option) => !option.disabled).map((option) => option.value);
  const allSelected = enabledValues.length > 0 && enabledValues.every((item) => value.map(coerce).includes(coerce(item)));
  const toggleAll = () => {
    if (allSelected) {
      commit(value.filter((item) => !enabledValues.map(coerce).includes(coerce(item))));
    } else {
      const next = [...value];
      for (const optionValue of enabledValues) {
        if (!next.map(coerce).includes(coerce(optionValue))) next.push(optionValue);
        if (maxSelected && next.length >= maxSelected) break;
      }
      commit(next);
    }
  };

  const sizeClass = size === "sm" ? "min-h-7 px-2 text-xs" : size === "lg" ? "min-h-10 px-3 text-sm" : "min-h-8 px-2.5 text-sm";
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
      {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
    </Label>
  ) : null;

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full flex-col", labelPosition === "left" ? "gap-2" : "gap-1.5")}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <WidgetBusy label="Updating…" />}
      <div className={cn("flex w-full min-w-0", labelPosition === "left" ? "flex-row items-start gap-2" : "flex-col gap-1.5")}>
        {labelNode}
        <div className="flex min-w-0 flex-1 items-start gap-1">
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <button
                id={id}
                type="button"
                disabled={disabled || readOnly}
                aria-labelledby={label ? labelId : undefined}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-required={required || undefined}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-control border border-input-custom bg-input-custom py-1 text-left text-foreground transition-shadow focus-visible:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
                  sizeClass
                )}
              >
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                  {summary.length === 0 ? (
                    <span className="truncate text-muted-foreground">{placeholder}</span>
                  ) : (
                    <>
                      {summary.map((option) => (
                        <span
                          key={coerce(option.value)}
                          className="max-w-full truncate rounded-control border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-foreground"
                        >
                          {option.label}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span
                          className="rounded-control border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          title={selectedOptions.slice(maxChips).map((option) => option.label).join(", ")}
                        >
                          +{overflow}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
              <div className="relative mb-1">
                <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
                <Input
                  autoFocus
                  value={filter}
                  onChange={(event) => {
                    const nextFilter = event.target.value;
                    setFilter(nextFilter);
                    if (asyncOptions) {
                      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
                      filterTimerRef.current = setTimeout(() => {
                        filterTimerRef.current = null;
                        loadOptions(1, nextFilter);
                      }, 250);
                    }
                  }}
                  placeholder={widgetConfig?.searchPlaceholder || "Filter…"}
                  aria-label={widgetConfig?.searchPlaceholder || "Filter options"}
                  className="h-7 pl-7 text-xs"
                />
                {loadingOptions && <Loader2 className="absolute right-2 top-1.5 h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />}
              </div>
              {showSelectAll && (
                <label className="flex items-center gap-2 rounded-control px-2 py-1.5 text-[11px] text-foreground hover:bg-muted/60">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all options"
                  />
                  Select all
                </label>
              )}
              <div role="listbox" aria-multiselectable="true" className="max-h-56 overflow-auto">
                {filtered.length === 0 && !loadingOptions && <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">{widgetConfig?.emptyText || "No options"}</p>}
                {loadingOptions && filtered.length === 0 && (
                  <p className="flex items-center justify-center gap-1.5 px-2 py-3 text-[11px] text-muted-foreground" role="status">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Loading options…
                  </p>
                )}
                {visibleOptions.map((option) => {
                  const selected = value.map(coerce).includes(coerce(option.value));
                  const atLimit = !selected && maxSelected && value.length >= maxSelected;
                  return (
                    <label
                      key={coerce(option.value)}
                      className={cn(
                        "flex cursor-pointer items-start gap-2 rounded-control px-2 py-1.5 text-xs text-foreground",
                        (option.disabled || atLimit) ? "cursor-not-allowed opacity-50" : "hover:bg-muted/60"
                      )}
                      title={atLimit ? `Maximum ${maxSelected} selections` : undefined}
                    >
                      <Checkbox
                        checked={selected}
                        disabled={option.disabled || atLimit}
                        onCheckedChange={() => toggle(option)}
                        aria-label={option.label}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{option.label}</span>
                        {option.description && <span className="block truncate text-[10px] text-muted-foreground">{option.description}</span>}
                      </span>
                      {selected && <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />}
                    </label>
                  );
                })}
                {hiddenOptionCount > 0 && (
                  <p className="px-2 py-2 text-center text-[10px] text-muted-foreground">
                    {hiddenOptionCount} more option{hiddenOptionCount === 1 ? "" : "s"} hidden. Refine the search or load the next page.
                  </p>
                )}
                {asyncOptions && (
                  <button
                    type="button"
                    onClick={() => loadOptions(optionPage + 1, filter)}
                    disabled={loadingOptions}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-control border border-border bg-background px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
                  >
                    {loadingOptions ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
                    {widgetConfig?.loadMoreLabel || "Load more"}
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {value.length > 0 && !disabled && !readOnly && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Clear selections"
              title="Clear selections"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {maxSelected && (
        <p className="text-[10px] text-muted-foreground" aria-live="polite">
          {value.length}/{maxSelected} selected
        </p>
      )}
    </WidgetSurface>
  );
};

MultiSelectWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default MultiSelectWidget;
