// src/components/forms/customJSONFormRenderers.jsx

import {
  and,
  formatIs,
  isControl,
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import Editor from "@monaco-editor/react";
import GithubTheme from "monaco-themes/themes/GitHub Light.json";

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
    <div className="">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs">{errors}</span>
      )}
      <input
        type="number"
        id={path}
        name={path}
        className={`placeholder:text-slate-400 text-sm bg-slate-50 border  focus:border-slate-700 ${
          errors && errors.length > 0
            ? "border-red-500 focus:border-red-500"
            : "border-slate-200"
        } text-slate-700 rounded  block w-full px-2.5 py-1.5`}
        placeholder={
          errors && errors.length > 0
            ? errors
            : uischema?.options?.placeholder || ""
        }
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
    <div className="">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      {isMulti ? (
        <textarea
          id={path}
          name={path}
          className={`placeholder:text-slate-400 text-sm bg-slate-50 border  focus:border-slate-700 ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200"
          } text-slate-700 rounded  block w-full px-2.5 py-1.5`}
          placeholder={
            errors && errors.length > 0
              ? errors
              : uischema?.options?.placeholder || ""
          }
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
          rows={uischema?.options?.rows || 3}
        />
      ) : (
        <input
          type={uischema?.options?.format === "password" ? "password" : "text"}
          id={path}
          name={path}
          className={`placeholder:text-slate-400 text-sm bg-slate-50 border  focus:border-slate-700 ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200"
          } text-slate-700 rounded  block w-full px-2.5 py-1.5`}
          placeholder={
            errors && errors.length > 0
              ? errors
              : uischema?.options?.placeholder || ""
          }
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
    <div className="">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      <select
        id={path}
        name={path}
        className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
          errors && errors.length > 0
            ? "border-red-500 focus:border-red-500"
            : "border-slate-200"
        } text-slate-700 rounded  block w-full px-2.5 py-1.5`}
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

const CustomCodePgsqlControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema,
}) => {
  const { databaseMetadata } = uischema.options || {};
  // build schema for autocompletion
  const tablesMap = useMemo(() => {
    if (!databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] =
          t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata]);

  const schemaRef = useRef(tablesMap);
  useEffect(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);

  const handleEditorWillMount = (monaco) => {
    monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [".", " "],
      provideCompletionItems: (model, pos) => {
        const text = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: pos.lineNumber,
          endColumn: pos.column,
        });
        const wordInfo = model.getWordUntilPosition(pos);
        const range = {
          startLineNumber: pos.lineNumber,
          endLineNumber: pos.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };
        const suggestions = [];
        const tableMatch = text.match(/(\b\w+)\.$/);
        if (tableMatch) {
          const cols = schemaRef.current[tableMatch[1]] || [];
          cols.forEach((col) =>
            suggestions.push({
              label: col,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col,
              detail: `Column of ${tableMatch[1]}`,
              range,
            })
          );
        } else {
          Object.keys(schemaRef.current).forEach((tbl) =>
            suggestions.push({
              label: tbl,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: tbl,
              detail: "Table",
              range,
            })
          );
          const sqlKeywords = [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "INNER JOIN",
            "ON",
            "GROUP BY",
            "ORDER BY",
            "ASC",
            "DESC",
            "AS",
            "DISTINCT",
            "LIMIT",
            "OFFSET",
            "INSERT INTO",
            "VALUES",
            "UPDATE",
            "SET",
            "DELETE",
            "CREATE TABLE",
            "ALTER TABLE",
            "DROP TABLE",
            "INDEX",
            "COUNT",
            "SUM",
            "AVG",
            "MAX",
            "MIN",
            "AND",
            "OR",
            "NOT",
            "NULL",
            "IS",
            // Add more keywords as needed
          ];
          sqlKeywords.forEach((kw) =>
            suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range,
            })
          );
        }
        return { suggestions };
      },
    });
    monaco.editor.defineTheme("github-light", GithubTheme);
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      <div className="border border-slate-200 rounded p-1">
        <Editor
          height={uischema.options?.height || "200px"}
          defaultLanguage="sql"
          value={data || ""}
          onChange={(val) => handleChange(path, val || "")}
          beforeMount={handleEditorWillMount}
          options={{
            readOnly: !enabled,
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: "on",
          }}
          theme="github-light"
        />
      </div>
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
      className={`custom-group-container border p-3 mt-3 rounded ${customClass}`}
    >
      {uischema.label && (
        <h2 className="!text-sm font-semibold text-slate-800 mb-2">
          {uischema.label}
        </h2>
      )}
      <div className="custom-group-content flex flex-col gap-2">
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
      : { key: "", value: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-slate-200 rounded bg-white">
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label || uischema.label || "Items"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="">
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
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
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
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
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
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border-slate-200"
      >
        Add Item
      </button>
    </div>
  );
};

const CustomKeyValueTypeArrayRenderer = ({
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
      : { key: "", value: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-slate-200 rounded bg-white">
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label || uischema.label || "Items"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="">
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
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Vlaue type */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/type",
                  label: "Value Type",
                  options: uischema.options?.typeOptions,
                }}
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
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
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
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
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border-slate-200"
      >
        Add Item
      </button>
    </div>
  );
};

const CustomKeyTypeArrayRenderer = ({
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
      : { key: "", value: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border mt-3 border-slate-200 rounded bg-white">
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label || uischema.label || "Items"}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="">
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
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Vlaue type */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/type",
                  label: "Value Type",
                  options: uischema.options?.typeOptions,
                }}
                schema={itemSchema} // Pass the entire item schema
                path={`${path}.${index}`} // Path to the item object
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
        className="mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border-slate-200"
      >
        Add Item
      </button>
    </div>
  );
};

const CustomCheckboxInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    enabled,
    uischema,
  } = props;

  const onToggle = (ev) => {
    handleChange(path, ev.target.checked);
  };

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={path}
        name={path}
        checked={!!data}
        disabled={!enabled}
        onChange={onToggle}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <label htmlFor={path} className="ml-2 text-sm font-medium text-slate-700">
        {label || description || uischema.label}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mt-1">{errors}</p>
      )}
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
    <div className="custom-tabs-container">
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
      <div className="p-3 border mt-3 border-slate-200 rounded bg-white flex flex-col gap-2">
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
export const MyCustomCodePgsqlControl = withJsonFormsControlProps(
  CustomCodePgsqlControl
);
export const MyCustomGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
export const MyCustomKeyValueArrayControl = withJsonFormsControlProps(
  CustomKeyValueArrayRenderer
);
export const MyCustomKeyValueTypeArrayControl = withJsonFormsControlProps(
  CustomKeyValueTypeArrayRenderer
);
export const MyCustomKeyTypeArrayControl = withJsonFormsControlProps(
  CustomKeyTypeArrayRenderer
);
export const MyCustomTabRenderer = withJsonFormsLayoutProps(CustomTabRenderer);

export const MyCustomCheckboxInput =
  withJsonFormsControlProps(CustomCheckboxInput);

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

CustomCodePgsqlControl.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
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

CustomKeyValueTypeArrayRenderer.propTypes = {
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

CustomKeyTypeArrayRenderer.propTypes = {
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

CustomCheckboxInput.propTypes = {
  data: PropTypes.bool,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object.isRequired,
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

const customCodePgsqlTester = rankWith(
  100,
  and(isControl, formatIs("code-pgsql"))
);

const customGroupLayoutTester = (uischema) => {
  return rankWith(10, uiTypeIs("Group"))(uischema);
};

const customKeyValueArrayRendererTester = (uischema, rootSchema) => {
  // 1) Must be a Control
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    // 2) Resolve the schema at this control’s scope
    const schemaAtScope = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );
    // 3) It must be an array
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    // 4) Items must be objects with string key/value props
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.value?.type !== "string"
    ) {
      return -1;
    }
    // If we get here, it’s a key/value array—give a high rank so our renderer wins
    return 50; // e.g. return 50
  } catch (e) {
    console.warn("Error in key/value tester:", e);
    return -1;
  }
};

const customKeyValueTypeArrayRendererTester = (uischema, rootSchema) => {
  // 1) Must be a Control
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    // 2) Resolve the schema at this control’s scope
    const schemaAtScope = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );
    // 3) It must be an array
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    // 4) Items must be objects with string key/value props
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.value?.type !== "string" ||
      itemSchema.properties?.type?.type !== "string"
    ) {
      return -1;
    }
    // If we get here, it’s a key/value array—give a high rank so our renderer wins
    return 60; // e.g. return 60
  } catch (e) {
    console.warn("Error in key/value tester:", e);
    return -1;
  }
};

const customKeyTypeArrayRendererTester = (uischema, rootSchema) => {
  // 1) Must be a Control
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    // 2) Resolve the schema at this control’s scope
    const schemaAtScope = Resolve.schema(
      rootSchema,
      uischema.scope,
      rootSchema
    );
    // 3) It must be an array
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    // 4) Items must be objects with string key/type props
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.type?.type !== "string" ||
      itemSchema.properties?.value?.type
    ) {
      return -1;
    }
    // If we get here, it’s a key/value array—give a high rank so our renderer wins
    return 60; // e.g. return 60
  } catch (e) {
    console.warn("Error in key/value tester:", e);
    return -1;
  }
};

const customCheckboxTester = (uischema, schema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const current = Resolve.schema(schema, uischema.scope, schema);
    if (current && current.type === "boolean") {
      return 10; // adjust rank as needed
    }
  } catch (e) {
    console.warn(e);
    return -1;
  }
  return -1;
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
    tester: customCodePgsqlTester,
    renderer: MyCustomCodePgsqlControl,
  },
  {
    tester: customCheckboxTester,
    renderer: MyCustomCheckboxInput,
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
  {
    tester: customKeyValueTypeArrayRendererTester,
    renderer: MyCustomKeyValueTypeArrayControl,
  },
  {
    tester: customKeyTypeArrayRendererTester,
    renderer: MyCustomKeyTypeArrayControl,
  },
];
