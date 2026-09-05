import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

export const DividerConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Filters" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Orientation</Label>
          <Select value={config.orientation || "horizontal"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.orientation", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="horizontal">Horizontal</SelectItem><SelectItem value="vertical">Vertical</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Thickness</Label>
          <Select value={config.thickness || "thin"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.thickness", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="thin">Thin</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="thick">Thick</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Spacing</Label>
          <Select value={config.spacing || "md"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.spacing", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="sm">Small</SelectItem><SelectItem value="md">Medium</SelectItem><SelectItem value="lg">Large</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
DividerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired };
export default DividerConfigEditor;
