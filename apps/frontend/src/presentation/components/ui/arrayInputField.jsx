import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import PropTypes from "prop-types";

import { Button, Input } from "@jet-admin/ui";
const LocalEditableChip = ({ value, onChange, onDelete, type }) => {
  LocalEditableChip.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };
  return (
    <div className="w-fit">
      <div className="flex items-center justify-between rounded px-2 h-8 border border-gray-300 bg-white">
        <Input
          type={type}
          placeholder="Add value here"
          className="w-fit p-0 border-none bg-transparent focus:ring-0 outline-none hover:outline-none border-0 hover:border-0 text-slate-700 placeholder:text-slate-500 text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          onClick={onDelete}
          type="button"
          className="p-1 bg-transparent rounded-full outline-none hover:outline-none border-0 hover:border-0 ml-2 focus:outline-none focus:border-0"
        >
          <FaXmark className="text-sm text-slate-700" />
        </Button>
      </div>
    </div>
  );
};

const LocalInput = ({ handleAddValue, type }) => {
  LocalInput.propTypes = {
    handleAddValue: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };
  const [newValue, setNewValue] = useState(type === "number" ? 0 : "");

  return (
    <div className="w-fit">
      <div className="flex items-center justify-between rounded px-2 h-8 border border-gray-300 bg-gray-100">
        <Input
          type={type}
          placeholder="Add value here"
          className="w-fit p-0 border-none bg-transparent focus:ring-0 outline-none hover:outline-none border-0 hover:border-0 text-slate-700 placeholder:text-slate-500 text-xs"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <Button
          onClick={() => handleAddValue(newValue)}
          type="button"
          className="p-1 bg-transparent rounded-full outline-none hover:outline-none border-0 hover:border-0 ml-2 focus:outline-none focus:border-0"
        >
          <FaPlus className="text-xs text-slate-700" />
        </Button>
      </div>
    </div>
  );
};

export const ArrayInput = ({ value, onChange, type }) => {
  ArrayInput.propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };
  const handleDelete = (index) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleAddValue = (v) => {
    const newValue = type === "number" ? parseInt(v) : v;
    onChange([...value, newValue]);
  };

  const handleValueChange = (index, v) => {
    const newValues = [...value];
    newValues[index] = type === "number" ? parseInt(v) : v;
    onChange(newValues);
  };

  return (
    <div className="w-full flex flex-wrap gap-1">
      {value.map((v, index) => (
        <LocalEditableChip
          key={index}
          value={v}
          type={type}
          onChange={(val) => handleValueChange(index, val)}
          onDelete={() => handleDelete(index)}
        />
      ))}
      <LocalInput type={type} handleAddValue={handleAddValue} />
    </div>
  );
};
