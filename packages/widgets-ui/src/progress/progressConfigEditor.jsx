import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const ProgressConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Value (0-100)</Label>
        <TemplateAutocompleteInput value={config.valueTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.valueTemplate", v)} placeholder="e.g. {{state.queries.stats.data[0].pct}}" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Variant</Label>
          <Select value={config.variant || "bar"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.variant", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="bar">Bar</SelectItem><SelectItem value="ring">Ring</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Status</Label>
          <Select value={config.status || "default"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.status", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Quota used" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="pg-show" checked={config.showValue !== false} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.showValue", !!c)} />
        <Label htmlFor="pg-show" className="text-xs text-muted-foreground cursor-pointer">Show percentage value</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
ProgressConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default ProgressConfigEditor;
