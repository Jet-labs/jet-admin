// src/components/forms/customJSONFormRenderers.jsx

import {
  rankWith,
  Resolve,
  uiTypeIs,
  // Make sure to import all necessary tester functions you use in 'and'
} from "@jsonforms/core";
import {
  JsonFormsDispatch,
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from "@jsonforms/react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";

// (Your CustomNumberInput, CustomTextInput, CustomSelectInput, CustomGroupLayout remain the same)
// ... (paste them here from your provided code) ...

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

const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema } =
    props;
  const isMulti = uischema?.options?.multi;

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
        <h2 className="!text-sm font-semibold text-slate-800 mb-2">
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

const CustomKeyValueArrayRenderer = ({
  data,
  path, // This 'path' is the absolute path to the array itself (e.g., 'root.headers')
  handleChange,
  schema, // This schema is for the array itself
  uischema,
  errors,
  label,
  enabled,
  renderers,
}) => {
  const items = data || [];

  // Determine the schema for an individual item based on the array schema
  const itemSchema = schema.items;

  const handleAddItem = () => {
    const newItem = itemSchema.properties
      ? Object.fromEntries(
          Object.entries(itemSchema.properties).map(([key, propSchema]) => [
            key,
            propSchema.default !== undefined ? propSchema.default : "",
          ])
        )
      : { key: "", value: "" };

    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-slate-200 rounded bg-white shadow-sm">
      <label className="block mb-2 text-sm font-medium text-slate-700">
        {label || uischema.label || "Items"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2">
            {/* Render 'key' field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                // For nested fields, the 'path' prop should be the *absolute path* to the data.
                // The 'scope' in the uischema *could* be relative to the *root* schema,
                // but passing the correct 'path' to the data is usually more robust.
                // Here, we directly refer to the 'key' property of the item at the specific index.
                uischema={{
                  type: "Control",
                  // The scope here refers to the path *within the item's schema itself*
                  // NOT relative to the root schema.
                  scope: "#/properties/key",
                  label: "Key",
                  options: uischema.options?.keyOptions,
                }}
                // Pass the schema for the *entire data object* (rootSchema) if you construct absolute paths.
                // However, since we are setting `path` explicitly, `schema` here can be `itemSchema`
                // and JsonForms will resolve relative to that.
                schema={itemSchema} // The schema for the individual item object ({key, value})
                path={`${path}.${index}.key`} // ABSOLUTE PATH TO THE 'KEY' DATA
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Render 'value' field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/value",
                  label: "Value",
                  options: uischema.options?.valueOptions,
                }}
                schema={itemSchema} // The schema for the individual item object ({key, value})
                path={`${path}.${index}.value`} // ABSOLUTE PATH TO THE 'VALUE' DATA
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="mt-3 p-2 rounded bg-red-100 text-red-400  focus:outline-none hover:border-red-400"
              aria-label="Remove item"
            >
              <MdDeleteOutline />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border-slate-200"
      >
        Add Item
      </button>
    </div>
  );
};

const CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements;

  const [activeTab, setActiveTab] = useState(0);

  if (!categories || categories.length === 0) {
    return null;
  }

  const activeCategory = categories[activeTab];

  return (
    <div className="custom-tabs-container mb-4">
      {/* Tab Headers */}
      <div className="flex border-slate-300">
        {categories.map((category, index) => (
          <button
            key={category.label || `tab-${index}`}
            className={`px-4 mr-2 py-2 text-sm font-medium rounded  ${
              index === activeTab
                ? "text-[#646cff] border-slate-200"
                : "text-slate-700"
            } focus:outline-none bg-white`}
            onClick={() => setActiveTab(index)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 border mt-3 border-slate-200 rounded bg-white">
        {activeCategory?.elements.map((element, i) => (
          <JsonFormsDispatch
            key={i}
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        ))}
      </div>
    </div>
  );
};

// Prop types for CustomTabRenderer

// HOC wrapper for the tab renderer

// --- NEW customTabRendererTester ---
// This tester checks if the uischema is of type "Categorization"
// and optionally if it has a specific option to trigger this custom renderer.

export const MyCustomNumberInput = withJsonFormsControlProps(CustomNumberInput);
export const MyCustomTextInput = withJsonFormsControlProps(CustomTextInput);
export const MyCustomSelectInput = withJsonFormsControlProps(CustomSelectInput);
export const MyCustomGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
export const MyCustomKeyValueArrayControl = withJsonFormsControlProps(
  CustomKeyValueArrayRenderer
);
export const MyCustomTabRenderer = withJsonFormsLayoutProps(CustomTabRenderer);

// PropTypes (slightly adjusted for errors prop being array of strings)
CustomNumberInput.propTypes = {
  data: PropTypes.number,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string), // Corrected to arrayOf(string)
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
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

CustomKeyValueArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object), // data is an array of objects ({key, value})
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired, // Schema for the array itself
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  description: PropTypes.string, // Not usually passed to array renderers, but fine if it is.
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool, // Enabled can be optional as it might come from context
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired, // Must pass renderers down
};

CustomTabRenderer.propTypes = {
  uischema: PropTypes.shape({
    type: PropTypes.string.isRequired,
    elements: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  schema: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
  cells: PropTypes.arrayOf(PropTypes.object), // <--- Add this propType
};
// --- TESTER FUNCTIONS (UNCHANGED, AS THEY SHOULD BE CORRECTED) ---

// eslint-disable-next-line no-unused-vars
const customNumberInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );
    if (!currentSchema) {
      return -1;
    }

    if (
      (currentSchema.type === "number" || currentSchema.type === "integer") &&
      !currentSchema.enum
    ) {
      return 10;
    }
  } catch (e) {
    console.warn(
      `Error resolving schema for scope ${uischema.scope} in customNumberInputTester:`,
      e
    );
    return -1;
  }
  return -1;
};

// eslint-disable-next-line no-unused-vars
const customTextInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );

    if (!currentSchema) {
      // console.warn('Could not resolve schema for', uischema.scope);
      return -1;
    }

    if (
      (currentSchema.format === "password" &&
        uischema.options?.format === "password") ||
      (currentSchema.type === "string" && !currentSchema.enum)
    ) {
      // Significantly increased rank for text inputs too
      return 50; // <--- Changed from 10 to 50
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
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );

    if (!currentSchema) {
      return -1;
    }

    if (currentSchema.type === "string" && currentSchema.enum) {
      return 10;
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
  return rankWith(10, uiTypeIs("Group"))(uischema);
};

const customKeyValueArrayRendererTester = (uischema, rootSchema, context) => {
  console.log("--- Testing customKeyValueArrayRendererTester ---");
  console.log("uischema:", uischema);
  console.log("context.path:", context.path); // Keep this log!

  // 1. Must be a Control in the UI Schema
  if (uischema.type !== "Control") {
    console.log("Not a Control UI element. Returning -1.");
    return -1;
  }

  try {
    // 2. Resolve the schema for the current scope (the array itself)
    const currentArraySchema = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );

    console.log("Resolved currentArraySchema:", currentArraySchema);

    if (!currentArraySchema) {
      console.log("Could not resolve array schema. Returning -1.");
      return -1;
    }

    // 3. Check if the resolved schema is an array
    if (currentArraySchema.type !== "array") {
      console.log("Schema is not an array. Returning -1.");
      return -1;
    }

    // 4. Check the schema of the items within the array
    const itemSchema = currentArraySchema.items;
    console.log("Resolved itemSchema:", itemSchema);

    if (
      !itemSchema ||
      typeof itemSchema !== "object" ||
      Array.isArray(itemSchema)
    ) {
      console.log("Items are not an object schema. Returning -1.");
      return -1;
    }

    // 5. Check if 'key' and 'value' properties exist and are strings within the item schema
    const hasKeyProp = itemSchema.properties?.key?.type === "string";
    const hasValueProp = itemSchema.properties?.value?.type === "string";

    console.log("hasKeyProp:", hasKeyProp, "hasValueProp:", hasValueProp);

    if (!hasKeyProp || !hasValueProp) {
      console.log(
        "Item schema does not have string 'key' and 'value' properties. Returning -1."
      );
      return -1;
    }

    // --- MODIFIED LOGIC FOR TARGET SCOPE CHECK ---
    // If context.path is undefined, we can't use it directly.
    // Instead, rely on the uischema.scope which should always be present for a Control.
    const scopeString = uischema.scope; // e.g., '#/properties/headers'
    let isTargetScope = false;

    if (scopeString) {
      // Extract the last part of the scope, e.g., 'headers' from '#/properties/headers'
      const scopeSegments = scopeString.split("/");
      const lastScopeSegment = scopeSegments[scopeSegments.length - 1];
      isTargetScope =
        lastScopeSegment === "headers" || lastScopeSegment === "queryParams";
    }

    console.log(
      "uischema.scope:",
      uischema.scope,
      "Is target scope (headers/queryParams):",
      isTargetScope
    );

    if (!isTargetScope) {
      console.log(
        "uischema.scope does not point to 'headers' or 'queryParams'. Returning -1."
      );
      return -1;
    }

    // If all conditions pass, return a high rank
    console.log("All conditions met! Returning rank 50.");
    return 50;
  } catch (e) {
    console.warn(
      `Error resolving schema for scope ${uischema.scope} in customKeyValueArrayRendererTester:`,
      e
    );
    return -1;
  }
};

const customTabRendererTester = (uischema) => {
  // Check if it's a Categorization UI schema type
  if (uischema.type === "Categorization") {
    // You can add more specific checks here if needed,
    // e.g., uischema.options?.variant === 'customTabs'
    // For now, let's make it pick up all Categorization UIs.
    // Return a high rank to ensure it overrides default Categorization renderers.
    return 50; // Increased rank
  }
  return -1;
};

export const customJSONFormRenderers = [
  {
    tester: customTabRendererTester, // Keep this high and early
    renderer: MyCustomTabRenderer,
  },
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
  {
    tester: customKeyValueArrayRendererTester,
    renderer: MyCustomKeyValueArrayControl,
  },
];
