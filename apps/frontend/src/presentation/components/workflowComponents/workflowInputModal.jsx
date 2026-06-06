import React, { useState, useMemo, useCallback } from "react";
import { Play, X } from 'lucide-react';
import PropTypes from "prop-types";
import { Button, InputValuesForm } from "@jet-admin/ui";
/**
 * Modal to prompt for workflow input parameters before test run.
 * Renders form fields based on the inputDefinitions schema defined in workflowOptions.
 * Uses the shared InputValuesForm component from @jet-admin/ui.
 */
export const WorkflowInputModal = ({ inputDefinitions, onSubmit, onClose }) => {
  // Initialize values based on inputDefinitions schema, using defaultValue when available
  const initialValues = useMemo(() => {
    const values = {};
    inputDefinitions.forEach((inputDef) => {
      if (inputDef.key) {
        // Use defaultValue if defined, otherwise fall back to type-appropriate empty value
        if (inputDef.defaultValue !== undefined && inputDef.defaultValue !== null) {
          values[inputDef.key] = inputDef.defaultValue;
        } else {
          switch (inputDef.type) {
            case "number":
              values[inputDef.key] = "";
              break;
            case "boolean":
              values[inputDef.key] = false;
              break;
            case "object":
              values[inputDef.key] = "";
              break;
            case "array":
              values[inputDef.key] = [];
              break;
            default:
              values[inputDef.key] = "";
          }
        }
      }
    });
    return values;
  }, [inputDefinitions]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    inputDefinitions.forEach((inputDef) => {
      if (inputDef.required && inputDef.key) {
        const value = values[inputDef.key];
        if (value === "" || value === undefined || value === null) {
          newErrors[inputDef.key] = "Required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [inputDefinitions, values]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse values based on type
    const parsedValues = {};
    inputDefinitions.forEach((inputDef) => {
      if (inputDef.key) {
        const value = values[inputDef.key];
        switch (inputDef.type) {
          case "number":
            parsedValues[inputDef.key] = value === "" ? null : Number(value);
            break;
          case "boolean":
            parsedValues[inputDef.key] = Boolean(value);
            break;
          case "object":
            try {
              parsedValues[inputDef.key] = value ? JSON.parse(value) : null;
            } catch {
              parsedValues[inputDef.key] = null;
            }
            break;
          case "array":
            parsedValues[inputDef.key] = Array.isArray(value) ? value : [];
            break;
          default:
            parsedValues[inputDef.key] = value;
        }
      }
    });
    onSubmit(parsedValues);
  }, [inputDefinitions, values, validate, onSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-md shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <h3 className="text-sm font-semibold text-foreground">
            Workflow Input Parameters
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            square
            onClick={onClose}
            className="h-8 w-8 text-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <form>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <InputValuesForm
              inputDefinitions={inputDefinitions}
              values={values}
              onChange={handleChange}
              errors={errors}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-background">
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
              // className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-3 h-3 mr-1.5" />
              Run Workflow
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

WorkflowInputModal.propTypes = {
  inputDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      type: PropTypes.string,
      required: PropTypes.bool,
      defaultValue: PropTypes.any,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
