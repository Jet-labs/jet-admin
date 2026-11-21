import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from 'lucide-react';
import PropTypes from "prop-types";


import { Button, Checkbox, CodeEditor, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

function stringifyJsonDefault(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

/**
 * JSON editor for object/array defaults. Keeps a draft string so invalid JSON
 * can be corrected in place, and only writes parsed values to the form.
 */
function JsonDefaultEditor({ inputDef, onChange }) {
  const [text, setText] = useState(() => stringifyJsonDefault(inputDef.defaultValue));
  const [error, setError] = useState("");

  useEffect(() => {
    const next = stringifyJsonDefault(inputDef.defaultValue);
    setText((current) => {
      if (current === next) return current;
      try {
        if (JSON.stringify(JSON.parse(current)) === JSON.stringify(inputDef.defaultValue ?? null)) {
          return current;
        }
      } catch {
        // Keep the user's in-progress invalid draft.
      }
      return next;
    });
  }, [inputDef.defaultValue]);

  const handleChange = useCallback((value) => {
    setText(value);
    if (!value.trim()) {
      setError("");
      onChange(undefined);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setError("");
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
    }
  }, [onChange]);

  return (
    <div className="space-y-1">
      <CodeEditor
        language="json"
        height={130}
        title={inputDef.type === "array" ? "JSON Array" : "JSON Object"}
        value={text}
        onChange={handleChange}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

JsonDefaultEditor.propTypes = {
  inputDef: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
/**
 * Panel for editing workflow input parameter schema (workflowOptions.inputDefinitions).
 * Allows users to define the expected input parameters for a workflow.
 */
export const WorkflowInputDefinitionsPanel = ({ workflowForm }) => {
  WorkflowInputDefinitionsPanel.propTypes = {
    workflowForm: PropTypes.object.isRequired,
  };

  const inputDefinitions = workflowForm.values.workflowOptions?.inputDefinitions || [];

  // Formik's setValues(function) evaluates against the current render before
  // dispatch. Use its queued state updater so back-to-back editor callbacks
  // cannot replace a sibling's freshly entered default with an old snapshot.
  const updateDefinitions = useCallback(update => {
    workflowForm.setFormikState(previous => ({
      ...previous,
      values: {
        ...previous.values,
        workflowOptions: {
          ...previous.values.workflowOptions,
          inputDefinitions: update(previous.values.workflowOptions?.inputDefinitions || []),
        },
      },
    }));
  }, [workflowForm.setFormikState]);

  const _handleAddInputDef = useCallback(() => {
    updateDefinitions(previous => [...previous, { key: "", type: "string", required: false }]);
  }, [updateDefinitions]);

  const _handleRemoveInputDef = useCallback((index) => {
    updateDefinitions(previous => previous.filter((_, position) => position !== index));
  }, [updateDefinitions]);

  const _handleUpdateInputDef = useCallback((index, field, value) => {
    updateDefinitions(previous => previous.map((definition, position) =>
      position === index ? { ...definition, [field]: value } : definition));
  }, [updateDefinitions]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Input Parameters{inputDefinitions.length > 0 ? ` (${inputDefinitions.length})` : ""}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={_handleAddInputDef}
          className="h-6 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-2.5 h-2.5 mr-1" />
          Add
        </Button>
      </div>

      {inputDefinitions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No input parameters defined.
        </p>
      ) : (
        <div className="space-y-2">
            {inputDefinitions.map((inputDef, index) => (
            <div key={index} className="rounded border border-border bg-muted/20 p-2 space-y-2">
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                  <Input
                    type="text"
                    placeholder="parameter_name"
                    size="sm"
                    className="w-full text-xs font-mono"
                    value={inputDef.key || ""}
                    onChange={(e) => _handleUpdateInputDef(index, "key", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="sm"
                  square
                  onClick={() => _handleRemoveInputDef(index)}
                  className="h-7 w-7 flex-shrink-0 self-end"
                  title="Remove parameter"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                  <Select value={inputDef.type || "string"} onValueChange={(val) => _handleUpdateInputDef(index, "type", val)}>
                    <SelectTrigger size="sm" className="w-full text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string" className="text-xs">String</SelectItem>
                      <SelectItem value="number" className="text-xs">Number</SelectItem>
                      <SelectItem value="boolean" className="text-xs">Boolean</SelectItem>
                      <SelectItem value="object" className="text-xs">Object</SelectItem>
                      <SelectItem value="array" className="text-xs">Array</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Label className="flex items-center gap-1.5 text-xs shrink-0 self-end pb-1.5">
                  <Checkbox
                    checked={inputDef.required || false}
                    onCheckedChange={(checked) => _handleUpdateInputDef(index, "required", checked)}
                  />
                  Required
                </Label>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">Default value</Label>
                {(inputDef.type || "string") === "boolean" ? (
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={inputDef.defaultValue === true}
                      onCheckedChange={(checked) => _handleUpdateInputDef(index, "defaultValue", checked)}
                    />
                    {inputDef.defaultValue === true ? "true" : "false"}
                  </Label>
                ) : ["object", "array"].includes(inputDef.type || "string") ? (
                  <JsonDefaultEditor
                    inputDef={inputDef}
                    onChange={(value) => _handleUpdateInputDef(index, "defaultValue", value)}
                  />
                ) : (
                  <Input
                    type={(inputDef.type || "string") === "number" ? "number" : "text"}
                    placeholder={`Default ${inputDef.key || "value"}`}
                    size="sm"
                    className="w-full text-xs"
                    value={inputDef.defaultValue ?? ""}
                    onChange={(e) => _handleUpdateInputDef(
                      index,
                      "defaultValue",
                      (inputDef.type || "string") === "number"
                        ? (e.target.value === "" ? undefined : Number(e.target.value))
                        : e.target.value
                    )}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
