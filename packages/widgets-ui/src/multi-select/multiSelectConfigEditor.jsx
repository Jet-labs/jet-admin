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
  TagField,
  useConfigValue,
} from "../config";

export const MultiSelectConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const [label, setLabel] = useConfigValue("label", "");
  const [placeholder, setPlaceholder] = useConfigValue("placeholder", "Select options...");
  const [options, setOptions] = useConfigValue("options", []);
  const [optionsTemplate, setOptionsTemplate] = useConfigValue("optionsTemplate", "");
  const [labelKey, setLabelKey] = useConfigValue("labelKey", "label");
  const [valueKey, setValueKey] = useConfigValue("valueKey", "value");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", []);
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No options");
  const [searchPlaceholder, setSearchPlaceholder] = useConfigValue("searchPlaceholder", "Filter…");
  const [size, setSize] = useConfigValue("size", "default");
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "top");
  const [maxChips, setMaxChips] = useConfigValue("maxChips", 3);
  const [showSelectAll, setShowSelectAll] = useConfigValue("showSelectAll", false);
  const [asyncOptions, setAsyncOptions] = useConfigValue("asyncOptions", false);
  const [optionsPageSize, setOptionsPageSize] = useConfigValue("optionsPageSize", 50);
  const [maxRenderedOptions, setMaxRenderedOptions] = useConfigValue("maxRenderedOptions", 200);
  const [loadMoreLabel, setLoadMoreLabel] = useConfigValue("loadMoreLabel", "Load more");
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [maxSelected, setMaxSelected] = useConfigValue("maxSelected", "");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  const boundOptions = Boolean(optionsTemplate);

  return (
    <>
      <ConfigSection id="multi-select-content" title="Field" description="Static or bound choices and their defaults." tab="content">
        <ConfigField label="Label" path="label" htmlFor="multi-select-label">
          <BindableInput id="multi-select-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Tags" />
        </ConfigField>
        <ConfigField label="Placeholder" path="placeholder" defaultValue="Select options..." htmlFor="multi-select-placeholder">
          <BindableInput id="multi-select-placeholder" value={placeholder} onChange={setPlaceholder} liveStateTree={liveStateTree} />
        </ConfigField>
        <ConfigField label="Static options" path="options">
          <OptionListEditor value={options || []} onChange={setOptions} itemLabel="Option" allowDescription allowGroup allowDisabled />
        </ConfigField>
        <ConfigField label="Bound options" path="optionsTemplate" helper="Expression resolving to an array. Overrides the static list.">
          <BindableInput value={optionsTemplate} onChange={setOptionsTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.tags.data }}" />
        </ConfigField>
        {boundOptions && (
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Label key" path="labelKey" defaultValue="label" htmlFor="multi-label-key">
              <Input id="multi-label-key" value={labelKey ?? "label"} onChange={(event) => setLabelKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
            <ConfigField label="Value key" path="valueKey" defaultValue="value" htmlFor="multi-value-key">
              <Input id="multi-value-key" value={valueKey ?? "value"} onChange={(event) => setValueKey(event.target.value)} className="h-8 font-mono text-xs" />
            </ConfigField>
          </div>
        )}
        <ConfigField label="Async options" path="asyncOptions" defaultValue={false} inline helper="Fires onLoadOptions with search term and page; bind a query to refresh optionsTemplate.">
          <Switch checked={!!asyncOptions} onCheckedChange={setAsyncOptions} aria-label="Async options" />
        </ConfigField>
        {asyncOptions && (
          <div className="grid grid-cols-3 gap-2">
            <ConfigField label="Page size" path="optionsPageSize" defaultValue={50} htmlFor="multi-options-page-size">
              <Input id="multi-options-page-size" type="number" min={1} max={500} value={optionsPageSize ?? 50} onChange={(event) => setOptionsPageSize(Number(event.target.value))} className="h-8 text-xs" />
            </ConfigField>
            <ConfigField label="Max rendered" path="maxRenderedOptions" defaultValue={200} htmlFor="multi-options-max-rendered">
              <Input id="multi-options-max-rendered" type="number" min={20} max={2000} value={maxRenderedOptions ?? 200} onChange={(event) => setMaxRenderedOptions(Number(event.target.value))} className="h-8 text-xs" />
            </ConfigField>
            <ConfigField label="Load more label" path="loadMoreLabel" defaultValue="Load more" htmlFor="multi-load-more-label">
              <Input id="multi-load-more-label" value={loadMoreLabel ?? ""} onChange={(event) => setLoadMoreLabel(event.target.value)} className="h-8 text-xs" />
            </ConfigField>
          </div>
        )}
        <ConfigField label="Default selections" path="defaultValue" helper="Applied once on first load.">
          <TagField value={Array.isArray(defaultValue) ? defaultValue : []} onChange={setDefaultValue} placeholder="Add a default value…" />
        </ConfigField>
        <ConfigField label="Empty message" path="emptyText" defaultValue="No options" htmlFor="multi-empty">
          <Input id="multi-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="multi-select-style" title="Field style" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Multi-select size"
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
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Max visible chips" path="maxChips" defaultValue={3} htmlFor="multi-max-chips" helper="Extra selections collapse into +N.">
            <Input id="multi-max-chips" type="number" min={1} max={10} value={maxChips ?? 3} onChange={(event) => setMaxChips(Number(event.target.value))} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Search placeholder" path="searchPlaceholder" defaultValue="Filter…" htmlFor="multi-search-placeholder">
            <Input id="multi-search-placeholder" value={searchPlaceholder ?? ""} onChange={(event) => setSearchPlaceholder(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Select all" path="showSelectAll" defaultValue={false} inline helper="Adds a select-all control inside the dropdown.">
          <Switch checked={!!showSelectAll} onCheckedChange={setShowSelectAll} aria-label="Show select all" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="multi-select-behavior" title="Validation & state" tab="behavior">
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
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Max selections" path="maxSelected" htmlFor="multi-max-selected" helper="Leave empty for no limit.">
            <Input
              id="multi-max-selected"
              type="number"
              min={1}
              value={maxSelected ?? ""}
              onChange={(event) => setMaxSelected(event.target.value === "" ? "" : Number(event.target.value))}
              className="h-8 text-xs"
            />
          </ConfigField>
          <ConfigField label="Loading template" path="isLoading">
            <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
          </ConfigField>
        </div>
      </ConfigSection>
    </>
  );
};

MultiSelectConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
MultiSelectConfigEditor.usesConfigKit = true;
export default MultiSelectConfigEditor;
