import React, { useCallback } from "react";
import PropTypes from "prop-types";

import {
  Checkbox,
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
    <div className="space-y-2 mt-2">
      <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
        Custom Properties
      </Label>

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

      <hr className="my-4 border-border" />

      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
        Widget Styling
      </h3>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="showBorder"
          checked={properties.style?.showBorder ?? true}
          onCheckedChange={(checked) => handlePropertyChange("style.showBorder", !!checked)}
        />
        <Label htmlFor="showBorder" className="text-xs text-muted-foreground cursor-pointer">
          Show border & shadow
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Radius</Label>
          <Input type="text" className="text-xs" value={properties.style?.borderRadius || ""} onChange={(e) => handlePropertyChange("style.borderRadius", e.target.value)} placeholder="e.g. 4px" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Padding</Label>
          <Input type="text" className="text-xs" value={properties.style?.padding || ""} onChange={(e) => handlePropertyChange("style.padding", e.target.value)} placeholder="e.g. 16px" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Width</Label>
          <Input type="text" className="text-xs" value={properties.style?.borderWidth || ""} onChange={(e) => handlePropertyChange("style.borderWidth", e.target.value)} placeholder="e.g. 1px" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Color</Label>
          <Input type="text" className="text-xs" value={properties.style?.borderColor || ""} onChange={(e) => handlePropertyChange("style.borderColor", e.target.value)} placeholder="e.g. #ff0000" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <Input type="text" className="text-xs" value={properties.style?.backgroundColor || ""} onChange={(e) => handlePropertyChange("style.backgroundColor", e.target.value)} placeholder="e.g. transparent" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Color</Label>
          <Input type="text" className="text-xs" value={properties.style?.textColor || ""} onChange={(e) => handlePropertyChange("style.textColor", e.target.value)} placeholder="e.g. #333333" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Custom CSS</Label>
        <p className="text-[10px] text-muted-foreground leading-normal">
          Write CSS properties directly. They will be scoped to this widget only.
        </p>
        <Textarea className="text-xs font-mono min-h-[80px]" value={properties.style?.customCSS || ""} onChange={(e) => handlePropertyChange("style.customCSS", e.target.value)} placeholder="box-shadow: 0 4px 6px rgba(0,0,0,0.1);&#10;opacity: 0.9;" />
      </div>
    </div>
  );
};
