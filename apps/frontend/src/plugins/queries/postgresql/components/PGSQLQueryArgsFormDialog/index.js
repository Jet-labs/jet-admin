import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { FaTimes } from "react-icons/fa";
import { LOCAL_CONSTANTS } from "../../../../../constants";
import { useEffect } from "react";

export const PGSQLQueryArgsFormDialog = ({
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
    onSubmit: (values) => {
      console.log({ values });
    },
  });

  useEffect(() => {
    if (argsForm && args) {
      args.forEach((arg) => {
        argsForm.setFieldValue(arg, "");
      });
    }
  }, [args]);

  console.log(argsForm);
  return (
    <Dialog
      open={open}
      onClose={onDecline}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={"sm"}
      fullWidth
    >
      <>
        <DialogTitle className=" !text-lg !flex flex-row justify-between items-center w-full">
          {LOCAL_CONSTANTS.STRINGS.PG_QUERY_ARG_FORM_TITLE}
          <IconButton aria-label="close" onClick={onDecline}>
            <FaTimes className="!text-base" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="!py-3">
          <span className="!font-normal !text-sm">
            {LOCAL_CONSTANTS.STRINGS.PG_QUERY_ARG_FORM_BODY}
          </span>
          <div className="!flex flex-col justify-start items-stretch w-full">
            {args.map((arg) => {
              return (
                <FormControl fullWidth size="small" className="!mt-2 ">
                  <span className="text-xs font-light  mb-1 normal-case">
                    {arg}
                  </span>
                  <TextField
                    value={argsForm.values[arg]}
                    name={arg}
                    onChange={argsForm.handleChange}
                    onBlur={argsForm.handleBlur}
                  />
                </FormControl>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            disableElevation
            variant="contained"
            size="small"
            onClick={() => onAccepted(argsForm.values)}
          >
            {"Confirm"}
          </Button>
        </DialogActions>
      </>
    </Dialog>
  );
};
