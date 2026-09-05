import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const SearchInputConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Search orders" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Placeholder</Label>
        <Input type="text" className="text-sm h-8" value={config.placeholder || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.placeholder", e.target.value)} placeholder="Search..." />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Debounce (ms)</Label>
        <Input type="number" className="text-sm h-8" value={config.debounceMs ?? 300} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.debounceMs", Number(e.target.value))} />
        <p className="text-xs text-muted-foreground">onSearch fires after typing pauses. onChange fires instantly.</p>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <TemplateAutocompleteInput value={config.defaultValue || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.defaultValue", v)} placeholder="" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
SearchInputConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default SearchInputConfigEditor;
