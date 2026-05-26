import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@jet-admin/ui";

export const AlertConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

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
        <Input
          type="text"
          className="text-sm"
          value={config.title || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.title", e.target.value)}
          placeholder="e.g. Warning!"
        />
      </div>

      {/* Alert Message */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Message</Label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] resize-y"
          value={config.message || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.message", e.target.value)}
          placeholder="e.g. Action completed successfully."
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
};

export default AlertConfigEditor;
