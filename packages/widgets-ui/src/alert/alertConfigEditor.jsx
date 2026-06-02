import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { getSuggestionsFromStateTree } from "../intellisense/suggestionEngine";

export const AlertConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

  const suggestions = useMemo(() => {
    if (!stateTree) return [];
    const rawSuggestions = getSuggestionsFromStateTree(stateTree);
    return rawSuggestions.map((s) => ({
      label: `{{${s.value}}}`,
      value: `{{${s.value}}}`,
      detail: s.detail,
    }));
  }, [stateTree]);

  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Type / Variant</Label>
        <Select
          value={config.variant || "info"}
          onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info (Blue)</SelectItem>
            <SelectItem value="success">Success (Green)</SelectItem>
            <SelectItem value="warning">Warning (Amber)</SelectItem>
            <SelectItem value="error">Error (Red)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Title (Optional)</Label>
        <TemplateAutocompleteInput
          value={config.title || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.title", val)}
          placeholder="e.g. Warning!"
          suggestions={suggestions}
        />
      </div>

      {/* Alert Message */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Message</Label>
        <TemplateAutocompleteInput
          isTextArea={true}
          value={config.message || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.message", val)}
          placeholder="e.g. Action completed successfully."
          suggestions={suggestions}
        />
      </div>

      {/* Dismissible Toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="alert-dismissible"
          checked={config.dismissible ?? true}
          onCheckedChange={(checked) =>
            widgetEditorForm.setFieldValue("widgetConfig.dismissible", !!checked)
          }
        />
        <Label htmlFor="alert-dismissible" className="text-xs text-muted-foreground cursor-pointer">
          Allow user to dismiss/close the banner
        </Label>
      </div>
    </div>
  );
};

AlertConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default AlertConfigEditor;
