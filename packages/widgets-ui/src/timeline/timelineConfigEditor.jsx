import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const TimelineConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Data Template</Label>
        <TemplateAutocompleteInput value={config.dataTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.dataTemplate", v)} placeholder="e.g. {{state.queries.audit.data}}" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Title Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.titleKey || "title"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.titleKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Time Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.timeKey || "time"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.timeKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Desc Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.descriptionKey || "description"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.descriptionKey", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Empty Text</Label>
        <Input type="text" className="text-sm h-8" value={config.emptyText || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.emptyText", e.target.value)} placeholder="No activity yet" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
TimelineConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default TimelineConfigEditor;
