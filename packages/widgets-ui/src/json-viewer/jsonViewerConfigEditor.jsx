import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const JsonViewerConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Data Template</Label>
        <TemplateAutocompleteInput value={config.dataTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.dataTemplate", v)} placeholder="e.g. {{state.queries.myQuery.data}}" liveStateTree={liveStateTree} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="jv-collapsed" checked={!!config.collapsed} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.collapsed", !!c)} />
        <Label htmlFor="jv-collapsed" className="text-xs text-muted-foreground cursor-pointer">Start collapsed</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Max Height (px) <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="number" className="text-sm h-8" value={config.maxHeight ?? ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.maxHeight", e.target.value === "" ? undefined : Number(e.target.value))} placeholder="e.g. 400" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
JsonViewerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default JsonViewerConfigEditor;
