import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const FileUploadConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input type="text" className="text-sm h-8" value={config.label || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)} placeholder="e.g. Upload CSV" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Accept <span className="text-muted-foreground font-normal">(e.g. .csv,image/*)</span></Label>
        <Input type="text" className="text-sm h-8 font-mono" value={config.accept || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.accept", e.target.value)} placeholder=".csv,.json,image/*" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Button Label</Label>
          <Input type="text" className="text-sm h-8" value={config.buttonLabel || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.buttonLabel", e.target.value)} placeholder="Choose file" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Max Size (MB)</Label>
          <Input type="number" className="text-sm h-8" value={config.maxSizeMB ?? ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.maxSizeMB", e.target.value === "" ? undefined : Number(e.target.value))} placeholder="No limit" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="fu-multi" checked={!!config.multiple} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.multiple", !!c)} />
        <Label htmlFor="fu-multi" className="text-xs text-muted-foreground cursor-pointer">Allow multiple files</Label>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
FileUploadConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default FileUploadConfigEditor;
