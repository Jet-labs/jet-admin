import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const VideoConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Video URL</Label>
        <TemplateAutocompleteInput value={config.src || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.src", v)} placeholder="https://.../video.mp4" liveStateTree={liveStateTree} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Poster URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.poster || ""} onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.poster", e.target.value)} placeholder="https://.../poster.jpg" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox id="vd-controls" checked={config.controls !== false} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.controls", !!c)} />
          <Label htmlFor="vd-controls" className="text-xs text-muted-foreground cursor-pointer">Controls</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="vd-auto" checked={!!config.autoplay} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.autoplay", !!c)} />
          <Label htmlFor="vd-auto" className="text-xs text-muted-foreground cursor-pointer">Autoplay</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="vd-loop" checked={!!config.loop} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.loop", !!c)} />
          <Label htmlFor="vd-loop" className="text-xs text-muted-foreground cursor-pointer">Loop</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="vd-muted" checked={!!config.muted} onCheckedChange={(c) => widgetEditorForm.setFieldValue("widgetConfig.muted", !!c)} />
          <Label htmlFor="vd-muted" className="text-xs text-muted-foreground cursor-pointer">Muted</Label>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput value={config.isLoading || ""} onChange={(v) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", v)} placeholder="e.g. {{ state.queries.q.isLoading }}" liveStateTree={liveStateTree} />
      </div>
    </div>
  );
};
VideoConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
export default VideoConfigEditor;
