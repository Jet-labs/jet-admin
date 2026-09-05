import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const TextInputConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Customer name" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Placeholder</Label>
        <Input type="text" className="text-sm h-8" value={config.placeholder || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.placeholder", e.target.value)} placeholder="Type..." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Input Type</Label>
          <Select value={config.inputType || "text"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.inputType", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Rows <span className="text-muted-foreground font-normal">(textarea)</span></Label>
          <Input type="number" className="text-sm h-8" value={config.rows ?? 3} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.rows", Number(e.target.value))} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <TemplateAutocompleteInput value={config.defaultValue || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.defaultValue", v)} placeholder="e.g. {{state.variables.name}}" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};

TextInputConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default TextInputConfigEditor;
