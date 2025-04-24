import moment from "moment";
import { FaChevronDown } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { ArrayInputField } from "./arrayInputField";
import { CodeEditorField } from "./codeEditorField";
import PropTypes from "prop-types";
import React from "react";

const InputWrapper = ({ label, customLabel, children, error, required }) => {
  InputWrapper.propTypes = {
    label: PropTypes.string,
    customLabel: PropTypes.string,
    children: PropTypes.node.isRequired,
    error: PropTypes.string,
    required: PropTypes.bool,
  };
  return (
    <div className="w-full flex flex-col space-y-1">
      {customLabel || (
        <label className="text-sm font-medium text-gray-600">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export const MultipleTypeInputField = ({
  type,
  isList,
  onChange,
  onBlur,
  value,
  error,
  name,
  required,
  readOnly,
  customMapping,
  selectOptions,
  setFieldValue,
  showDefault,
  language,
  customLabel,
}) => {
  MultipleTypeInputField.propTypes = {
    type: PropTypes.string.isRequired,
    isList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired,
    error: PropTypes.string,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    customMapping: PropTypes.object,
    selectOptions: PropTypes.array,
    setFieldValue: PropTypes.func.isRequired,
    showDefault: PropTypes.bool,
    language: PropTypes.string,
    customLabel: PropTypes.string,
  };

  const label = name?.toLowerCase() || "";
  const convertedType =
    CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]?.normalizedType ||
    CONSTANTS.DATA_TYPES.JSON;

  console.log("convertedType", type, convertedType);

  const handleChange = (e) => {
    const { value } = e.target;
    onChange({ target: { name, value } });
  };

  const renderSelect = (options, multiple = false) => (
    <div className="relative w-full">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={readOnly}
        multiple={multiple}
        className={`w-full p-2 pr-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      >
        {options?.map((option) => {
          const optionValue = option.value ?? option;
          const optionLabel = option.label ?? optionValue;
          return (
            <option
              key={optionValue}
              value={optionValue}
              className="px-2 py-1 hover:bg-blue-50"
            >
              {optionLabel}
            </option>
          );
        })}
      </select>
      {!multiple && (
        <FaChevronDown className="h-4 w-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
      )}
    </div>
  );

  switch (convertedType) {
    case CONSTANTS.DATA_TYPES.STRING:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <input
            type="text"
            name={name}
            value={value ?? ""}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={readOnly}
            className={`p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.COLOR:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <input
            type="color"
            name={name}
            value={value ?? "#ffffff"}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={readOnly}
            className="w-full h-10 cursor-pointer disabled:cursor-not-allowed"
          />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.CODE:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <CodeEditorField
            value={value}
            onChange={(val) => setFieldValue(name, val)}
            language={language}
            disabled={readOnly}
          />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.SINGLE_SELECT:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          {renderSelect(selectOptions)}
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.MULTIPLE_SELECT:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          {renderSelect(selectOptions, true)}
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.BOOLEAN:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <select
            name={name}
            value={!!value}
            onChange={(e) => setFieldValue(name, e.target.value === "true")}
            onBlur={onBlur}
            disabled={readOnly}
            className={`p-2 pr-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          >
            <option value={true}>True</option>
            <option value={false}>False</option>
          </select>
          <FaChevronDown className="h-4 w-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.DATETIME:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <input
            type="datetime-local"
            name={name}
            value={moment(value).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) =>
              setFieldValue(name, new Date(e.target.value).toISOString())
            }
            disabled={readOnly}
            className={`p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.JSON:
      return (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <CodeEditorField
            value={JSON.stringify(value, null, 2)}
            onChange={(val) => setFieldValue(name, JSON.parse(val))}
            language="json"
            disabled={readOnly}
          />
        </InputWrapper>
      );

    case CONSTANTS.DATA_TYPES.INT:
    case CONSTANTS.DATA_TYPES.FLOAT:
    case CONSTANTS.DATA_TYPES.DECIMAL:
      if (isList) {
        return (
          <InputWrapper {...{ label, customLabel, error, required }}>
            <ArrayInputField
              value={value ?? []}
              onChange={(val) => setFieldValue(name, val)}
              type="number"
              disabled={readOnly}
            />
          </InputWrapper>
        );
      }
      return customMapping ? (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <div className="relative w-full">
            <select
              name={name}
              value={value ?? ""}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={readOnly}
              className={`p-2 pr-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            >
              {Object.entries(customMapping).map(([key, val]) => (
                <option key={key} value={key}>
                  {val}
                </option>
              ))}
            </select>
            <FaChevronDown className="h-4 w-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
          </div>
        </InputWrapper>
      ) : (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <input
            type="number"
            name={name}
            value={value ?? ""}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={readOnly}
            step={convertedType === CONSTANTS.DATA_TYPES.INT ? "1" : "any"}
            className={`p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
        </InputWrapper>
      );

    default:
      return showDefault ? (
        <InputWrapper {...{ label, customLabel, error, required }}>
          <CodeEditorField
            value={JSON.stringify(value, null, 2)}
            onChange={(val) => setFieldValue(name, JSON.parse(val))}
            language="json"
            disabled={readOnly}
          />
        </InputWrapper>
      ) : null;
  }
};
