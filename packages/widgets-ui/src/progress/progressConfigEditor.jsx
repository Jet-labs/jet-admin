import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  ConditionalStyleField,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const ProgressConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [valueTemplate, setValueTemplate] = useConfigValue("valueTemplate", "");
  const [label, setLabel] = useConfigValue("label", "");
  const [variant, setVariant] = useConfigValue("variant", "bar");
  const [status, setStatus] = useConfigValue("status", "default");
  const [showValue, setShowValue] = useConfigValue("showValue", true);
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "above");
  const [indeterminate, setIndeterminate] = useConfigValue("indeterminate", false);
  const [striped, setStriped] = useConfigValue("striped", false);
  const [animated, setAnimated] = useConfigValue("animated", true);
  const [decimals, setDecimals] = useConfigValue("decimals", 0);
  const [unit, setUnit] = useConfigValue("unit", "%");
  const [styleRules, setStyleRules] = useConfigValue("styleRules", { logic: "and", rules: [], style: {} });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="progress-content" title="Progress" tab="content">
        <ConfigField label="Value (0–100)" path="valueTemplate" helper="Number or template expression. Values are clamped to 0–100.">
          <BindableInput value={valueTemplate} onChange={setValueTemplate} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.job.data.progress }}" />
        </ConfigField>
        <ConfigField label="Label" path="label">
          <BindableInput value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Quota used" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Decimals" path="decimals" defaultValue={0}>
            <SegmentedControl
              ariaLabel="Progress decimals"
              value={String(decimals ?? 0)}
              onChange={(value) => setDecimals(Number(value))}
              options={[
                { value: "0", label: "0" },
                { value: "1", label: "1" },
                { value: "2", label: "2" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Unit" path="unit" defaultValue="%" htmlFor="progress-unit">
            <Input id="progress-unit" value={unit ?? ""} onChange={(event) => setUnit(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="progress-style" title="Presentation" tab="style">
        <ConfigField label="Variant" path="variant" defaultValue="bar">
          <SegmentedControl
            ariaLabel="Progress variant"
            value={variant === "ring" ? "ring" : variant || "bar"}
            onChange={setVariant}
            options={[
              { value: "bar", label: "Bar" },
              { value: "ring", label: "Ring" },
              { value: "segmented", label: "Steps" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Status" path="status" defaultValue="default">
            <SegmentedControl
              ariaLabel="Progress status"
              value={status || "default"}
              onChange={setStatus}
              options={[
                { value: "default", label: "Default" },
                { value: "success", label: "Success" },
                { value: "warning", label: "Warning" },
                { value: "error", label: "Error" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Label position" path="labelPosition" defaultValue="above">
            <SegmentedControl
              ariaLabel="Label position"
              value={labelPosition || "above"}
              onChange={setLabelPosition}
              options={[
                { value: "above", label: "Above" },
                { value: "inline", label: "Inline" },
                { value: "below", label: "Below" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Show percentage" path="showValue" defaultValue={true} inline>
            <Switch checked={showValue !== false} onCheckedChange={setShowValue} aria-label="Show percentage" />
          </ConfigField>
          <ConfigField label="Striped" path="striped" defaultValue={false} inline>
            <Switch checked={!!striped} onCheckedChange={setStriped} aria-label="Striped" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Animate fill" path="animated" defaultValue={true} inline helper="Respects reduced motion.">
            <Switch checked={animated !== false} onCheckedChange={setAnimated} aria-label="Animate fill" />
          </ConfigField>
          <ConfigField label="Indeterminate" path="indeterminate" defaultValue={false} inline helper="Ignores the value while active.">
            <Switch checked={!!indeterminate} onCheckedChange={setIndeterminate} aria-label="Indeterminate" />
          </ConfigField>
        </div>
        <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
          <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style</summary>
          <div className="mt-1.5">
            <ConditionalStyleField
              value={styleRules}
              onChange={setStyleRules}
              fields={["value", "state.variables.status"]}
              emptyLabel="No rules — use the selected status."
            />
          </div>
        </details>
      </ConfigSection>

      <ConfigSection id="progress-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

ProgressConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
ProgressConfigEditor.usesConfigKit = true;
export default ProgressConfigEditor;
