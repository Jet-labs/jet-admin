import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useState } from "react";

export const DataExportConfirmationDialog = ({
  onDecline,
  onAccepted,
  open,
}) => {
  const [value, setValue] = useState("female");

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return (
    <Dialog
      open={open}
      onClose={onDecline}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <>
        <DialogTitle className=" !text-lg !flex flex-row justify-between items-center w-full">
          {LOCAL_CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_TITLE}
          <IconButton aria-label="close" onClick={onDecline}>
            <FaTimes className="!text-base" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="!py-3">
          <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">
              {LOCAL_CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_BODY}
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel
                value="xlsx"
                control={<Radio />}
                label="Excel"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            disableElevation
            variant="contained"
            size="small"
            onClick={() => {
              onAccepted(value);
            }}
          >
            {"Confirm"}
          </Button>
        </DialogActions>
      </>
    </Dialog>
  );
};
