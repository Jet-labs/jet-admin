import React from "react";
import PropTypes from "prop-types";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

export const TextConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

  return (
    <div className="space-y-4">
      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Content</Label>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Supports Markdown formatting and <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]">{"{{expression}}"}</code> templates.
        </p>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-y"
          value={config.content || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.content", e.target.value)}
          placeholder={"# Heading\n\nSome **bold** and *italic* text.\n\nValue: {{ state.queries.myQuery.data[0].name }}"}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Format */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Format</Label>
          <Select
            value={config.format || "markdown"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.format", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="plain">Plain Text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Align */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Align</Label>
          <Select
            value={config.textAlign || "left"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Size</Label>
          <Select
            value={config.fontSize || "sm"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.fontSize", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

TextConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
};

export default TextConfigEditor;
