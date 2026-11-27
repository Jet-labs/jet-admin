import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ColorField,
  ConditionalStyleField,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const TextConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [content, setContent] = useConfigValue("content", "");
  const [format, setFormat] = useConfigValue("format", "markdown");
  const [preset, setPreset] = useConfigValue("preset", "body");
  const [textAlign, setTextAlign] = useConfigValue("textAlign", "left");
  const [color, setColor] = useConfigValue("color", "");
  const [lineClamp, setLineClamp] = useConfigValue("lineClamp", "");
  const [styleRules, setStyleRules] = useConfigValue("styleRules", { logic: "and", rules: [], style: {} });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="text-content" title="Content" tab="content">
        <ConfigField label="Content" path="content" helper="Markdown and {{ expressions }} are supported.">
          <BindableInput
            value={content}
            onChange={setContent}
            liveStateTree={liveStateTree}
            multiline
            rows={6}
            placeholder={"# Heading\n\nSome **bold** text.\n\nValue: {{ state.queries.myQuery.data[0].name }}"}
          />
        </ConfigField>
        <ConfigField label="Format" path="format" defaultValue="markdown">
          <SegmentedControl
            ariaLabel="Text format"
            value={format || "markdown"}
            onChange={setFormat}
            options={[
              { value: "markdown", label: "Markdown" },
              { value: "plain", label: "Plain" },
            ]}
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="text-style" title="Typography" tab="style">
        <ConfigField label="Preset" path="preset" defaultValue="body">
          <SegmentedControl
            ariaLabel="Text preset"
            value={preset || "body"}
            onChange={setPreset}
            options={[
              { value: "heading", label: "Heading" },
              { value: "body", label: "Body" },
              { value: "caption", label: "Caption" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Alignment" path="textAlign" defaultValue="left">
            <SegmentedControl
              ariaLabel="Text alignment"
              value={textAlign || "left"}
              onChange={setTextAlign}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Line clamp" path="lineClamp" htmlFor="text-line-clamp" helper="Empty shows all lines.">
            <Input
              id="text-line-clamp"
              type="number"
              min={1}
              max={20}
              value={lineClamp ?? ""}
              onChange={(event) => setLineClamp(event.target.value === "" ? "" : Number(event.target.value))}
              placeholder="∞"
              className="h-8 text-xs"
            />
          </ConfigField>
        </div>
        <ConfigField label="Text color" path="color">
          <ColorField value={color} onChange={setColor} label="Text" />
        </ConfigField>
        <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
          <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style</summary>
          <div className="mt-1.5">
            <ConditionalStyleField
              value={styleRules}
              onChange={setStyleRules}
              fields={["value", "state.variables.status"]}
              emptyLabel="No rules — use the typography defaults."
            />
          </div>
        </details>
      </ConfigSection>

      <ConfigSection id="text-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

TextConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
TextConfigEditor.usesConfigKit = true;
export default TextConfigEditor;
