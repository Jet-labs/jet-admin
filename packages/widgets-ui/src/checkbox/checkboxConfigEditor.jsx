import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const CheckboxConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Include archived" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.description || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.description", e.target.value)} placeholder="Helper text" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="cb-default" checked={!!config.defaultChecked} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.defaultChecked", !!c)} />
        <Label htmlFor="cb-default" className="text-xs text-muted-foreground cursor-pointer">Checked by default</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
CheckboxConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default CheckboxConfigEditor;
