import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const ImageConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      {/* Image Source */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Image URL / Source</Label>
        <TemplateAutocompleteInput
          value={config.src || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.src", val)}
          placeholder="e.g. {{state.queries.user.data.avatar_url}}"
          liveStateTree={liveStateTree}
        />
        <p className="text-[10px] text-muted-foreground">
          Supports template expressions for dynamic content.
        </p>
      </div>

      {/* Alternative Text */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Alt Text (Accessibility)</Label>
        <Input
          type="text"
          className="text-sm"
          value={config.alt || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.alt", e.target.value)}
          placeholder="e.g. Profile photo"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Object Fit */}
        <div className="space-y-1">
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
        <div className="space-y-1">
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

      {/* Is Loading Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

ImageConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default ImageConfigEditor;
