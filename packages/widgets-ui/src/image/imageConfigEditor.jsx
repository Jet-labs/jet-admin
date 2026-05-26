import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

export const ImageConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

  return (
    <div className="space-y-4">
      {/* Image Source */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Image URL / Source</Label>
        <Input
          type="text"
          className="text-sm font-mono"
          value={config.src || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.src", e.target.value)}
          placeholder="e.g. {{queries.user.data.avatar_url}}"
        />
        <p className="text-[10px] text-muted-foreground">
          Supports template expressions for dynamic content.
        </p>
      </div>

      {/* Alternative Text */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Alt Text (Accessibility)</Label>
        <Input
          type="text"
          className="text-sm"
          value={config.alt || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.alt", e.target.value)}
          placeholder="e.g. Profile photo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Object Fit */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Object Fit</Label>
          <Select
            value={config.objectFit || "cover"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.objectFit", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (crop to fit)</SelectItem>
              <SelectItem value="contain">Contain (show all)</SelectItem>
              <SelectItem value="fill">Fill (stretch)</SelectItem>
              <SelectItem value="none">Original Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Corner Radius</Label>
          <Select
            value={config.borderRadius || "none"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.borderRadius", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Square (None)</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="full">Circle (Full)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

ImageConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
};

export default ImageConfigEditor;
