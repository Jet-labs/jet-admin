import React from "react";
import PropTypes from "prop-types";
import { Plus, Trash2 } from "lucide-react";
import { Label, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@jet-admin/ui";

export const FormConfigEditor = ({ widgetEditorForm }) => {
    const config = widgetEditorForm.values.widgetConfig || {};
    const fields = config.fields || [];

    const handleAddField = () => {
        const newField = {
            key: `field_${fields.length + 1}`,
            label: `Field ${fields.length + 1}`,
            type: "text",
            placeholder: "",
            required: false,
            defaultValue: "",
            options: [],
        };
        widgetEditorForm.setFieldValue("widgetConfig.fields", [...fields, newField]);
    };

    const handleRemoveField = (idx) => {
        const updated = [...fields];
        updated.splice(idx, 1);
        widgetEditorForm.setFieldValue("widgetConfig.fields", updated);
    };

    const handleFieldChange = (idx, key, val) => {
        widgetEditorForm.setFieldValue(`widgetConfig.fields[${idx}].${key}`, val);
    };

    const handleOptionsChange = (idx, optionsStr) => {
        const list = optionsStr.split(",").map((s) => s.trim()).filter(Boolean);
        handleFieldChange(idx, "options", list);
    };

    return (
        <div className="space-y-4">
            {/* Global Form Settings */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Submit Button Text</Label>
                    <Input
                        type="text"
                        className="text-xs h-8"
                        value={config.submitLabel || "Submit"}
                        onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.submitLabel", e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Size / Spacing</Label>
                    <Select
                        value={config.size || "default"}
                        onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)}
                    >
                        <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sm">Compact (Small)</SelectItem>
                            <SelectItem value="default">Normal (Default)</SelectItem>
                            <SelectItem value="lg">Spacious (Large)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Fields list</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={handleAddField}
                >
                    <Plus className="h-3 w-3" /> Add Field
                </Button>
            </div>

            {/* Field Item Editors */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {fields.map((field, idx) => (
                    <div key={idx} className="p-3 border rounded bg-muted/10 relative space-y-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveField(idx)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        <div className="grid grid-cols-2 gap-2 pr-5">
                            {/* Field Label */}
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-medium">Label</Label>
                                <Input
                                    type="text"
                                    className="text-xs h-7"
                                    value={field.label || ""}
                                    onChange={(e) => handleFieldChange(idx, "label", e.target.value)}
                                    placeholder="e.g. Email Address"
                                />
                            </div>

                            {/* Unique Key */}
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-medium">Key (Unique ID)</Label>
                                <Input
                                    type="text"
                                    className="text-xs h-7 font-mono"
                                    value={field.key || ""}
                                    onChange={(e) => handleFieldChange(idx, "key", e.target.value)}
                                    placeholder="e.g. email"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Type Select */}
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-medium">Input Type</Label>
                                <Select
                                    value={field.type || "text"}
                                    onValueChange={(val) => handleFieldChange(idx, "type", val)}
                                >
                                    <SelectTrigger className="text-[11px] h-7 bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text (Single line)</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="password">Password</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                        <SelectItem value="select">Select / Dropdown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Placeholder */}
                            {field.type !== "checkbox" && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground font-medium">Placeholder</Label>
                                    <Input
                                        type="text"
                                        className="text-xs h-7"
                                        value={field.placeholder || ""}
                                        onChange={(e) => handleFieldChange(idx, "placeholder", e.target.value)}
                                        placeholder="Hint text..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Options list for select type */}
                        {field.type === "select" && (
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground font-medium">Options (comma-separated)</Label>
                                <Input
                                    type="text"
                                    className="text-xs h-7"
                                    value={(field.options || []).join(", ")}
                                    onChange={(e) => handleOptionsChange(idx, e.target.value)}
                                    placeholder="admin, member, guest"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dashed">
                            {/* Required Check */}
                            <div className="flex items-center gap-1.5">
                                <Checkbox
                                    id={`field-req-${idx}`}
                                    checked={!!field.required}
                                    onCheckedChange={(val) => handleFieldChange(idx, "required", !!val)}
                                />
                                <Label htmlFor={`field-req-${idx}`} className="text-[10px] text-muted-foreground cursor-pointer font-medium">
                                    Required field
                                </Label>
                            </div>

                            {/* Default Value */}
                            <div className="space-y-0.5">
                                <Label className="text-[9px] text-muted-foreground block leading-none">Default Value</Label>
                                <Input
                                    type="text"
                                    className="text-[10px] h-6 font-mono px-1.5"
                                    value={field.defaultValue || ""}
                                    onChange={(e) => handleFieldChange(idx, "defaultValue", e.target.value)}
                                    placeholder="e.g. {{widgets.table1.selectedRow.name}}"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {fields.length === 0 && (
                    <div className="text-center p-4 border border-dashed text-xs text-muted-foreground rounded">
                        Click 'Add Field' above to define dynamic form fields.
                    </div>
                )}
            </div>

            {/* Show Reset Option */}
            <div className="flex items-center gap-2 pt-2">
                <Checkbox
                    id="form-show-reset"
                    checked={config.showReset ?? false}
                    onCheckedChange={(checked) =>
                        widgetEditorForm.setFieldValue("widgetConfig.showReset", !!checked)
                    }
                />
                <Label htmlFor="form-show-reset" className="text-xs text-muted-foreground cursor-pointer">
                    Show form reset button alongside submit
                </Label>
            </div>
        </div>
    );
};

FormConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
};

export default FormConfigEditor;