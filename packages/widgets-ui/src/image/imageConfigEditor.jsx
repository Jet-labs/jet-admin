import React, { useContext, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Upload, Loader2 } from "lucide-react";
import { Button, Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  SegmentedControl,
  useConfigValue,
} from "../config";
import { WidgetEditorContext } from "../context/WidgetEditorContext";

export const ImageConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const { fileUpload } = useContext(WidgetEditorContext) || {};
  const [src, setSrc] = useConfigValue("src", "");
  const [alt, setAlt] = useConfigValue("alt", "");
  const [objectFit, setObjectFit] = useConfigValue("objectFit", "cover");
  const [objectPosition, setObjectPosition] = useConfigValue("objectPosition", "center");
  const [borderRadius, setBorderRadius] = useConfigValue("borderRadius", "none");
  const [aspectRatio, setAspectRatio] = useConfigValue("aspectRatio", "");
  const [caption, setCaption] = useConfigValue("caption", "");
  const [fallbackSrc, setFallbackSrc] = useConfigValue("fallbackSrc", "");
  const [lazy, setLazy] = useConfigValue("lazy", true);
  const [lightbox, setLightbox] = useConfigValue("lightbox", false);
  const [showBorder, setShowBorder] = useConfigValue("showBorder", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !fileUpload?.uploadFile) return;
    try {
      setUploading(true);
      const result = await fileUpload.uploadFile(file);
      if (result?.url) setSrc(result.url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <ConfigSection id="image-content" title="Image" tab="content">
        <ConfigField label="Source" path="src">
          <BindableInput value={src} onChange={setSrc} liveStateTree={liveStateTree} placeholder="https://… or {{ state.queries.user.data.avatar }}" />
        </ConfigField>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
          <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" disabled={uploading || !fileUpload} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
            Upload image
          </Button>
          <span className="text-[10px] text-muted-foreground">Or paste a URL/binding above.</span>
        </div>
        <ConfigField label="Alt text" path="alt" htmlFor="image-alt" helper="Required for informative images. Leave empty only for decoration.">
          <Input id="image-alt" value={alt ?? ""} onChange={(event) => setAlt(event.target.value)} placeholder="Profile photo" className="h-8 text-xs" />
        </ConfigField>
        <ConfigField label="Caption" path="caption">
          <BindableInput value={caption} onChange={setCaption} liveStateTree={liveStateTree} placeholder="Optional caption" />
        </ConfigField>
        <ConfigField label="Fallback source" path="fallbackSrc" helper="Shown when the primary image fails to load.">
          <BindableInput value={fallbackSrc} onChange={setFallbackSrc} liveStateTree={liveStateTree} placeholder="Fallback URL" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="image-style" title="Fit & frame" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Object fit" path="objectFit" defaultValue="cover">
            <SegmentedControl
              ariaLabel="Object fit"
              value={objectFit || "cover"}
              onChange={setObjectFit}
              options={[
                { value: "cover", label: "Cover" },
                { value: "contain", label: "Contain" },
                { value: "fill", label: "Fill" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Object position" path="objectPosition" defaultValue="center" htmlFor="image-position">
            <Input id="image-position" value={objectPosition ?? ""} onChange={(event) => setObjectPosition(event.target.value)} placeholder="center" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Corner radius" path="borderRadius" defaultValue="none">
            <SegmentedControl
              ariaLabel="Corner radius"
              value={borderRadius || "none"}
              onChange={setBorderRadius}
              options={[
                { value: "none", label: "0" },
                { value: "sm", label: "6" },
                { value: "md", label: "8" },
                { value: "lg", label: "12" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Aspect ratio" path="aspectRatio" htmlFor="image-aspect" helper="e.g. 16 / 9 or 1 / 1.">
            <Input id="image-aspect" value={aspectRatio ?? ""} onChange={(event) => setAspectRatio(event.target.value)} placeholder="auto" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Border" path="showBorder" defaultValue={false} inline>
            <Switch checked={!!showBorder} onCheckedChange={setShowBorder} aria-label="Show border" />
          </ConfigField>
          <ConfigField label="Lazy load" path="lazy" defaultValue={true} inline>
            <Switch checked={lazy !== false} onCheckedChange={setLazy} aria-label="Lazy load" />
          </ConfigField>
          <ConfigField label="Lightbox" path="lightbox" defaultValue={false} inline>
            <Switch checked={!!lightbox} onCheckedChange={setLightbox} aria-label="Lightbox" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="image-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

ImageConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
ImageConfigEditor.usesConfigKit = true;
export default ImageConfigEditor;
