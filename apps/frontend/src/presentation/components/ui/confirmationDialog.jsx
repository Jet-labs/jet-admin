import { X } from "lucide-react";
import PropTypes from "prop-types";
import React from "react";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Spinner } from "@jet-admin/ui";
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDecline(); }}>
      <DialogContent className="max-w-sm p-4">
        {isLoading ? (
          <div className="flex flex-row justify-start items-center p-2">
            {loadingText && (
              <span className="text-sm font-semibold text-slate-700">
                {loadingText}
              </span>
            )}
            <Spinner size={16} className="ml-3" />
          </div>
        ) : (
          <>
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-sm font-semibold flex flex-row justify-between items-center w-full">
                  {title}
                  <Button
                    aria-label="close"
                    onClick={onDecline}
                    className="rounded-sm opacity-70 hover:opacity-100 outline-none border-0 bg-transparent p-0"
                  >
                    <X className="h-4 w-4 text-slate-600" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div>
                <span className="font-normal text-sm">{message}</span>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={onAccepted}
                  className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded hover:bg-blue-800 focus:outline-none"
                >
                  {confirmText ? confirmText : "Confirm"}
                </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
