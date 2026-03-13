import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

export const ButtonConfigEditor = ({ widgetEditorForm }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Button Text</Label>
        <Input
          type="text"
          className="text-sm"
          value={widgetEditorForm.values.widgetConfig?.text || ""}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.text', e.target.value)}
          placeholder="Click Me"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Variant</Label>
          <Select
            value={widgetEditorForm.values.widgetConfig?.variant || "default"}
            onValueChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.variant', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Size</Label>
          <Select
            value={widgetEditorForm.values.widgetConfig?.size || "default"}
            onValueChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.size', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="icon">Icon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

ButtonConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
};

export default ButtonConfigEditor;
