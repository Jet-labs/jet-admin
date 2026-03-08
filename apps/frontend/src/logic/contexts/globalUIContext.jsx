// GlobalUIContext.jsx
import React, { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Button } from "@jet-admin/ui";
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
      <AlertDialog
        open={dialogState.open && dialogState.type === "confirmation"}
        onOpenChange={(open) => {
          if (!open) handleReject();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={dialogState.isLoading}
              className={dialogState.cancelButtonClass}
            >
              {dialogState.cancelText}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={dialogState.isLoading}
              className={dialogState.confirmButtonClass}
            >
              {dialogState.isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                dialogState.confirmText
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
