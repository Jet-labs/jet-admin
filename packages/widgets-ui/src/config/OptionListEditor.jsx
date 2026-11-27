import React, { useId, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Textarea,
  cn,
} from "@jet-admin/ui";

const toItem = (item, labelKey, valueKey) => {
  if (item === null || item === undefined) return { [labelKey]: "", [valueKey]: "" };
  if (typeof item === "object" && !Array.isArray(item)) return { ...item };
  return { [labelKey]: String(item), [valueKey]: item };
};

const uniqueValue = (base, items, valueKey) => {
  const existing = new Set(items.map((item) => String(item?.[valueKey] ?? "")));
  let candidate = base;
  let index = 2;
  while (existing.has(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }
  return candidate;
};

const parsePasted = (text, labelKey, valueKey) => {
  const raw = String(text || "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => toItem(item, labelKey, valueKey));
    }
  } catch {
    /* fall through to CSV */
  }
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");
  const first = lines[0]?.toLowerCase() || "";
  const start = first.includes("label") && first.includes("value") ? 1 : 0;
  return lines.slice(start).map((line) => {
    const [label, value = label, description = ""] = line.split(",").map((part) => part.trim());
    return { [labelKey]: label, [valueKey]: value, description };
  });
};

/**
 * OptionListEditor
 *
 * Drag-reorderable array editor with add / duplicate / delete / collapse,
 * per-item enable, and bulk JSON/CSV paste. Used for select options, radio
 * options, tabs, columns and form fields as they migrate to the kit.
 */
export const OptionListEditor = ({
  value = [],
  onChange,
  labelKey = "label",
  valueKey = "value",
  itemLabel = "Option",
  allowDescription = false,
  allowGroup = false,
  allowDisabled = true,
  renderFields,
  getPreview,
  showValue = true,
  minItems = 0,
  className,
}) => {
  const baseId = useId().replace(/:/g, "");
  const items = useMemo(() => (Array.isArray(value) ? value.map((item) => toItem(item, labelKey, valueKey)) : []), [value, labelKey, valueKey]);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const commit = (next) => onChange?.(next);

  const updateItem = (index, key, nextValue) => {
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item));
    commit(next);
  };

  const addItem = () => {
    const label = `${itemLabel} ${items.length + 1}`;
    const nextValue = uniqueValue(label.toLowerCase().replace(/\s+/g, "_"), items, valueKey);
    commit([...items, { [labelKey]: label, [valueKey]: nextValue }]);
  };

  const removeItem = (index) => {
    if (items.length <= minItems) return;
    commit(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const duplicateItem = (index) => {
    const source = items[index];
    const copy = { ...source, [labelKey]: `${source?.[labelKey] ?? "Option"} copy` };
    copy[valueKey] = uniqueValue(`${source?.[valueKey] ?? "option"}_copy`, items, valueKey);
    const next = [...items];
    next.splice(index + 1, 0, copy);
    commit(next);
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    commit(next);
  };

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    commit(next);
  };

  const toggleCollapsed = (index) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const errors = useMemo(() => {
    const seen = new Map();
    return items.map((item) => {
      const label = String(item?.[labelKey] ?? "").trim();
      const itemValue = String(item?.[valueKey] ?? "").trim();
      if (!label) return "Label is required.";
      if (showValue && !itemValue) return "Value is required.";
      if (showValue && seen.has(itemValue)) return "Duplicate value.";
      if (showValue) seen.set(itemValue, true);
      return "";
    });
  }, [items, labelKey, valueKey, showValue]);

  const applyPaste = () => {
    const parsed = parsePasted(pasteText, labelKey, valueKey);
    if (parsed.length) commit(parsed);
    setPasteText("");
    setPasteOpen(false);
  };

  return (
    <div className={cn("space-y-1.5", className)} data-option-list>
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
        <div className="flex items-center gap-1">
          <Popover open={pasteOpen} onOpenChange={setPasteOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" title="Paste from JSON or CSV">
                <ClipboardPaste className="mr-1 h-3 w-3" />
                Paste
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-2">
              <p className="mb-1 text-[11px] font-medium text-foreground">Paste JSON or CSV</p>
              <p className="mb-2 text-[10px] text-muted-foreground">
                JSON array, or one `label,value` pair per line.
              </p>
              <Textarea
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                rows={5}
                placeholder={'[{"label":"Active","value":"active"}]\n\nActive,active\nArchived,archived'}
                className="font-mono text-[11px]"
              />
              <div className="mt-2 flex justify-end gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setPasteOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyPaste} disabled={!pasteText.trim()}>
                  Replace list
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button type="button" variant="outline" size="sm" className="h-6 px-1.5 text-[10px]" onClick={addItem}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-control border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
          No {itemLabel.toLowerCase()} entries yet. Add one or paste a list.
        </div>
      )}

      <div className="space-y-1">
        {items.map((item, index) => {
          const isCollapsed = collapsed.has(index);
          const labelId = `${baseId}-${index}-label`;
          const valueId = `${baseId}-${index}-value`;
          const descId = `${baseId}-${index}-description`;
          const groupId = `${baseId}-${index}-group`;
          return (
            <div
              key={index}
              onDragOver={(event) => {
                if (dragIndex === null) return;
                event.preventDefault();
                setOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(index);
              }}
              className={cn(
                "rounded-control border bg-background/50 transition-colors",
                overIndex === index && dragIndex !== null ? "border-primary/60" : "border-border/80",
                item?.disabled && "opacity-60"
              )}
            >
              <div className="flex items-center gap-1 px-1.5 py-1">
                <span
                  draggable
                  onDragStart={(event) => {
                    setDragIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => toggleCollapsed(index)}
                  className="flex min-w-0 flex-1 items-center gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-expanded={!isCollapsed}
                  aria-controls={`${baseId}-${index}-body`}
                >
                  {isCollapsed ? <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  <span className="truncate text-[11px] font-medium text-foreground">
                    {getPreview ? getPreview(item) : String(item?.[labelKey] ?? "") || `Untitled ${itemLabel.toLowerCase()}`}
                  </span>
                  {showValue && !isCollapsed && (
                    <span className="truncate font-mono text-[9px] text-muted-foreground">({String(item?.[valueKey] ?? "")})</span>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  {allowDisabled && (
                    <Switch
                      checked={!item?.disabled}
                      onCheckedChange={(checked) => updateItem(index, "disabled", !checked)}
                      className="h-[14px] w-[26px] [&>span]:h-2.5 [&>span]:w-2.5 data-[state=checked]:[&>span]:translate-x-3"
                      aria-label={`${item?.[labelKey] || itemLabel} enabled`}
                      title={item?.disabled ? "Enable" : "Disable"}
                    />
                  )}
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label="Move down" title="Move down">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateItem(index)} aria-label="Duplicate" title="Duplicate">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= minItems}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!isCollapsed && (
                <div id={`${baseId}-${index}-body`} className="space-y-1.5 border-t border-border/60 px-1.5 py-1.5">
                  {renderFields ? (
                    renderFields(item, index, updateItem, { labelId, valueId, descId, groupId })
                  ) : (
                    <>
                  <div className={cn("grid gap-1.5", showValue ? "grid-cols-2" : "grid-cols-1")}>
                    <div className="space-y-0.5">
                      <label htmlFor={labelId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Label
                      </label>
                      <Input
                        id={labelId}
                        value={item?.[labelKey] ?? ""}
                        onChange={(event) => updateItem(index, labelKey, event.target.value)}
                        className="h-7 text-[11px]"
                        placeholder="Label"
                        aria-invalid={!!errors[index] || undefined}
                      />
                    </div>
                    {showValue && (
                      <div className="space-y-0.5">
                        <label htmlFor={valueId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          Value
                        </label>
                        <Input
                          id={valueId}
                          value={item?.[valueKey] ?? ""}
                          onChange={(event) => updateItem(index, valueKey, event.target.value)}
                          className="h-7 font-mono text-[11px]"
                          placeholder="value"
                          aria-invalid={!!errors[index] || undefined}
                        />
                      </div>
                    )}
                  </div>
                  {allowDescription && (
                    <div className="space-y-0.5">
                      <label htmlFor={descId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Description
                      </label>
                      <Input
                        id={descId}
                        value={item?.description ?? ""}
                        onChange={(event) => updateItem(index, "description", event.target.value)}
                        className="h-7 text-[11px]"
                        placeholder="Optional helper"
                      />
                    </div>
                  )}
                  {allowGroup && (
                    <div className="space-y-0.5">
                      <label htmlFor={groupId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Group
                      </label>
                      <Input
                        id={groupId}
                        value={item?.group ?? ""}
                        onChange={(event) => updateItem(index, "group", event.target.value)}
                        className="h-7 text-[11px]"
                        placeholder="Optional group heading"
                      />
                    </div>
                  )}
                    </>
                  )}
                  {errors[index] && (
                    <p role="alert" className="flex items-center gap-1 text-[10px] text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors[index]}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OptionListEditor;
