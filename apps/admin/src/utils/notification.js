import { create } from "zustand";

let seq = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const _extractMessage = (error) => {
  if (!error) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error?.message) return error.error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Something went wrong.";
  }
};

const _display = (type, messageOrError, durationMs) => {
  const id = ++seq;
  useToastStore.getState().push({
    id,
    type,
    message: _extractMessage(messageOrError),
  });
  setTimeout(() => useToastStore.getState().remove(id), durationMs);
};

export const displaySuccess = (message) => _display("success", message, 4000);
export const displayError = (error) => _display("error", error, 6000);
