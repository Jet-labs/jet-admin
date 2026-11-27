import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { CodeEditor, Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ColorField,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const HtmlConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [html, setHtml] = useConfigValue("html", "");
  const [css, setCss] = useConfigValue("css", "");
  const [mode, setMode] = useConfigValue("templateMode", "template");
  const [colorScheme, setColorScheme] = useConfigValue("colorScheme", "light");
  const [backgroundColor, setBackgroundColor] = useConfigValue("backgroundColor", "#ffffff");
  const [textColor, setTextColor] = useConfigValue("textColor", "#111827");
  const [allowScripts, setAllowScripts] = useConfigValue("allowScripts", false);
  const [allowForms, setAllowForms] = useConfigValue("allowForms", false);
  const [allowPopups, setAllowPopups] = useConfigValue("allowPopups", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="html-content" title="Markup" tab="content">
        <ConfigField label="Authoring mode" path="templateMode" defaultValue="template">
          <SegmentedControl
            ariaLabel="HTML authoring mode"
            value={mode || "template"}
            onChange={setMode}
            options={[
              { value: "raw", label: "Raw HTML" },
              { value: "template", label: "Templates" },
            ]}
          />
        </ConfigField>
        <ConfigField label="HTML" path="html">
          <CodeEditor
            language="html"
            value={html || ""}
            onChange={setHtml}
            stateTree={liveStateTree}
            templateMode={mode === "raw" ? undefined : "js-template"}
            height={180}
            showExpandButton
            showFormatButton={false}
            showLineNumbers
            title="HTML"
          />
        </ConfigField>
        <ConfigField label="CSS" path="css">
          <CodeEditor
            language="css"
            value={css || ""}
            onChange={setCss}
            stateTree={liveStateTree}
            templateMode={mode === "raw" ? undefined : "js-template"}
            height={120}
            showExpandButton
            showFormatButton={false}
            showLineNumbers
            title="CSS"
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="html-style" title="Theme" tab="style">
        <ConfigField label="Color scheme" path="colorScheme" defaultValue="light">
          <SegmentedControl
            ariaLabel="Color scheme"
            value={colorScheme || "light"}
            onChange={setColorScheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Background" path="backgroundColor">
            <ColorField value={backgroundColor} onChange={setBackgroundColor} label="Background" />
          </ConfigField>
          <ConfigField label="Text color" path="textColor">
            <ColorField value={textColor} onChange={setTextColor} label="Text" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="html-security" title="Sandbox security" tab="behavior">
        <div className="space-y-1.5">
          <ConfigField label="Execute JavaScript" path="allowScripts" defaultValue={false} inline helper="Allows script tags inside the sandbox.">
            <Switch checked={!!allowScripts} onCheckedChange={setAllowScripts} aria-label="Execute JavaScript" />
          </ConfigField>
          <ConfigField label="Submit forms" path="allowForms" defaultValue={false} inline>
            <Switch checked={!!allowForms} onCheckedChange={setAllowForms} aria-label="Submit forms" />
          </ConfigField>
          <ConfigField label="Popups" path="allowPopups" defaultValue={false} inline>
            <Switch checked={!!allowPopups} onCheckedChange={setAllowPopups} aria-label="Allow popups" />
          </ConfigField>
        </div>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

HtmlConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
HtmlConfigEditor.usesConfigKit = true;
export default HtmlConfigEditor;
