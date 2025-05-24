// src/components/forms/customJSONFormRenderers.jsx
import React from "react";
import { JsonFormsDispatch, withJsonFormsControlProps, withJsonFormsLayoutProps } from "@jsonforms/react";
import PropTypes from "prop-types";
import { rankWith, Resolve, uiTypeIs } from "@jsonforms/core";

const CustomNumberInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    uischema,
    schema,
  } = props;

  const handleInputChange = (ev) => {
    const valueString = ev.target.value;
    if (valueString === "") {
      handleChange(path, undefined); // Clear the value
    } else {
      // Use schema.type to determine if it should be integer or float
      const numValue =
        schema.type === "integer"
          ? parseInt(valueString, 10)
          : parseFloat(valueString);

      if (!isNaN(numValue)) {
        handleChange(path, numValue);
      } else {
        // Optionally, handle NaN case, e.g., by not calling handleChange
        // or by calling it with undefined or the original data
        // For now, we only update if it's a valid number
      }
    }
  };

  const step =
    uischema.options?.step ||
    schema.multipleOf ||
    (schema.type === "integer" ? 1 : "any");

  return (
    <div className="mb-2">
      <label
        htmlFor={path}
        className="block mb-1 text-xs font-medium text-slate-500"
      >
        {label || description || schema.description}
      </label>
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs">{errors}</span>
      )}
      <input
        type="number"
        id={path}
        name={path}
        className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 py-1.5"
        placeholder={uischema?.options?.placeholder || ""}
        onChange={handleInputChange}
        value={data === undefined || data === null ? "" : data} // Handle undefined/null for controlled input
        min={schema.minimum}
        max={schema.maximum}
        step={step}
      />
    </div>
  );
};

// --- Custom Text Renderer (no changes needed here, still good) ---
const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema } =
    props;
  const isMulti = uischema?.options?.multi;

  return (
    <div className="mb-2 w-full">
      <label
        htmlFor={path}
        className="block mb-1 text-xs font-medium text-slate-500"
      >
        {label || description}
      </label>
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs">{errors}</span>
      )}
      {isMulti ? (
        <textarea
          id={path}
          name={path}
          className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 py-1.5"
          placeholder={uischema?.options?.placeholder || ""}
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
          rows={uischema?.options?.rows || 3}
        />
      ) : (
        <input
          type={uischema?.options?.format === "password" ? "password" : "text"}
          id={path}
          name={path}
          className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 py-1.5"
          placeholder={uischema?.options?.placeholder || ""}
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
        />
      )}
    </div>
  );
};


// --- Dynamic Custom Select Renderer ---
const CustomSelectInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    schema,
    uischema,
  } = props;
  const options = schema.enum; // Get enum values from schema

  // Function to determine the display name for an option
  const getDisplayName = (optionValue) => {
    // Check if the uischema explicitly provides an enum mapping
    if (uischema.options && uischema.options.enumLabels) {
      const labelMap = uischema.options.enumLabels.find(
        (item) => item.value === optionValue
      );
      if (labelMap) return labelMap.label;
    }

    // Default: use the optionValue itself if no specific label found
    return optionValue;
  };

  return (
    <div className="mb-2">
      <label
        htmlFor={path}
        className="block mb-1 text-xs font-medium text-slate-500"
      >
        {label || description}
      </label>
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs">{errors}</span>
      )}
      <select
        id={path}
        name={path}
        className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 py-1.5"
        onChange={(ev) => handleChange(path, ev.target.value)}
        value={data || ""}
      >
        {/* Optional: Add a default empty option if not required */}
        {schema.required && !schema.required.includes(path) && (
          <option value="">Select an option</option>
        )}
        {/* Or always add an empty option if a default is not set and user can choose not to pick */}
        {!data && <option value="">Select an option</option>}

        {options.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {getDisplayName(optionValue)}
          </option>
        ))}
      </select>
    </div>
  );
};
const CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers } = props;
  const elements = uischema.elements;

  const customClass = uischema.options?.customClass || "";

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`custom-group-container border p-3 mb-2 mt-1 rounded ${customClass}`}
    >
      {uischema.label && (
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          {uischema.label}
        </h2>
      )}
      <div className="custom-group-content">
        {elements.map((element, index) => (
          <JsonFormsDispatch
            key={index}
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
          />
        ))}
      </div>
    </div>
  );
};

export const MyCustomNumberInput = withJsonFormsControlProps(CustomNumberInput);
export const MyCustomTextInput = withJsonFormsControlProps(CustomTextInput);
export const MyCustomSelectInput = withJsonFormsControlProps(CustomSelectInput);
export const MyCustomGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);

CustomNumberInput.propTypes = {
  data: PropTypes.number,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.string, // Corrected
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired, // `schema` (sub-schema) is provided by withJsonFormsControlProps
};

CustomTextInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
};

CustomSelectInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
};

CustomGroupLayout.propTypes = {
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
// --- MODIFIED TESTER FUNCTIONS ---
// eslint-disable-next-line no-unused-vars
const customNumberInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!currentSchema) {
      return -1;
    }

    // Target 'number' or 'integer' types, but not if it has an enum (could be a select)
    if (
      (currentSchema.type === "number" || currentSchema.type === "integer") &&
      !currentSchema.enum // Don't use for enums, those might be better as selects
    ) {
      return 10; // High priority
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in customNumberInputTester:`, e);
    return -1;
  }
  return -1;
};

// eslint-disable-next-line no-unused-vars
const customTextInputTester = (uischema, rootSchema, context) => {
  // Check if the uischema is a Control
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    // Resolve the specific schema for the control's scope
    const currentSchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );

    if (!currentSchema) {
      // console.warn('Could not resolve schema for', uischema.scope);
      return -1;
    }

    // Now use currentSchema for type checks
    if (
      // Condition for datasourceDescription (if it were part of this JSONForm schema)
      // (uischema.scope === "#/properties/datasourceDescription" && currentSchema.type === "string") ||

      // Condition for password fields
      (currentSchema.format === "password" &&
        uischema.options?.format === "password") ||
      // Condition for any general string control that is NOT an enum
      (currentSchema.type === "string" && !currentSchema.enum)
    ) {
      return 10; // High priority
    }
  } catch (e) {
    console.warn(
      `Error resolving schema for scope ${uischema.scope} in customTextInputTester:`,
      e
    );
    return -1;
  }
  return -1;
};

// eslint-disable-next-line no-unused-vars
const customSelectInputTester = (uischema, rootSchema, context) => {
  // Check if the uischema is a Control
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    // Resolve the specific schema for the control's scope
    const currentSchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );

    if (!currentSchema) {
      // console.warn('Could not resolve schema for', uischema.scope);
      return -1;
    }

    // Now use currentSchema for type checks
    // Use this renderer for any string field that has an `enum` property in its schema
    if (currentSchema.type === "string" && currentSchema.enum) {
      return 10; // High priority for enum selects
    }
  } catch (e) {
    console.warn(
      `Error resolving schema for scope ${uischema.scope} in customSelectInputTester:`,
      e
    );
    return -1;
  }
  return -1;
};

const customGroupLayoutTester = (uischema) => {
  // Use uiTypeIs helper for common UI Schema element types
  return rankWith(10, uiTypeIs("Group"))(uischema);
};

export const customJSONFormRenderers = [
  {
    tester: customNumberInputTester,
    renderer: MyCustomNumberInput,
  },
  {
    tester: customTextInputTester,
    renderer: MyCustomTextInput,
  },
  {
    tester: customSelectInputTester,
    renderer: MyCustomSelectInput,
  },
  {
    tester: customGroupLayoutTester,
    renderer: MyCustomGroupLayout,
  },
];
