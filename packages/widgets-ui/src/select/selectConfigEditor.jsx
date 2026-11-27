import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const SelectConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const [label, setLabel] = useConfigValue("label", "");
  const [placeholder, setPlaceholder] = useConfigValue("placeholder", "Select option...");
  const [options, setOptions] = useConfigValue("options", []);
  const [optionsTemplate, setOptionsTemplate] = useConfigValue("optionsTemplate", "");
  const [labelKey, setLabelKey] = useConfigValue("labelKey", "label");
  const [valueKey, setValueKey] = useConfigValue("valueKey", "value");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", "");
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No options");
  const [searchPlaceholder, setSearchPlaceholder] = useConfigValue("searchPlaceholder", "Search…");
  const [searchable, setSearchable] = useConfigValue("searchable", false);
  const [clearable, setClearable] = useConfigValue("clearable", false);
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const [size, setSize] = useConfigValue("size", "default");
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "top");

  const boundOptions = Boolean(optionsTemplate);

  return (
    <>
      <ConfigSection id="select-content" title="Field" description="The label, static options and optional bound option list." tab="content">
        <ConfigField label="Label" path="label" htmlFor="select-label">
          <BindableInput id="select-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Status" />
        </ConfigField>
        <ConfigField label="Placeholder" path="placeholder" defaultValue="Select option..." htmlFor="select-placeholder">
          <BindableInput id="select-placeholder" value={placeholder} onChange={setPlaceholder} liveStateTree={liveStateTree} placeholder="Select option…" />
        </ConfigField>

        <ConfigField label="Static options" path="options" helper={boundOptions ? "Bound options below override this static list." : undefined}>
          <OptionListEditor
            value={options || []}
            onChange={setOptions}
            itemLabel="Option"
            allowDescription
            allowGroup
            allowDisabled
          />
        </ConfigField>

        <ConfigField
          label="Bound options"
          path="optionsTemplate"
          helper="Expression resolving to an array. Overrides the static list."
        >
          <BindableInput
            value={optionsTemplate}
            onChange={setOptionsTemplate}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.statuses.data }}"
          />
        </ConfigField>

        {boundOptions && (
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Label key" path="labelKey" defaultValue="label" htmlFor="select-label-key">
              <Input id="select-label-key" value={labelKey ?? "label"} onChange={(event) => setLabelKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
            <ConfigField label="Value key" path="valueKey" defaultValue="value" htmlFor="select-value-key">
              <Input id="select-value-key" value={valueKey ?? "value"} onChange={(event) => setValueKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
          </div>
        )}

        <ConfigField label="Default value" path="defaultValue">
          <BindableInput value={defaultValue} onChange={setDefaultValue} liveStateTree={liveStateTree} placeholder="e.g. active" />
        </ConfigField>

        <ConfigField label="Empty message" path="emptyText" defaultValue="No options" htmlFor="select-empty-text">
          <Input id="select-empty-text" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="select-style" title="Field style" description="Presentation and dropdown behaviour." tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Select size"
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
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Searchable" path="searchable" defaultValue={false} inline helper="Adds a filter box for long lists.">
            <Switch checked={!!searchable} onCheckedChange={setSearchable} aria-label="Searchable select" />
          </ConfigField>
          <ConfigField label="Clearable" path="clearable" defaultValue={false} inline helper="Shows a clear button when a value is selected.">
            <Switch checked={!!clearable} onCheckedChange={setClearable} aria-label="Clearable select" />
          </ConfigField>
        </div>
        {searchable && (
          <ConfigField label="Search placeholder" path="searchPlaceholder" defaultValue="Search…" htmlFor="select-search-placeholder">
            <Input id="select-search-placeholder" value={searchPlaceholder ?? ""} onChange={(event) => setSearchPlaceholder(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        )}
      </ConfigSection>

      <ConfigSection id="select-behavior" title="Validation & state" tab="behavior">
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Required" path="required" defaultValue={false} inline>
            <BindableSwitch value={required} onChange={setRequired} liveStateTree={liveStateTree} ariaLabel="Required" />
          </ConfigField>
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
        </div>
        <ConfigField label="Loading template" path="isLoading" helper="Boolean expression; shows an in-place busy state.">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

SelectConfigEditor.propTypes = { widgetEditorForm: PropTypes.object.isRequired, stateTree: PropTypes.object };
SelectConfigEditor.usesConfigKit = true;
export default SelectConfigEditor;
