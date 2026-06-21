/**
 * CraftEditorContext.js
 *
 * Shared React context for values that need to reach Craft.js User Components
 * but cannot be passed as Craft props (functions, callbacks, etc.).
 *
 * Craft.js only serialises/deserialises props defined in component.craft.props.
 * Functions like renderWidget must be distributed via context instead.
 */
import { createContext, useContext } from "react";

export const CraftEditorContext = createContext({
  renderWidget: null,
  previewMode: false,
});

export const useCraftEditorContext = () => useContext(CraftEditorContext);
