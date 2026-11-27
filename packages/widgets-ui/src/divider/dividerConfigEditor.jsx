import React from "react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  ColorField,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const DividerConfigEditor = () => {
  const [label, setLabel] = useConfigValue("label", "");
  const [orientation, setOrientation] = useConfigValue("orientation", "horizontal");
  const [thickness, setThickness] = useConfigValue("thickness", "thin");
  const [lineStyle, setLineStyle] = useConfigValue("lineStyle", "solid");
  const [spacing, setSpacing] = useConfigValue("spacing", "md");
  const [color, setColor] = useConfigValue("color", "");
  const [inset, setInset] = useConfigValue("inset", false);
  const [labelAlign, setLabelAlign] = useConfigValue("labelAlign", "center");

  return (
    <>
      <ConfigSection id="divider-content" title="Divider" tab="content">
        <ConfigField label="Label" path="label" htmlFor="divider-label" helper="Optional text shown in the middle of a horizontal divider.">
          <Input id="divider-label" value={label ?? ""} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Filters" className="h-8 text-xs" />
        </ConfigField>
        {label && (
          <ConfigField label="Label alignment" path="labelAlign" defaultValue="center">
            <SegmentedControl
              ariaLabel="Label alignment"
              value={labelAlign || "center"}
              onChange={setLabelAlign}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </ConfigField>
        )}
      </ConfigSection>

      <ConfigSection id="divider-style" title="Line" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Orientation" path="orientation" defaultValue="horizontal">
            <SegmentedControl
              ariaLabel="Orientation"
              value={orientation || "horizontal"}
              onChange={setOrientation}
              options={[
                { value: "horizontal", label: "Horizontal" },
                { value: "vertical", label: "Vertical" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Spacing" path="spacing" defaultValue="md">
            <SegmentedControl
              ariaLabel="Spacing"
              value={spacing || "md"}
              onChange={setSpacing}
              options={[
                { value: "sm", label: "S" },
                { value: "md", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Thickness" path="thickness" defaultValue="thin">
            <SegmentedControl
              ariaLabel="Thickness"
              value={thickness || "thin"}
              onChange={setThickness}
              options={[
                { value: "thin", label: "1" },
                { value: "medium", label: "2" },
                { value: "thick", label: "4" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Line style" path="lineStyle" defaultValue="solid">
            <SegmentedControl
              ariaLabel="Line style"
              value={lineStyle || "solid"}
              onChange={setLineStyle}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dash" },
                { value: "dotted", label: "Dot" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Line color" path="color">
          <ColorField value={color} onChange={setColor} label="Line" />
        </ConfigField>
        <ConfigField label="Inset" path="inset" defaultValue={false} inline helper="Adds horizontal inset on horizontal dividers.">
          <input
            type="checkbox"
            checked={!!inset}
            onChange={(event) => setInset(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
            aria-label="Inset divider"
          />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

DividerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object };
DividerConfigEditor.usesConfigKit = true;
export default DividerConfigEditor;
