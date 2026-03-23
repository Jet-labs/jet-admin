import { useFormik } from "formik";
import React, { useEffect, useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, InputArgsForm } from "@jet-admin/ui";

/**
 * Parse raw form values based on arg type definitions.
 * JSON Forms stores:
 *  - arrays as comma-separated strings
 *  - objects as stringified JSON
 * This function converts them to proper JS types before sending to the backend.
 */
function parseFormValues(args, rawValues) {
  if (!args || !rawValues) return rawValues;
  const parsed = {};

  for (const arg of args) {
    const key = arg.key;
    const type = arg.type || "string";
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

export const DataQueryArgsForm = ({
  onDecline,
  onAccepted,
  open,
  dataQueryArgs,
}) => {
  DataQueryArgsForm.propTypes = {
    onDecline: PropTypes.func.isRequired,
    onAccepted: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    dataQueryArgs: PropTypes.array.isRequired,
  };

  const dataQueryArgsForm = useFormik({
    initialValues: Object.fromEntries(
      dataQueryArgs?.map(({ key, type }) => {
        // Initialize with proper default based on type
        switch (type) {
          case "boolean": return [key, false];
          case "array": return [key, []];
          case "number": return [key, ""];
          default: return [key, ""];
        }
      })
    ),
    validateOnMount: false,
    validateOnChange: false,
    validationSchema:
      formValidations.dataQueryArgsFormValidationSchema(dataQueryArgs),
    onSubmit: () => {},
  });

  useEffect(() => {
    if (dataQueryArgsForm && dataQueryArgs) {
      dataQueryArgs.forEach((arg) => {
        const type = arg.type || "string";
        switch (type) {
          case "boolean":
            dataQueryArgsForm.setFieldValue(arg.key, false);
            break;
          case "array":
            dataQueryArgsForm.setFieldValue(arg.key, []);
            break;
          default:
            dataQueryArgsForm.setFieldValue(arg.key, "");
        }
      });
    }
  }, [dataQueryArgs]);

  const handleAccepted = useCallback(() => {
    const parsedValues = parseFormValues(dataQueryArgs, dataQueryArgsForm.values);
    onAccepted(parsedValues);
  }, [dataQueryArgs, dataQueryArgsForm.values, onAccepted]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDecline(); }}>
      <DialogContent className="max-w-sm p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_TITLE}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_DESCRIPTION}
          </p>
          <InputArgsForm
            args={dataQueryArgs}
            values={dataQueryArgsForm.values}
            onChange={(key, value) => dataQueryArgsForm.setFieldValue(key, value)}
            errors={dataQueryArgsForm.errors}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-3 mt-4">
          <Button
            onClick={onDecline}
            type="button"
            variant="outline"
          >
            {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_CANCEL_BUTTON}
          </Button>

          <Button
            type="button"
            onClick={handleAccepted}
            disabled={dataQueryArgs.some(
              (arg) => arg.required && !dataQueryArgsForm.values[arg.key]
            )}
          >
            {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_CONFIRM_BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
