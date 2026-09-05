import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const TabsConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const tabs = config.tabs || [];
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Tabs</Label>
        <div className="space-y-1">
          {tabs.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input type="text" className="text-xs h-8 flex-1" value={t?.label ?? ""} onChange={(e) => {
                const next = [...tabs];
                next[i] = { ...next[i], label: e.target.value };
                widgetEditorForm.setFieldValue("widgetConfig.tabs", next);
              }} placeholder="Label" />
              <Input type="text" className="text-xs h-8 flex-1 font-mono" value={t?.value ?? ""} onChange={(e) => {
                const next = [...tabs];
                next[i] = { ...next[i], value: e.target.value };
                widgetEditorForm.setFieldValue("widgetConfig.tabs", next);
              }} placeholder="value" />
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0" onClick={() => widgetEditorForm.setFieldValue("widgetConfig.tabs", tabs.filter((_, x) => x !== i))}>×</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => widgetEditorForm.setFieldValue("widgetConfig.tabs", [...tabs, { label: `Tab ${tabs.length + 1}`, value: `tab${tabs.length + 1}` }])}>+ Add tab</Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Tab</Label>
        <TemplateAutocompleteInput value={config.defaultTab || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.defaultTab", v)} placeholder="e.g. tab1" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
TabsConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default TabsConfigEditor;
