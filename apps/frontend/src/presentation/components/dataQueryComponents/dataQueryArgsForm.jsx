import { useFormik } from "formik";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from "@jet-admin/ui";

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
      dataQueryArgs?.map(({ key, value }) => [key, value])
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
        dataQueryArgsForm.setFieldValue(arg.key, "");
      });
    }
  }, [dataQueryArgs]);

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
          <div className="space-y-4">
            {dataQueryArgs.map((arg) => (
              <div key={arg.key} className="space-y-1">
                <label
                  htmlFor={arg.key}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {arg.key}
                </label>
                <Input
                  id={arg.key}
                  name={arg.key}
                  value={dataQueryArgsForm.values[arg.key]}
                  onChange={dataQueryArgsForm.handleChange}
                  onBlur={dataQueryArgsForm.handleBlur}
                  autoComplete="off"
                />
                {dataQueryArgsForm.errors[arg.key] && (
                  <span className="text-destructive text-xs">
                    {dataQueryArgsForm.errors[arg.key]}
                  </span>
                )}
              </div>
            ))}
          </div>
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
            onClick={() => onAccepted(dataQueryArgsForm.values)}
            disabled={dataQueryArgs.some(
              (arg) => !dataQueryArgsForm.values[arg.key]
            )}
          >
            {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_CONFIRM_BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
