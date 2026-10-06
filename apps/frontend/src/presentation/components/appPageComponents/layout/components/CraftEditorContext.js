/**
 * CraftEditorContext.js
 *
 * Shared React context for values that need to reach Craft.js User Components
 * but cannot be passed as Craft props (functions, callbacks, etc.).
 */
import { createContext, useContext, useMemo } from "react";
import { evaluateVisibilityCondition } from "../../../../../logic/evaluationEngine";

export const CraftEditorContext = createContext({
  renderWidget: null,
  previewMode: false,
  editorLiveStateTree: null,
});

export const useCraftEditorContext = () => useContext(CraftEditorContext);

/**
 * Evaluate a layout-node visibility condition against the editor-time state
 * tree. Returns true when the node would be hidden in the viewer.
 * Mirrors LayoutRenderer's fail-closed semantics: empty => visible,
 * error => hidden (logged). Silent in editor to avoid console spam —
 * the Settings badge surfaces the error.
 */
export const evaluateConditionForEditor = (condition, editorLiveStateTree, opts = {}) => {
  if (typeof condition !== "string" || !condition.trim()) {
    return { visible: true, hidden: false, isEmpty: true, hasError: false, isNonBoolean: false, missingMustaches: false };
  }
  try {
    const inner = editorLiveStateTree?.state || {};
    const res = evaluateVisibilityCondition(condition, inner, { silent: true, ...opts });
    return { ...res, hidden: !res.visible };
  } catch {
    return { visible: false, hidden: true, isEmpty: false, hasError: true, isNonBoolean: false, missingMustaches: false };
  }
};

export const useConditionHidden = (condition, editorLiveStateTree) => {
  return useMemo(() => {
    return evaluateConditionForEditor(condition, editorLiveStateTree).hidden;
  }, [condition, editorLiveStateTree]);
};

export const useVisibilityDetails = (condition, editorLiveStateTree) => {
  return useMemo(() => {
    return evaluateConditionForEditor(condition, editorLiveStateTree);
  }, [condition, editorLiveStateTree]);
};
