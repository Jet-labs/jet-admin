/**
 * CraftEditorContext.js
 *
 * Shared React context for values that need to reach Craft.js User Components
 * but cannot be passed as Craft props (functions, callbacks, etc.).
 */
import { createContext, useContext } from "react";

export const CraftEditorContext = createContext({
  renderWidget: null,
  previewMode: false,
});

export const useCraftEditorContext = () => useContext(CraftEditorContext);
