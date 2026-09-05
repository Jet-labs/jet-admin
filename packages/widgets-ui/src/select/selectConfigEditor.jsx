import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { Button } from "@jet-admin/ui";

export const SelectConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Status" />
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
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0" onClick={() => {
                widgetEditorForm.setFieldValue("widgetConfig.options", (config.options || []).filter((_, x) => x !== i));
              }}>×</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => {
            widgetEditorForm.setFieldValue("widgetConfig.options", [...(config.options || []), { label: `Option ${(config.options || []).length + 1}`, value: `option_${(config.options || []).length + 1}` }]);
          }}>+ Add option</Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Options Template <span className="text-muted-foreground font-normal">(optional, overrides static)</span></Label>
        <TemplateAutocompleteInput value={config.optionsTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.optionsTemplate", v)} placeholder="e.g. {{state.queries.users.data}}" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Label Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.labelKey || "label"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.labelKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Value Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.valueKey || "value"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.valueKey", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <TemplateAutocompleteInput value={config.defaultValue || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.defaultValue", v)} placeholder="e.g. active" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};

SelectConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default SelectConfigEditor;
