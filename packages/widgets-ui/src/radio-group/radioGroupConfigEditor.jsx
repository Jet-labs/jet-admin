import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const RadioGroupConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "");
  const [options, setOptions] = useConfigValue("options", []);
  const [optionsTemplate, setOptionsTemplate] = useConfigValue("optionsTemplate", "");
  const [labelKey, setLabelKey] = useConfigValue("labelKey", "label");
  const [valueKey, setValueKey] = useConfigValue("valueKey", "value");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", "");
  const [orientation, setOrientation] = useConfigValue("orientation", "vertical");
  const [variant, setVariant] = useConfigValue("variant", "plain");
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const bound = Boolean(optionsTemplate);

  return (
    <>
      <ConfigSection id="radio-content" title="Choices" tab="content">
        <ConfigField label="Label" path="label" htmlFor="radio-label">
          <BindableInput id="radio-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Priority" />
        </ConfigField>
        <ConfigField label="Options" path="options">
          <OptionListEditor value={options || []} onChange={setOptions} itemLabel="Option" allowDescription allowDisabled />
        </ConfigField>
        <ConfigField label="Bound options" path="optionsTemplate" helper="Expression resolving to an array. Overrides the static list.">
          <BindableInput value={optionsTemplate} onChange={setOptionsTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.priorities.data }}" />
        </ConfigField>
        {bound && (
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Label key" path="labelKey" defaultValue="label" htmlFor="radio-label-key">
              <Input id="radio-label-key" value={labelKey ?? "label"} onChange={(event) => setLabelKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
            <ConfigField label="Value key" path="valueKey" defaultValue="value" htmlFor="radio-value-key">
              <Input id="radio-value-key" value={valueKey ?? "value"} onChange={(event) => setValueKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
          </div>
        )}
        <ConfigField label="Default value" path="defaultValue">
          <BindableInput value={defaultValue} onChange={setDefaultValue} liveStateTree={liveStateTree} placeholder="e.g. high" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="radio-style" title="Layout" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Orientation" path="orientation" defaultValue="vertical">
            <SegmentedControl
              ariaLabel="Orientation"
              value={orientation || "vertical"}
              onChange={setOrientation}
              options={[
                { value: "vertical", label: "Vertical" },
                { value: "horizontal", label: "Horizontal" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Variant" path="variant" defaultValue="plain">
            <SegmentedControl
              ariaLabel="Radio variant"
              value={variant || "plain"}
              onChange={setVariant}
              options={[
                { value: "plain", label: "Plain" },
                { value: "cards", label: "Cards" },
              ]}
            />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="radio-behavior" title="Validation & state" tab="behavior">
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Required" path="required" defaultValue={false} inline>
            <BindableSwitch value={required} onChange={setRequired} liveStateTree={liveStateTree} ariaLabel="Required" />
          </ConfigField>
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Read-only" path="readOnly" defaultValue={false} inline>
            <BindableSwitch value={readOnly} onChange={setReadOnly} liveStateTree={liveStateTree} ariaLabel="Read-only" />
          </ConfigField>
        </div>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

RadioGroupConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
RadioGroupConfigEditor.usesConfigKit = true;
export default RadioGroupConfigEditor;
