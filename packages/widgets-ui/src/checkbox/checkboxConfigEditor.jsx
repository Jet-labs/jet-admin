import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const CheckboxConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "Checkbox");
  const [description, setDescription] = useConfigValue("description", "");
  const [defaultChecked, setDefaultChecked] = useConfigValue("defaultChecked", false);
  const [size, setSize] = useConfigValue("size", "default");
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [indeterminate, setIndeterminate] = useConfigValue("indeterminate", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="checkbox-content" title="Checkbox" tab="content">
        <ConfigField label="Label" path="label" htmlFor="checkbox-label">
          <BindableInput id="checkbox-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Include archived" />
        </ConfigField>
        <ConfigField label="Description" path="description" htmlFor="checkbox-description" helper="Shown under the label and linked with aria-describedby.">
          <BindableInput id="checkbox-description" value={description} onChange={setDescription} liveStateTree={liveStateTree} placeholder="Helper text" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="checkbox-style" title="Style" tab="style">
        <ConfigField label="Control size" path="size" defaultValue="default">
          <SegmentedControl
            ariaLabel="Checkbox size"
            value={size || "default"}
            onChange={setSize}
            options={[
              { value: "sm", label: "S" },
              { value: "default", label: "M" },
              { value: "lg", label: "L" },
            ]}
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="checkbox-behavior" title="State" tab="behavior">
        <ConfigField label="Checked by default" path="defaultChecked" defaultValue={false} inline>
          <Switch checked={!!defaultChecked} onCheckedChange={setDefaultChecked} aria-label="Checked by default" />
        </ConfigField>
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
        <ConfigField label="Indeterminate" path="indeterminate" defaultValue={false} inline helper="Displays the mixed state until the user chooses.">
          <Switch checked={!!indeterminate} onCheckedChange={setIndeterminate} aria-label="Indeterminate" />
        </ConfigField>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

CheckboxConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
CheckboxConfigEditor.usesConfigKit = true;
export default CheckboxConfigEditor;
