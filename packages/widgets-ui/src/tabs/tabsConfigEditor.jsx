import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const TabsConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [tabs, setTabs] = useConfigValue("tabs", []);
  const [defaultTab, setDefaultTab] = useConfigValue("defaultTab", "");
  const [orientation, setOrientation] = useConfigValue("orientation", "horizontal");
  const [variant, setVariant] = useConfigValue("variant", "underline");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="tabs-content" title="Tabs" tab="content">
        <ConfigField label="Tab list" path="tabs">
          <OptionListEditor value={tabs || []} onChange={setTabs} itemLabel="Tab" allowDescription allowDisabled />
        </ConfigField>
        <ConfigField label="Default tab" path="defaultTab" helper="Tab value selected on first load.">
          <BindableInput value={defaultTab} onChange={setDefaultTab} liveStateTree={liveStateTree} placeholder="e.g. overview" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="tabs-style" title="Tab bar" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Orientation" path="orientation" defaultValue="horizontal">
            <SegmentedControl
              ariaLabel="Tab orientation"
              value={orientation || "horizontal"}
              onChange={setOrientation}
              options={[
                { value: "horizontal", label: "Horizontal" },
                { value: "vertical", label: "Vertical" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Variant" path="variant" defaultValue="underline">
            <SegmentedControl
              ariaLabel="Tab variant"
              value={variant || "underline"}
              onChange={setVariant}
              options={[
                { value: "underline", label: "Underline" },
                { value: "pills", label: "Pills" },
                { value: "segmented", label: "Segmented" },
              ]}
            />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="tabs-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

TabsConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
TabsConfigEditor.usesConfigKit = true;
export default TabsConfigEditor;
