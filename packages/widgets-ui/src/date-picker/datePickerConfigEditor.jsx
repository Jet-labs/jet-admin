import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox } from '@jet-admin/ui';
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const DatePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

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
        <TemplateAutocompleteInput
          value={config.defaultValue || ''}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.defaultValue', val)}
          placeholder="e.g. {{state.variables.myDate}} or ISO string"
          liveStateTree={liveStateTree}
        />
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1.5 mt-2">
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
