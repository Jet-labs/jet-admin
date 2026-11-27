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

export const TimelineConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [dataTemplate, setDataTemplate] = useConfigValue("dataTemplate", "");
  const [titleKey, setTitleKey] = useConfigValue("titleKey", "title");
  const [timeKey, setTimeKey] = useConfigValue("timeKey", "time");
  const [descriptionKey, setDescriptionKey] = useConfigValue("descriptionKey", "description");
  const [iconKey, setIconKey] = useConfigValue("iconKey", "");
  const [colorKey, setColorKey] = useConfigValue("colorKey", "");
  const [statusKey, setStatusKey] = useConfigValue("statusKey", "");
  const [relativeTime, setRelativeTime] = useConfigValue("relativeTime", false);
  const [groupByDay, setGroupByDay] = useConfigValue("groupByDay", false);
  const [variant, setVariant] = useConfigValue("variant", "default");
  const [emptyText, setEmptyText] = useConfigValue("emptyText", "No activity yet");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="timeline-content" title="Events" tab="content">
        <ConfigField label="Data template" path="dataTemplate">
          <BindableInput value={dataTemplate} onChange={setDataTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.audit.data }}" />
        </ConfigField>
        <div className="grid grid-cols-3 gap-2">
          <ConfigField label="Title key" path="titleKey" defaultValue="title" htmlFor="timeline-title-key">
            <Input id="timeline-title-key" value={titleKey ?? "title"} onChange={(event) => setTitleKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Time key" path="timeKey" defaultValue="time" htmlFor="timeline-time-key">
            <Input id="timeline-time-key" value={timeKey ?? "time"} onChange={(event) => setTimeKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Desc key" path="descriptionKey" defaultValue="description" htmlFor="timeline-desc-key">
            <Input id="timeline-desc-key" value={descriptionKey ?? "description"} onChange={(event) => setDescriptionKey(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ConfigField label="Icon key" path="iconKey" htmlFor="timeline-icon-key">
            <Input id="timeline-icon-key" value={iconKey ?? ""} onChange={(event) => setIconKey(event.target.value)} placeholder="icon" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Color key" path="colorKey" htmlFor="timeline-color-key">
            <Input id="timeline-color-key" value={colorKey ?? ""} onChange={(event) => setColorKey(event.target.value)} placeholder="color" className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Status key" path="statusKey" htmlFor="timeline-status-key">
            <Input id="timeline-status-key" value={statusKey ?? ""} onChange={(event) => setStatusKey(event.target.value)} placeholder="status" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Empty text" path="emptyText" defaultValue="No activity yet" htmlFor="timeline-empty">
          <Input id="timeline-empty" value={emptyText ?? ""} onChange={(event) => setEmptyText(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="timeline-style" title="Timeline style" tab="style">
        <ConfigField label="Variant" path="variant" defaultValue="default">
          <SegmentedControl
            ariaLabel="Timeline variant"
            value={variant || "default"}
            onChange={setVariant}
            options={[
              { value: "default", label: "Default" },
              { value: "compact", label: "Compact" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Relative time" path="relativeTime" defaultValue={false} inline>
            <Switch checked={!!relativeTime} onCheckedChange={setRelativeTime} aria-label="Relative time" />
          </ConfigField>
          <ConfigField label="Group by day" path="groupByDay" defaultValue={false} inline>
            <Switch checked={!!groupByDay} onCheckedChange={setGroupByDay} aria-label="Group by day" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="timeline-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

TimelineConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
TimelineConfigEditor.usesConfigKit = true;
export default TimelineConfigEditor;
