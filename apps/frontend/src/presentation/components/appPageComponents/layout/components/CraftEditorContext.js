/**
 * CraftEditorContext.js
 *
 * Shared React context for values that need to reach Craft.js User Components
 * but cannot be passed as Craft props (functions, callbacks, etc.).
 */
import { createContext, useContext, useMemo } from "react";
import { resolveValue } from "../../../../../logic/evaluationEngine";

export const CraftEditorContext = createContext({
  renderWidget: null,
  previewMode: false,
  editorLiveStateTree: null,
});

export const useCraftEditorContext = () => useContext(CraftEditorContext);

/**
 * Evaluate a layout-node visibility condition against the editor-time state
 * tree. Returns true when the node would be hidden in the viewer.
 * Mirrors LayoutRenderer's `!resolveValue(condition, stateTree)` semantics;
 * evaluation errors resolve to visible (same fail-open as the viewer).
 */
export const useConditionHidden = (condition, editorLiveStateTree) => {
  return useMemo(() => {
    if (!condition?.trim()) return false;
    try {
      const inner = editorLiveStateTree?.state || {};
      return !resolveValue(condition, inner);
    } catch {
      return false;
    }
  }, [condition, editorLiveStateTree]);
};
