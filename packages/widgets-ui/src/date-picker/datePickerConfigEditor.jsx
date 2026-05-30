import React from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox } from '@jet-admin/ui';

export const DatePickerConfigEditor = ({ widgetEditorForm }) => {
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
          placeholder="e.g. Select date"
        />
      </div>

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Default Value</Label>
        <Input
          type="text"
          className="text-sm h-8 font-mono"
          value={config.defaultValue || ''}
          onChange={(e) => widgetEditorForm.setFieldValue('widgetConfig.defaultValue', e.target.value)}
          placeholder="e.g. 2026-05-30T14:30:00 or ISO string"
        />
      </div>
    </div>
  );
};

DatePickerConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
};

export default DatePickerConfigEditor;
