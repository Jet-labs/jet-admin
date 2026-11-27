import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const KeyValueConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [dataTemplate, setDataTemplate] = useConfigValue("dataTemplate", "");
  const [items, setItems] = useConfigValue("items", []);
  const [layout, setLayout] = useConfigValue("layout", "grid");
  const [columns, setColumns] = useConfigValue("columns", 1);
  const [labelWidth, setLabelWidth] = useConfigValue("labelWidth", "");
  const [copyable, setCopyable] = useConfigValue("copyable", false);
  const [dividers, setDividers] = useConfigValue("dividers", false);
  const [truncate, setTruncate] = useConfigValue("truncate", false);
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No data");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="kv-content" title="Details" tab="content">
        <ConfigField label="Data template" path="dataTemplate" helper="Object whose entries render as rows. Overrides the items list.">
          <BindableInput value={dataTemplate} onChange={setDataTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.user.data[0] }}" />
        </ConfigField>
        <ConfigField label="Static items" path="items" helper="Used when no data template resolves.">
          <OptionListEditor value={items || []} onChange={setItems} itemLabel="Field" allowDescription={false} allowDisabled={false} />
        </ConfigField>
        <ConfigField label="Empty text" path="emptyText" defaultValue="No data" htmlFor="kv-empty">
          <Input id="kv-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="kv-style" title="Layout" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Layout" path="layout" defaultValue="grid">
            <SegmentedControl
              ariaLabel="Key-value layout"
              value={layout || "grid"}
              onChange={setLayout}
              options={[
                { value: "stacked", label: "Stacked" },
                { value: "inline", label: "Inline" },
                { value: "grid", label: "Grid" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Columns" path="columns" defaultValue={1}>
            <SegmentedControl
              ariaLabel="Columns"
              value={String(Math.min(3, Math.max(1, Number(columns) || 1)))}
              onChange={(value) => setColumns(Number(value))}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Label width" path="labelWidth" htmlFor="kv-label-width" helper="CSS width for inline/stacked labels, e.g. 8rem.">
          <Input id="kv-label-width" value={labelWidth ?? ""} onChange={(event) => setLabelWidth(event.target.value)} placeholder="8rem" className="h-8 font-mono text-xs" />
        </ConfigField>
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Copy values" path="copyable" defaultValue={false} inline>
            <Switch checked={!!copyable} onCheckedChange={setCopyable} aria-label="Copy values" />
          </ConfigField>
          <ConfigField label="Dividers" path="dividers" defaultValue={false} inline>
            <Switch checked={!!dividers} onCheckedChange={setDividers} aria-label="Dividers" />
          </ConfigField>
          <ConfigField label="Truncate" path="truncate" defaultValue={false} inline>
            <Switch checked={!!truncate} onCheckedChange={setTruncate} aria-label="Truncate values" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="kv-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

KeyValueConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
KeyValueConfigEditor.usesConfigKit = true;
export default KeyValueConfigEditor;
