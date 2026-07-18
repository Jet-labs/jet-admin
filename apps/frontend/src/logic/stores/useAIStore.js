import { create } from 'zustand';

/**
 * useAIStore — minimal global state for the AI chat panel.
 *
 * With useChat (from ai/react) handling the full message lifecycle —
 * streaming, tool invocations, history — this store only needs to
 * manage the panel's open/close state and the expanded view toggle.
 */
export const useAIStore = create((set) => ({
  isOpen: false,
  pendingMessage: null,

  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  /** Open the panel and pre-populate (or immediately send) a message. */
  openWithMessage: (message) => set({ isOpen: true, pendingMessage: message }),
  /** Clear the pending message after it has been consumed. */
  clearPendingMessage: () => set({ pendingMessage: null }),
}));
