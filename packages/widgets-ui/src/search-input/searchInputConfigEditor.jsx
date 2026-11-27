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

export const SearchInputConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "");
  const [placeholder, setPlaceholder] = useConfigValue("placeholder", "Search...");
  const [debounceMs, setDebounceMs] = useConfigValue("debounceMs", 300);
  const [minChars, setMinChars] = useConfigValue("minChars", 0);
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", "");
  const [shortcut, setShortcut] = useConfigValue("shortcut", "");
  const [clearable, setClearable] = useConfigValue("clearable", true);
  const [submitOnEnter, setSubmitOnEnter] = useConfigValue("submitOnEnter", true);
  const [size, setSize] = useConfigValue("size", "default");
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="search-content" title="Search field" tab="content">
        <ConfigField label="Label" path="label" htmlFor="search-label">
          <BindableInput id="search-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Search orders" />
        </ConfigField>
        <ConfigField label="Placeholder" path="placeholder" defaultValue="Search..." htmlFor="search-placeholder">
          <BindableInput id="search-placeholder" value={placeholder} onChange={setPlaceholder} liveStateTree={liveStateTree} />
        </ConfigField>
        <ConfigField label="Default value" path="defaultValue">
          <BindableInput value={defaultValue} onChange={setDefaultValue} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.query }}" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Debounce (ms)" path="debounceMs" defaultValue={300}>
            <Input type="number" min={0} max={5000} step={50} value={debounceMs ?? 300} onChange={(event) => setDebounceMs(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Minimum characters" path="minChars" defaultValue={0} helper="onSearch waits until this length, except clearing.">
            <Input type="number" min={0} max={20} value={minChars ?? 0} onChange={(event) => setMinChars(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Keyboard shortcut" path="shortcut" htmlFor="search-shortcut" helper="Focuses the field from anywhere, e.g. Ctrl+K.">
          <Input id="search-shortcut" value={shortcut ?? ""} onChange={(event) => setShortcut(event.target.value)} placeholder="Ctrl+K" className="h-8 font-mono text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="search-style" title="Presentation" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Search size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Clear button" path="clearable" defaultValue={true} inline>
            <Switch checked={clearable !== false} onCheckedChange={setClearable} aria-label="Clear button" />
          </ConfigField>
        </div>
        <ConfigField label="Enter submits immediately" path="submitOnEnter" defaultValue={true} inline>
          <Switch checked={submitOnEnter !== false} onCheckedChange={setSubmitOnEnter} aria-label="Enter submits" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="search-behavior" title="State" tab="behavior">
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Loading template" path="isLoading">
            <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
          </ConfigField>
        </div>
      </ConfigSection>
    </>
  );
};

SearchInputConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
SearchInputConfigEditor.usesConfigKit = true;
export default SearchInputConfigEditor;
