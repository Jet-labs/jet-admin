import { create } from "zustand";

/**
 * Global AI chat panel state.
 *
 * Streaming fields:
 *   currentThinking — accumulates reasoning tokens while the model thinks
 *   currentText     — accumulates text tokens for the in-progress message
 *   isStreaming     — true while the SSE stream is open
 */
export const useAIStore = create((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,     // waiting for first token
  isStreaming: false,   // SSE connection is open and receiving
  error: null,

  // In-progress streaming content
  currentThinking: "",
  currentText: "",

  // In-progress tool calls for the current turn
  currentToolCalls: [],  // [{ toolName, args, result, error, pending }]

  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  appendMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setLoading: (isLoading) => set({ isLoading }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),

  appendThinking: (content) =>
    set((state) => ({ currentThinking: state.currentThinking + content })),

  appendText: (content) =>
    set((state) => ({ currentText: state.currentText + content })),

  addToolCallStart: (toolName, args) =>
    set((state) => ({
      currentToolCalls: [
        ...state.currentToolCalls,
        { toolName, args, result: null, error: null, pending: true },
      ],
    })),

  updateToolCallEnd: (toolName, result, error) =>
    set((state) => {
      const calls = [...state.currentToolCalls];
      // Update the last pending call with this toolName
      const idx = calls.findLastIndex(
        (c) => c.toolName === toolName && c.pending
      );
      if (idx !== -1) {
        calls[idx] = { ...calls[idx], result, error, pending: false };
      }
      return { currentToolCalls: calls };
    }),

  /**
   * Commit the completed streaming turn into the messages array and reset all
   * streaming accumulators.
   */
  commitStreamingMessage: () =>
    set((state) => {
      const msg = {
        role: "assistant",
        content: state.currentText,
        thinking: state.currentThinking || null,
        toolCallSteps: state.currentToolCalls,
      };
      return {
        messages: [...state.messages, msg],
        currentThinking: "",
        currentText: "",
        currentToolCalls: [],
        isStreaming: false,
        isLoading: false,
      };
    }),

  clearMessages: () =>
    set({
      messages: [],
      error: null,
      currentThinking: "",
      currentText: "",
      currentToolCalls: [],
      isStreaming: false,
      isLoading: false,
    }),

  setMessages: (messages) => set({ messages }),
}));
