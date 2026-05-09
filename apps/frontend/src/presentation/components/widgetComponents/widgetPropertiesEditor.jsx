import React, { useCallback } from "react";
import PropTypes from "prop-types";

import {
  Input,
  Label,
  Textarea,
} from "@jet-admin/ui";

/**
 * WidgetPropertiesEditor
 * 
 * Handles editing the `widgetConfig.properties` section of a widget.
 * This is where users can define custom CSS, Tailwind classes,
 * and any additional property bindings.
 */
export const WidgetPropertiesEditor = ({ widgetEditorForm }) => {
  WidgetPropertiesEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
  };

  const properties = widgetEditorForm.values.widgetConfig?.properties || {};

  const handlePropertyChange = useCallback((key, value) => {
    widgetEditorForm.setFieldValue(`widgetConfig.properties.${key}`, value);
  }, [widgetEditorForm]);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
        Custom Properties
      </h3>

      {/* Container Tailwind CSS */}
      <div className="space-y-1.5">
        <Label
          htmlFor="containerTailwindCss"
          className="text-xs text-muted-foreground"
        >
          Container CSS Classes
        </Label>
        <Input
          type="text"
          name="containerTailwindCss"
          id="containerTailwindCss"
          className="text-xs font-mono"
          placeholder="e.g. p-4 rounded-md shadow"
          value={properties.containerTailwindCss || ""}
          onChange={(e) => handlePropertyChange("containerTailwindCss", e.target.value)}
        />
      </div>

      {/* Widget Tailwind CSS */}
      <div className="space-y-1.5">
        <Label
          htmlFor="widgetTailwindCss"
          className="text-xs text-muted-foreground"
        >
          Widget CSS Classes
        </Label>
        <Input
          type="text"
          name="widgetTailwindCss"
          id="widgetTailwindCss"
          className="text-xs font-mono"
          placeholder="e.g. text-foreground bg-card"
          value={properties.widgetTailwindCss || ""}
          onChange={(e) => handlePropertyChange("widgetTailwindCss", e.target.value)}
        />
      </div>

      {/* Refetch Interval */}
      <div className="space-y-1.5">
        <Label
          htmlFor="refetchInterval"
          className="text-xs text-muted-foreground"
        >
          Auto-refresh interval (ms, 0 = disabled)
        </Label>
        <Input
          type="number"
          name="refetchInterval"
          id="refetchInterval"
          className="text-xs"
          placeholder="0"
          min={0}
          step={1000}
          value={properties.refetchInterval || 0}
          onChange={(e) => handlePropertyChange("refetchInterval", parseInt(e.target.value, 10) || 0)}
        />
      </div>
    </div>
  );
};
