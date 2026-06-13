import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const StatConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input
          type="text"
          className="text-sm"
          value={config.label || ""}
          onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value)}
          placeholder="e.g. Total Revenue"
        />
      </div>

      {/* Value Template */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Value</Label>
        <TemplateAutocompleteInput
          value={config.valueTemplate || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.valueTemplate", val)}
          placeholder="e.g. {{state.queries.stats.data[0].count}}"
          liveStateTree={liveStateTree}
        />
        <p className="text-[10px] text-muted-foreground">
          The primary metric value. Use template expressions to bind to data sources.
        </p>
      </div>

      {/* Prefix & Suffix */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Prefix</Label>
          <Input
            type="text"
            className="text-sm"
            value={config.prefix || ""}
            onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.prefix", e.target.value)}
            placeholder="e.g. $"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Suffix</Label>
          <Input
            type="text"
            className="text-sm"
            value={config.suffix || ""}
            onChange={(e) => widgetEditorForm.setFieldValue("widgetConfig.suffix", e.target.value)}
            placeholder="e.g. users"
          />
        </div>
      </div>

      {/* Trend */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Trend Value</Label>
        <TemplateAutocompleteInput
          value={config.trendTemplate || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.trendTemplate", val)}
          placeholder="e.g. {{state.queries.stats.data[0].change_pct}}"
          liveStateTree={liveStateTree}
        />
        <p className="text-[10px] text-muted-foreground">
          Optional percentage change. Positive = up trend, negative = down trend.
        </p>
      </div>

      {/* Trend Direction */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Trend Semantics</Label>
          <Select
            value={config.trendDirection || "up-is-good"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.trendDirection", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="up-is-good">Up = Good (green)</SelectItem>
              <SelectItem value="down-is-good">Down = Good (green)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Align */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Align</Label>
          <Select
            value={config.textAlign || "center"}
            onValueChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

StatConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default StatConfigEditor;
