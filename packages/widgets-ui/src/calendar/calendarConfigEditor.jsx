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

export const CalendarConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => (stateTree ? { state: stateTree } : null), [stateTree]);
  const [dataArrayTemplate, setDataArrayTemplate] = useConfigValue("dataArrayTemplate", "");
  const [dateKey, setDateKey] = useConfigValue("dateKey", "due_date");
  const [titleKey, setTitleKey] = useConfigValue("titleKey", "name");
  const [subtitleKey, setSubtitleKey] = useConfigValue("subtitleKey", "");
  const [groupKey, setGroupKey] = useConfigValue("groupKey", "");
  const [itemKey, setItemKey] = useConfigValue("itemKey", "id");
  const [allowDrag, setAllowDrag] = useConfigValue("allowDrag", false);
  const [allowCreate, setAllowCreate] = useConfigValue("allowCreate", false);
  const [showMiniCalendar, setShowMiniCalendar] = useConfigValue("showMiniCalendar", false);
  const [view, setView] = useConfigValue("view", "month");
  const [weekStartsOn, setWeekStartsOn] = useConfigValue("weekStartsOn", 1);
  const [showWeekends, setShowWeekends] = useConfigValue("showWeekends", true);
  const [groupColors, setGroupColors] = useConfigValue("groupColors", []);
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No dated records.");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="calendar-content" title="Events" tab="content">
        <ConfigField label="Data array" path="dataArrayTemplate" helper="Resolved array of dated records.">
          <BindableInput value={dataArrayTemplate} onChange={setDataArrayTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.events.data }}" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Date field" path="dateKey" defaultValue="due_date" htmlFor="calendar-date-key">
            <Input id="calendar-date-key" value={dateKey ?? "due_date"} onChange={(event) => setDateKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Title field" path="titleKey" defaultValue="name" htmlFor="calendar-title-key">
            <Input id="calendar-title-key" value={titleKey ?? "name"} onChange={(event) => setTitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Subtitle field" path="subtitleKey" htmlFor="calendar-subtitle-key">
            <Input id="calendar-subtitle-key" value={subtitleKey ?? ""} onChange={(event) => setSubtitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Group field" path="groupKey" htmlFor="calendar-group-key">
            <Input id="calendar-group-key" value={groupKey ?? ""} onChange={(event) => setGroupKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Stable ID field" path="itemKey" defaultValue="id" htmlFor="calendar-item-key">
            <Input id="calendar-item-key" value={itemKey ?? "id"} onChange={(event) => setItemKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Group colors" path="groupColors" helper="Map a group value to a token/CSS color.">
          <OptionListEditor value={groupColors || []} onChange={setGroupColors} itemLabel="Group" allowDisabled={false} />
        </ConfigField>
        <ConfigField label="Empty text" path="emptyText" defaultValue="No dated records." htmlFor="calendar-empty">
          <Input id="calendar-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="calendar-style" title="Calendar view" tab="style">
        <ConfigField label="View" path="view" defaultValue="month">
          <SegmentedControl
            ariaLabel="Calendar view"
            value={view || "month"}
            onChange={setView}
            options={[
              { value: "month", label: "Month" },
              { value: "week", label: "Week" },
              { value: "agenda", label: "Agenda" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Week starts" path="weekStartsOn" defaultValue={1}>
            <SegmentedControl
              ariaLabel="Week starts on"
              value={String(weekStartsOn ?? 1)}
              onChange={(value) => setWeekStartsOn(Number(value))}
              options={[
                { value: "0", label: "Sun" },
                { value: "1", label: "Mon" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Show weekends" path="showWeekends" defaultValue={true} inline>
            <Switch checked={showWeekends !== false} onCheckedChange={setShowWeekends} aria-label="Show weekends" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Drag events" path="allowDrag" defaultValue={false} inline helper="Fires onEventMove.">
            <Switch checked={!!allowDrag} onCheckedChange={setAllowDrag} aria-label="Drag events" />
          </ConfigField>
          <ConfigField label="Create on date" path="allowCreate" defaultValue={false} inline helper="Fires onEventCreate.">
            <Switch checked={!!allowCreate} onCheckedChange={setAllowCreate} aria-label="Create on date" />
          </ConfigField>
          <ConfigField label="Mini calendar" path="showMiniCalendar" defaultValue={false} inline helper="Week and agenda views.">
            <Switch checked={!!showMiniCalendar} onCheckedChange={setShowMiniCalendar} aria-label="Mini calendar" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="calendar-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

CalendarConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
CalendarConfigEditor.usesConfigKit = true;
export default CalendarConfigEditor;
