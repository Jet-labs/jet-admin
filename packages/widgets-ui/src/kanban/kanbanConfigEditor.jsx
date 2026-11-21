import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const KanbanConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => (stateTree ? { state: stateTree } : null), [stateTree]);
  const set = (key, value) => widgetEditorForm.setFieldValue(`widgetConfig.${key}`, value);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Data array</Label>
        <TemplateAutocompleteInput value={config.dataArrayTemplate || ""} onChange={(v) => set("dataArrayTemplate", v)} placeholder="e.g. {{ state.queries.deals.data }}" liveStateTree={liveStateTree} />
        <p className="text-[0.65rem] text-muted-foreground">Resolved array of card objects.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Group by field</Label>
          <Input className="h-8 text-sm font-mono" value={config.groupBy || "status"} onChange={(e) => set("groupBy", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Title field</Label>
          <Input className="h-8 text-sm font-mono" value={config.titleKey || "name"} onChange={(e) => set("titleKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Subtitle field</Label>
          <Input className="h-8 text-sm font-mono" value={config.subtitleKey || ""} onChange={(e) => set("subtitleKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Value field</Label>
          <Input className="h-8 text-sm font-mono" value={config.valueKey || ""} onChange={(e) => set("valueKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Date field</Label>
          <Input className="h-8 text-sm font-mono" value={config.dateKey || ""} onChange={(e) => set("dateKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Badge field</Label>
          <Input className="h-8 text-sm font-mono" value={config.badgeKey || ""} onChange={(e) => set("badgeKey", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Columns (comma-separated, optional)</Label>
        <Input className="h-8 text-sm" value={(config.columns || []).join(", ")} onChange={(e) => set("columns", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} placeholder="new, qualified, proposal, won" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Empty text</Label>
        <Input className="h-8 text-sm" value={config.emptyText || ""} onChange={(e) => set("emptyText", e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="kanban-loading" checked={!!config.isLoading} onCheckedChange={(v) => set("isLoading", v)} />
        <Label htmlFor="kanban-loading" className="text-xs text-muted-foreground">Show loading overlay</Label>
      </div>
    </div>
  );
};

KanbanConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default KanbanConfigEditor;
