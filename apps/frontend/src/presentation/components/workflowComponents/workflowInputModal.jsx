import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { FaPlay, FaTimes } from "react-icons/fa";

import { Button, Checkbox, Textarea, Input } from "@jet-admin/ui";
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
      "w-full px-2.5 py-1.5 text-sm bg-white border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";
    const errorClass = errors[key] ? "border-red-400" : "border-slate-300";

    switch (type) {
      case "boolean":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={values[key] || false}
              onCheckedChange={(checked) => handleChange(key, checked, type)}
            />
            <span className="text-sm text-slate-600">True</span>
          </label>
        );
      case "number":
        return (
          <Input
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
          <Textarea
            value={values[key] || ""}
            onChange={(e) => handleChange(key, e.target.value, type)}
            placeholder={type === "array" ? '["item1", "item2"]' : '{"key": "value"}'}
            rows={3}
            className={`${baseClass} ${errorClass} font-mono text-xs`}
          />
        );
      default:
        return (
          <Input
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <FaTimes className="w-4 h-4" />
          </Button>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type='button'
              size="sm"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FaPlay className="w-3 h-3 mr-1.5" />
              Run Workflow
            </Button>
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
