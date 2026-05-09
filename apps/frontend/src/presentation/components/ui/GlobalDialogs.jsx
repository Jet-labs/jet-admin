import React from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@jet-admin/ui";
import { useUIStore } from "../../../logic/stores/useUIStore";

export const GlobalDialogs = () => {
  const dialogState = useUIStore((state) => state.dialogState);
  const handleConfirm = useUIStore((state) => state.handleConfirm);
  const handleReject = useUIStore((state) => state.handleReject);

  return (
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
  );
};
