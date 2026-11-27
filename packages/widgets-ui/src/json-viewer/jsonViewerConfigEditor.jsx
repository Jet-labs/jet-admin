import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const JsonViewerConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [dataTemplate, setDataTemplate] = useConfigValue("dataTemplate", "");
  const [collapsed, setCollapsed] = useConfigValue("collapsed", false);
  const [searchable, setSearchable] = useConfigValue("searchable", true);
  const [wrap, setWrap] = useConfigValue("wrap", true);
  const [maxDepth, setMaxDepth] = useConfigValue("maxDepth", 8);
  const [maxHeight, setMaxHeight] = useConfigValue("maxHeight", "");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="json-content" title="Data" tab="content">
        <ConfigField label="Data template" path="dataTemplate" helper="Bind an object, array or primitive.">
          <BindableInput value={dataTemplate} onChange={setDataTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.myQuery.data }}" />
        </ConfigField>
        <ConfigField label="Max height" path="maxHeight" htmlFor="json-max-height" helper="Empty fills the widget height.">
          <Input
            id="json-max-height"
            type="number"
            min={0}
            value={maxHeight ?? ""}
            onChange={(event) => setMaxHeight(event.target.value === "" ? "" : Number(event.target.value))}
            placeholder="Auto"
            className="h-8 text-xs"
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="json-style" title="Viewer" tab="style">
        <ConfigField label="Start collapsed" path="collapsed" defaultValue={false} inline>
          <Switch checked={!!collapsed} onCheckedChange={setCollapsed} aria-label="Start collapsed" />
        </ConfigField>
        <ConfigField label="Search" path="searchable" defaultValue={true} inline helper="Filter keys and values; matching nodes auto-expand.">
          <Switch checked={searchable !== false} onCheckedChange={setSearchable} aria-label="Search JSON" />
        </ConfigField>
        <ConfigField label="Wrap long values" path="wrap" defaultValue={true} inline>
          <Switch checked={wrap !== false} onCheckedChange={setWrap} aria-label="Wrap long values" />
        </ConfigField>
        <ConfigField label="Max depth" path="maxDepth" defaultValue={8}>
          <SegmentedControl
            ariaLabel="Maximum depth"
            value={String(maxDepth ?? 8)}
            onChange={(value) => setMaxDepth(Number(value))}
            options={[
              { value: "4", label: "4" },
              { value: "8", label: "8" },
              { value: "16", label: "16" },
            ]}
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="json-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

JsonViewerConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
JsonViewerConfigEditor.usesConfigKit = true;
export default JsonViewerConfigEditor;
