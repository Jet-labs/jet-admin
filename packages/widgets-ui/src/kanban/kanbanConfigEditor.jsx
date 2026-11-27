import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ColorField,
  OptionListEditor,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const KanbanConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => (stateTree ? { state: stateTree } : null), [stateTree]);
  const [dataArrayTemplate, setDataArrayTemplate] = useConfigValue("dataArrayTemplate", "");
  const [groupBy, setGroupBy] = useConfigValue("groupBy", "status");
  const [titleKey, setTitleKey] = useConfigValue("titleKey", "name");
  const [subtitleKey, setSubtitleKey] = useConfigValue("subtitleKey", "");
  const [valueKey, setValueKey] = useConfigValue("valueKey", "");
  const [dateKey, setDateKey] = useConfigValue("dateKey", "");
  const [badgeKey, setBadgeKey] = useConfigValue("badgeKey", "");
  const [swimlaneKey, setSwimlaneKey] = useConfigValue("swimlaneKey", "");
  const [quickAdd, setQuickAdd] = useConfigValue("quickAdd", false);
  const [detailDrawer, setDetailDrawer] = useConfigValue("detailDrawer", true);
  const [savedFilters, setSavedFilters] = useConfigValue("savedFilters", false);
  const [filterStorageKey, setFilterStorageKey] = useConfigValue("filterStorageKey", "");
  const [columns, setColumns] = useConfigValue("columns", []);
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No cards in this pipeline.");
  const [showCounts, setShowCounts] = useConfigValue("showCounts", true);
  const [allowDrag, setAllowDrag] = useConfigValue("allowDrag", false);
  const [collapsible, setCollapsible] = useConfigValue("collapsible", true);
  const [searchable, setSearchable] = useConfigValue("searchable", false);
  const [variant, setVariant] = useConfigValue("variant", "default");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  const renderColumn = (column, index, update, ids) => (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label htmlFor={ids.labelId} className="text-[9px] uppercase tracking-wider text-muted-foreground">Label</label>
          <Input id={ids.labelId} value={column?.label ?? ""} onChange={(event) => update(index, "label", event.target.value)} className="h-7 text-[11px]" />
        </div>
        <div className="space-y-0.5">
          <label htmlFor={ids.valueId} className="text-[9px] uppercase tracking-wider text-muted-foreground">Value</label>
          <Input id={ids.valueId} value={column?.value ?? ""} onChange={(event) => update(index, "value", event.target.value)} className="h-7 font-mono text-[11px]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Color</label>
          <ColorField value={column?.color ?? ""} onChange={(color) => update(index, "color", color)} label="Column" />
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">WIP limit</label>
          <Input
            type="number"
            min={0}
            value={column?.wip ?? ""}
            onChange={(event) => update(index, "wip", event.target.value === "" ? "" : Number(event.target.value))}
            placeholder="No limit"
            className="h-7 text-[11px]"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      <ConfigSection id="kanban-content" title="Board data" tab="content">
        <ConfigField label="Data array" path="dataArrayTemplate" helper="Resolved array of card objects.">
          <BindableInput value={dataArrayTemplate} onChange={setDataArrayTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.deals.data }}" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Group by field" path="groupBy" defaultValue="status" htmlFor="kanban-group">
            <Input id="kanban-group" value={groupBy ?? "status"} onChange={(event) => setGroupBy(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Title field" path="titleKey" defaultValue="name" htmlFor="kanban-title">
            <Input id="kanban-title" value={titleKey ?? "name"} onChange={(event) => setTitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Subtitle field" path="subtitleKey" htmlFor="kanban-subtitle">
            <Input id="kanban-subtitle" value={subtitleKey ?? ""} onChange={(event) => setSubtitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Value field" path="valueKey" htmlFor="kanban-value">
            <Input id="kanban-value" value={valueKey ?? ""} onChange={(event) => setValueKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Date field" path="dateKey" htmlFor="kanban-date">
            <Input id="kanban-date" value={dateKey ?? ""} onChange={(event) => setDateKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Badge field" path="badgeKey" htmlFor="kanban-badge">
            <Input id="kanban-badge" value={badgeKey ?? ""} onChange={(event) => setBadgeKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Swimlane field" path="swimlaneKey" htmlFor="kanban-swimlane" helper="Groups columns into horizontal lanes.">
            <Input id="kanban-swimlane" value={swimlaneKey ?? ""} onChange={(event) => setSwimlaneKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Columns" path="columns" helper="Order and style the board columns. Empty infers from data.">
          <OptionListEditor
            value={columns || []}
            onChange={setColumns}
            labelKey="label"
            valueKey="value"
            itemLabel="Column"
            allowDisabled={false}
            renderFields={renderColumn}
            getPreview={(column) => `${column?.label || column?.value || "Untitled"}${column?.wip ? ` · WIP ${column.wip}` : ""}`}
          />
        </ConfigField>
        <ConfigField label="Empty text" path="emptyText" defaultValue="No cards in this pipeline." htmlFor="kanban-empty">
          <Input id="kanban-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="kanban-style" title="Board style" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Variant" path="variant" defaultValue="default">
            <SegmentedControl
              ariaLabel="Kanban variant"
              value={variant || "default"}
              onChange={setVariant}
              options={[
                { value: "default", label: "Default" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Search" path="searchable" defaultValue={false} inline>
            <Switch checked={!!searchable} onCheckedChange={setSearchable} aria-label="Search cards" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Show counts" path="showCounts" defaultValue={true} inline>
            <Switch checked={showCounts !== false} onCheckedChange={setShowCounts} aria-label="Show column counts" />
          </ConfigField>
          <ConfigField label="Collapsible columns" path="collapsible" defaultValue={true} inline>
            <Switch checked={collapsible !== false} onCheckedChange={setCollapsible} aria-label="Collapsible columns" />
          </ConfigField>
        </div>
        <ConfigField label="Drag and drop" path="allowDrag" defaultValue={false} inline helper="Fires onCardMove; the page decides whether to persist the move.">
          <Switch checked={!!allowDrag} onCheckedChange={setAllowDrag} aria-label="Drag and drop" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Quick add" path="quickAdd" defaultValue={false} inline helper="Inline card creation; fires onCardCreate.">
            <Switch checked={!!quickAdd} onCheckedChange={setQuickAdd} aria-label="Quick add" />
          </ConfigField>
          <ConfigField label="Detail drawer" path="detailDrawer" defaultValue={true} inline helper="Double-click or press Enter on a card.">
            <Switch checked={detailDrawer !== false} onCheckedChange={setDetailDrawer} aria-label="Detail drawer" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Saved filters" path="savedFilters" defaultValue={false} inline helper="Stores search and lane filters in this browser.">
            <Switch checked={!!savedFilters} onCheckedChange={setSavedFilters} aria-label="Saved filters" />
          </ConfigField>
          <ConfigField label="Filter storage key" path="filterStorageKey" htmlFor="kanban-filter-key" helper="Leave empty to scope to this widget.">
            <Input id="kanban-filter-key" value={filterStorageKey ?? ""} onChange={(event) => setFilterStorageKey(event.target.value)} className="h-8 font-mono text-xs" disabled={!savedFilters} />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="kanban-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

KanbanConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
KanbanConfigEditor.usesConfigKit = true;
export default KanbanConfigEditor;
