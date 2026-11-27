import { create } from "zustand";

/**
 * Ephemeral widget-draft previews.
 *
 * The widget IDE modal writes the in-progress config here so the page canvas
 * can render it live without saving. Nothing is persisted; closing the modal
 * or a successful save clears the entry and the canvas falls back to the
 * saved widget record.
 */
export const useWidgetDraftStore = create((set) => ({
  drafts: {},
  setDraft: (widgetID, draft) =>
    set((state) => {
      if (!widgetID) return state;
      const key = String(widgetID);
      const previous = state.drafts[key];
      if (
        previous &&
        previous.title === draft?.title &&
        previous.widgetType === draft?.widgetType &&
        JSON.stringify(previous.config) === JSON.stringify(draft?.config)
      ) {
        return state;
      }
      return {
        drafts: {
          ...state.drafts,
          [key]: {
            title: draft?.title || "",
            widgetType: draft?.widgetType,
            config: draft?.config || {},
          },
        },
      };
    }),
  clearDraft: (widgetID) =>
    set((state) => {
      if (!widgetID) return state;
      const key = String(widgetID);
      if (!state.drafts[key]) return state;
      const next = { ...state.drafts };
      delete next[key];
      return { drafts: next };
    }),
  clearAll: () => set({ drafts: {} }),
}));

export default useWidgetDraftStore;
