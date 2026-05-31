import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Checkbox } from '@jet-admin/ui';
import TemplateAutocompleteInput from '../_shared/TemplateAutocompleteInput';
import { getSuggestionsFromStateTree } from '../intellisense/suggestionEngine';

export const DatePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
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
          suggestions={suggestions}
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
