import React, { useState } from "react";
import { X } from "lucide-react";
import { Input, cn } from "@jet-admin/ui";

/**
 * TagField — compact chip editor for arrays of primitive values.
 * Enter/comma commits, Backspace on an empty input removes the last chip.
 */
export const TagField = ({
  id,
  value = [],
  onChange,
  placeholder = "Type and press Enter",
  disabled = false,
  className,
}) => {
  const [draft, setDraft] = useState("");
  const values = Array.isArray(value) ? value : [];

  const commit = () => {
    const next = draft.trim();
    if (!next) return;
    if (!values.map(String).includes(next)) onChange?.([...values, next]);
    setDraft("");
  };

  const removeAt = (index) => {
    onChange?.(values.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className={cn("space-y-1", className)}>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((item, index) => (
            <span
              key={`${String(item)}-${index}`}
              className="inline-flex max-w-full items-center gap-1 rounded-control border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-foreground"
            >
              <span className="truncate">{String(item)}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
                aria-label={`Remove ${String(item)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          } else if (event.key === "Backspace" && !draft && values.length) {
            removeAt(values.length - 1);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-8 text-xs"
      />
    </div>
  );
};

export default TagField;
