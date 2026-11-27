import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  SegmentedControl,
  TagField,
  useConfigValue,
} from "../config";

export const ListConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [dataTemplate, setDataTemplate] = useConfigValue("dataTemplate", "");
  const [titleKey, setTitleKey] = useConfigValue("titleKey", "title");
  const [subtitleKey, setSubtitleKey] = useConfigValue("subtitleKey", "subtitle");
  const [metaKeys, setMetaKeys] = useConfigValue("metaKeys", []);
  const [avatarKey, setAvatarKey] = useConfigValue("avatarKey", "");
  const [itemKey, setItemKey] = useConfigValue("itemKey", "id");
  const [groupKey, setGroupKey] = useConfigValue("groupKey", "");
  const [layout, setLayout] = useConfigValue("layout", "rows");
  const [dividers, setDividers] = useConfigValue("dividers", true);
  const [searchable, setSearchable] = useConfigValue("searchable", false);
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No items");
  const [noResultsText, setNoResultsText] = useConfigValue("noResultsText", "No matching items");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="list-content" title="Items" tab="content">
        <ConfigField label="Data template" path="dataTemplate">
          <BindableInput value={dataTemplate} onChange={setDataTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.orders.data }}" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Title key" path="titleKey" defaultValue="title" htmlFor="list-title-key">
            <Input id="list-title-key" value={titleKey ?? "title"} onChange={(event) => setTitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Subtitle key" path="subtitleKey" defaultValue="subtitle" htmlFor="list-subtitle-key">
            <Input id="list-subtitle-key" value={subtitleKey ?? "subtitle"} onChange={(event) => setSubtitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Avatar key" path="avatarKey" htmlFor="list-avatar-key" helper="Image URL field.">
            <Input id="list-avatar-key" value={avatarKey ?? ""} onChange={(event) => setAvatarKey(event.target.value)} placeholder="avatar_url" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Stable ID key" path="itemKey" defaultValue="id" htmlFor="list-item-key">
            <Input id="list-item-key" value={itemKey ?? "id"} onChange={(event) => setItemKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Meta keys" path="metaKeys" helper="Small metadata chips under each item.">
          <TagField value={metaKeys || []} onChange={setMetaKeys} placeholder="Add a field key…" />
        </ConfigField>
        <ConfigField label="Group by key" path="groupKey" htmlFor="list-group-key" helper="Optional field used for section headings.">
          <Input id="list-group-key" value={groupKey ?? ""} onChange={(event) => setGroupKey(event.target.value)} placeholder="status" className="h-8 font-mono text-xs" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Empty text" path="emptyText" defaultValue="No items" htmlFor="list-empty">
            <Input id="list-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="No results text" path="noResultsText" defaultValue="No matching items" htmlFor="list-no-results">
            <Input id="list-no-results" value={noResultsText ?? ""} onChange={(event) => setNoResultsText(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="list-style" title="Layout" tab="style">
        <ConfigField label="Layout" path="layout" defaultValue="rows">
          <SegmentedControl
            ariaLabel="List layout"
            value={layout || "rows"}
            onChange={setLayout}
            options={[
              { value: "rows", label: "Rows" },
              { value: "cards", label: "Cards" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Dividers" path="dividers" defaultValue={true} inline>
            <Switch checked={dividers !== false} onCheckedChange={setDividers} aria-label="Dividers" />
          </ConfigField>
          <ConfigField label="Search box" path="searchable" defaultValue={false} inline>
            <Switch checked={!!searchable} onCheckedChange={setSearchable} aria-label="Search box" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="list-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

ListConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
ListConfigEditor.usesConfigKit = true;
export default ListConfigEditor;
