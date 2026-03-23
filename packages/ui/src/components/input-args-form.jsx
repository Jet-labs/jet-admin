import React from "react";
import PropTypes from "prop-types";
import { Input } from "./input";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { CodeEditor } from "./code-editor";
import { ArrayInput } from "./array-input";

/**
 * Unified component for rendering typed input args from a schema array.
 * Replaces the 4 duplicate per-type rendering implementations across
 * DataQueryArgsForm, WorkflowInputModal, CronJobEditor, and WidgetDatasetArguments.
 *
 * @param {{
 *   args: Array<{ key: string, type?: string, required?: boolean }>,
 *   values: Object,
 *   onChange: (key: string, value: any) => void,
 *   errors?: Object<string, string>,
 *   disabled?: boolean,
 *   className?: string,
 * }} props
 */
export function InputArgsForm({
  args = [],
  values = {},
  onChange,
  errors = {},
  disabled = false,
  className,
}) {
  if (!Array.isArray(args) || args.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">
        No input parameters defined.
      </p>
    );
  }

  const renderField = (arg) => {
    const argName = arg.key;
    const argType = arg.type || "string";
    const value = values[argName];

    switch (argType) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`input-arg-${argName}`}
              checked={!!value}
              onCheckedChange={(checked) => onChange(argName, checked)}
              disabled={disabled}
            />
            <Label
              htmlFor={`input-arg-${argName}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {argName}
              {arg.required && <span className="text-red-500 ml-1">*</span>}
              <span className="text-muted-foreground ml-1">({argType})</span>
            </Label>
          </div>
        );

      case "array":
        return (
          <>
            <Label htmlFor={`input-arg-${argName}`} className="text-xs">
              {argName}{" "}
              {arg.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({argType})</span>
            </Label>
            <ArrayInput
              value={Array.isArray(value) ? value : []}
              onChange={(val) => onChange(argName, val)}
              placeholder={`Add ${argName} item...`}
              disabled={disabled}
            />
          </>
        );

      case "object":
        return (
          <>
            <Label htmlFor={`input-arg-${argName}`} className="text-xs">
              {argName}{" "}
              {arg.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({argType})</span>
            </Label>
            <CodeEditor
              language="json"
              height={120}
              title="JSON Input"
              value={
                typeof value === "object" && value !== null
                  ? JSON.stringify(value, null, 2)
                  : value || ""
              }
              onChange={(val) => onChange(argName, val)}
              disabled={disabled}
            />
          </>
        );

      case "number":
        return (
          <>
            <Label htmlFor={`input-arg-${argName}`} className="text-xs">
              {argName}{" "}
              {arg.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({argType})</span>
            </Label>
            <Input
              type="number"
              id={`input-arg-${argName}`}
              className="w-full text-xs"
              placeholder={`Value for ${argName}`}
              value={value ?? ""}
              onChange={(e) =>
                onChange(
                  argName,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              disabled={disabled}
            />
          </>
        );

      // string & default
      default:
        return (
          <>
            <Label htmlFor={`input-arg-${argName}`} className="text-xs">
              {argName}{" "}
              {arg.required && <span className="text-red-500">*</span>}{" "}
              {argType !== "string" && (
                <span className="text-muted-foreground">({argType})</span>
              )}
            </Label>
            <Input
              type="text"
              id={`input-arg-${argName}`}
              className="w-full text-xs"
              placeholder={`Value for ${argName}`}
              value={value || ""}
              onChange={(e) => onChange(argName, e.target.value)}
              disabled={disabled}
            />
          </>
        );
    }
  };

  return (
    <div className={className || "space-y-3"}>
      {args.map((arg) => (
        <div key={arg.key} className="space-y-1">
          {renderField(arg)}
          {errors[arg.key] && (
            <span className="text-destructive text-xs">{errors[arg.key]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

InputArgsForm.propTypes = {
  args: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      type: PropTypes.string,
      required: PropTypes.bool,
    })
  ).isRequired,
  values: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
