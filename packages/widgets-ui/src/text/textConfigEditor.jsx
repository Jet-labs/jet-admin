import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const TextConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  // Wrap so {{ state.X }} paths resolve correctly inside the JS sandbox
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      {/* Content */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Content</Label>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Supports Markdown formatting and <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]">{"{{expression}}"}</code> templates. Full JS expressions supported.
        </p>
        <TemplateAutocompleteInput
          isTextArea={true}
          className=""
          value={config.content || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.content", val)}
          placeholder={"# Heading\n\nSome **bold** and *italic* text.\n\nValue: {{ state.queries.myQuery.data[0].name }}"}
          liveStateTree={liveStateTree}
        />
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Format */}
        <div className="space-y-1">
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
        <div className="space-y-1">
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
        <div className="space-y-1">
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
  stateTree: PropTypes.object,
};

export default TextConfigEditor;
