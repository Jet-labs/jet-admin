import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  CodeEditor,
} from "@jet-admin/ui";
import { Plus, Trash2, Edit2, Key, Layers, ArrowLeft } from "lucide-react";

export const AppPageVariablesEditor = ({ appPageEditorForm }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const variables = appPageEditorForm.values.appPageConfig?.variables || [];

  const updateVariables = useCallback(
    (newVariables) => {
      appPageEditorForm.setFieldValue("appPageConfig.variables", newVariables);
    },
    [appPageEditorForm]
  );

  const handleAddVariable = () => {
    const newVar = {
      key: `variable_${variables.length + 1}`,
      type: "string",
      defaultValue: "",
      description: "",
    };
    updateVariables([...variables, newVar]);
    setEditingIndex(variables.length);
    setIsAdding(true);
  };

  const handleRemoveVariable = (index) => {
    if (confirm("Are you sure you want to delete this page variable?")) {
      const updated = variables.filter((_, i) => i !== index);
      updateVariables(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
        setIsAdding(false);
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleVariableChange = (index, field, value) => {
    const updated = variables.map((v, i) => {
      if (i !== index) return v;
      const next = { ...v, [field]: value };
      if (field === "type") {
        if (value === "boolean") next.defaultValue = false;
        else if (value === "number") next.defaultValue = 0;
        else if (value === "object") next.defaultValue = {};
        else if (value === "array") next.defaultValue = [];
        else next.defaultValue = "";
      }
      return next;
    });
    updateVariables(updated);
  };

  const selectedVariable = editingIndex !== null ? variables[editingIndex] : null;

  const renderDefaultValueInput = (variable, index) => {
    switch (variable.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2 mt-1">
            <Checkbox
              id={`var-default-${index}`}
              checked={!!variable.defaultValue}
              onCheckedChange={(checked) => handleVariableChange(index, "defaultValue", checked)}
            />
            <Label htmlFor={`var-default-${index}`} className="text-xs cursor-pointer">
              True
            </Label>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            className="w-full text-xs"
            value={variable.defaultValue ?? 0}
            onChange={(e) => handleVariableChange(index, "defaultValue", Number(e.target.value))}
          />
        );
      case "object":
      case "array":
        const displayValue =
          typeof variable.defaultValue === "object"
            ? JSON.stringify(variable.defaultValue, null, 2)
            : String(variable.defaultValue);
        return (
          <div className="rounded-md border border-border overflow-hidden">
            <CodeEditor
              language="json"
              height={120}
              showHeader={false}
              showExpandButton={false}
              showFormatButton={true}
              value={displayValue}
              onChange={(val) => {
                try {
                  const parsed = JSON.parse(val);
                  handleVariableChange(index, "defaultValue", parsed);
                } catch (e) {
                  // Keep as string if invalid JSON during editing
                  handleVariableChange(index, "defaultValue", val);
                }
              }}
            />
          </div>
        );
      case "string":
      default:
        return (
          <Input
            type="text"
            className="w-full text-xs"
            placeholder="Default string value"
            value={variable.defaultValue || ""}
            onChange={(e) => handleVariableChange(index, "defaultValue", e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {editingIndex !== null && selectedVariable ? (
        /* ─── Detail / Edit View ─── */
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setEditingIndex(null);
                  setIsAdding(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAdding ? "New Variable" : "Edit Variable"}
              </p>
            </div>
          </div>

          <div className="space-y-2 p-2">
            {/* Variable Key */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Variable Key / Name
              </Label>
              <Input
                type="text"
                className="w-full text-xs font-mono"
                placeholder="e.g. selectedUserId"
                value={selectedVariable.key || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                  handleVariableChange(editingIndex, "key", val);
                }}
              />
              <p className="text-[10px] text-muted-foreground">
                Accessible via expression engine, e.g.{" "}
                <code className="bg-background px-1 rounded border border-border font-mono text-xs">{`{{variables.${selectedVariable.key || "key"}}}`}</code>
              </p>
            </div>

            {/* Variable Type */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Variable Type
              </Label>
              <Select
                value={selectedVariable.type || "string"}
                onValueChange={(val) => handleVariableChange(editingIndex, "type", val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="object">Object (JSON)</SelectItem>
                  <SelectItem value="array">Array (JSON)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Value */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Default Value
              </Label>
              {renderDefaultValueInput(selectedVariable, editingIndex)}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Input
                type="text"
                className="w-full text-xs"
                placeholder="What is this variable used for?"
                value={selectedVariable.description || ""}
                onChange={(e) => handleVariableChange(editingIndex, "description", e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between p-2 border-b border-border">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Page Variables
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Manage variables that form the local reactive state of the page.
              </p>
            </div>
          </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {variables.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-muted/30 p-2 text-center flex flex-col items-center justify-center py-10">
                <Key className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs font-medium text-foreground">No Page Variables</p>
                <p className="text-[10px] text-muted-foreground/70 max-w-[200px] mt-1">
                  Add local variables to store selection, filtering state, or page configurations.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {variables.map((variable, index) => {
                  return (
                    <div
                      key={index}
                      className="rounded-md border border-border bg-card p-2 flex flex-col hover:shadow-sm transition-shadow group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-mono font-medium truncate text-foreground block">
                            {variable.key || `variable_${index + 1}`}
                          </span>
                          {variable.defaultValue !== undefined && variable.defaultValue !== "" && (
                            <p className="text-[10px] text-muted-foreground/75 truncate mt-0.5">
                              Default: <code className="text-[10px] font-mono font-semibold bg-muted px-1 py-0.5 rounded border border-border/50">{typeof variable.defaultValue === "object"
                                ? JSON.stringify(variable.defaultValue)
                                : String(variable.defaultValue)}</code>
                            </p>
                          )}
                          {variable.description && (
                            <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
                              {variable.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-muted-foreground/70 uppercase tracking-wider">Type:</span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                            {variable.type || "string"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingIndex(index);
                              setIsAdding(false);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveVariable(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

              <div className="">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={handleAddVariable}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AppPageVariablesEditor.propTypes = {
  appPageEditorForm: PropTypes.object.isRequired,
};
