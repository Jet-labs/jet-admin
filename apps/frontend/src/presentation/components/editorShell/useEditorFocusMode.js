import { useEffect, useState } from "react";

const FOCUS_STORAGE_KEY = "jet-admin-editor-focus";

/**
 * Editor focus mode hides the global navigation and the tenant drawer so the
 * canvas gets the full viewport. The preference is remembered between editor
 * sessions; leaving the editor always restores the normal app shell.
 */
export const useEditorFocusMode = () => {
  const [focusMode, setFocusMode] = useState(() => {
    try {
      return window.localStorage.getItem(FOCUS_STORAGE_KEY) !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("editor-focus", focusMode);
    try {
      window.localStorage.setItem(FOCUS_STORAGE_KEY, String(focusMode));
    } catch {
      // Local storage can be unavailable in private/embedded contexts.
    }

    return () => {
      document.documentElement.classList.remove("editor-focus");
    };
  }, [focusMode]);

  return [focusMode, setFocusMode];
};
