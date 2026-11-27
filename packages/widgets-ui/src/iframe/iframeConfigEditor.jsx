import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const IframeConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [url, setUrl] = useConfigValue("url", "");
  const [title, setTitle] = useConfigValue("title", "");
  const [allowScripts, setAllowScripts] = useConfigValue("allowScripts", true);
  const [allowForms, setAllowForms] = useConfigValue("allowForms", true);
  const [allowPopups, setAllowPopups] = useConfigValue("allowPopups", false);
  const [allowSameOrigin, setAllowSameOrigin] = useConfigValue("allowSameOrigin", false);
  const [allowFullscreen, setAllowFullscreen] = useConfigValue("allowFullscreen", true);
  const [allowCamera, setAllowCamera] = useConfigValue("allowCamera", false);
  const [referrerPolicy, setReferrerPolicy] = useConfigValue("referrerPolicy", "no-referrer-when-downgrade");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const preset = useMemo(() => {
    if (allowScripts && allowForms && !allowPopups && !allowSameOrigin) return "interactive";
    if (!allowScripts && !allowForms && !allowPopups) return "safe";
    return "custom";
  }, [allowScripts, allowForms, allowPopups, allowSameOrigin]);

  const applyPreset = (next) => {
    if (next === "safe") {
      setAllowScripts(false);
      setAllowForms(false);
      setAllowPopups(false);
      setAllowSameOrigin(false);
    } else if (next === "interactive") {
      setAllowScripts(true);
      setAllowForms(true);
      setAllowPopups(false);
      setAllowSameOrigin(false);
    }
  };

  return (
    <>
      <ConfigSection id="iframe-content" title="Embed" tab="content">
        <ConfigField label="URL" path="url" helper="http(s) or relative URLs. Other schemes are blocked.">
          <BindableInput value={url} onChange={setUrl} liveStateTree={liveStateTree} placeholder="https://example.com" />
        </ConfigField>
        <ConfigField label="Frame title" path="title" htmlFor="iframe-title" helper="Read by screen readers.">
          <Input id="iframe-title" value={title ?? ""} onChange={(event) => setTitle(event.target.value)} placeholder="Embedded dashboard" className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="iframe-style" title="Security & permissions" tab="style">
        <ConfigField label="Preset" path="sandboxPreset" defaultValue="interactive">
          <SegmentedControl
            ariaLabel="Sandbox preset"
            value={preset}
            onChange={applyPreset}
            options={[
              { value: "safe", label: "Safe" },
              { value: "interactive", label: "Interactive" },
              { value: "custom", label: "Custom" },
            ]}
          />
        </ConfigField>
        <div className="space-y-1.5">
          <ConfigField label="Scripts" path="allowScripts" defaultValue={true} inline>
            <Switch checked={allowScripts !== false} onCheckedChange={setAllowScripts} aria-label="Allow scripts" />
          </ConfigField>
          <ConfigField label="Forms" path="allowForms" defaultValue={true} inline>
            <Switch checked={allowForms !== false} onCheckedChange={setAllowForms} aria-label="Allow forms" />
          </ConfigField>
          <ConfigField label="Popups" path="allowPopups" defaultValue={false} inline>
            <Switch checked={!!allowPopups} onCheckedChange={setAllowPopups} aria-label="Allow popups" />
          </ConfigField>
          <ConfigField
            label="Same origin"
            path="allowSameOrigin"
            defaultValue={false}
            inline
            helper="Only enable for fully trusted content; scripts plus same-origin can escape the sandbox."
          >
            <Switch checked={!!allowSameOrigin} onCheckedChange={setAllowSameOrigin} aria-label="Allow same origin" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Fullscreen" path="allowFullscreen" defaultValue={true} inline>
            <Switch checked={allowFullscreen !== false} onCheckedChange={setAllowFullscreen} aria-label="Allow fullscreen" />
          </ConfigField>
          <ConfigField label="Camera/mic" path="allowCamera" defaultValue={false} inline>
            <Switch checked={!!allowCamera} onCheckedChange={setAllowCamera} aria-label="Allow camera and microphone" />
          </ConfigField>
        </div>
        <ConfigField label="Referrer policy" path="referrerPolicy" defaultValue="no-referrer-when-downgrade" htmlFor="iframe-referrer">
          <Input id="iframe-referrer" value={referrerPolicy ?? ""} onChange={(event) => setReferrerPolicy(event.target.value)} className="h-8 font-mono text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="iframe-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

IframeConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
IframeConfigEditor.usesConfigKit = true;
export default IframeConfigEditor;
