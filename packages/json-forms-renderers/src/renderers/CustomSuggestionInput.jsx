// Custom Suggestion Input Renderer
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Label } from '@jet-admin/ui';

export const CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = useState(false);
  const hasErrors = errors && errors.length > 0;

  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-3">
      <Label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          hasErrors ? "text-red-500" : "text-muted-foreground"
        } flex justify-between items-center`}
      >
        <span>{label || description}</span>
        {suggestions && suggestions.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={!enabled}
          >
            Map +
          </Button>
        )}
      </Label>

      <Input
        type="text"
        id={path}
        name={path}
        disabled={!enabled}
        className={hasErrors ? "border-red-500 focus:border-red-500" : ""}
        placeholder={errors || placeholder || ""}
        onChange={(ev) => handleChange(path, ev.target.value)}
        value={data || ""}
      />

      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}

      {isOpen && suggestions && (
        <div className="absolute right-0 top-6 w-48 bg-brand-dark border border-border shadow-xl rounded-sm z-[50] max-h-40 overflow-y-auto">
          <div className="p-2 border-b border-border flex justify-between items-center bg-muted/50">
            <span className="text-[10px] font-semibold text-muted-foreground">Pick a node</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>×</Button>
          </div>
          {suggestions.length === 0 ? (
            <div className="px-2 py-1 text-[10px] text-muted-foreground italic">No suggestions</div>
          ) : (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-2 py-1.5 text-xs hover:bg-primary/5 cursor-pointer truncate text-foreground border-b border-border/50 last:border-0"
                onClick={() => handleSelect(item.value)}
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

CustomSuggestionInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};
