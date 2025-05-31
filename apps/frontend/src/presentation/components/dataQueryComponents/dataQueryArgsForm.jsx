import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

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
    <Dialog
      open={open}
      onClose={onDecline}
      PaperProps={{
        className: "rounded shadow-xl w-full max-w-lg", // Tailwind classes for the dialog container
      }}
      BackdropProps={{
        className: "bg-black/50", // Tailwind class for the backdrop
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        <span className="text-sm font-normal text-gray-600">
          {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_DESCRIPTION}
        </span>
        <div className="space-y-4">
          {dataQueryArgs.map((arg) => (
            <div key={arg.key} className="space-y-1">
              <label
                htmlFor={arg.key}
                className="text-xs font-light text-gray-500"
              >
                {arg.key}
              </label>
              <input
                id={arg.key}
                name={arg.key}
                value={dataQueryArgsForm.values[arg]?.value}
                onChange={dataQueryArgsForm.handleChange}
                onBlur={dataQueryArgsForm.handleBlur}
                autoComplete="off"
                className="w-full rounded border p-2.5 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
              />
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={onDecline}
          type="button"
          className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
        >
          {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_CANCEL_BUTTON}
        </button>

        <button
          type="button"
          onClick={() => onAccepted(dataQueryArgsForm.values)}
          disabled={dataQueryArgs.some(
            (arg) => !dataQueryArgsForm.values[arg.key]
          )}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none ${
            dataQueryArgs.some((arg) => !dataQueryArgsForm.values[arg.key])
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {CONSTANTS.STRINGS.DATA_QUERY_ARGS_FORM_CONFIRM_BUTTON}
        </button>
      </DialogActions>
    </Dialog>
  );
};
