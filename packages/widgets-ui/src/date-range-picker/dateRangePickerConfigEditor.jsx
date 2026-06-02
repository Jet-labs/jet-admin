import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox } from '@jet-admin/ui';
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { getSuggestionsFromStateTree } from '../intellisense/suggestionEngine';

export const DateRangePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

  const suggestions = useMemo(() => {
    if (!stateTree) return [];
    const rawSuggestions = getSuggestionsFromStateTree(stateTree);
    return rawSuggestions.map((s) => ({
      label: `{{${s.value}}}`,
      value: `{{${s.value}}}`,
      detail: s.detail,
    }));
  }, [stateTree]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Label</Label>
        <Input
          type="text"
          className="text-sm h-8"
          value={config.label || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.label', e.target.value)}
          placeholder="e.g. Select date range"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Start Placeholder</Label>
          <Input
            type="text"
            className="text-sm h-8"
            value={config.placeholderStart || ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.placeholderStart', e.target.value)}
            placeholder="Start date"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">End Placeholder</Label>
          <Input
            type="text"
            className="text-sm h-8"
            value={config.placeholderEnd || ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.placeholderEnd', e.target.value)}
            placeholder="End date"
          />
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Default Start</Label>
          <TemplateAutocompleteInput
            value={config.defaultStart || ''}
            onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultStart', val)}
            placeholder="e.g. {{state.variables.startDate}}"
            suggestions={suggestions}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Default End</Label>
          <TemplateAutocompleteInput
            value={config.defaultEnd || ''}
            onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultEnd', val)}
            placeholder="e.g. {{state.variables.endDate}}"
            suggestions={suggestions}
          />
        </div>
      </div>
    </div>
  );
};

DateRangePickerConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default DateRangePickerConfigEditor;
