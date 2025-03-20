import { useFormik } from "formik";
import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { Dialog } from "@mui/material";

export const DatabaseQueryArgsForm = ({
  onDecline,
  onAccepted,
  open,
  args,
}) => {
  const argsForm = useFormik({
    initialValues: args.reduce((acc, arg) => {
      acc[arg] = "";
      return acc;
    }, {}),
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {},
  });

  useEffect(() => {
    if (argsForm && args) {
      args.forEach((arg) => {
        argsForm.setFieldValue(arg, "");
      });
    }
  }, [args]);

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
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-lg rounded bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-medium text-slate-700">
              {CONSTANTS.STRINGS.DATABASE_QUERY_ARGS_FORM_TITLE}
            </h2>
            <button
              onClick={onDecline}
              className="rounded p-1 text-slate-700 hover:text-[#646cff] outline-none focus:outline-none bg-transparent"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <span className="text-sm font-normal text-gray-600">
              {CONSTANTS.STRINGS.DATABASE_QUERY_ARGS_FORM_DESCRIPTION}
            </span>
            <div className="space-y-4">
              {args.map((arg) => (
                <div key={arg} className="space-y-1">
                  <label
                    htmlFor={arg}
                    className="text-xs font-light text-gray-500"
                  >
                    {arg}
                  </label>
                  <input
                    id={arg}
                    name={arg}
                    value={argsForm.values[arg]}
                    onChange={argsForm.handleChange}
                    onBlur={argsForm.handleBlur}
                    autoComplete="off"
                    className="w-full rounded border p-2.5 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <button
              onClick={() => onAccepted(argsForm.values)}
              disabled={args.some((arg) => !argsForm.values[arg])}
              className={`flex w-full items-center justify-center rounded border border-[#646cff] bg-white px-4 py-2 text-sm font-medium text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50 ${
                args.some((arg) => !argsForm.values[arg])
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {CONSTANTS.STRINGS.DATABASE_QUERY_ARGS_FORM_CONFIRM_BUTTON}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
