import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const SliderConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Min revenue" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Min</Label>
          <Input type="number" className="text-sm h-8" value={config.min ?? 0} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.min", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Max</Label>
          <Input type="number" className="text-sm h-8" value={config.max ?? 100} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.max", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Step</Label>
          <Input type="number" className="text-sm h-8" value={config.step ?? 1} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.step", Number(e.target.value))} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <TemplateAutocompleteInput value={String(config.defaultValue ?? "")} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.defaultValue", v)} placeholder="e.g. 50" liveStateTree={liveStateTree} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="sl-show" checked={config.showValue !== false} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.showValue", !!c)} />
        <Label htmlFor="sl-show" className="text-xs text-muted-foreground cursor-pointer">Show current value badge</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
SliderConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default SliderConfigEditor;
