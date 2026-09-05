import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const CodeBlockConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Code</Label>
        <TemplateAutocompleteInput isTextArea value={config.code || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.code", v)} placeholder="SELECT * FROM orders LIMIT 10" liveStateTree={liveStateTree} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Language</Label>
          <Select value={config.language || "sql"} onValueChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.language", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="text">Plain text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Max Height (px)</Label>
          <Input type="number" className="text-sm h-8" value={config.maxHeight ?? ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.maxHeight", e.target.value === "" ? undefined : Number(e.target.value))} placeholder="Auto" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="cb-copy" checked={config.showCopy !== false} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.showCopy", !!c)} />
        <Label htmlFor="cb-copy" className="text-xs text-muted-foreground cursor-pointer">Show copy button</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
CodeBlockConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default CodeBlockConfigEditor;
