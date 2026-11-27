import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const TextInputConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const [label, setLabel] = useConfigValue("label", "");
  const [placeholder, setPlaceholder] = useConfigValue("placeholder", "");
  const [defaultValue, setDefaultValue] = useConfigValue("defaultValue", "");
  const [inputType, setInputType] = useConfigValue("inputType", "text");
  const [rows, setRows] = useConfigValue("rows", 3);
  const [prefix, setPrefix] = useConfigValue("prefix", "");
  const [suffix, setSuffix] = useConfigValue("suffix", "");
  const [mask, setMask] = useConfigValue("mask", "");
  const [help, setHelp] = useConfigValue("help", "");
  const [labelPosition, setLabelPosition] = useConfigValue("labelPosition", "top");
  const [size, setSize] = useConfigValue("size", "default");
  const [variant, setVariant] = useConfigValue("variant", "outline");
  const [showCount, setShowCount] = useConfigValue("showCount", false);
  const [autosize, setAutosize] = useConfigValue("autosize", false);
  const [allowPasswordReveal, setAllowPasswordReveal] = useConfigValue("allowPasswordReveal", true);
  const [required, setRequired] = useConfigValue("required", false);
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [minLength, setMinLength] = useConfigValue("minLength", "");
  const [maxLength, setMaxLength] = useConfigValue("maxLength", "");
  const [pattern, setPattern] = useConfigValue("pattern", "");
  const [errorMessage, setErrorMessage] = useConfigValue("errorMessage", "");
  const [validateOn, setValidateOn] = useConfigValue("validateOn", "blur");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");
  const [autoComplete, setAutoComplete] = useConfigValue("autoComplete", "");

  const lengthError =
    minLength !== "" && maxLength !== "" && Number(minLength) > Number(maxLength)
      ? "Minimum length cannot exceed maximum length."
      : "";

  return (
    <>
      <ConfigSection id="text-input-content" title="Field" description="The label, value source and input shape." tab="content">
        <ConfigField label="Label" path="label" htmlFor="text-input-label">
          <BindableInput id="text-input-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Customer name" />
        </ConfigField>
        <ConfigField label="Placeholder" path="placeholder" htmlFor="text-input-placeholder">
          <BindableInput id="text-input-placeholder" value={placeholder} onChange={setPlaceholder} liveStateTree={liveStateTree} placeholder="Type…" />
        </ConfigField>
        <ConfigField label="Default value" path="defaultValue" helper="Applies once on first load. Clearing the field stays empty.">
          <BindableInput value={defaultValue} onChange={setDefaultValue} liveStateTree={liveStateTree} placeholder="e.g. {{ state.variables.name }}" />
        </ConfigField>

        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Input type" path="inputType" defaultValue="text" htmlFor="text-input-type">
            <Select value={inputType || "text"} onValueChange={setInputType}>
              <SelectTrigger id="text-input-type" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="tel">Telephone</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          {inputType === "textarea" ? (
            <ConfigField label="Rows" path="rows" defaultValue={3} htmlFor="text-input-rows">
              <Input
                id="text-input-rows"
                type="number"
                min={1}
                max={20}
                value={rows ?? 3}
                onChange={(event) => setRows(Number(event.target.value))}
                className="h-8 text-xs"
              />
            </ConfigField>
          ) : (
            <ConfigField label="Autocomplete" path="autoComplete" htmlFor="text-input-autocomplete">
              <Input
                id="text-input-autocomplete"
                value={autoComplete ?? ""}
                onChange={(event) => setAutoComplete(event.target.value)}
                placeholder="off"
                className="h-8 font-mono text-xs"
              />
            </ConfigField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Prefix" path="prefix">
            <BindableInput value={prefix} onChange={setPrefix} liveStateTree={liveStateTree} placeholder="$" />
          </ConfigField>
          <ConfigField label="Suffix" path="suffix">
            <BindableInput value={suffix} onChange={setSuffix} liveStateTree={liveStateTree} placeholder="kg" />
          </ConfigField>
        </div>

        <ConfigField label="Help text" path="help">
          <BindableInput value={help} onChange={setHelp} liveStateTree={liveStateTree} placeholder="Shown under the field" />
        </ConfigField>

        <ConfigField label="Input mask" path="mask" htmlFor="text-input-mask" helper="9 = digit, A = letter, * = letter or digit. Example: (999) 999-9999">
          <Input
            id="text-input-mask"
            value={mask ?? ""}
            onChange={(event) => setMask(event.target.value)}
            placeholder="(999) 999-9999"
            className="h-8 font-mono text-xs"
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="text-input-style" title="Field style" description="Presentation specific to this input." tab="style">
        <ConfigField label="Label position" path="labelPosition" defaultValue="top">
          <SegmentedControl
            ariaLabel="Label position"
            value={labelPosition || "top"}
            onChange={setLabelPosition}
            options={[
              { value: "top", label: "Top" },
              { value: "left", label: "Left" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Size" path="size" defaultValue="default">
            <SegmentedControl
              ariaLabel="Input size"
              value={size || "default"}
              onChange={setSize}
              options={[
                { value: "sm", label: "S" },
                { value: "default", label: "M" },
                { value: "lg", label: "L" },
              ]}
            />
          </ConfigField>
          <ConfigField label="Variant" path="variant" defaultValue="outline">
            <SegmentedControl
              ariaLabel="Input variant"
              value={variant || "outline"}
              onChange={setVariant}
              options={[
                { value: "outline", label: "Outline" },
                { value: "filled", label: "Filled" },
                { value: "underline", label: "Line" },
              ]}
            />
          </ConfigField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Character counter" path="showCount" defaultValue={false} inline>
            <Switch
              checked={!!showCount}
              onCheckedChange={setShowCount}
              aria-label="Show character counter"
            />
          </ConfigField>
          <ConfigField label="Password reveal" path="allowPasswordReveal" defaultValue={true} inline>
            <Switch
              checked={allowPasswordReveal !== false}
              onCheckedChange={setAllowPasswordReveal}
              aria-label="Allow password reveal"
              disabled={inputType !== "password"}
            />
          </ConfigField>
        </div>
        {inputType === "textarea" && (
          <ConfigField label="Auto-resize" path="autosize" defaultValue={false} inline helper="Grows with content up to the available height.">
            <Switch checked={!!autosize} onCheckedChange={setAutosize} aria-label="Auto-resize textarea" />
          </ConfigField>
        )}
      </ConfigSection>

      <ConfigSection id="text-input-behavior" title="Validation & state" description="Rules and states evaluated at runtime." tab="behavior">
        <div className="grid grid-cols-3 gap-3">          <ConfigField label="Required" path="required" defaultValue={false} inline>
            <BindableSwitch value={required} onChange={setRequired} liveStateTree={liveStateTree} ariaLabel="Required" />
          </ConfigField>
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Read-only" path="readOnly" defaultValue={false} inline>
            <BindableSwitch value={readOnly} onChange={setReadOnly} liveStateTree={liveStateTree} ariaLabel="Read-only" />
          </ConfigField>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Min length" path="minLength" error={lengthError}>
            <Input
              type="number"
              min={0}
              value={minLength ?? ""}
              onChange={(event) => setMinLength(event.target.value === "" ? "" : Number(event.target.value))}
              className="h-8 text-xs"
            />
          </ConfigField>
          <ConfigField label="Max length" path="maxLength">
            <Input
              type="number"
              min={0}
              value={maxLength ?? ""}
              onChange={(event) => setMaxLength(event.target.value === "" ? "" : Number(event.target.value))}
              className="h-8 text-xs"
            />
          </ConfigField>
        </div>

        <ConfigField
          label="Pattern"
          path="pattern"
          htmlFor="text-input-pattern"
          helper="Regular expression tested against the value."
        >
          <Input
            id="text-input-pattern"
            value={pattern ?? ""}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="^[A-Z].*"
            className="h-8 font-mono text-xs"
          />
        </ConfigField>
        <ConfigField label="Error message" path="errorMessage" helper="Shown when pattern validation fails.">
          <Input
            value={errorMessage ?? ""}
            onChange={(event) => setErrorMessage(event.target.value)}
            placeholder="Enter a valid value."
            className="h-8 text-xs"
          />
        </ConfigField>
        <ConfigField label="Validate on" path="validateOn" defaultValue="blur">
          <SegmentedControl
            ariaLabel="Validation timing"
            value={validateOn || "blur"}
            onChange={setValidateOn}
            options={[
              { value: "change", label: "Change" },
              { value: "blur", label: "Blur" },
              { value: "submit", label: "Submit" },
            ]}
          />
        </ConfigField>
        <ConfigField label="Loading template" path="isLoading" helper="Boolean expression; shows an in-place busy state.">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

TextInputConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object,
  stateTree: PropTypes.object,
};
TextInputConfigEditor.usesConfigKit = true;

export default TextInputConfigEditor;
