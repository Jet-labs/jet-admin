import React from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox } from '@jet-admin/ui';

export const DateRangePickerConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

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
          <Input
            type="text"
            className="text-sm h-8 font-mono"
            value={config.defaultStart || ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.defaultStart', e.target.value)}
            placeholder="ISO date string"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Default End</Label>
          <Input
            type="text"
            className="text-sm h-8 font-mono"
            value={config.defaultEnd || ''}
            onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.defaultEnd', e.target.value)}
            placeholder="ISO date string"
          />
        </div>
      </div>
    </div>
  );
};

DateRangePickerConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
};

export default DateRangePickerConfigEditor;
