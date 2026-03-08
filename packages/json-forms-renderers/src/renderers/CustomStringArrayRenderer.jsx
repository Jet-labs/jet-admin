// Custom String Array Renderer for arrays of simple strings
import React from 'react';
import PropTypes from 'prop-types';
import { MdDeleteOutline } from 'react-icons/md';
import { Button, Input } from '@jet-admin/ui';

export const CustomStringArrayRenderer = (props) => {
  const { data, path, handleChange, label, uischema, enabled, visible } = props;

  const arrayData = Array.isArray(data) ? data : [];

  const handleAddItem = () => {
    handleChange(path, [...arrayData, '']);
  };

  const handleRemoveItem = (index) => {
    const newData = arrayData.filter((_, i) => i !== index);
    handleChange(path, newData);
  };

  const handleItemChange = (index, value) => {
    const newData = [...arrayData];
    newData[index] = value;
    handleChange(path, newData);
  };

  if (visible === false) {
    return null;
  }

  return (
    <div className="p-3 border border-slate-200 rounded bg-white mb-3">
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label || uischema?.label || "Items"}
      </label>
      
      <div className="gap-2">
        {arrayData.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2 mb-2">
            <div className="flex-grow">
              <Input
                type="text"
                value={item || ''}
                onChange={(e) => handleItemChange(index, e.target.value)}
                disabled={!enabled}
                placeholder="Enter value..."
                className="w-full placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-200 text-slate-700 rounded focus:border-slate-400 focus:outline-none px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <Button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={!enabled}
              className="p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdDeleteOutline />
            </Button>
          </div>
        ))}
      </div>

      {arrayData.length === 0 && (
        <div className="text-xs text-slate-400 italic py-2">
          No items added yet.
        </div>
      )}

      <Button
        type="button"
        onClick={handleAddItem}
        disabled={!enabled}
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Item
      </Button>
    </div>
  );
};

CustomStringArrayRenderer.propTypes = {
  data: PropTypes.array,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  uischema: PropTypes.object,
  enabled: PropTypes.bool,
  visible: PropTypes.bool,
};
