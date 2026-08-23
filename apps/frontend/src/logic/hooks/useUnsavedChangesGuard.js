/**
 * useUnsavedChangesGuard
 *
 * Protects editor pages from losing unsaved work:
 * - Blocks in-app route changes via the data-router blocker and asks for
 *   confirmation using the global UI dialog.
 * - Registers a beforeunload handler so tab close/reload also warns.
 *
 * Usage:
 *   useUnsavedChangesGuard({ isDirty: historyIndex > 0 });
 */

import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { useGlobalUI } from "../stores/useUIStore";

export const useUnsavedChangesGuard = ({ isDirty, title = "Unsaved changes" }) => {
  const { showConfirmation } = useGlobalUI();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    let isActive = true;
    (async () => {
      const confirmed = await showConfirmation({
        title,
        message:
          "You have unsaved changes. If you leave now, your changes will be lost.",
        confirmText: "Leave without saving",
        cancelText: "Keep editing",
      });
      if (!isActive) return;
      if (confirmed) {
        blocker.proceed?.();
      } else {
        blocker.reset?.();
      }
    })();

    return () => {
      isActive = false;
    };
  }, [blocker, showConfirmation, title]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
};
