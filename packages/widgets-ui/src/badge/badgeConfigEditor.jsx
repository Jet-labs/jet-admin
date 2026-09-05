import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const BadgeConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Text</Label>
        <TemplateAutocompleteInput value={config.text || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.text", v)} placeholder="e.g. {{state.queries.order.data[0].status}}" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Variant</Label>
          <Select value={config.variant || "default"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.variant", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Size</Label>
          <Select value={config.size || "default"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.size", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="sm">Small</SelectItem><SelectItem value="default">Default</SelectItem><SelectItem value="lg">Large</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
BadgeConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default BadgeConfigEditor;
