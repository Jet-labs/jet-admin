import React, { useState } from "react";
import { Input } from "@jet-admin/ui";

const TemplateAutocompleteInput = ({ value, onChange, placeholder, suggestions = [] }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (val) => {
    onChange(val);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value || s.value.toLowerCase().includes(value.toLowerCase()) || value === "{{"
  );

  return (
    <div className="relative flex flex-col gap-1">
      <Input
        type="text"
        className="text-xs font-mono h-8 w-full"
        value={value || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50">
          {filteredSuggestions.map((s, i) => (
            <div
              key={i}
              className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer flex justify-between items-center"
              onClick={() => handleSelect(s.value)}
            >
              <span className="font-mono text-foreground">{s.label}</span>
              {s.detail && (
                <span className="text-[10px] text-muted-foreground">{s.detail}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateAutocompleteInput;
