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
import { formatValidationMessage } from './formatValidationMessage.js';

export const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const options = uischema?.options || {};
  const isMulti = options.multi;
  const isPassword = options.format === "password";
  const isDisabled = enabled === false;
  // JSON Forms normally passes an array, but some custom controls pass a
  // single string. Normalize both shapes instead of warning and rendering
  // "[object Object]".
  const errorList = Array.isArray(errors) ? errors : errors ? [String(errors)] : [];
  const hasErrors = errorList.length > 0;
  const errorText = formatValidationMessage(errorList[0] || "");
  const stateTree = options.stateTree || null;
  const templateMode = options.templateMode;
  // Validation copy must never become the field's placeholder/value. Errors
  // are still rendered below the control (and on the label/border).
  const placeholder = options.placeholder || "";
  const stringValue = typeof data === 'object' ? JSON.stringify(data) : data || "";

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 ${hasErrors ? "text-destructive" : ""}`}
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
          className={hasErrors ? "border-destructive focus:border-destructive" : ""}
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
            className={hasErrors ? "ring-1 ring-red-500 rounded" : ""}
        />
      )}
      {hasErrors && (
        <p className="text-xs text-destructive mt-1">{errorText}</p>
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
  errors: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};
