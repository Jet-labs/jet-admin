import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

const VARIANTS = [
  { value: "default", label: "Default" },
  { value: "secondary", label: "Secondary" },
  { value: "green", label: "Green" },
  { value: "destructive", label: "Destructive" },
  { value: "white", label: "White" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
  { value: "link", label: "Link" },
  { value: "pill", label: "Pill" },
  { value: "primary-ghost", label: "Primary Ghost" },
  { value: "destructive-ghost", label: "Destructive Ghost" },
  { value: "primary-outline", label: "Primary Outline" },
];

const SIZES = [
  { value: "default", label: "Default" },
  { value: "sm", label: "Small" },
  { value: "lg", label: "Large" },
  { value: "icon", label: "Icon" },
  { value: "circle", label: "Circle" },
  { value: "pill", label: "Pill" },
];

// Radix Select forbids an empty-string SelectItem value. Use a sentinel for
// "no icon" and translate it back to "" in the stored config.
const NO_ICON = "__none__";

const ICONS = [
  { value: NO_ICON, label: "None" },
  { value: "play", label: "Play" },
  { value: "plus", label: "Plus" },
  { value: "download", label: "Download" },
  { value: "upload", label: "Upload" },
  { value: "trash", label: "Trash" },
  { value: "edit", label: "Edit" },
  { value: "save", label: "Save" },
  { value: "search", label: "Search" },
  { value: "refresh", label: "Refresh" },
  { value: "arrowRight", label: "Arrow Right" },
  { value: "check", label: "Check" },
  { value: "close", label: "Close" },
  { value: "filter", label: "Filter" },
  { value: "settings", label: "Settings" },
  { value: "chevronDown", label: "Chevron Down" },
];

export const ButtonConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const set = (key, val) => widgetEditorForm.setFieldValue(`widgetConfig.${key}`, val);

  return (
    <div className="space-y-2">
      {/* Button Text */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Button Text</Label>
        <TemplateAutocompleteInput
          value={config.text ?? config.label ?? ""}
          onChange={(val) => set('text', val)}
          placeholder="Click Me"
          liveStateTree={liveStateTree}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Variant */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Variant</Label>
          <Select
            value={config.variant || "default"}
            onValueChange={(val) => set('variant', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {VARIANTS.map((v) => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Size</Label>
          <Select
            value={config.size || "default"}
            onValueChange={(val) => set('size', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Alignment */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Alignment</Label>
          <Select
            value={config.alignment || "center"}
            onValueChange={(val) => set('alignment', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Icon <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Select
            value={config.icon || NO_ICON}
            onValueChange={(val) => set('icon', val === NO_ICON ? "" : val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="No icon" />
            </SelectTrigger>
            <SelectContent>
              {ICONS.map((i) => (
                <SelectItem key={i.value || "none"} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Icon position */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Icon Position</Label>
          <Select
            value={config.iconPosition || "left"}
            onValueChange={(val) => set('iconPosition', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Icon position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Full width */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-foreground">Full Width</Label>
          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={config.fullWidth === true || config.fullWidth === "true"}
              onCheckedChange={(val) => set('fullWidth', val)}
            />
            <span className="text-xs text-muted-foreground">Stretch to fill row</span>
          </div>
        </div>
      </div>

      {/* Disabled Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Disabled Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.disabled || ""}
          onChange={(val) => set('disabled', val)}
          placeholder="e.g. {{ !state.variables.canSubmit }}"
          liveStateTree={liveStateTree}
        />
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => set('isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

ButtonConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default ButtonConfigEditor;
