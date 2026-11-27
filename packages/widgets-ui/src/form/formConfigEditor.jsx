import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  ConditionBuilder,
  OptionListEditor,
  SegmentedControl,
  TagField,
  useConfigValue,
} from "../config";

const FIELD_TYPES = ["text", "email", "password", "number", "textarea", "checkbox", "select", "radio", "switch", "date", "datetime", "file", "hidden"];

export const FormConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [submitLabel, setSubmitLabel] = useConfigValue("submitLabel", "Submit");
  const [resetLabel, setResetLabel] = useConfigValue("resetLabel", "Reset");
  const [showReset, setShowReset] = useConfigValue("showReset", false);
  const [layout, setLayout] = useConfigValue("layout", "vertical");
  const [columns, setColumns] = useConfigValue("columns", 1);
  const [size, setSize] = useConfigValue("size", "default");
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "top");
  const [stickyActions, setStickyActions] = useConfigValue("stickyActions", false);
  const [stepper, setStepper] = useConfigValue("stepper", false);
  const [autosave, setAutosave] = useConfigValue("autosave", false);
  const [autosaveDelay, setAutosaveDelay] = useConfigValue("autosaveDelay", 900);
  const [validationUrl, setValidationUrl] = useConfigValue("validationUrl", "");
  const [successMessage, setSuccessMessage] = useConfigValue("successMessage", "");
  const [warnUnsaved, setWarnUnsaved] = useConfigValue("warnUnsaved", false);
  const [fields, setFields] = useConfigValue("fields", []);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  const renderField = (field, index, update, ids) => (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Label</label>
          <Input value={field?.label ?? ""} onChange={(event) => update(index, "label", event.target.value)} className="h-7 text-[11px]" placeholder="Email address" />
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Key</label>
          <Input value={field?.key ?? ""} onChange={(event) => update(index, "key", event.target.value)} className="h-7 font-mono text-[11px]" placeholder="email" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Type</label>
          <select
            value={field?.type || "text"}
            onChange={(event) => update(index, "type", event.target.value)}
            className="h-7 w-full rounded border border-input-custom bg-input-custom px-1.5 text-[11px] text-foreground"
          >
            {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Placeholder</label>
          <Input value={field?.placeholder ?? ""} onChange={(event) => update(index, "placeholder", event.target.value)} className="h-7 text-[11px]" />
        </div>
      </div>
      {["select", "radio"].includes(field?.type) && (
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Options</label>
          <TagField value={Array.isArray(field?.options) ? field.options : []} onChange={(options) => update(index, "options", options)} placeholder="Add an option…" />
        </div>
      )}
      <div className="space-y-0.5">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Help text</label>
        <Input value={field?.help ?? ""} onChange={(event) => update(index, "help", event.target.value)} className="h-7 text-[11px]" />
      </div>
      <div className="space-y-0.5">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Default value</label>
        <BindableInput value={field?.defaultValue ?? ""} onChange={(value) => update(index, "defaultValue", value)} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.name }}" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Width (cols)</label>
          <Input type="number" min={1} max={4} value={field?.width ?? ""} onChange={(event) => update(index, "width", event.target.value === "" ? "" : Number(event.target.value))} className="h-7 text-[11px]" />
        </div>
        <div className="space-y-0.5">
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Section / step</label>
          <Input value={field?.section ?? ""} onChange={(event) => update(index, "section", event.target.value)} placeholder="Details" className="h-7 text-[11px]" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-1">
        {[["required", "Required", field?.required], ["disabled", "Disabled", field?.disabled], ["readOnly", "Read-only", field?.readOnly]].map(([key, label, checked]) => (
          <label key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Switch checked={!!checked} onCheckedChange={(value) => update(index, key, !!value)} className="h-[14px] w-[24px] [&>span]:h-2.5 [&>span]:w-2.5 data-[state=checked]:[&>span]:translate-x-2.5" aria-label={`${label} ${field?.label || field?.key || index + 1}`} />
            {label}
          </label>
        ))}
      </div>
      <details className="rounded-control border border-border/60 bg-muted/20 p-1.5">
        <summary className="cursor-pointer text-[10px] text-muted-foreground">Validation & visibility</summary>
        <div className="mt-1.5 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Min</label>
              <Input type="number" value={field?.validation?.min ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), min: event.target.value === "" ? undefined : Number(event.target.value) })} className="h-7 text-[11px]" />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Max</label>
              <Input type="number" value={field?.validation?.max ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), max: event.target.value === "" ? undefined : Number(event.target.value) })} className="h-7 text-[11px]" />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Min length</label>
              <Input type="number" value={field?.validation?.minLength ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), minLength: event.target.value === "" ? undefined : Number(event.target.value) })} className="h-7 text-[11px]" />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Max length</label>
              <Input type="number" value={field?.validation?.maxLength ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), maxLength: event.target.value === "" ? undefined : Number(event.target.value) })} className="h-7 text-[11px]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Pattern</label>
            <Input value={field?.validation?.pattern ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), pattern: event.target.value })} className="h-7 font-mono text-[11px]" />
          </div>
          <div className="space-y-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Error message</label>
            <Input value={field?.validation?.message ?? ""} onChange={(event) => update(index, "validation", { ...(field?.validation || {}), message: event.target.value })} className="h-7 text-[11px]" />
          </div>
          <div className="space-y-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Visible when</label>
            <ConditionBuilder value={field?.visibleWhen} onChange={(value) => update(index, "visibleWhen", value)} fields={["values.status", "values.role"]} emptyLabel="Always visible." />
          </div>
        </div>
      </details>
    </>
  );

  return (
    <>
      <ConfigSection id="form-settings" title="Form settings" tab="content">
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Submit label" path="submitLabel" defaultValue="Submit" htmlFor="form-submit-label">
            <Input id="form-submit-label" value={submitLabel ?? ""} onChange={(event) => setSubmitLabel(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
          <ConfigField label="Reset label" path="resetLabel" defaultValue="Reset" htmlFor="form-reset-label">
            <Input id="form-reset-label" value={resetLabel ?? ""} onChange={(event) => setResetLabel(event.target.value)} className="h-8 text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Show reset" path="showReset" defaultValue={false} inline>
          <Switch checked={!!showReset} onCheckedChange={setShowReset} aria-label="Show reset" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Layout" path="layout" defaultValue="vertical">
            <SegmentedControl
              ariaLabel="Form layout"
              value={layout || "vertical"}
              onChange={setLayout}
              options={[
                { value: "vertical", label: "Stack" },
                { value: "horizontal", label: "Row" },
                { value: "grid", label: "Grid" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Columns" path="columns" defaultValue={1}>
            <SegmentedControl
              ariaLabel="Form columns"
              value={String(Math.min(4, Math.max(1, Number(columns) || 1)))}
              onChange={(value) => setColumns(Number(value))}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Form size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Label position" path="labelPosition" defaultValue="top">
            <SegmentedControl
              ariaLabel="Form label position"
              value={labelPosition || "top"}
              onChange={setLabelPosition}
              options={[
                { value: "top", label: "Top" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Sticky actions" path="stickyActions" defaultValue={false} inline>
          <Switch checked={!!stickyActions} onCheckedChange={setStickyActions} aria-label="Sticky actions" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Stepper" path="stepper" defaultValue={false} inline helper="Groups fields by their Section / step value.">
            <Switch checked={!!stepper} onCheckedChange={setStepper} aria-label="Stepper" />
          </ConfigField>
          <ConfigField label="Autosave" path="autosave" defaultValue={false} inline helper="Fires onAutosave after edits settle.">
            <Switch checked={!!autosave} onCheckedChange={setAutosave} aria-label="Autosave" />
          </ConfigField>
        </div>
        {autosave && (
          <ConfigField label="Autosave delay (ms)" path="autosaveDelay" defaultValue={900} htmlFor="form-autosave-delay">
            <Input
              id="form-autosave-delay"
              type="number"
              min={250}
              max={10000}
              step={50}
              value={autosaveDelay ?? 900}
              onChange={(event) => setAutosaveDelay(Number(event.target.value))}
              className="h-8 text-xs"
            />
          </ConfigField>
        )}
        <ConfigField label="Async validation URL" path="validationUrl" helper="Optional POST endpoint receiving { values, fields }; return { errors } to block submit.">
          <BindableInput value={validationUrl} onChange={setValidationUrl} liveStateTree={liveStateTree} placeholder="https://api.example.com/validate" />
        </ConfigField>
        <ConfigField label="Success message" path="successMessage">
          <BindableInput value={successMessage} onChange={setSuccessMessage} liveStateTree={liveStateTree} placeholder="Saved successfully." />
        </ConfigField>
        <ConfigField label="Warn on unsaved changes" path="warnUnsaved" defaultValue={false} inline>
          <Switch checked={!!warnUnsaved} onCheckedChange={setWarnUnsaved} aria-label="Warn on unsaved changes" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="form-fields" title="Fields" description="Build the form fields, validation and conditional visibility." tab="content">
        <OptionListEditor
          value={fields || []}
          onChange={setFields}
          labelKey="label"
          valueKey="key"
          itemLabel="Field"
          allowDisabled={false}
          showValue={false}
          renderFields={renderField}
          getPreview={(field) => `${field?.label || field?.key || "Untitled"} · ${field?.type || "text"}`}
        />
      </ConfigSection>

      <ConfigSection id="form-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

FormConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
FormConfigEditor.usesConfigKit = true;
export default FormConfigEditor;
