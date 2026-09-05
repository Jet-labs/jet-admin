import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const ListConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Data Template</Label>
        <TemplateAutocompleteInput value={config.dataTemplate || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.dataTemplate", v)} placeholder="e.g. {{state.queries.orders.data}}" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Title Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.titleKey || "title"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.titleKey", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Subtitle Key</Label>
          <Input type="text" className="text-sm h-8 font-mono" value={config.subtitleKey || "subtitle"} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.subtitleKey", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Layout</Label>
          <Select value={config.layout || "rows"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.layout", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="rows">Rows</SelectItem><SelectItem value="cards">Cards</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Empty Text</Label>
          <Input type="text" className="text-sm h-8" value={config.emptyText || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.emptyText", e.target.value)} placeholder="No items" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="list-search" checked={!!config.searchable} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.searchable", !!c)} />
        <Label htmlFor="list-search" className="text-xs text-muted-foreground cursor-pointer">Show filter box</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
ListConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default ListConfigEditor;
