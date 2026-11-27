import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import { Plus, Trash2 } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  ConditionalStyleField,
  IconPicker,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const AlertConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [variant, setVariant] = useConfigValue("variant", "info");
  const [title, setTitle] = useConfigValue("title", "");
  const [message, setMessage] = useConfigValue("message", "");
  const [icon, setIcon] = useConfigValue("icon", "");
  const [dismissible, setDismissible] = useConfigValue("dismissible", true);
  const [persistDismissal, setPersistDismissal] = useConfigValue("persistDismissal", false);
  const [layout, setLayout] = useConfigValue("layout", "inline");
  const [autoDismissMs, setAutoDismissMs] = useConfigValue("autoDismissMs", "");
  const [actions, setActions] = useConfigValue("actions", []);
  const [styleRules, setStyleRules] = useConfigValue("styleRules", { logic: "and", rules: [], style: {} });
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const rows = Array.isArray(actions) ? actions : [];

  return (
    <>
      <ConfigSection id="alert-content" title="Message" tab="content">
        <ConfigField label="Variant" path="variant" defaultValue="info">
          <SegmentedControl
            ariaLabel="Alert variant"
            value={variant || "info"}
            onChange={setVariant}
            options={[
              { value: "info", label: "Info" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "error", label: "Error" },
              { value: "neutral", label: "Neutral" },
            ]}
          />
        </ConfigField>
        <ConfigField label="Title" path="title">
          <BindableInput value={title} onChange={setTitle} liveStateTree={liveStateTree} placeholder="e.g. Warning!" />
        </ConfigField>
        <ConfigField label="Message" path="message">
          <BindableInput value={message} onChange={setMessage} liveStateTree={liveStateTree} multiline rows={3} placeholder="Describe what happened." />
        </ConfigField>
        <ConfigField label="Icon override" path="icon">
          <IconPicker value={icon} onChange={setIcon} label="Alert icon" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="alert-style" title="Layout" tab="style">
        <ConfigField label="Layout" path="layout" defaultValue="inline">
          <SegmentedControl
            ariaLabel="Alert layout"
            value={layout || "inline"}
            onChange={setLayout}
            options={[
              { value: "inline", label: "Inline" },
              { value: "banner", label: "Banner" },
            ]}
          />
        </ConfigField>
        <ConfigField label="Actions" path="actions" helper="Buttons appended to the alert; each fires onAction with its key.">
          <div className="space-y-1.5">
            {rows.map((action, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input
                  value={action.label ?? ""}
                  onChange={(event) => setActions(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)))}
                  placeholder="Label"
                  className="h-7 w-24 text-[11px]"
                />
                <Input
                  value={action.actionKey ?? ""}
                  onChange={(event) => setActions(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, actionKey: event.target.value } : item)))}
                  placeholder="actionKey"
                  className="h-7 flex-1 font-mono text-[11px]"
                />
                <Select
                  value={action.variant || "outline"}
                  onValueChange={(next) => setActions(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, variant: next } : item)))}
                >
                  <SelectTrigger className="h-7 w-20 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="default">Primary</SelectItem>
                    <SelectItem value="destructive">Danger</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setActions(rows.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove action">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="h-7 w-full text-[11px]" onClick={() => setActions([...rows, { label: "Action", actionKey: `action_${rows.length + 1}`, variant: "outline" }])}>
              <Plus className="mr-1 h-3 w-3" /> Add action
            </Button>
          </div>
        </ConfigField>
        <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
          <summary className="cursor-pointer text-[10px] text-muted-foreground">Conditional style</summary>
          <div className="mt-1.5">
            <ConditionalStyleField
              value={styleRules}
              onChange={setStyleRules}
              fields={["value", "state.variables.status"]}
              emptyLabel="No rules — use the selected variant."
            />
          </div>
        </details>
      </ConfigSection>

      <ConfigSection id="alert-behavior" title="Dismissal & state" tab="behavior">
        <ConfigField label="Dismissible" path="dismissible" defaultValue={true} inline>
          <Switch checked={dismissible !== false} onCheckedChange={setDismissible} aria-label="Dismissible" />
        </ConfigField>
        <ConfigField label="Persist dismissal" path="persistDismissal" defaultValue={false} inline helper="Remember dismissal for this message in this browser session.">
          <Switch checked={!!persistDismissal} onCheckedChange={setPersistDismissal} aria-label="Persist dismissal" />
        </ConfigField>
        <ConfigField label="Auto-dismiss (ms)" path="autoDismissMs" htmlFor="alert-auto-dismiss" helper="Empty disables the timer.">
          <Input
            id="alert-auto-dismiss"
            type="number"
            min={0}
            step={500}
            value={autoDismissMs ?? ""}
            onChange={(event) => setAutoDismissMs(event.target.value === "" ? "" : Number(event.target.value))}
            placeholder="0"
            className="h-8 text-xs"
          />
        </ConfigField>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

AlertConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
AlertConfigEditor.usesConfigKit = true;
export default AlertConfigEditor;
