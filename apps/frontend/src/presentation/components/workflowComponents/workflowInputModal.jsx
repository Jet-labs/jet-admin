import React, { useState, useMemo, useCallback } from "react";
import { Play } from 'lucide-react';
import PropTypes from "prop-types";
import { Button, InputValuesForm, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@jet-admin/ui";
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
    <Dialog open={true} onOpenChange={(open) => {
      if (!open && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-2 border-b shrink-0 text-left">
          <DialogTitle className="text-base text-foreground font-medium">
            Workflow Input Parameters
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-2 overflow-y-auto flex-1">
            <InputValuesForm
              inputDefinitions={inputDefinitions}
              values={values}
              onChange={handleChange}
              errors={errors}
            />
          </div>

          <DialogFooter className="p-2 bg-muted/20 shrink-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              <Play className="w-3 h-3 mr-1.5" />
              Run Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
