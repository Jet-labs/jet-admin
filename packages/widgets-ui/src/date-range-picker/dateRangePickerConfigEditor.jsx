import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox, Button, Textarea } from '@jet-admin/ui';
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const DateRangePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [presetsText, setPresetsText] = useState(null);

  const presetsValue = presetsText !== null ? presetsText : JSON.stringify(config.presets || [
    { label: "Today", startOffset: 0, endOffset: 0 },
    { label: "Last 7 days", startOffset: -7, endOffset: 0 },
    { label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" },
  ], null, 2);

  const savePresets = (text) => {
    setPresetsText(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) widgetEditorForm.setFieldValue('widgetConfig.presets', parsed);
    } catch { /* keep editing, validate on blur */ }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={config.label || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.label', e.target.value)}
          placeholder="e.g. Select date range"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Help text (optional)</Label>
        <Input type="text" className="text-sm h-8" value={config.help || ''} onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.help', e.target.value)} placeholder="Shown under the field" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Start Placeholder <span className="text-muted-foreground font-normal">(canonical)</span></Label>
          <Input
            type="text"
            className="text-sm h-8"
            value={config.placeholderStart ?? config.startPlaceholder ?? ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.placeholderStart', e.target.value)}
            placeholder="Start date"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">End Placeholder <span className="text-muted-foreground font-normal">(canonical)</span></Label>
          <Input
            type="text"
            className="text-sm h-8"
            value={config.placeholderEnd ?? config.endPlaceholder ?? ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.placeholderEnd', e.target.value)}
            placeholder="End date"
          />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Legacy startPlaceholder/endPlaceholder still render; canonical placeholderStart/placeholderEnd win.</p>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="date-range-enable-time"
          checked={!!config.enableTime}
          onCheckedChange={(checked) => widgetEditorForm.setFieldValue('widgetConfig.enableTime', !!checked)}
        />
        <Label htmlFor="date-range-enable-time" className="text-xs text-muted-foreground cursor-pointer">
          Enable Time picking (granularity to hours, minutes, seconds)
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="date-range-require-apply"
          checked={!!config.requireApply}
          onCheckedChange={(checked) => widgetEditorForm.setFieldValue('widgetConfig.requireApply', !!checked)}
        />
        <Label htmlFor="date-range-require-apply" className="text-xs text-muted-foreground cursor-pointer">
          Require Apply/Cancel (edit draft, commit explicitly)
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Default Start</Label>
          <TemplateAutocompleteInput
            value={config.defaultStart || ''}
            onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultStart', val)}
            placeholder="e.g. {{state.variables.startDate}}"
            liveStateTree={liveStateTree}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Default End</Label>
          <TemplateAutocompleteInput
            value={config.defaultEnd || ''}
            onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultEnd', val)}
            placeholder="e.g. {{state.variables.endDate}}"
            liveStateTree={liveStateTree}
          />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Defaults apply once. Clearing stays empty; Reset re-applies.</p>

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
        <Input type="text" className="text-sm h-8" value={(config.disabledDates || []).join(", ")} onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.disabledDates', e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="2026-12-25, 2026-01-01" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Presets (JSON)</Label>
        <Textarea
          className="text-xs font-mono min-h-[90px]"
          value={presetsValue}
          onChange={(e) => savePresets(e.target.value)}
          placeholder='[{"label":"Today","startOffset":0,"endOffset":0}]'
        />
        <p className="text-[11px] text-muted-foreground">Canonical: {"{"}label, start, end{"}"} ISO. Legacy offsets (startOffset/endOffset numbers or startOfMonth/endOfMonth/startOfYear/endOfYear) still work.</p>
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox id="date-range-required" checked={!!config.required} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.required', !!c)} />
          <Label htmlFor="date-range-required" className="text-xs text-muted-foreground cursor-pointer">Required</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="date-range-disabled" checked={!!config.disabled} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.disabled', !!c)} />
          <Label htmlFor="date-range-disabled" className="text-xs text-muted-foreground cursor-pointer">Disabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="date-range-readonly" checked={!!config.readOnly} onCheckedChange={(c) => widgetEditorForm.setFieldValue('widgetConfig.readOnly', !!c)} />
          <Label htmlFor="date-range-readonly" className="text-xs text-muted-foreground cursor-pointer">Read-only</Label>
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

DateRangePickerConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default DateRangePickerConfigEditor;
