import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  dialogState: {
    open: false,
    type: null,
    title: "",
    message: "",
    isLoading: false,
    resolve: null,
    reject: null,
    confirmText: "Confirm",
    confirmVariant: "default",
    cancelText: "Cancel",
    confirmButtonClass: "",
    cancelButtonClass: "",
  },

  showConfirmation: ({
    title = "Confirmation Required",
    message,
    confirmText = "Confirm",
    confirmVariant = "default",
    cancelText = "Cancel",
    confirmButtonClass = "",
    cancelButtonClass = "",
  }) => {
    return new Promise((resolve, reject) => {
      set({
        dialogState: {
          open: true,
          type: "confirmation",
          title,
          message,
          isLoading: false,
          resolve,
          reject,
          confirmText,
          confirmVariant,
          confirmButtonClass,
          cancelText,
          cancelButtonClass,
        },
      });
    });
  },

  closeDialog: () => {
    set((state) => ({
      dialogState: {
        ...state.dialogState,
        open: false,
        isLoading: false,
        resolve: null,
        reject: null,
      },
    }));
  },

  setDialogLoading: (isLoading) => {
    set((state) => ({
      dialogState: {
        ...state.dialogState,
        isLoading,
      },
    }));
  },

  handleConfirm: async () => {
    // Capture the resolver, then dismiss the dialog before resuming the
    // caller. Awaiting the resolver first kept the modal mounted with its
    // buttons disabled when the caller synchronously navigated away (e.g.
    // the unsaved-changes guard): the navigation unmounted the consumer and
    // the finally-block never produced a visible close.
    const { dialogState, closeDialog } = get();
    const resolve = dialogState.resolve;
    closeDialog();
    try {
      if (resolve) {
        await resolve(true);
      }
    } catch {
      // The consumer handles its own errors; the dialog is already closed.
    }
  },

  handleReject: () => {
    const { dialogState, closeDialog } = get();
    const resolve = dialogState.resolve;
    closeDialog();
    if (resolve) {
      resolve(false);
    }
  },
}));

export const useGlobalUI = () => {
  const showConfirmation = useUIStore((state) => state.showConfirmation);
  return { showConfirmation };
};
