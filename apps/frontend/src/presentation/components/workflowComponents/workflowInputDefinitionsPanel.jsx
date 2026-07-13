import React, { useCallback } from "react";
import { Plus, Settings, Trash2 } from 'lucide-react';
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <Settings className="text-foreground w-3 h-3" />
          <span className="text-[10px] font-bold text-foreground tracking-wider">
            Input Parameters
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={_handleAddInputDef}
          className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-2.5 h-2.5 mr-1" />
          Add
        </Button>
      </div>

      {inputDefinitions.length === 0 ? (
        <p className="text-[10px] text-foreground italic">
          No input parameters defined.
        </p>
      ) : (
        <div className="space-y-2">
            {inputDefinitions.map((inputDef, index) => (
            <div key={index} className="flex flex-col gap-1.5 p-2 bg-background rounded border border-border">
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Name"
                  className=""
                  size="sm"
                  value={inputDef.key || ""}
                  onChange={(e) => _handleUpdateInputDef(index, "key", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  square
                  onClick={() => _handleRemoveInputDef(index)}
                  className=""
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Select value={inputDef.type || "string"} onValueChange={(val) => _handleUpdateInputDef(index, "type", val)}>
                  <SelectTrigger size="sm" className="text-xs flex-1 min-w-0">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="flex items-center gap-1">
                  <Checkbox
                    checked={inputDef.required || false}
                    onCheckedChange={(checked) => _handleUpdateInputDef(index, "required", checked)}
                  />
                  Required
                </Label>
              </div>
              {/* Default value input */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground font-medium">Default value</span>
                {(inputDef.type || "string") === "boolean" ? (
                  <Label className="flex items-center gap-1.5">
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
                    className="text-[10px]"
                    size="sm"
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
