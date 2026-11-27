import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

const DEFAULT_PRESETS = [
  { label: "Today", startOffset: 0, endOffset: 0 },
  { label: "Last 7 days", startOffset: -7, endOffset: 0 },
  { label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" },
];

export const DateRangePickerConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "");
  const [help, setHelp] = useConfigValue("help", "");
  const [placeholderStart, setPlaceholderStart] = useConfigValue("placeholderStart", "Start date");
  const [placeholderEnd, setPlaceholderEnd] = useConfigValue("placeholderEnd", "End date");
  const [defaultStart, setDefaultStart] = useConfigValue("defaultStart", "");
  const [defaultEnd, setDefaultEnd] = useConfigValue("defaultEnd", "");
  const [enableTime, setEnableTime] = useConfigValue("enableTime", false);
  const [requireApply, setRequireApply] = useConfigValue("requireApply", false);
  const [comparePrevious, setComparePrevious] = useConfigValue("comparePrevious", false);
  const [minDate, setMinDate] = useConfigValue("minDate", "");
  const [maxDate, setMaxDate] = useConfigValue("maxDate", "");
  const [disabledDates, setDisabledDates] = useConfigValue("disabledDates", []);
  const [presets, setPresets] = useConfigValue("presets", DEFAULT_PRESETS);
  const [size, setSize] = useConfigValue("size", "default");
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const rows = Array.isArray(presets) ? presets : [];
  const updatePreset = (index, patch) => setPresets(rows.map((preset, presetIndex) => (presetIndex === index ? { ...preset, ...patch } : preset)));

  return (
    <>
      <ConfigSection id="date-range-content" title="Date range" tab="content">
        <ConfigField label="Label" path="label" htmlFor="date-range-label">
          <BindableInput id="date-range-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Select a period" />
        </ConfigField>
        <ConfigField label="Help text" path="help">
          <BindableInput value={help} onChange={setHelp} liveStateTree={liveStateTree} placeholder="Shown under the field" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Start placeholder" path="placeholderStart" defaultValue="Start date" htmlFor="date-range-start-placeholder">
            <Input id="date-range-start-placeholder" value={placeholderStart ?? ""} onChange={(event) => setPlaceholderStart(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="End placeholder" path="placeholderEnd" defaultValue="End date" htmlFor="date-range-end-placeholder">
            <Input id="date-range-end-placeholder" value={placeholderEnd ?? ""} onChange={(event) => setPlaceholderEnd(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Default start" path="defaultStart">
            <BindableInput value={defaultStart} onChange={setDefaultStart} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.start }}" />
          </ConfigField>
          <ConfigField label="Default end" path="defaultEnd">
            <BindableInput value={defaultEnd} onChange={setDefaultEnd} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.end }}" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Min date" path="minDate" htmlFor="range-min">
            <Input id="range-min" value={minDate ?? ""} onChange={(event) => setMinDate(event.target.value)} placeholder="YYYY-MM-DD" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Max date" path="maxDate" htmlFor="range-max">
            <Input id="range-max" value={maxDate ?? ""} onChange={(event) => setMaxDate(event.target.value)} placeholder="YYYY-MM-DD" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Disabled dates" path="disabledDates" helper="Comma-separated YYYY-MM-DD values.">
          <Input
            value={(disabledDates || []).join(", ")}
            onChange={(event) => setDisabledDates(event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
            placeholder="2026-12-25, 2026-01-01"
            className="h-8 font-mono text-xs"
          />
        </ConfigField>
        <ConfigField label="Presets" path="presets" helper="Offsets accept numbers or startOfMonth/endOfMonth/startOfYear/endOfYear.">
          <div className="space-y-1.5">
            {rows.map((preset, index) => (
              <div key={index} className="flex items-end gap-1.5">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Label</label>
                  <Input value={preset.label ?? ""} onChange={(event) => updatePreset(index, { label: event.target.value })} className="h-7 text-[11px]" />
                </div>
                <div className="w-20 space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Start</label>
                  <Input value={preset.startOffset ?? ""} onChange={(event) => updatePreset(index, { startOffset: event.target.value })} className="h-7 font-mono text-[11px]" />
                </div>
                <div className="w-20 space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">End</label>
                  <Input value={preset.endOffset ?? ""} onChange={(event) => updatePreset(index, { endOffset: event.target.value })} className="h-7 font-mono text-[11px]" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setPresets(rows.filter((_, presetIndex) => presetIndex !== index))}
                  aria-label="Remove preset"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="h-7 w-full text-[11px]" onClick={() => setPresets([...rows, { label: "New preset", startOffset: 0, endOffset: 0 }])}>
              <Plus className="mr-1 h-3 w-3" /> Add preset
            </Button>
          </div>
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="date-range-style" title="Presentation" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Date range size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Apply/Cancel" path="requireApply" defaultValue={false} inline helper="Edit a draft and commit explicitly.">
            <BindableSwitch value={requireApply} onChange={setRequireApply} liveStateTree={liveStateTree} ariaLabel="Require Apply" />
          </ConfigField>
        </div>
        <ConfigField label="Compare previous period" path="comparePrevious" defaultValue={false} inline helper="Shows and includes the equally sized prior range.">
          <Switch checked={!!comparePrevious} onCheckedChange={setComparePrevious} aria-label="Compare previous period" />
        </ConfigField>
        <ConfigField label="Enable time" path="enableTime" defaultValue={false} inline>
          <BindableSwitch value={enableTime} onChange={setEnableTime} liveStateTree={liveStateTree} ariaLabel="Enable time" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="date-range-behavior" title="State" tab="behavior">
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

DateRangePickerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
DateRangePickerConfigEditor.usesConfigKit = true;
export default DateRangePickerConfigEditor;
