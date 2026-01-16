import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { FaPlay, FaTimes } from "react-icons/fa";

/**
 * Modal to prompt for workflow input parameters before test run.
 * Renders form fields based on the args schema defined in workflowOptions.
 */
export const WorkflowInputModal = ({ args, onSubmit, onClose }) => {
  // Initialize values based on args schema
  const initialValues = useMemo(() => {
    const values = {};
    args.forEach((arg) => {
      if (arg.key) {
        switch (arg.type) {
          case "number":
            values[arg.key] = "";
            break;
          case "boolean":
            values[arg.key] = false;
            break;
          case "object":
          case "array":
            values[arg.key] = "";
            break;
          default:
            values[arg.key] = "";
        }
      }
    });
    return values;
  }, [args]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((key, value, type) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    args.forEach((arg) => {
      if (arg.required && arg.key) {
        const value = values[arg.key];
        if (value === "" || value === undefined || value === null) {
          newErrors[arg.key] = "Required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [args, values]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse values based on type
    const parsedValues = {};
    args.forEach((arg) => {
      if (arg.key) {
        const value = values[arg.key];
        switch (arg.type) {
          case "number":
            parsedValues[arg.key] = value === "" ? null : Number(value);
            break;
          case "boolean":
            parsedValues[arg.key] = Boolean(value);
            break;
          case "object":
          case "array":
            try {
              parsedValues[arg.key] = value ? JSON.parse(value) : null;
            } catch {
              parsedValues[arg.key] = null;
            }
            break;
          default:
            parsedValues[arg.key] = value;
        }
      }
    });
    onSubmit(parsedValues);
  }, [args, values, validate, onSubmit]);

  const renderInput = (arg, index) => {
    const { key, type, required } = arg;
    if (!key) return null;

    const baseClass =
      "w-full px-2.5 py-1.5 text-sm bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#646cff] focus:border-[#646cff]";
    const errorClass = errors[key] ? "border-red-400" : "border-slate-300";

    switch (type) {
      case "boolean":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values[key] || false}
              onChange={(e) => handleChange(key, e.target.checked, type)}
              className="w-4 h-4 text-[#646cff] rounded border-slate-300 focus:ring-[#646cff]"
            />
            <span className="text-sm text-slate-600">True</span>
          </label>
        );
      case "number":
        return (
          <input
            type="number"
            value={values[key] || ""}
            onChange={(e) => handleChange(key, e.target.value, type)}
            placeholder="Enter number..."
            className={`${baseClass} ${errorClass}`}
          />
        );
      case "object":
      case "array":
        return (
          <textarea
            value={values[key] || ""}
            onChange={(e) => handleChange(key, e.target.value, type)}
            placeholder={type === "array" ? '["item1", "item2"]' : '{"key": "value"}'}
            rows={3}
            className={`${baseClass} ${errorClass} font-mono text-xs`}
          />
        );
      default:
        return (
          <input
            type="text"
            value={values[key] || ""}
            onChange={(e) => handleChange(key, e.target.value, type)}
            placeholder="Enter value..."
            className={`${baseClass} ${errorClass}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">
            Workflow Input Parameters
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form >
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {args.map((arg, index) =>
              arg.key ? (
                <div key={index} className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
                    {arg.key}
                    {arg.required && (
                      <span className="text-red-500">*</span>
                    )}
                    <span className="text-slate-400 font-normal">
                      ({arg.type || "string"})
                    </span>
                  </label>
                  {renderInput(arg, index)}
                  {errors[arg.key] && (
                    <p className="text-xs text-red-500">{errors[arg.key]}</p>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none"
            >
              <FaPlay className="w-3 h-3" />
              Run Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

WorkflowInputModal.propTypes = {
  args: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      type: PropTypes.string,
      required: PropTypes.bool,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
