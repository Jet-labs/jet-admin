import React, { useMemo, useState } from "react";
import { Link, Link2Off } from "lucide-react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from "@jet-admin/ui";

const SIDES = ["top", "right", "bottom", "left"];
const UNITS = ["px", "rem", "%"];

const parseSpacing = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return { sides: { top: "", right: "", bottom: "", left: "" }, unit: "px", linked: true };
  const parts = raw.split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return null;
  const matches = parts.map((part) => part.match(/^(-?\d*\.?\d+)(px|rem|%)$/));
  if (matches.some((match) => !match)) return null;
  const unit = matches[0][2];
  if (matches.some((match) => match[2] !== unit)) return null;
  const numbers = matches.map((match) => match[1]);
  let top;
  let right;
  let bottom;
  let left;
  if (numbers.length === 1) {
    [top, right, bottom, left] = [numbers[0], numbers[0], numbers[0], numbers[0]];
  } else if (numbers.length === 2) {
    [top, right, bottom, left] = [numbers[0], numbers[1], numbers[0], numbers[1]];
  } else if (numbers.length === 3) {
    [top, right, bottom, left] = [numbers[0], numbers[1], numbers[2], numbers[1]];
  } else {
    [top, right, bottom, left] = numbers;
  }
  return {
    sides: { top, right, bottom, left },
    unit,
    linked: top === right && right === bottom && bottom === left,
  };
};

const formatSpacing = (sides, unit) => {
  const values = SIDES.map((side) => sides[side]);
  if (values.every((value) => value === "")) return "";
  if (sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left) {
    return `${sides.top}${unit}`;
  }
  if (sides.top === sides.bottom && sides.right === sides.left) {
    return `${sides.top}${unit} ${sides.right}${unit}`;
  }
  return SIDES.map((side) => `${sides[side] || 0}${unit}`).join(" ");
};

/**
 * SpacingField — four-side box with a link toggle and inline units.
 * Stores a CSS shorthand string so existing `properties.style.padding`
 * consumers keep working.
 */
export const SpacingField = ({
  id,
  value = "",
  onChange,
  label = "Spacing",
  ariaDescribedBy,
  disabled = false,
  className,
}) => {
  const parsed = useMemo(() => parseSpacing(value), [value]);
  const [rawMode, setRawMode] = useState(false);
  const [linkedOverride, setLinkedOverride] = useState(null);

  if (!parsed || rawMode) {
    return (
      <div className={cn("space-y-1", className)}>
        <Input
          id={id}
          type="text"
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="8px 12px"
          disabled={disabled}
          aria-label={`${label} CSS value`}
          aria-describedby={ariaDescribedBy}
          className="h-8 font-mono text-xs"
        />
        {parsed === null && (
          <button
            type="button"
            onClick={() => setRawMode(false)}
            className="text-[10px] text-primary underline-offset-2 hover:underline"
          >
            Use side editor
          </button>
        )}
      </div>
    );
  }

  const linked = linkedOverride === null ? parsed.linked : linkedOverride;

  const updateSide = (side, nextValue) => {
    const nextSides = linked
      ? { top: nextValue, right: nextValue, bottom: nextValue, left: nextValue }
      : { ...parsed.sides, [side]: nextValue };
    onChange?.(formatSpacing(nextSides, parsed.unit));
  };

  const updateUnit = (nextUnit) => {
    onChange?.(formatSpacing(parsed.sides, nextUnit));
  };

  const toggleLink = () => {
    if (linked) {
      setLinkedOverride(false);
      return;
    }
    const first = parsed.sides.top || "0";
    setLinkedOverride(true);
    onChange?.(formatSpacing({ top: first, right: first, bottom: first, left: first }, parsed.unit));
  };

  return (
    <div className={cn("rounded-control border border-border bg-background/40 p-2", className)} data-spacing-field>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Box</span>
        <div className="flex items-center gap-1">
          <Select value={parsed.unit} onValueChange={updateUnit} disabled={disabled}>
            <SelectTrigger className="h-6 w-16 text-[10px]" aria-label={`${label} unit`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={toggleLink}
            disabled={disabled}
            aria-pressed={linked}
            title={linked ? "Unlink sides" : "Link all sides"}
            aria-label={linked ? "Unlink sides" : "Link all sides"}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-control border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              linked
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {linked ? <Link className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {SIDES.map((side) => (
          <label key={side} className="flex items-center gap-1">
            <span className="w-7 shrink-0 text-[9px] uppercase text-muted-foreground">{side.slice(0, 1)}</span>
            <Input
              type="number"
              inputMode="decimal"
              value={parsed.sides[side]}
              onChange={(event) => updateSide(side, event.target.value)}
              disabled={disabled}
              aria-label={`${label} ${side}`}
              aria-describedby={ariaDescribedBy}
              className="h-7 min-w-0 flex-1 px-1.5 text-[11px] tabular-nums"
              step="any"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default SpacingField;
