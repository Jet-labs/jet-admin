import React, { useId } from "react";
import { Input, Switch } from "@jet-admin/ui";
import { ConfigSection } from "./ConfigSection";
import { ConfigField } from "./ConfigField";
import { ColorField } from "./ColorField";
import { SpacingField } from "./SpacingField";
import { SegmentedControl } from "./SegmentedControl";
import { StylePresetMenu } from "./StylePresetMenu";
import { useConfigValue } from "./configEditorContext";

/**
 * Shared widget surface controls. These write to the existing
 * `properties.style` contract consumed by AppPageWidgetSlot, so no renderer
 * or schema break is required.
 */
export const WidgetStyleSection = ({ widgetType }) => {
  const densityId = useId();
  const borderId = useId();

  const [density, setDensity] = useConfigValue("properties.density", "comfortable");
  const [showBorder, setShowBorder] = useConfigValue("properties.style.showBorder", true);
  const [backgroundColor, setBackgroundColor] = useConfigValue("properties.style.backgroundColor", "");
  const [textColor, setTextColor] = useConfigValue("properties.style.textColor", "");
  const [borderWidth, setBorderWidth] = useConfigValue("properties.style.borderWidth", "1px");
  const [borderColor, setBorderColor] = useConfigValue("properties.style.borderColor", "");
  const [borderRadius, setBorderRadius] = useConfigValue("properties.style.borderRadius", "");
  const [padding, setPadding] = useConfigValue("properties.style.padding", "");
  const [boxShadow, setBoxShadow] = useConfigValue("properties.style.boxShadow", "");
  const [fullStyle, setFullStyle] = useConfigValue("properties.style", {});

  return (
    <ConfigSection
      id="shared-style-surface"
      title="Surface"
      description="Density, frame and token-backed colors shared by every widget."
      tab="style"
      keywords={`${widgetType} density padding border radius shadow background text color frame surface`}
      actions={
        <StylePresetMenu
          currentStyle={fullStyle || {}}
          storageKey={`jet.widget.stylePresets.${widgetType || "widget"}`}
          onApply={(preset, key) => {
            if (key === "default") setFullStyle({});
            else setFullStyle({ ...(fullStyle || {}), ...preset });
          }}
        />
      }
    >
      <ConfigField
        label="Density"
        path="properties.density"
        defaultValue="comfortable"
        htmlFor={densityId}
        helper="Scales padding, row height and type size. Comfortable matches today's look."
      >
        <SegmentedControl
          value={density || "comfortable"}
          onChange={setDensity}
          ariaLabel="Widget density"
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
            { value: "spacious", label: "Spacious" },
          ]}
        />
      </ConfigField>

      <ConfigField
        label="Show border and shadow"
        path="properties.style.showBorder"
        defaultValue={true}
        inline
        htmlFor={borderId}
        helper="Turn off for a borderless, embedded look."
      >
        <Switch id={borderId} checked={showBorder !== false} onCheckedChange={setShowBorder} />
      </ConfigField>

      {showBorder !== false && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Border width" path="properties.style.borderWidth" defaultValue="1px">
              <Input
                value={borderWidth ?? ""}
                onChange={(event) => setBorderWidth(event.target.value)}
                placeholder="1px"
                className="h-8 font-mono text-xs"
              />
            </ConfigField>
            <ConfigField label="Border color" path="properties.style.borderColor">
              <ColorField value={borderColor} onChange={setBorderColor} label="Border" />
            </ConfigField>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Corner radius" path="properties.style.borderRadius">
              <SegmentedControl
                ariaLabel="Corner radius"
                value={borderRadius || ""}
                onChange={setBorderRadius}
                options={[
                  { value: "", label: "0", title: "Square" },
                  { value: "var(--radius-control)", label: "6", title: "Control radius" },
                  { value: "var(--radius-card)", label: "8", title: "Card radius" },
                  { value: "var(--radius-overlay)", label: "12", title: "Overlay radius" },
                ]}
              />
            </ConfigField>
            <ConfigField label="Shadow" path="properties.style.boxShadow">
              <SegmentedControl
                ariaLabel="Shadow"
                value={boxShadow || ""}
                onChange={setBoxShadow}
                options={[
                  { value: "", label: "None" },
                  { value: "var(--shadow-soft)", label: "Soft" },
                  { value: "var(--shadow-raised)", label: "Raised" },
                ]}
              />
            </ConfigField>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <ConfigField label="Background" path="properties.style.backgroundColor">
          <ColorField value={backgroundColor} onChange={setBackgroundColor} label="Background" />
        </ConfigField>
        <ConfigField label="Text color" path="properties.style.textColor">
          <ColorField value={textColor} onChange={setTextColor} label="Text" />
        </ConfigField>
      </div>

      <ConfigField
        label="Inner padding"
        path="properties.style.padding"
        helper="CSS shorthand; use the link control to keep all sides equal."
      >
        <SpacingField value={padding} onChange={setPadding} label="Inner padding" />
      </ConfigField>
    </ConfigSection>
  );
};

export const WidgetAccessibilitySection = () => {
  const ariaId = useId();
  const testId = useId();
  const [ariaLabel, setAriaLabel] = useConfigValue("properties.ariaLabel", "");
  const [dataTestId, setDataTestId] = useConfigValue("properties.testId", "");

  return (
    <ConfigSection
      id="shared-advanced-accessibility"
      title="Accessibility & test hooks"
      description="Names assistive technology and automation use for this widget."
      tab="advanced"
      keywords="aria label accessibility test id data-testid automation screen reader"
    >
      <ConfigField
        label="Accessible name"
        path="properties.ariaLabel"
        htmlFor={ariaId}
        helper="Overrides the visible widget title for screen readers."
      >
        <Input
          id={ariaId}
          value={ariaLabel ?? ""}
          onChange={(event) => setAriaLabel(event.target.value)}
          placeholder="e.g. Revenue summary"
          className="h-8 text-xs"
        />
      </ConfigField>
      <ConfigField
        label="Test ID"
        path="properties.testId"
        htmlFor={testId}
        helper="Added as data-testid on the widget frame."
      >
        <Input
          id={testId}
          value={dataTestId ?? ""}
          onChange={(event) => setDataTestId(event.target.value)}
          placeholder="e.g. revenue-stat"
          className="h-8 font-mono text-xs"
        />
      </ConfigField>
    </ConfigSection>
  );
};

export default WidgetStyleSection;
