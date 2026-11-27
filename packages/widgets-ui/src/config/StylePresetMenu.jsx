import React, { useMemo, useState } from "react";
import { Check, Copy, Palette, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@jet-admin/ui";

const BUILT_IN_PRESETS = {
  default: { label: "Default", style: {} },
  subtle: {
    label: "Subtle",
    style: {
      backgroundColor: "hsl(var(--muted) / 0.35)",
      borderColor: "hsl(var(--border))",
      borderRadius: "var(--radius-card)",
      boxShadow: "none",
    },
  },
  outlined: {
    label: "Outlined",
    style: {
      backgroundColor: "transparent",
      borderWidth: "1px",
      borderColor: "hsl(var(--border))",
      boxShadow: "none",
    },
  },
  filled: {
    label: "Filled",
    style: {
      backgroundColor: "hsl(var(--muted))",
      borderColor: "transparent",
    },
  },
  ghost: {
    label: "Ghost",
    style: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      boxShadow: "none",
    },
  },
};

/**
 * StylePresetMenu — named style bundles plus copy/paste and per-browser
 * custom presets. Presets only contain token-backed values; applying one
 * merges into `properties.style` so existing overrides survive.
 */
export const StylePresetMenu = ({
  currentStyle = {},
  onApply,
  onCopyStyle,
  onApplyToAll,
  storageKey = "jet.widget.stylePresets",
  className,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [copied, setCopied] = useState(false);
  const [customPresets, setCustomPresets] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });

  const presets = useMemo(
    () => ({
      ...Object.fromEntries(Object.entries(BUILT_IN_PRESETS).map(([key, preset]) => [key, preset])),
      ...customPresets,
    }),
    [customPresets]
  );

  const saveCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const next = { ...customPresets, [name]: { label: name, style: currentStyle || {}, custom: true } };
    setCustomPresets(next);
    setCustomName("");
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore unavailable storage */
    }
  };

  const deleteCustom = (name) => {
    const next = { ...customPresets };
    delete next[name];
    setCustomPresets(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const copyStyle = async () => {
    try {
      if (onCopyStyle) onCopyStyle();
      else await navigator.clipboard.writeText(JSON.stringify(currentStyle || {}, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-7 gap-1 px-2 text-[11px]", className)}
          disabled={disabled}
          aria-label="Style presets"
        >
          <Palette className="h-3.5 w-3.5" />
          Presets
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Apply preset</p>
        <div className="space-y-0.5">
          {Object.entries(presets).map(([key, preset]) => (
            <div key={key} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onApply?.(preset.style || {}, key);
                  setOpen(false);
                }}
                className="flex h-7 min-w-0 flex-1 items-center justify-between rounded-control px-1.5 text-left text-[11px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span className="truncate">{preset.label || key}</span>
                <span className="ml-1 shrink-0 text-[9px] text-muted-foreground">{preset.custom ? "custom" : "built-in"}</span>
              </button>
              {preset.custom && (
                <button
                  type="button"
                  onClick={() => deleteCustom(key)}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete ${preset.label || key} preset`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 border-t border-border/60 pt-2">
          <label htmlFor="config-preset-name" className="text-[10px] text-muted-foreground">
            Save current style as
          </label>
          <div className="mt-1 flex gap-1">
            <Input
              id="config-preset-name"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveCustom();
              }}
              placeholder="Preset name"
              className="h-7 text-[11px]"
            />
            <Button type="button" size="icon" className="h-7 w-7 shrink-0" onClick={saveCustom} disabled={!customName.trim()} aria-label="Save preset" title="Save preset">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 border-t border-border/60 pt-2">
          <Button type="button" variant="ghost" size="sm" className="h-7 flex-1 gap-1 text-[10px]" onClick={copyStyle}>
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy style"}
          </Button>
          {onApplyToAll && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 flex-1 text-[10px]"
              onClick={() => {
                onApplyToAll(currentStyle || {});
                setOpen(false);
              }}
            >
              Apply to all
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StylePresetMenu;
