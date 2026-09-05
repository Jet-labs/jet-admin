import React, { useCallback } from "react";
import { Plus, Trash2 } from 'lucide-react';
import PropTypes from "prop-types";


import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
/**
 * Panel for editing workflow input parameter schema (workflowOptions.inputDefinitions).
 * Allows users to define the expected input parameters for a workflow.
 */
export const WorkflowInputDefinitionsPanel = ({ workflowForm }) => {
  WorkflowInputDefinitionsPanel.propTypes = {
    workflowForm: PropTypes.object.isRequired,
  };

  const inputDefinitions = workflowForm.values.workflowOptions?.inputDefinitions || [];

  const _handleAddInputDef = useCallback(() => {
    const newInputDefs = [
      ...inputDefinitions,
      { key: "", type: "string", required: false },
    ];
    workflowForm.setFieldValue("workflowOptions.inputDefinitions", newInputDefs);
  }, [inputDefinitions, workflowForm]);

  const _handleRemoveInputDef = useCallback((index) => {
    const newInputDefs = [...inputDefinitions];
    newInputDefs.splice(index, 1);
    workflowForm.setFieldValue("workflowOptions.inputDefinitions", newInputDefs);
  }, [inputDefinitions, workflowForm]);

  const _handleUpdateInputDef = useCallback((index, field, value) => {
    const newInputDefs = [...inputDefinitions];
    newInputDefs[index] = { ...newInputDefs[index], [field]: value };
    workflowForm.setFieldValue("workflowOptions.inputDefinitions", newInputDefs);
  }, [inputDefinitions, workflowForm]);

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
