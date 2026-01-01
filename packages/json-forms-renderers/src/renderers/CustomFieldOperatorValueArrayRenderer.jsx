// Custom Field-Operator-Value Array Renderer (for Firestore where conditions)
import React from 'react';
import PropTypes from 'prop-types';
import { MdDeleteOutline } from 'react-icons/md';

export const CustomFieldOperatorValueArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const isDisabled = enabled === false;

  // Get operator options from schema
  const operatorOptions = itemSchema?.properties?.operator?.enum || [
    "==", "!=", "<", "<=", ">", ">=", "array-contains", "array-contains-any", "in", "not-in"
  ];

  const handleAddItem = () => {
    const newItem = { field: "", operator: "==", value: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-slate-200 rounded bg-white mb-3">
      <label className="block mb-2 text-sm font-medium text-slate-700">
        {label || uischema.label || "Conditions"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center gap-2">
            {/* Field */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Field"
                value={item.field || ""}
                disabled={isDisabled}
                onChange={(e) => handleItemChange(index, "field", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 placeholder:text-slate-400 focus:border-slate-700 disabled:opacity-50"
              />
            </div>
            {/* Operator */}
            <div className="w-36">
              <select
                value={item.operator || "=="}
                disabled={isDisabled}
                onChange={(e) => handleItemChange(index, "operator", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 focus:border-slate-700 disabled:opacity-50"
              >
                {operatorOptions.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            {/* Value */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Value"
                value={item.value || ""}
                disabled={isDisabled}
                onChange={(e) => handleItemChange(index, "value", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 placeholder:text-slate-400 focus:border-slate-700 disabled:opacity-50"
              />
            </div>
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={isDisabled}
              className="p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:bg-red-200 disabled:opacity-50"
            >
              <MdDeleteOutline />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        disabled={isDisabled}
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200 disabled:opacity-50"
      >
        Add Condition
      </button>
    </div>
  );
};

CustomFieldOperatorValueArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
};
