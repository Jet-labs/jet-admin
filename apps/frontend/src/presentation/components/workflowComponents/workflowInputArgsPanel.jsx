import React, { useCallback } from "react";
import { Plus, Settings, Trash2 } from 'lucide-react';
import PropTypes from "prop-types";


import { Button, Checkbox, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
/**
 * Panel for editing workflow input parameter schema (workflowOptions.args).
 * Allows users to define the expected input parameters for a workflow.
 */
export const WorkflowInputArgsPanel = ({ workflowForm }) => {
  WorkflowInputArgsPanel.propTypes = {
    workflowForm: PropTypes.object.isRequired,
  };

  const args = workflowForm.values.workflowOptions?.args || [];

  const _handleAddArg = useCallback(() => {
    const newArgs = [
      ...args,
      { key: "", type: "string", required: false },
    ];
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

  const _handleRemoveArg = useCallback((index) => {
    const newArgs = [...args];
    newArgs.splice(index, 1);
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

  const _handleUpdateArg = useCallback((index, field, value) => {
    const newArgs = [...args];
    newArgs[index] = { ...newArgs[index], [field]: value };
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

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
          onClick={_handleAddArg}
          className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-2.5 h-2.5 mr-1" />
          Add
        </Button>
      </div>

      {args.length === 0 ? (
        <p className="text-[10px] text-foreground italic">
          No input parameters defined.
        </p>
      ) : (
        <div className="space-y-2">
          {args.map((arg, index) => (
            <div key={index} className="flex flex-col gap-1.5 p-2 bg-background rounded-sm border border-border">
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Name"
                  className=""
                  size="sm"
                  value={arg.key || ""}
                  onChange={(e) => _handleUpdateArg(index, "key", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  square
                  onClick={() => _handleRemoveArg(index)}
                  className=""
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Select value={arg.type || "string"} onValueChange={(val) => _handleUpdateArg(index, "type", val)}>
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
                <label className="flex items-center gap-1 text-[10px] text-foreground flex-shrink-0">
                  <Checkbox
                    checked={arg.required || false}
                    onCheckedChange={(checked) => _handleUpdateArg(index, "required", checked)}
                  />
                  Required
                </label>
              </div>
              {/* Default value input */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground font-medium">Default value</span>
                {(arg.type || "string") === "boolean" ? (
                  <label className="flex items-center gap-1.5 text-[10px] text-foreground">
                    <Checkbox
                      checked={arg.defaultValue === true}
                      onCheckedChange={(checked) => _handleUpdateArg(index, "defaultValue", checked)}
                    />
                    {arg.defaultValue === true ? "true" : "false"}
                  </label>
                ) : (
                  <Input
                    type={(arg.type || "string") === "number" ? "number" : "text"}
                    placeholder={`Default ${arg.key || "value"}`}
                    className="text-[10px]"
                    size="sm"
                    value={arg.defaultValue ?? ""}
                    onChange={(e) => _handleUpdateArg(
                      index,
                      "defaultValue",
                      (arg.type || "string") === "number"
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
