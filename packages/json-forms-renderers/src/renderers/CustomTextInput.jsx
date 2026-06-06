// Custom Text Input Renderer
//
// Every JSON Forms text input is {{ }}-template aware: it renders the shared
// TemplateAutocompleteInput from @jet-admin/ui, which provides expression-engine
// powered intellisense whenever the cursor is inside a {{ }} zone. Context and
// mode are supplied by the host form via uischema.options:
//   options.stateTree     → live context tree for suggestions (args / ctx / events)
//   options.templateMode  → expression-engine mode ("js-template" | "safe-path")
// Password fields fall back to a masked plain input.
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Label, TemplateAutocompleteInput } from '@jet-admin/ui';

export const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const options = uischema?.options || {};
  const isMulti = options.multi;
  const isPassword = options.format === "password";
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0;
  const stateTree = options.stateTree || null;
  const templateMode = options.templateMode;
  const placeholder = hasErrors ? errors : options.placeholder || "";
  const stringValue = typeof data === 'object' ? JSON.stringify(data) : data || "";

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          hasErrors ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        {label || description}
      </Label>
      {isPassword ? (
        <Input
          size="sm"
          type="password"
          id={path}
          name={path}
          disabled={isDisabled}
          className={hasErrors ? "border-red-500 focus:border-red-500" : ""}
          placeholder={placeholder}
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={stringValue}
        />
      ) : (
          <TemplateAutocompleteInput
            value={stringValue}
            onChange={(val) => handleChange(path, val)}
            placeholder={placeholder}
            liveStateTree={stateTree}
            mode={templateMode}
            isTextArea={!!isMulti}
            rows={options.rows || 3}
            readOnly={isDisabled}
            className={hasErrors ? "ring-1 ring-red-500 rounded-sm" : ""}
        />
      )}
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
    </div>
  );
};

CustomTextInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};
