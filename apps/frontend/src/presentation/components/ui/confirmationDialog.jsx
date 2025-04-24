import CloseIcon from "@mui/icons-material/Close";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

export const ConfirmationDialog = ({
  onDecline,
  onAccepted,
  title,
  message,
  open,
  isLoading,
  loadingText,
  confirmText,
}) => {
  ConfirmationDialog.propTypes = {
    onDecline: PropTypes.func.isRequired,
    onAccepted: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    loadingText: PropTypes.string,
    confirmText: PropTypes.string,
  };
  return (
    <Dialog
      open={open}
      onClose={onDecline}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {isLoading ? (
        <DialogContent className="!flex !flex-row !justify-start !items-center !p-2">
          {loadingText && (
            <span className="!text-sm font-semibold text-slate-700">
              {loadingText}
            </span>
          )}
          <CircularProgress size={20} className="!ml-3" />
        </DialogContent>
      ) : (
        <>
          <DialogTitle className="!p-3 !text-sm !flex flex-row justify-between items-center w-full !font-semibold">
            {title}
            <IconButton aria-label="close" onClick={onDecline}>
              <CloseIcon className="!text-base !text-slate-600" />
            </IconButton>
          </DialogTitle>
          <DialogContent className="!px-3">
            <span className="!font-normal !text-sm">{message}</span>
          </DialogContent>
          <DialogActions className="!p-3 !pt-1">
            <button
              type="button"
              onClick={onAccepted}
              className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {confirmText ? confirmText : "Confirm"}
            </button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
