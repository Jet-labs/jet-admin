// GlobalUIContext.jsx
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";

const GlobalUIContext = createContext();

export const GlobalUIProvider = ({ children }) => {
  GlobalUIProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [dialogState, setDialogState] = useState({
    open: false,
    type: null,
    title: "",
    message: "",
    isLoading: false,
    resolve: null,
    reject: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmButtonClass: "",
    cancelButtonClass: "",
  });

  const showConfirmation = useCallback(
    ({
      title = "Confirmation Required",
      message,
      confirmText,
      cancelText,
      confirmButtonClass,
      cancelButtonClass,
    }) => {
      return new Promise((resolve, reject) => {
        setDialogState({
          open: true,
          type: "confirmation",
          title,
          message,
          isLoading: false,
          resolve,
          reject,
          confirmText: confirmText || "Confirm",
          confirmButtonClass: confirmButtonClass || "",
          cancelText: cancelText || "Cancel",
          cancelButtonClass: cancelButtonClass || "",
        });
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
      resolve: null,
      reject: null,
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      setDialogState((prev) => ({ ...prev, isLoading: true }));
      dialogState.resolve?.();
    } finally {
      closeDialog();
    }
  }, [dialogState.resolve, closeDialog]);

  const handleReject = useCallback(() => {
    dialogState.reject?.();
    closeDialog();
  }, [dialogState.reject, closeDialog]);

  return (
    <GlobalUIContext.Provider value={{ showConfirmation }}>
      {children}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogState.open && dialogState.type === "confirmation"}
        onClose={handleReject}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="font-semibold text-slate-700 !text-lg !p-4 !pb-0">
          {dialogState.title}
        </DialogTitle>

        <DialogContent className="!p-4">
          <p className="text-slate-600 !text-sm">{dialogState.message}</p>
        </DialogContent>

        <DialogActions className="!p-4">
          <button
            onClick={handleReject}
            disabled={dialogState.isLoading}
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none ${dialogState.cancelButtonClass}`}
          >
            {dialogState.cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={dialogState.isLoading}
            className={`px-2.5 py-1.5 text-white text-sm bg-red-500 rounded hover:bg-red-600 hover:outline-none hover:border-0 border-0 outline-none ${dialogState.confirmButtonClass}`}
          >
            {dialogState.isLoading ? (
              <CircularProgress
                size={20}
                className="!text-white !align-middle"
              />
            ) : (
              dialogState.confirmText
            )}
          </button>
        </DialogActions>
      </Dialog>
    </GlobalUIContext.Provider>
  );
};

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (!context) {
    throw new Error("useGlobalUI must be used within a GlobalUIProvider");
  }
  return context;
};
