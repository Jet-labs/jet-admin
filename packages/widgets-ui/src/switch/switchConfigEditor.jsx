import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const SwitchConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "Toggle");
  const [description, setDescription] = useConfigValue("description", "");
  const [defaultChecked, setDefaultChecked] = useConfigValue("defaultChecked", false);
  const [onLabel, setOnLabel] = useConfigValue("onLabel", "On");
  const [offLabel, setOffLabel] = useConfigValue("offLabel", "Off");
  const [showStateLabels, setShowStateLabels] = useConfigValue("showStateLabels", false);
  const [labelPlacement, setLabelPlacement] = useConfigValue("labelPlacement", "left");
  const [size, setSize] = useConfigValue("size", "default");
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [confirm, setConfirm] = useConfigValue("confirm", { enabled: false });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="switch-content" title="Switch" tab="content">
        <ConfigField label="Label" path="label" htmlFor="switch-label">
          <BindableInput id="switch-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Active only" />
        </ConfigField>
        <ConfigField label="Description" path="description" htmlFor="switch-description">
          <BindableInput id="switch-description" value={description} onChange={setDescription} liveStateTree={liveStateTree} placeholder="Helper text" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="On label" path="onLabel" defaultValue="On" htmlFor="switch-on-label">
            <Input id="switch-on-label" value={onLabel ?? ""} onChange={(event) => setOnLabel(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Off label" path="offLabel" defaultValue="Off" htmlFor="switch-off-label">
            <Input id="switch-off-label" value={offLabel ?? ""} onChange={(event) => setOffLabel(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Show on/off labels" path="showStateLabels" defaultValue={false} inline>
          <Switch checked={!!showStateLabels} onCheckedChange={setShowStateLabels} aria-label="Show state labels" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="switch-style" title="Presentation" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Label placement" path="labelPlacement" defaultValue="left">
            <SegmentedControl
              ariaLabel="Label placement"
              value={labelPlacement || "left"}
              onChange={setLabelPlacement}
              options={[
                { value: "left", label: "Label left" },
                { value: "right", label: "Label right" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Switch size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="switch-behavior" title="State & confirmation" tab="behavior">
        <ConfigField label="On by default" path="defaultChecked" defaultValue={false} inline>
          <Switch checked={!!defaultChecked} onCheckedChange={setDefaultChecked} aria-label="On by default" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Read-only" path="readOnly" defaultValue={false} inline>
            <BindableSwitch value={readOnly} onChange={setReadOnly} liveStateTree={liveStateTree} ariaLabel="Read-only" />
          </ConfigField>
        </div>
        <ConfigField label="Confirm before changing" path="confirm.enabled" defaultValue={false} inline helper="Useful for destructive settings.">
          <Switch
            checked={!!confirm?.enabled}
            onCheckedChange={(checked) => setConfirm({ ...(confirm || {}), enabled: !!checked })}
            aria-label="Confirm before changing"
          />
        </ConfigField>
        {confirm?.enabled && (
          <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
            <ConfigField label="Dialog title" path="confirm.title">
              <BindableInput value={confirm?.title ?? ""} onChange={(value) => setConfirm({ ...confirm, title: value })} liveStateTree={liveStateTree} placeholder="Change this setting?" />
            </ConfigField>
            <ConfigField label="Message" path="confirm.message">
              <BindableInput value={confirm?.message ?? ""} onChange={(value) => setConfirm({ ...confirm, message: value })} liveStateTree={liveStateTree} placeholder="This may affect other records." />
            </ConfigField>
          </div>
        )}
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

SwitchConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
SwitchConfigEditor.usesConfigKit = true;
export default SwitchConfigEditor;
