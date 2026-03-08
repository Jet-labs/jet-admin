// Custom Suggestion Input Renderer
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '@jet-admin/ui';

export const CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-3">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        } flex justify-between items-center`}
      >
        <span>{label || description} {errors && errors.length > 0 && errors}</span>
        {suggestions && suggestions.length > 0 && (
          <Button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={!enabled}
            className="text-[10px] bg-slate-100 text-purple-600 px-1.5 py-0.5 rounded border border-transparent hover:border-purple-200"
          >
            Map +
          </Button>
        )}
      </label>

      <Input
        type="text"
        id={path}
        name={path}
        disabled={!enabled}
        className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
          errors && errors.length > 0
            ? "border-red-500 focus:border-red-500"
            : "border-slate-200"
        } text-slate-700 rounded block w-full px-2.5 py-1.5`}
        placeholder={errors || placeholder || ""}
        onChange={(ev) => handleChange(path, ev.target.value)}
        value={data || ""}
      />

      {isOpen && suggestions && (
        <div className="absolute right-0 top-6 w-48 bg-white border border-slate-200 shadow-xl rounded z-[50] max-h-40 overflow-y-auto">
          <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="text-[10px] font-semibold text-slate-500">Pick a node</span>
            <Button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">×</Button>
          </div>
          {suggestions.length === 0 ? (
            <div className="px-2 py-1 text-[10px] text-slate-400 italic">No suggestions</div>
          ) : (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-2 py-1.5 text-xs hover:bg-purple-50 cursor-pointer truncate text-slate-700 border-b border-slate-50 last:border-0"
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
