import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const VideoConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [src, setSrc] = useConfigValue("src", "");
  const [poster, setPoster] = useConfigValue("poster", "");
  const [controls, setControls] = useConfigValue("controls", true);
  const [autoplay, setAutoplay] = useConfigValue("autoplay", false);
  const [muted, setMuted] = useConfigValue("muted", false);
  const [loop, setLoop] = useConfigValue("loop", false);
  const [playsInline, setPlaysInline] = useConfigValue("playsInline", true);
  const [preload, setPreload] = useConfigValue("preload", "metadata");
  const [aspectRatio, setAspectRatio] = useConfigValue("aspectRatio", "");
  const [tracks, setTracks] = useConfigValue("tracks", []);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="video-content" title="Video" tab="content">
        <ConfigField label="Video URL" path="src">
          <BindableInput value={src} onChange={setSrc} liveStateTree={liveStateTree} placeholder="https://…/video.mp4" />
        </ConfigField>
        <ConfigField label="Poster URL" path="poster">
          <BindableInput value={poster} onChange={setPoster} liveStateTree={liveStateTree} placeholder="Optional poster image" />
        </ConfigField>
        <ConfigField label="Caption tracks" path="tracks" helper="Add WebVTT caption files.">
          <OptionListEditor
            value={tracks || []}
            onChange={setTracks}
            labelKey="label"
            valueKey="src"
            itemLabel="Track"
            allowDescription
            allowDisabled={false}
            showValue
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="video-style" title="Player" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Aspect ratio" path="aspectRatio" htmlFor="video-aspect" helper="e.g. 16 / 9.">
            <Input id="video-aspect" value={aspectRatio ?? ""} onChange={(event) => setAspectRatio(event.target.value)} placeholder="auto" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Preload" path="preload" defaultValue="metadata">
            <SegmentedControl
              ariaLabel="Preload"
              value={preload || "metadata"}
              onChange={setPreload}
              options={[
                { value: "none", label: "None" },
                { value: "metadata", label: "Meta" },
                { value: "auto", label: "Auto" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Controls" path="controls" defaultValue={true} inline>
            <Switch checked={controls !== false} onCheckedChange={setControls} aria-label="Controls" />
          </ConfigField>
          <ConfigField label="Loop" path="loop" defaultValue={false} inline>
            <Switch checked={!!loop} onCheckedChange={setLoop} aria-label="Loop" />
          </ConfigField>
          <ConfigField label="Autoplay" path="autoplay" defaultValue={false} inline helper="Requires muted in most browsers.">
            <Switch checked={!!autoplay} onCheckedChange={setAutoplay} aria-label="Autoplay" />
          </ConfigField>
          <ConfigField label="Muted" path="muted" defaultValue={false} inline>
            <Switch checked={!!muted} onCheckedChange={setMuted} aria-label="Muted" />
          </ConfigField>
          <ConfigField label="Play inline" path="playsInline" defaultValue={true} inline>
            <Switch checked={playsInline !== false} onCheckedChange={setPlaysInline} aria-label="Play inline" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="video-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

VideoConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
VideoConfigEditor.usesConfigKit = true;
export default VideoConfigEditor;
