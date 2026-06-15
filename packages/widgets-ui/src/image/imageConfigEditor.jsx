import React, { useMemo, useContext, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { Upload, Loader2 } from "lucide-react";
import { WidgetEditorContext } from "../context/WidgetEditorContext";

export const ImageConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const { fileUpload } = useContext(WidgetEditorContext);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await fileUpload.uploadFile(file);
      if (res && res.url) {
        widgetEditorForm.setFieldValue("widgetConfig.src", res.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Image Source */}
      <div className="space-y-3">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs flex items-center justify-center"
            disabled={isUploading}
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload Image
          </Button>
        </div>

        <div className="space-y-1 w-full min-w-0 overflow-hidden">
          <Label className="text-xs font-medium text-foreground">Image URL / Source</Label>
          <div className="w-full min-w-0">
            <TemplateAutocompleteInput
              value={config.src || ""}
              onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.src", val)}
              placeholder="e.g. {{state.queries.user.data.avatar_url}}"
              liveStateTree={liveStateTree}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Supports template expressions for dynamic content.
          </p>
        </div>
      </div>

      {/* Alternative Text */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Alt Text (Accessibility)</Label>
        <Input
          type="text"
          className="text-sm"
          value={config.alt || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.alt", e.target.value)}
          placeholder="e.g. Profile photo"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Object Fit */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Object Fit</Label>
          <Select
            value={config.objectFit || "cover"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.objectFit", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (crop to fit)</SelectItem>
              <SelectItem value="contain">Contain (show all)</SelectItem>
              <SelectItem value="fill">Fill (stretch)</SelectItem>
              <SelectItem value="none">Original Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Corner Radius</Label>
          <Select
            value={config.borderRadius || "none"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.borderRadius", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Square (None)</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="full">Circle (Full)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

ImageConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default ImageConfigEditor;
