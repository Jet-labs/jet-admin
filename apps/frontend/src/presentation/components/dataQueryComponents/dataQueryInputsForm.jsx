import { useFormik } from "formik";
import React, { useEffect, useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, InputValuesForm } from "@jet-admin/ui";

/**
 * Parse raw form values based on inputDefinitions.
 * JSON Forms stores:
 *  - arrays as comma-separated strings
 *  - objects as stringified JSON
 * This function converts them to proper JS types before sending to the backend.
 */
function parseFormValues(inputDefinitions, rawValues) {
  if (!inputDefinitions || !rawValues) return rawValues;
  const parsed = {};

  for (const inputDef of inputDefinitions) {
    const key = inputDef.key;
    const type = inputDef.type || "string";
    const rawValue = rawValues[key];

    switch (type) {
      case "number": {
        if (rawValue === "" || rawValue === undefined || rawValue === null) {
          parsed[key] = null;
        } else {
          parsed[key] = Number(rawValue);
        }
        break;
      }
      case "boolean": {
        parsed[key] = Boolean(rawValue);
        break;
      }
      case "object": {
        if (typeof rawValue === "object" && rawValue !== null) {
          parsed[key] = rawValue;
        } else if (typeof rawValue === "string" && rawValue.trim() !== "") {
          try {
            parsed[key] = JSON.parse(rawValue);
          } catch {
            parsed[key] = rawValue; // let backend handle/reject
          }
        } else {
          parsed[key] = null;
        }
        break;
      }
      case "array": {
        if (Array.isArray(rawValue)) {
          parsed[key] = rawValue;
        } else if (typeof rawValue === "string" && rawValue.trim() !== "") {
          // Try JSON parse first (e.g. "[1,2,3]")
          try {
            const jsonParsed = JSON.parse(rawValue);
            if (Array.isArray(jsonParsed)) {
              parsed[key] = jsonParsed;
            } else {
              // Fallback: comma-separated
              parsed[key] = rawValue.split(",").map((v) => v.trim()).filter(Boolean);
            }
          } catch {
            // Fallback: comma-separated
            parsed[key] = rawValue.split(",").map((v) => v.trim()).filter(Boolean);
          }
        } else {
          parsed[key] = [];
        }
        break;
      }
      default: {
        parsed[key] = rawValue ?? "";
        break;
      }
    }
  }

  return parsed;
}

export const DataQueryInputsForm = ({
  onDecline,
  onAccepted,
  open,
  inputDefinitions,
}) => {
  DataQueryInputsForm.propTypes = {
    onDecline: PropTypes.func.isRequired,
    onAccepted: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    inputDefinitions: PropTypes.array.isRequired,
  };

  const dataQueryInputsForm = useFormik({
    initialValues: Object.fromEntries(
      inputDefinitions?.map(({ key, type }) => {
        // Initialize with proper default based on type
        switch (type) {
          case "boolean": return [key, false];
          case "array": return [key, []];
          case "number": return [key, ""];
          default: return [key, ""];
        }
      })
    ),
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: false,
    validationSchema:
      formValidations.dataQueryInputsFormValidationSchema(inputDefinitions),
    onSubmit: () => {},
  });

  const handleAccepted = useCallback(() => {
    const parsedValues = parseFormValues(inputDefinitions, dataQueryInputsForm.values);
    onAccepted(parsedValues);
  }, [inputDefinitions, dataQueryInputsForm.values, onAccepted]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDecline(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {CONSTANTS.STRINGS.DATA_QUERY_INPUTS_FORM_TITLE}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {CONSTANTS.STRINGS.DATA_QUERY_INPUTS_FORM_DESCRIPTION}
          </p>
          <InputValuesForm
            inputDefinitions={inputDefinitions}
            values={dataQueryInputsForm.values}
            onChange={(key, value) => dataQueryInputsForm.setFieldValue(key, value)}
            errors={dataQueryInputsForm.errors}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-3 mt-4">
          <Button
            onClick={onDecline}
            type="button"
            variant="outline"
          >
            {CONSTANTS.STRINGS.DATA_QUERY_INPUTS_FORM_CANCEL_BUTTON}
          </Button>

          <Button
            type="button"
            onClick={handleAccepted}
            disabled={inputDefinitions.some(
              (inputDef) => inputDef.required && !dataQueryInputsForm.values[inputDef.key]
            )}
          >
            {CONSTANTS.STRINGS.DATA_QUERY_INPUTS_FORM_CONFIRM_BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
