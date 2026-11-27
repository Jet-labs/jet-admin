import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  ColorField,
  SegmentedControl,
  TagField,
  useConfigValue,
} from "../config";

export const SliderConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", 50);
  const [range, setRange] = useConfigValue("range", false);
  const [min, setMin] = useConfigValue("min", 0);
  const [max, setMax] = useConfigValue("max", 100);
  const [step, setStep] = useConfigValue("step", 1);
  const [showValue, setShowValue] = useConfigValue("showValue", true);
  const [showMinMax, setShowMinMax] = useConfigValue("showMinMax", true);
  const [showInput, setShowInput] = useConfigValue("showInput", false);
  const [unit, setUnit] = useConfigValue("unit", "");
  const [decimals, setDecimals] = useConfigValue("decimals", 0);
  const [marks, setMarks] = useConfigValue("marks", []);
  const [trackColor, setTrackColor] = useConfigValue("trackColor", "");
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  const boundsError = Number(min) >= Number(max) ? "Maximum must be greater than minimum." : "";
  const stepError = Number(step) <= 0 ? "Step must be greater than 0." : "";

  return (
    <>
      <ConfigSection id="slider-content" title="Slider" tab="content">
        <ConfigField label="Label" path="label" htmlFor="slider-label">
          <BindableInput id="slider-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Min revenue" />
        </ConfigField>
        <ConfigField label="Default value" path="defaultValue" defaultValue={50}>
          {range ? (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                aria-label="Default minimum"
                value={Array.isArray(defaultValue) ? (defaultValue[0] ?? min) : min}
                onChange={(event) => {
                  const start = event.target.value === "" ? "" : Number(event.target.value);
                  const current = Array.isArray(defaultValue) ? defaultValue : [min, max];
                  setDefaultValue([start, current[1] ?? max]);
                }}
                className="h-8 text-xs"
              />
              <Input
                type="number"
                aria-label="Default maximum"
                value={Array.isArray(defaultValue) ? (defaultValue[1] ?? max) : max}
                onChange={(event) => {
                  const end = event.target.value === "" ? "" : Number(event.target.value);
                  const current = Array.isArray(defaultValue) ? defaultValue : [min, max];
                  setDefaultValue([current[0] ?? min, end]);
                }}
                className="h-8 text-xs"
              />
            </div>
          ) : (
            <BindableInput value={String(defaultValue ?? "")} onChange={(value) => setDefaultValue(value === "" ? "" : Number(value))} liveStateTree={liveStateTree} placeholder="50" />
          )}
        </ConfigField>
        <ConfigField label="Range mode" path="range" defaultValue={false} inline helper="Two thumbs with a start/end array value.">
          <Switch checked={!!range} onCheckedChange={setRange} aria-label="Range mode" />
        </ConfigField>
        <div className="grid grid-cols-3 gap-2">
          <ConfigField label="Min" path="min" defaultValue={0} error={boundsError}>
            <Input type="number" value={min ?? 0} onChange={(event) => setMin(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Max" path="max" defaultValue={100}>
            <Input type="number" value={max ?? 100} onChange={(event) => setMax(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Step" path="step" defaultValue={1} error={stepError}>
            <Input type="number" min={0.0001} value={step ?? 1} onChange={(event) => setStep(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Unit" path="unit" htmlFor="slider-unit">
            <Input id="slider-unit" value={unit ?? ""} onChange={(event) => setUnit(event.target.value)} placeholder="%" className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Decimals" path="decimals" defaultValue={0}>
            <SegmentedControl
              ariaLabel="Value decimals"
              value={String(decimals ?? 0)}
              onChange={(value) => setDecimals(Number(value))}
              options={[
                { value: "0", label: "0" },
                { value: "1", label: "1" },
                { value: "2", label: "2" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Marks" path="marks" helper="Optional tick values, e.g. 0, 25, 50, 75, 100.">
          <TagField value={marks || []} onChange={setMarks} placeholder="Add a tick value…" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Show value badge" path="showValue" defaultValue={true} inline>
            <Switch checked={showValue !== false} onCheckedChange={setShowValue} aria-label="Show value badge" />
          </ConfigField>
          <ConfigField label="Show min/max" path="showMinMax" defaultValue={true} inline>
            <Switch checked={showMinMax !== false} onCheckedChange={setShowMinMax} aria-label="Show min and max" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Number input" path="showInput" defaultValue={false} inline helper="Keeps a precise numeric input in sync.">
            <Switch checked={!!showInput} onCheckedChange={setShowInput} aria-label="Show numeric input" />
          </ConfigField>
          <ConfigField label="Track color" path="trackColor">
            <ColorField value={trackColor} onChange={setTrackColor} label="Track" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="slider-behavior" title="State" tab="behavior">
        <div className="grid grid-cols-2 gap-3">
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

SliderConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
SliderConfigEditor.usesConfigKit = true;
export default SliderConfigEditor;
