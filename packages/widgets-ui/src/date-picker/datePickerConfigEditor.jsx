import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const DatePickerConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "");
  const [help, setHelp] = useConfigValue("help", "");
  const [placeholder, setPlaceholder] = useConfigValue("placeholder", "");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", "");
  const [enableTime, setEnableTime] = useConfigValue("enableTime", false);
  const [minDate, setMinDate] = useConfigValue("minDate", "");
  const [maxDate, setMaxDate] = useConfigValue("maxDate", "");
  const [disabledDates, setDisabledDates] = useConfigValue("disabledDates", []);
  const [dateFormat, setDateFormat] = useConfigValue("dateFormat", "");
  const [size, setSize] = useConfigValue("size", "default");
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "top");
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="date-picker-content" title="Date field" tab="content">
        <ConfigField label="Label" path="label" htmlFor="date-picker-label">
          <BindableInput id="date-picker-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Start date" />
        </ConfigField>
        <ConfigField label="Help text" path="help">
          <BindableInput value={help} onChange={setHelp} liveStateTree={liveStateTree} placeholder="Shown under the field" />
        </ConfigField>
        <ConfigField label="Placeholder" path="placeholder" htmlFor="date-picker-placeholder">
          <BindableInput id="date-picker-placeholder" value={placeholder} onChange={setPlaceholder} liveStateTree={liveStateTree} placeholder="Pick a date…" />
        </ConfigField>
        <ConfigField label="Default value" path="defaultValue" helper="Applies once on first load. Clearing stays empty.">
          <BindableInput value={defaultValue} onChange={setDefaultValue} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.date }}" />
        </ConfigField>
        <ConfigField label="Enable time" path="enableTime" defaultValue={false} inline helper="Hour, minute and second precision.">
          <BindableSwitch value={enableTime} onChange={setEnableTime} liveStateTree={liveStateTree} ariaLabel="Enable time" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Min date" path="minDate" htmlFor="date-min">
            <Input id="date-min" value={minDate ?? ""} onChange={(event) => setMinDate(event.target.value)} placeholder="YYYY-MM-DD" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Max date" path="maxDate" htmlFor="date-max">
            <Input id="date-max" value={maxDate ?? ""} onChange={(event) => setMaxDate(event.target.value)} placeholder="YYYY-MM-DD" className="h-8 font-mono text-xs" />
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
        <ConfigField label="Display format" path="dateFormat" htmlFor="date-format" helper="Optional display hint; typed entry still accepts YYYY-MM-DD.">
          <Input id="date-format" value={dateFormat ?? ""} onChange={(event) => setDateFormat(event.target.value)} placeholder="YYYY-MM-DD" className="h-8 font-mono text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="date-picker-style" title="Presentation" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Date picker size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Label position" path="labelPosition" defaultValue="top">
            <SegmentedControl
              ariaLabel="Label position"
              value={labelPosition || "top"}
              onChange={setLabelPosition}
              options={[
                { value: "top", label: "Top" },
                { value: "left", label: "Left" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="date-picker-behavior" title="State" tab="behavior">
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

DatePickerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
DatePickerConfigEditor.usesConfigKit = true;
export default DatePickerConfigEditor;
