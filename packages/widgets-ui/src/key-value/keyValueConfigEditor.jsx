import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const KeyValueConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Data Template</Label>
        <TemplateAutocompleteInput value={config.dataTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.dataTemplate", v)} placeholder="e.g. {{state.queries.user.data[0]}}" liveStateTree={liveStateTree} />
        <p className="text-xs text-muted-foreground">Object whose entries render as rows. Resolved by runtime.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Columns</Label>
          <Select value={String(config.columns || 1)} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.columns", Number(v))}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Empty Text</Label>
          <Input type="text" className="text-sm h-8" value={config.emptyText || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.emptyText", e.target.value)} placeholder="No data" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
KeyValueConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default KeyValueConfigEditor;
