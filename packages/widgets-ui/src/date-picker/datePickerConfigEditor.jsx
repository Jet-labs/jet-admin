import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox, Textarea } from '@jet-admin/ui';
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const DatePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={config.label || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.label', e.target.value)}
          placeholder="e.g. Select date"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Help text (optional)</Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={config.help || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.help', e.target.value)}
          placeholder="Shown under the field"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Placeholder</Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={config.placeholder || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.placeholder', e.target.value)}
          placeholder="Pick a date..."
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="date-picker-enable-time"
          checked={!!config.enableTime}
          onCheckedChange={(checked) => widgetEditorForm.setFieldValue('widgetConfig.enableTime', !!checked)}
        />
        <Label htmlFor="date-picker-enable-time" className="text-xs text-muted-foreground cursor-pointer">
          Enable Time picking (granularity to hours, minutes, seconds)
        </Label>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Date-only values stay calendar dates (YYYY-MM-DD, no timezone). Datetime values are local wall time (YYYY-MM-DDTHH:mm:ss, no Z).
      </p>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <TemplateAutocompleteInput
          value={config.defaultValue || ''}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultValue', val)}
          placeholder="e.g. {{state.variables.myDate}} or ISO string"
          liveStateTree={liveStateTree}
        />
        <p className="text-[11px] text-muted-foreground">Applies once on first load. Clearing stays empty; use Reset to re-apply.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Min date (ISO)</Label>
          <Input type="text" className="text-sm h-8" value={config.minDate || ''} onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.minDate', e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Max date (ISO)</Label>
          <Input type="text" className="text-sm h-8" value={config.maxDate || ''} onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.maxDate', e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Disabled dates <span className="text-muted-foreground font-normal">(comma-separated YYYY-MM-DD)</span></Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={(config.disabledDates || []).join(", ")}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.disabledDates', e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="2026-12-25, 2026-01-01"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Display format <span className="text-muted-foreground font-normal">(documented, rendered via locale)</span></Label>
        <Input type="text" className="text-sm h-8" value={config.dateFormat || ''} onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.dateFormat', e.target.value)} placeholder="YYYY-MM-DD" />
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox id="date-picker-required" checked={!!config.required} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.required', !!c)} />
          <Label htmlFor="date-picker-required" className="text-xs text-muted-foreground cursor-pointer">Required</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="date-picker-disabled" checked={!!config.disabled} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.disabled', !!c)} />
          <Label htmlFor="date-picker-disabled" className="text-xs text-muted-foreground cursor-pointer">Disabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="date-picker-readonly" checked={!!config.readOnly} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.readOnly', !!c)} />
          <Label htmlFor="date-picker-readonly" className="text-xs text-muted-foreground cursor-pointer">Read-only</Label>
        </div>
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

DatePickerConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default DatePickerConfigEditor;
