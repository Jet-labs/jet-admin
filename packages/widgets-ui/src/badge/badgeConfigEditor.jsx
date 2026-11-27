import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ConditionalStyleField,
  IconPicker,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const BadgeConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [text, setText] = useConfigValue("text", "");
  const [variant, setVariant] = useConfigValue("variant", "default");
  const [size, setSize] = useConfigValue("size", "default");
  const [dot, setDot] = useConfigValue("dot", false);
  const [icon, setIcon] = useConfigValue("icon", "");
  const [shape, setShape] = useConfigValue("shape", "pill");
  const [alignment, setAlignment] = useConfigValue("alignment", "center");
  const [maxWidth, setMaxWidth] = useConfigValue("maxWidth", "");
  const [styleRules, setStyleRules] = useConfigValue("styleRules", { logic: "and", rules: [], style: {} });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="badge-content" title="Badge" tab="content">
        <ConfigField label="Text" path="text" htmlFor="badge-text">
          <BindableInput id="badge-text" value={text} onChange={setText} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.order.data[0].status }}" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Icon" path="icon">
            <IconPicker value={icon} onChange={setIcon} label="Badge icon" />
          </ConfigField>
          <ConfigField label="Max width" path="maxWidth" htmlFor="badge-max-width" helper="Empty means natural width.">
            <Input id="badge-max-width" value={maxWidth ?? ""} onChange={(event) => setMaxWidth(event.target.value)} placeholder="12rem" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Dot indicator" path="dot" defaultValue={false} inline helper="A small status dot before the label.">
          <Switch checked={!!dot} onCheckedChange={setDot} aria-label="Dot indicator" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="badge-style" title="Variant & shape" tab="style">
        <ConfigField label="Variant" path="variant" defaultValue="default" htmlFor="badge-variant">
          <select
            id="badge-variant"
            value={variant || "default"}
            onChange={(event) => setVariant(event.target.value)}
            className="h-8 w-full rounded border border-input-custom bg-input-custom px-2 text-xs text-foreground focus-visible:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <option value="default">Default</option>
            <option value="soft">Soft</option>
            <option value="outline">Outline</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="info">Info</option>
            <option value="neutral">Neutral</option>
          </select>
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Badge size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Shape" path="shape" defaultValue="pill">
            <SegmentedControl
              ariaLabel="Badge shape"
              value={shape || "pill"}
              onChange={setShape}
              options={[
                { value: "pill", label: "Pill" },
                { value: "square", label: "Square" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Alignment" path="alignment" defaultValue="center">
          <SegmentedControl
            ariaLabel="Badge alignment"
            value={alignment || "center"}
            onChange={setAlignment}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </ConfigField>
        <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
          <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style</summary>
          <div className="mt-1.5">
            <ConditionalStyleField
              value={styleRules}
              onChange={setStyleRules}
              fields={["value", "state.variables.status"]}
              emptyLabel="No rules — use the selected variant."
            />
          </div>
        </details>
      </ConfigSection>

      <ConfigSection id="badge-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

BadgeConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
BadgeConfigEditor.usesConfigKit = true;
export default BadgeConfigEditor;
