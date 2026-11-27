import React, { useState } from "react";
import { Check, Pipette, Trash2 } from "lucide-react";
import { Button, Input, Popover, PopoverContent, PopoverTrigger, cn } from "@jet-admin/ui";

const TOKEN_SWATCHES = [
  { label: "Transparent", value: "transparent", css: "transparent" },
  { label: "Canvas", value: "hsl(var(--background))", css: "hsl(var(--background))" },
  { label: "Card", value: "hsl(var(--card))", css: "hsl(var(--card))" },
  { label: "Raised", value: "hsl(var(--surface-raised))", css: "hsl(var(--surface-raised))" },
  { label: "Muted", value: "hsl(var(--muted))", css: "hsl(var(--muted))" },
  { label: "Foreground", value: "hsl(var(--foreground))", css: "hsl(var(--foreground))" },
  { label: "Primary", value: "hsl(var(--primary))", css: "hsl(var(--primary))" },
  { label: "Success", value: "hsl(var(--status-success))", css: "hsl(var(--status-success))" },
  { label: "Warning", value: "hsl(var(--status-warning))", css: "hsl(var(--status-warning))" },
  { label: "Danger", value: "hsl(var(--status-danger))", css: "hsl(var(--status-danger))" },
  { label: "Info", value: "hsl(var(--status-info))", css: "hsl(var(--status-info))" },
  { label: "Border", value: "hsl(var(--border))", css: "hsl(var(--border))" },
];

const isHex = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value || ""));

/**
 * ColorField — token swatches + free-form CSS color input. Values are stored
 * as CSS strings so they resolve through the active theme instead of freezing
 * a light/dark-specific hex.
 */
export const ColorField = ({
  id,
  value = "",
  onChange,
  label = "Color",
  allowClear = true,
  ariaDescribedBy,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const current = value || "transparent";
  const swatchStyle = { backgroundColor: current };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-label={`Choose ${label.toLowerCase()}`}
            aria-describedby={ariaDescribedBy}
            className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
            title={current}
          >
            <span className="absolute inset-1 rounded-control border border-border/70" style={swatchStyle} />
            <Pipette className="relative h-3 w-3 text-foreground/70 mix-blend-difference" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Theme tokens</p>
          <div className="grid grid-cols-4 gap-1.5">
            {TOKEN_SWATCHES.map((token) => {
              const selected = current === token.value;
              return (
                <button
                  key={token.value}
                  type="button"
                  onClick={() => {
                    onChange?.(token.value);
                    setOpen(false);
                  }}
                  title={token.label}
                  aria-label={token.label}
                  aria-pressed={selected}
                  className="group relative flex flex-col items-center gap-1 rounded-control p-1 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span
                    className="h-7 w-full rounded-control border border-border"
                    style={{ backgroundColor: token.css }}
                  />
                  <span className="max-w-full truncate text-[9px] text-muted-foreground">{token.label}</span>
                  {selected && <Check className="absolute right-1 top-1 h-3 w-3 text-foreground drop-shadow" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-border/60 pt-2">
            <input
              type="color"
              aria-label={`Custom ${label.toLowerCase()}`}
              value={isHex(current) ? current : "#7582ff"}
              onChange={(event) => onChange?.(event.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer rounded-control border border-border bg-background p-0.5"
            />
            <span className="text-[10px] text-muted-foreground">or custom hex</span>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="hsl(var(--…))"
        disabled={disabled}
        aria-label={`${label} CSS value`}
        aria-describedby={ariaDescribedBy}
        className="h-8 min-w-0 flex-1 font-mono text-xs"
      />

      {allowClear && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onChange?.("")}
          aria-label={`Clear ${label.toLowerCase()}`}
          title="Clear"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default ColorField;
