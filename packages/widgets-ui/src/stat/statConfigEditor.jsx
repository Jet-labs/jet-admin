import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ColorField,
  ConditionalStyleField,
  IconPicker,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const StatConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const [label, setLabel] = useConfigValue("label", "");
  const [valueTemplate, setValueTemplate] = useConfigValue("valueTemplate", "");
  const [prefix, setPrefix] = useConfigValue("prefix", "");
  const [suffix, setSuffix] = useConfigValue("suffix", "");
  const [trendTemplate, setTrendTemplate] = useConfigValue("trendTemplate", "");
  const [trendDirection, setTrendDirection] = useConfigValue("trendDirection", "up-is-good");
  const [trendLabel, setTrendLabel] = useConfigValue("comparisonLabel", "");
  const [textAlign, setTextAlign] = useConfigValue("textAlign", "center");
  const [valueSize, setValueSize] = useConfigValue("valueSize", "default");
  const [format, setFormat] = useConfigValue("format", "number");
  const [decimals, setDecimals] = useConfigValue("decimals", 2);
  const [currency, setCurrency] = useConfigValue("currency", "USD");
  const [locale, setLocale] = useConfigValue("locale", "");
  const [icon, setIcon] = useConfigValue("icon", "");
  const [iconColor, setIconColor] = useConfigValue("iconColor", "");
  const [sparklineTemplate, setSparklineTemplate] = useConfigValue("sparklineTemplate", "");
  const [animateValue, setAnimateValue] = useConfigValue("animateValue", false);
  const [thresholds, setThresholds] = useConfigValue("thresholds", []);
  const [styleRules, setStyleRules] = useConfigValue("styleRules", { logic: "and", rules: [], style: {} });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const thresholdRows = Array.isArray(thresholds) ? thresholds : [];
  const addThreshold = () => setThresholds([...thresholdRows, { min: 0, status: "warning" }]);
  const updateThreshold = (index, patch) =>
    setThresholds(thresholdRows.map((threshold, thresholdIndex) => (thresholdIndex === index ? { ...threshold, ...patch } : threshold)));
  const removeThreshold = (index) => setThresholds(thresholdRows.filter((_, thresholdIndex) => thresholdIndex !== index));

  return (
    <>
      <ConfigSection id="stat-content" title="Metric" description="Value, label and comparison displayed by the card." tab="content">
        <ConfigField label="Label" path="label" htmlFor="stat-label">
          <BindableInput id="stat-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Total revenue" />
        </ConfigField>
        <ConfigField
          label="Value"
          path="valueTemplate"
          helper="Number or template expression. 0 displays as 0; empty displays an em dash."
        >
          <BindableInput
            value={valueTemplate}
            onChange={setValueTemplate}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.stats.data[0].total }}"
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Prefix" path="prefix">
            <BindableInput value={prefix} onChange={setPrefix} liveStateTree={liveStateTree} placeholder="$" />
          </ConfigField>
          <ConfigField label="Suffix" path="suffix">
            <BindableInput value={suffix} onChange={setSuffix} liveStateTree={liveStateTree} placeholder="users" />
          </ConfigField>
        </div>

        <ConfigField label="Trend value" path="trendTemplate" helper="Percentage change. Positive is up; negative is down.">
          <BindableInput
            value={trendTemplate}
            onChange={setTrendTemplate}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.stats.data[0].change_pct }}"
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Comparison label" path="comparisonLabel" htmlFor="stat-comparison-label">
            <BindableInput id="stat-comparison-label" value={trendLabel} onChange={setTrendLabel} liveStateTree={liveStateTree} placeholder="vs last month" />
          </ConfigField>
          <ConfigField label="Trend semantics" path="trendDirection" defaultValue="up-is-good">
            <Select value={trendDirection || "up-is-good"} onValueChange={setTrendDirection}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up-is-good">Up is good</SelectItem>
                <SelectItem value="down-is-good">Down is good</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="stat-style" title="Format & style" description="Number formatting, icon and alignment." tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Format" path="format" defaultValue="number">
            <Select value={format || "number"} onValueChange={setFormat}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="compact">Compact (1.2K)</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="percent">Percent</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField label="Decimals" path="decimals" defaultValue={2} htmlFor="stat-decimals">
            <Input
              id="stat-decimals"
              type="number"
              min={0}
              max={6}
              value={decimals ?? 2}
              onChange={(event) => setDecimals(Math.max(0, Math.min(6, Number(event.target.value))))}
              className="h-8 text-xs"
            />
          </ConfigField>
        </div>
        {format === "currency" && (
          <div className="grid grid-cols-2 gap-2">
            <ConfigField label="Currency" path="currency" defaultValue="USD" htmlFor="stat-currency">
              <Input id="stat-currency" value={currency ?? "USD"} onChange={(event) => setCurrency(event.target.value.toUpperCase())} className="h-8 font-mono text-xs" />
            </ConfigField>
            <ConfigField label="Locale" path="locale" htmlFor="stat-locale" helper="Optional BCP-47 locale.">
              <Input id="stat-locale" value={locale ?? ""} onChange={(event) => setLocale(event.target.value)} placeholder="en-US" className="h-8 font-mono text-xs" />
            </ConfigField>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Alignment" path="textAlign" defaultValue="center">
            <SegmentedControl
              ariaLabel="Text alignment"
              value={textAlign || "center"}
              onChange={setTextAlign}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Value size" path="valueSize" defaultValue="default">
            <SegmentedControl
              ariaLabel="Value size"
              value={valueSize || "default"}
              onChange={setValueSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Icon" path="icon">
            <IconPicker value={icon} onChange={setIcon} label="Stat icon" />
          </ConfigField>
          <ConfigField label="Icon color" path="iconColor">
            <ColorField value={iconColor} onChange={setIconColor} label="Icon" allowClear />
          </ConfigField>
        </div>
        <ConfigField label="Sparkline data" path="sparklineTemplate" helper="Expression resolving to an array of numbers.">
          <BindableInput
            value={sparklineTemplate}
            onChange={setSparklineTemplate}
            liveStateTree={liveStateTree}
            placeholder="e.g. {{ state.queries.trend.data }}"
          />
        </ConfigField>
        <ConfigField label="Animate value changes" path="animateValue" defaultValue={false} inline helper="Respects reduced-motion preferences.">
          <Switch checked={!!animateValue} onCheckedChange={setAnimateValue} aria-label="Animate value changes" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="stat-thresholds" title="Threshold colors" description="Color the value when it crosses a numeric threshold." tab="style" defaultOpen={false}>
        {thresholdRows.length === 0 && (
          <div className="rounded-control border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
            No thresholds. The value uses the default foreground color.
          </div>
        )}
        {thresholdRows.map((threshold, index) => (
          <div key={index} className="flex items-end gap-1.5">
            <div className="w-24 space-y-0.5">
              <label htmlFor={`stat-threshold-${index}`} className="text-[9px] uppercase tracking-wider text-muted-foreground">
                At least
              </label>
              <Input
                id={`stat-threshold-${index}`}
                type="number"
                value={threshold.min ?? 0}
                onChange={(event) => updateThreshold(index, { min: Number(event.target.value) })}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="flex-1 space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Color</label>
              <Select value={threshold.status || "warning"} onValueChange={(status) => updateThreshold(index, { status })}>
                <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeThreshold(index)} aria-label="Remove threshold">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 w-full text-[11px]" onClick={addThreshold}>
          <Plus className="mr-1 h-3 w-3" /> Add threshold
        </Button>
        <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
          <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style rules</summary>
          <div className="mt-1.5">
            <ConditionalStyleField
              value={styleRules}
              onChange={setStyleRules}
              fields={["value", "numeric", "state.variables.status"]}
              emptyLabel="No rules — thresholds and defaults still apply."
            />
          </div>
        </details>
      </ConfigSection>

      <ConfigSection id="stat-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading" helper="Boolean expression; shows a skeleton instead of stale values.">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

StatConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};
StatConfigEditor.usesConfigKit = true;

export default StatConfigEditor;
