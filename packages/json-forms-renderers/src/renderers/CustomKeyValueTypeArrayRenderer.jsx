// Custom Key-Value-Type Array Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';
import { MdDeleteOutline } from 'react-icons/md';

export const CustomKeyValueTypeArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
  renderers,
}) => {
  const items = data || [];
  const itemSchema = schema.items;

  const handleAddItem = () => {
    const newItem = itemSchema.properties
      ? Object.fromEntries(
          Object.entries(itemSchema.properties).map(([key, propSchema]) => [
            key,
            propSchema.default !== undefined ? propSchema.default : "",
          ])
        )
      : { key: "", value: "", type: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-slate-200 rounded bg-white mb-3">
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label || uischema.label || "Items"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="gap-2">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2">
            {/* Key Field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/key",
                  label: "Key",
                  options: uischema.options?.keyOptions,
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Value Type */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/type",
                  label: "Value Type",
                  options: uischema.options?.typeOptions,
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Value Field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/value",
                  label: "Value",
                  options: uischema.options?.valueOptions,
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="mt-5 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
            >
              <MdDeleteOutline />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200"
      >
        Add Item
      </button>
    </div>
  );
};

CustomKeyValueTypeArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
