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
              <span className="text-sm font-semibold text-foreground">
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
                    variant="ghost"
                    size="icon"
                    className="p-0 opacity-70 hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-foreground" />
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
                  size="sm"
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
