import React, { useId, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { evaluate, getValueByPath } from "@jet-admin/expression-engine";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@jet-admin/ui";
import { SegmentedControl } from "./SegmentedControl";

export const CONDITION_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "gt", label: "greater than" },
  { value: "gte", label: "greater or equal" },
  { value: "lt", label: "less than" },
  { value: "lte", label: "less or equal" },
  { value: "in", label: "in list" },
  { value: "not_in", label: "not in list" },
  { value: "matches", label: "matches regex" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
  { value: "truthy", label: "is truthy" },
  { value: "falsy", label: "is falsy" },
];

const UNARY = new Set(["is_empty", "is_not_empty", "truthy", "falsy"]);

const readPath = (source, path) => {
  if (!source || !path) return undefined;
  if (String(path).includes("{{")) return undefined;
  return String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .reduce((cursor, key) => (cursor === null || cursor === undefined ? undefined : cursor[key]), source);
};

const resolveValue = (raw, context) => {
  if (typeof raw !== "string") return raw;
  const value = raw.trim();
  if (!value) return "";
  if (value.includes("{{")) {
    try {
      return evaluate(value, context || {}, { mode: "js-template", allowedRoots: ["state", "row", "event", "item"] });
    } catch {
      return "";
    }
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
};

const asList = (value) =>
  Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

export const evaluateCondition = (rule, context = {}) => {
  if (!rule?.field || !rule?.operator) return false;
  let left;
  try {
    left = String(rule.field).includes("{{")
      ? evaluate(rule.field, context, { mode: "js-template", allowedRoots: ["state", "row", "event", "item"] })
      : readPath(context, rule.field) ?? getValueByPath(context, rule.field);
  } catch {
    left = undefined;
  }
  const right = resolveValue(rule.value, context);

  switch (rule.operator) {
    case "equals":
      return String(left) === String(right);
    case "not_equals":
      return String(left) !== String(right);
    case "contains":
      return Array.isArray(left) ? left.some((item) => String(item) === String(right)) : String(left ?? "").includes(String(right ?? ""));
    case "not_contains":
      return Array.isArray(left) ? !left.some((item) => String(item) === String(right)) : !String(left ?? "").includes(String(right ?? ""));
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      return asList(right).map(String).includes(String(left));
    case "not_in":
      return !asList(right).map(String).includes(String(left));
    case "matches":
      try {
        return new RegExp(String(right ?? "")).test(String(left ?? ""));
      } catch {
        return false;
      }
    case "is_empty":
      return left === undefined || left === null || left === "";
    case "is_not_empty":
      return !(left === undefined || left === null || left === "");
    case "truthy":
      return !!left;
    case "falsy":
      return !left;
    default:
      return false;
  }
};

export const evaluateConditions = (condition, context = {}) => {
  const normalized = Array.isArray(condition) ? { logic: "and", rules: condition } : condition || {};
  const rules = Array.isArray(normalized.rules) ? normalized.rules : [];
  if (!rules.length) return true;
  return normalized.logic === "or"
    ? rules.some((rule) => evaluateCondition(rule, context))
    : rules.every((rule) => evaluateCondition(rule, context));
};

/**
 * ConditionBuilder — reusable rule rows for visibility and conditional style.
 * Stores `{ logic: "and"|"or", rules: [{ field, operator, value }] }`.
 */
export const ConditionBuilder = ({
  value,
  onChange,
  fields = [],
  emptyLabel = "No conditions — always applies.",
  className,
}) => {
  const baseId = useId().replace(/:/g, "");
  const normalized = useMemo(
    () => (Array.isArray(value) ? { logic: "and", rules: value } : value || { logic: "and", rules: [] }),
    [value]
  );
  const rules = Array.isArray(normalized.rules) ? normalized.rules : [];

  const commit = (next) => onChange?.(next);
  const updateRule = (index, patch) => {
    commit({
      ...normalized,
      rules: rules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)),
    });
  };

  return (
    <div className={cn("space-y-1.5", className)} data-condition-builder>
      {rules.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Match</span>
          <SegmentedControl
            size="sm"
            ariaLabel="Condition logic"
            value={normalized.logic || "and"}
            onChange={(logic) => commit({ ...normalized, logic })}
            options={[
              { value: "and", label: "All" },
              { value: "or", label: "Any" },
            ]}
            className="max-w-[140px]"
          />
        </div>
      )}

      {rules.length === 0 && (
        <div className="rounded-control border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
          {emptyLabel}
        </div>
      )}

      {rules.map((rule, index) => {
        const fieldId = `${baseId}-field-${index}`;
        const operatorId = `${baseId}-operator-${index}`;
        const valueId = `${baseId}-value-${index}`;
        const unary = UNARY.has(rule.operator);
        return (
          <div key={index} className="rounded-control border border-border/80 bg-background/50 p-1.5">
            <div className="flex items-start gap-1">
              <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <label htmlFor={fieldId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Field
                  </label>
                  <Input
                    id={fieldId}
                    list={`${baseId}-field-options`}
                    value={rule.field ?? ""}
                    onChange={(event) => updateRule(index, { field: event.target.value })}
                    placeholder="row.status"
                    className="h-7 font-mono text-[11px]"
                  />
                  <datalist id={`${baseId}-field-options`}>
                    {fields.map((field) => (
                      <option key={field} value={field} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-0.5">
                  <label htmlFor={operatorId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Operator
                  </label>
                  <Select value={rule.operator || "equals"} onValueChange={(operator) => updateRule(index, { operator })}>
                    <SelectTrigger id={operatorId} className="h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPERATORS.map((operator) => (
                        <SelectItem key={operator.value} value={operator.value}>
                          {operator.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-4 h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => commit({ ...normalized, rules: rules.filter((_, ruleIndex) => ruleIndex !== index) })}
                aria-label="Remove condition"
                title="Remove condition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {!unary && (
              <div className="mt-1 space-y-0.5">
                <label htmlFor={valueId} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Value
                </label>
                <Input
                  id={valueId}
                  value={rule.value ?? ""}
                  onChange={(event) => updateRule(index, { value: event.target.value })}
                  placeholder={rule.operator === "in" || rule.operator === "not_in" ? "a, b, c" : "value or {{ state.… }}"}
                  className="h-7 font-mono text-[11px]"
                />
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 w-full text-[11px]"
        onClick={() => commit({ ...normalized, rules: [...rules, { field: "", operator: "equals", value: "" }] })}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add condition
      </Button>
    </div>
  );
};

export default ConditionBuilder;
