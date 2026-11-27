import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  IconPicker,
  SegmentedControl,
  useConfigValue,
} from "../config";

const VARIANTS = [
  { value: "default", label: "Default", group: "Standard" },
  { value: "secondary", label: "Secondary", group: "Standard" },
  { value: "outline", label: "Outline", group: "Standard" },
  { value: "ghost", label: "Ghost", group: "Standard" },
  { value: "destructive", label: "Destructive", group: "Standard" },
  { value: "link", label: "Link", group: "Standard" },
  { value: "primary-outline", label: "Primary outline", group: "Standard" },
  { value: "primary-ghost", label: "Primary ghost", group: "Standard" },
  { value: "green", label: "Green (legacy)", group: "Legacy" },
  { value: "white", label: "White (legacy)", group: "Legacy" },
  { value: "pill", label: "Pill (legacy)", group: "Legacy" },
  { value: "destructive-ghost", label: "Destructive ghost (legacy)", group: "Legacy" },
];

const SIZES = [
  { value: "default", label: "Default", group: "Standard" },
  { value: "sm", label: "Small", group: "Standard" },
  { value: "lg", label: "Large", group: "Standard" },
  { value: "icon", label: "Icon", group: "Standard" },
  { value: "circle", label: "Circle (legacy)", group: "Legacy" },
  { value: "pill", label: "Pill (legacy)", group: "Legacy" },
];

export const ButtonConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const [text, setText] = useConfigValue("text", "Click Me");
  const [variant, setVariant] = useConfigValue("variant", "default");
  const [size, setSize] = useConfigValue("size", "default");
  const [alignment, setAlignment] = useConfigValue("alignment", "center");
  const [fullWidth, setFullWidth] = useConfigValue("fullWidth", false);
  const [icon, setIcon] = useConfigValue("icon", "");
  const [iconPosition, setIconPosition] = useConfigValue("iconPosition", "left");
  const [tooltip, setTooltip] = useConfigValue("tooltip", "");
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const [loadingText, setLoadingText] = useConfigValue("loadingText", "");
  const [successText, setSuccessText] = useConfigValue("successText", "");
  const [shortcut, setShortcut] = useConfigValue("shortcut", "");
  const [confirm, setConfirm] = useConfigValue("confirm", { enabled: false });
  const confirmEnabled = !!confirm?.enabled;

  return (
    <>
      <ConfigSection id="button-content" title="Button" description="What the button says and how it is labelled." tab="content">
        <ConfigField label="Text" path="text" htmlFor="button-text" helper="Leave empty for an icon-only button; set an accessible name in Advanced.">
          <BindableInput id="button-text" value={text} onChange={setText} liveStateTree={liveStateTree} placeholder="Click Me" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Icon" path="icon">
            <IconPicker value={icon} onChange={setIcon} label="Button icon" />
          </ConfigField>
          <ConfigField label="Icon position" path="iconPosition" defaultValue="left">
            <SegmentedControl
              ariaLabel="Icon position"
              value={iconPosition || "left"}
              onChange={setIconPosition}
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ]}
              className={!icon ? "opacity-50" : undefined}
            />
          </ConfigField>
        </div>
        <ConfigField label="Tooltip" path="tooltip" helper="Shown on hover and focus. Falls back to the button text.">
          <BindableInput value={tooltip} onChange={setTooltip} liveStateTree={liveStateTree} placeholder="e.g. Save changes" />
        </ConfigField>
        <ConfigField label="Keyboard shortcut" path="shortcut" htmlFor="button-shortcut" helper="Example: Ctrl+Enter or Cmd+K. Avoid single letters.">
          <Input
            id="button-shortcut"
            value={shortcut ?? ""}
            onChange={(event) => setShortcut(event.target.value)}
            placeholder="Ctrl+Enter"
            className="h-8 font-mono text-xs"
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="button-style" title="Appearance" tab="style">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Variant" path="variant" defaultValue="default">
            <Select value={variant || "default"} onValueChange={setVariant}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Standard", "Legacy"].map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="text-[9px] uppercase tracking-wider">{group}</SelectLabel>
                    {VARIANTS.filter((item) => item.group === group).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField label="Size" path="size" defaultValue="default">
            <Select value={size || "default"} onValueChange={setSize}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Standard", "Legacy"].map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="text-[9px] uppercase tracking-wider">{group}</SelectLabel>
                    {SIZES.filter((item) => item.group === group).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </ConfigField>
        </div>
        <ConfigField label="Alignment" path="alignment" defaultValue="center">
          <SegmentedControl
            ariaLabel="Button alignment"
            value={alignment || "center"}
            onChange={setAlignment}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </ConfigField>
        <ConfigField label="Full width" path="fullWidth" defaultValue={false} inline helper="Stretch to fill the widget row.">
          <Switch checked={!!fullWidth} onCheckedChange={setFullWidth} aria-label="Full width" />
        </ConfigField>
        <p className="text-[10px] leading-snug text-muted-foreground">
          Standard variants use the 6px control radius. Pill and circle sizes are kept only for saved-content compatibility.
        </p>
      </ConfigSection>

      <ConfigSection id="button-behavior" title="State & feedback" tab="behavior">
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Loading" path="isLoading" inline helper="Blocks duplicate clicks.">
            <BindableSwitch value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} ariaLabel="Loading" />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Loading text" path="loadingText">
            <BindableInput value={loadingText} onChange={setLoadingText} liveStateTree={liveStateTree} placeholder="Saving…" />
          </ConfigField>
          <ConfigField label="Success text" path="successText">
            <BindableInput value={successText} onChange={setSuccessText} liveStateTree={liveStateTree} placeholder="Saved" />
          </ConfigField>
        </div>

        <ConfigField label="Confirm before running" path="confirm.enabled" defaultValue={false} inline helper="Adds a final confirmation dialog for destructive or irreversible actions.">
          <Switch
            checked={confirmEnabled}
            onCheckedChange={(checked) => setConfirm({ ...(confirm || {}), enabled: !!checked })}
            aria-label="Confirm before running"
          />
        </ConfigField>
        {confirmEnabled && (
          <div className="space-y-2 rounded-control border border-border/70 bg-muted/20 p-2">
            <ConfigField label="Dialog title" path="confirm.title">
              <BindableInput
                value={confirm?.title ?? ""}
                onChange={(value) => setConfirm({ ...confirm, title: value })}
                liveStateTree={liveStateTree}
                placeholder="Delete this record?"
              />
            </ConfigField>
            <ConfigField label="Message" path="confirm.message">
              <BindableInput
                value={confirm?.message ?? ""}
                onChange={(value) => setConfirm({ ...confirm, message: value })}
                liveStateTree={liveStateTree}
                placeholder="This action cannot be undone."
              />
            </ConfigField>
            <div className="grid grid-cols-2 gap-2">
              <ConfigField label="Confirm label" path="confirm.confirmLabel" htmlFor="button-confirm-label">
                <Input
                  id="button-confirm-label"
                  value={confirm?.confirmLabel ?? ""}
                  onChange={(event) => setConfirm({ ...confirm, confirmLabel: event.target.value })}
                  placeholder="Delete"
                  className="h-8 text-xs"
                />
              </ConfigField>
              <ConfigField label="Cancel label" path="confirm.cancelLabel" htmlFor="button-cancel-label">
                <Input
                  id="button-cancel-label"
                  value={confirm?.cancelLabel ?? ""}
                  onChange={(event) => setConfirm({ ...confirm, cancelLabel: event.target.value })}
                  placeholder="Cancel"
                  className="h-8 text-xs"
                />
              </ConfigField>
            </div>
          </div>
        )}
      </ConfigSection>
    </>
  );
};

ButtonConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};
ButtonConfigEditor.usesConfigKit = true;

export default ButtonConfigEditor;
