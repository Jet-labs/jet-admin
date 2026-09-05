import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const MultiSelectConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Tags" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Options (static)</Label>
        <div className="space-y-1">
          {(config.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input type="text" className="text-xs h-8 flex-1" value={opt?.label ?? ""} onChange={(e) => {
                const next = [...(config.options || [])];
                next[i] = { ...(typeof next[i] === "object" ? next[i] : { value: next[i] }), label: e.target.value };
                widgetEditorForm.setFieldValue("widgetConfig.options", next);
              }} placeholder="Label" />
              <Input type="text" className="text-xs h-8 flex-1 font-mono" value={String(opt?.value ?? "")} onChange={(e) => {
                const next = [...(config.options || [])];
                next[i] = { ...(typeof next[i] === "object" ? next[i] : { label: String(next[i]) }), value: e.target.value };
                widgetEditorForm.setFieldValue("widgetConfig.options", next);
              }} placeholder="Value" />
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0" onClick={() => widgetEditorForm.setFieldValue("widgetConfig.options", (config.options || []).filter((_, x) => x !== i))}>×</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => widgetEditorForm.setFieldValue("widgetConfig.options", [...(config.options || []), { label: `Option ${(config.options || []).length + 1}`, value: `option_${(config.options || []).length + 1}` }])}>+ Add option</Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Options Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.optionsTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.optionsTemplate", v)} placeholder="e.g. {{state.queries.tags.data}}" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Max Selected <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="number" className="text-sm h-8" value={config.maxSelected ?? ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.maxSelected", e.target.value === "" ? undefined : Number(e.target.value))} placeholder="No limit" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};

MultiSelectConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default MultiSelectConfigEditor;
