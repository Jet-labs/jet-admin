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
    cancelText: "Cancel",
    confirmButtonClass: "",
    cancelButtonClass: "",
  },

  showConfirmation: ({
    title = "Confirmation Required",
    message,
    confirmText = "Confirm",
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
    const { dialogState, setDialogLoading, closeDialog } = get();
    try {
      setDialogLoading(true);
      if (dialogState.resolve) {
        await dialogState.resolve();
      }
    } finally {
      closeDialog();
    }
  },

  handleReject: () => {
    const { dialogState, closeDialog } = get();
    if (dialogState.reject) {
      dialogState.reject();
    }
    closeDialog();
  },
}));

export const useGlobalUI = () => {
  const showConfirmation = useUIStore((state) => state.showConfirmation);
  return { showConfirmation };
};
