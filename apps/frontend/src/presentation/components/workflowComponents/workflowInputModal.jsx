import React, { useState, useMemo, useCallback } from "react";
import { Play, X } from 'lucide-react';
import PropTypes from "prop-types";
import { Button, InputArgsForm } from "@jet-admin/ui";
/**
 * Modal to prompt for workflow input parameters before test run.
 * Renders form fields based on the args schema defined in workflowOptions.
 * Uses the shared InputArgsForm component from @jet-admin/ui.
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
            values[arg.key] = "";
            break;
          case "array":
            values[arg.key] = [];
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

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
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
            try {
              parsedValues[arg.key] = value ? JSON.parse(value) : null;
            } catch {
              parsedValues[arg.key] = null;
            }
            break;
          case "array":
            parsedValues[arg.key] = Array.isArray(value) ? value : [];
            break;
          default:
            parsedValues[arg.key] = value;
        }
      }
    });
    onSubmit(parsedValues);
  }, [args, values, validate, onSubmit]);

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
            <InputArgsForm
              args={args}
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
              className="bg-green-600 hover:bg-green-700 text-white"
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
