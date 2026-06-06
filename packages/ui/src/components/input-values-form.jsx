import React from "react";
import PropTypes from "prop-types";
import { Input } from "./input";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { CodeEditor } from "./code-editor";
import { ArrayInput } from "./array-input";
import { TemplateAutocompleteInput } from "./template-autocomplete-input";

/**
 * Unified component for rendering typed input definitions from a schema array.
 * Replaces the 4 duplicate per-type rendering implementations across
 * DataQueryArgsForm, WorkflowInputModal, CronJobEditor, and WidgetDatasetArguments.
 *
 * When `stateTree` is provided, every field renders as a TemplateAutocompleteInput
 * so values can be authored as {{ }} templates (e.g. listener action mappings use
 * `{{event.property}}` regardless of the arg's declared type).
 *
 * @param {{
 *   inputDefinitions: Array<{ key: string, type?: string, required?: boolean }>,
 *   values: Object,
 *   onChange: (key: string, value: any) => void,
 *   errors?: Object<string, string>,
 *   disabled?: boolean,
 *   className?: string,
 *   stateTree?: Object,
 *   templateMode?: string,
 * }} props
 */
export function InputValuesForm({
  inputDefinitions = [],
  values = {},
  onChange,
  errors = {},
  disabled = false,
  className,
  stateTree = null,
  templateMode,
}) {
  if (!Array.isArray(inputDefinitions) || inputDefinitions.length === 0) {
    return (
      <p className="text-xs text-[#1c1c1e] italic">
        No input parameters defined.
      </p>
    );
  }

  const renderField = (inputDef) => {
    const inputName = inputDef.key;
    const inputType = inputDef.type || "string";
    const value = values[inputName];

    // Template mode: author the value as a {{ }} expression against stateTree.
    if (stateTree) {
      return (
        <>
          <Label htmlFor={`input-def-${inputName}`} className="text-xs">
            {inputName}{" "}
            {inputDef.required && <span className="text-red-500">*</span>}{" "}
            {inputType !== "string" && (
              <span className="text-muted-foreground">({inputType})</span>
            )}
          </Label>
          <TemplateAutocompleteInput
            value={typeof value === "string" ? value : value == null ? "" : String(value)}
            onChange={(val) => onChange(inputName, val)}
            placeholder={`{{event.${inputName}}}`}
            context={stateTree}
            mode={templateMode}
            readOnly={disabled}
          />
        </>
      );
    }

    switch (inputType) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`input-def-${inputName}`}
              checked={!!value}
              onCheckedChange={(checked) => onChange(inputName, checked)}
              disabled={disabled}
            />
            <Label
              htmlFor={`input-def-${inputName}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {inputName}
              {inputDef.required && <span className="text-red-500 ml-1">*</span>}
              <span className="text-muted-foreground ml-1">({inputType})</span>
            </Label>
          </div>
        );

      case "array":
        return (
          <>
            <Label htmlFor={`input-def-${inputName}`} className="text-xs">
              {inputName}{" "}
              {inputDef.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({inputType})</span>
            </Label>
            <ArrayInput
              value={Array.isArray(value) ? value : []}
              onChange={(val) => onChange(inputName, val)}
              placeholder={`Add ${inputName} item...`}
              disabled={disabled}
            />
          </>
        );

      case "object":
        return (
          <>
            <Label htmlFor={`input-def-${inputName}`} className="text-xs">
              {inputName}{" "}
              {inputDef.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({inputType})</span>
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
              onChange={(val) => onChange(inputName, val)}
              disabled={disabled}
            />
          </>
        );

      case "number":
        return (
          <>
            <Label htmlFor={`input-def-${inputName}`} className="text-xs">
              {inputName}{" "}
              {inputDef.required && <span className="text-red-500">*</span>}{" "}
              <span className="text-muted-foreground">({inputType})</span>
            </Label>
            <Input
              type="number"
              id={`input-def-${inputName}`}
              className="w-full text-xs"
              placeholder={`Value for ${inputName}`}
              value={value ?? ""}
              onChange={(e) =>
                onChange(
                  inputName,
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
            <Label htmlFor={`input-def-${inputName}`} className="text-xs">
              {inputName}{" "}
              {inputDef.required && <span className="text-red-500">*</span>}{" "}
              {inputType !== "string" && (
                <span className="text-muted-foreground">({inputType})</span>
              )}
            </Label>
            <Input
              type="text"
              id={`input-def-${inputName}`}
              className="w-full text-xs"
              placeholder={`Value for ${inputName}`}
              value={value || ""}
              onChange={(e) => onChange(inputName, e.target.value)}
              disabled={disabled}
            />
          </>
        );
    }
  };

  return (
    <div className={className || "space-y-3"}>
      {inputDefinitions.map((inputDef) => (
        <div key={inputDef.key} className="space-y-1">
          {renderField(inputDef)}
          {errors[inputDef.key] && (
            <span className="text-destructive text-xs">{errors[inputDef.key]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

InputValuesForm.propTypes = {
  inputDefinitions: PropTypes.arrayOf(
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
  stateTree: PropTypes.object,
  templateMode: PropTypes.string,
};
