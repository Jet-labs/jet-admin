import { Close } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import warning_illustration from "../../assets/warning_illustration.svg";

export const ConfirmationDialog = ({
  onDecline,
  onAccepted,
  title,
  message,
  open,
  isLoading,
  loadingText,
  variant,
  confirmText,
  illustration,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onDecline}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {isLoading ? (
        <DialogContent className="!p-2 !flex !flex-row !justify-start !items-center !p-4">
          {loadingText && (
            <span className="text-base font-semibold text-slate-700">
              {loadingText}
            </span>
          )}
          <CircularProgress size={20} className="!ml-3" />
        </DialogContent>
      ) : (
        <>
          <DialogTitle className=" !text-lg !flex flex-row justify-between items-center w-full">
            {title}
            <IconButton aria-label="close" onClick={onDecline}>
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers className="!py-3">
            {variant == "error" && (
              <img
                src={illustration ? illustration : warning_illustration}
              ></img>
            )}

            <span className="!font-normal !text-sm">{message}</span>
          </DialogContent>
          <DialogActions>
            <Button
              disableElevation
              variant="contained"
              size="small"
              onClick={onAccepted}
            >
              {confirmText ? confirmText : "Confirm"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
