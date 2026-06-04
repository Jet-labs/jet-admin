import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@jet-admin/ui";

/**
 * FormWidget
 *
 * A beautifully designed dynamic form widget.
 * Renders dynamically defined input fields, select boxes, and checkboxes.
 * Supports template defaults resolved by the AppPage runtime.
 * Fires `onSubmit` with field values when submitted, and `onFieldChange` on edits.
 */
export const FormWidget = ({
    widgetConfig,
    fireWidgetEvent,
}) => {
    const fields = widgetConfig?.fields || [];
    const submitLabel = widgetConfig?.submitLabel || "Submit";
    const size = widgetConfig?.size || "default"; // "default" | "sm" | "lg"
    const showReset = widgetConfig?.showReset ?? false;

    // Form state
    const [formData, setFormData] = useState({});

    // Populate default values when fields config resolves/loads
    useEffect(() => {
        const defaults = {};
        fields.forEach((field) => {
            if (field.key) {
                defaults[field.key] = field.defaultValue !== undefined ? field.defaultValue : "";
            }
        });
        setFormData(defaults);
    }, [widgetConfig?.fields]);

    const handleFieldChange = (key, value) => {
        const nextData = { ...formData, [key]: value };
        setFormData(nextData);

        if (fireWidgetEvent) {
            fireWidgetEvent("onFieldChange", {
                field: key,
                value: value,
                formData: nextData,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fireWidgetEvent) {
            // Fire onSubmit event with aggregated form data
            fireWidgetEvent("onSubmit", {
                formData: formData,
            });
        }
    };

    const handleReset = () => {
        const defaults = {};
        fields.forEach((field) => {
            if (field.key) {
                defaults[field.key] = field.defaultValue !== undefined ? field.defaultValue : "";
            }
        });
        setFormData(defaults);
    };

    if (fields.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs text-center">
                No fields configured in form properties.
            </div>
        );
    }

    const formSizeClass = {
        sm: "space-y-2.5 p-3 text-xs",
        default: "space-y-4 p-4 text-sm",
        lg: "space-y-5.5 p-5 text-base",
    }[size] || "space-y-4 p-4 text-sm";

    return (
        <form
            onSubmit={handleSubmit}
            className={`w-full h-full overflow-auto flex flex-col justify-between ${formSizeClass}`}
        >
            <div className="space-y-3.5">
                {fields.map((field, idx) => {
                    if (!field.key) return null;
                    const fieldType = field.type || "text";
                    const inputId = `form-field-${field.key}-${idx}`;

                    return (
                        <div key={idx} className="space-y-1.5">
                            {fieldType !== "checkbox" && (
                                <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
                                    {field.label || field.key}
                                    {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                                </Label>
                            )}

                            {fieldType === "select" ? (
                                <Select
                                    value={String(formData[field.key] ?? "")}
                                    onValueChange={(val) => handleFieldChange(field.key, val)}
                                >
                                    <SelectTrigger id={inputId} className="w-full text-xs">
                                        <SelectValue placeholder={field.placeholder || "Select option..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(field.options || []).map((opt, oIdx) => {
                                            const val = typeof opt === "object" ? opt.value : opt;
                                            const lbl = typeof opt === "object" ? opt.label : opt;
                                            return (
                                                <SelectItem key={oIdx} value={String(val)}>
                                                    {lbl}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            ) : fieldType === "checkbox" ? (
                                <div className="flex items-center gap-2 py-1">
                                    <Checkbox
                                        id={inputId}
                                        checked={!!formData[field.key]}
                                        onCheckedChange={(checked) => handleFieldChange(field.key, !!checked)}
                                    />
                                    <Label htmlFor={inputId} className="text-xs text-muted-foreground cursor-pointer">
                                        {field.label || field.key}
                                        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                                    </Label>
                                </div>
                            ) : (
                                <Input
                                    id={inputId}
                                    type={fieldType}
                                    className="text-xs h-8 bg-background border border-input focus:border-primary w-full"
                                    placeholder={field.placeholder || ""}
                                    required={field.required}
                                    value={formData[field.key] ?? ""}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Buttons Panel */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-4">
                {showReset && (
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 text-xs font-semibold px-4"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                )}
                <Button
                    type="submit"
                    className="h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};

FormWidget.propTypes = {
    widgetConfig: PropTypes.object,
    fireWidgetEvent: PropTypes.func,
};

export default FormWidget;