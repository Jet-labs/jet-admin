import React from "react";
import PropTypes from "prop-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import { ConditionBuilder } from "./ConditionBuilder";

/**
 * Conditional style rule editor: conditions plus a token tone/emphasis.
 * Value shape: { logic, rules, style: { tone, emphasis } }.
 */
export const ConditionalStyleField = ({
  value,
  onChange,
  fields = [],
  emptyLabel = "No rules — use the default style.",
  conditionLabel = "When",
}) => {
  const normalized = value && typeof value === "object" ? value : { logic: "and", rules: [], style: {} };
  const style = normalized.style || {};
  const patch = (next) => onChange?.(next);

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{conditionLabel}</p>
      <ConditionBuilder
        value={normalized}
        onChange={(next) => patch({ ...next, style })}
        fields={fields}
        emptyLabel={emptyLabel}
      />
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Tone</label>
          <Select
            value={style.tone || "neutral"}
            onValueChange={(tone) => patch({ ...normalized, style: { ...style, tone } })}
          >
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="danger">Danger</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Emphasis</label>
          <Select
            value={style.emphasis || "normal"}
            onValueChange={(emphasis) => patch({ ...normalized, style: { ...style, emphasis } })}
          >
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

ConditionalStyleField.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  fields: PropTypes.arrayOf(PropTypes.string),
  emptyLabel: PropTypes.string,
  conditionLabel: PropTypes.string,
};

export default ConditionalStyleField;
