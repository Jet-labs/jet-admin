import { useEffect } from "react";
import PropTypes from "prop-types";
import { useEditor } from "@craftjs/core";

const SPANNABLE_TYPES = [
  "CanvasWidgetSlot",
  "CanvasContainer",
  "CanvasStack",
  "CanvasZStack",
];

/**
 * CanvasShortcuts
 *
 * Keyboard manipulation for the selected canvas node(s). Kept inside <Editor>
 * so it can query the current Craft tree without prop drilling.
 */
export default function CanvasShortcuts({ setWidgets }) {
  const { selectedKey, enabled } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || [])
      .sort()
      .join("|"),
    enabled: state.options.enabled,
  }));
  const { actions, query } = useEditor();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!enabled) return;
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.closest("[contenteditable='true']"));
      if (isEditable) return;

      if (event.key === "Escape") {
        actions.selectNode([]);
        return;
      }

      if (
        target instanceof HTMLElement &&
        !target.closest("[data-canvas-ui]") &&
        target.closest("button, a, [role='button']")
      ) {
        return;
      }

      const ids = (selectedKey ? selectedKey.split("|") : []).filter(
        (id) => id && id !== "ROOT"
      );
      if (!ids.length) return;

      if ((event.key === "Delete" || event.key === "Backspace") && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        // Craft selections are normally non-overlapping, but nested
        // selections can still arrive from programmatic paths. Delete the
        // deepest nodes only so a parent deletion does not double-delete.
        const elements = ids
          .map((id) => document.getElementById(id))
          .filter(Boolean);
        const roots = elements
          .filter((el) => !elements.some((other) => other !== el && el.contains(other)))
          .map((el) => el.id);
        const deleteIds = roots.length ? roots : ids;
        const widgetKeys = new Set();
        const collectWidgetKeys = (nodeId) => {
          try {
            const node = query.node(nodeId).get();
            const widgetKey = node?.data?.props?.widgetKey;
            if (widgetKey) widgetKeys.add(widgetKey);
            (node?.data?.nodes || []).forEach(collectWidgetKeys);
          } catch {
            /* stale node */
          }
        };
        deleteIds.forEach(collectWidgetKeys);
        actions.delete(deleteIds);
        actions.selectNode([]);
        if (widgetKeys.size && setWidgets) {
          setWidgets((prev) =>
            Array.isArray(prev) ? prev.filter((key) => !widgetKeys.has(key)) : prev
          );
        }
        return;
      }

      if (event.key === "[" || event.key === "]") {
        const delta = event.key === "]" ? 1 : -1;
        let changed = false;
        ids.forEach((id) => {
          try {
            const node = query.node(id).get();
            const displayName = node?.data?.displayName;
            if (!SPANNABLE_TYPES.includes(displayName)) return;
            const parentId = node?.data?.parent;
            const parent = parentId ? query.node(parentId).get() : null;
            if (parent?.data?.displayName !== "CanvasRow") return;
            const currentSpan = node?.data?.props?.span || 6;
            const nextSpan = Math.max(1, Math.min(12, currentSpan + delta));
            if (nextSpan !== currentSpan) {
              changed = true;
              actions.setProp(id, (props) => {
                props.span = nextSpan;
              });
            }
          } catch {
            /* stale node */
          }
        });
        if (changed) event.preventDefault();
        return;
      }

      if (
        ids.length === 1 &&
        event.altKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        const id = ids[0];
        try {
          const node = query.node(id).get();
          const parentId = node?.data?.parent;
          if (!parentId) return;
          const parent = query.node(parentId).get();
          const siblings = parent?.data?.nodes || [];
          const index = siblings.indexOf(id);
          const nextIndex = index + (event.key === "ArrowRight" ? 1 : -1);
          if (index >= 0 && nextIndex >= 0 && nextIndex < siblings.length) {
            actions.move(id, parentId, nextIndex);
          }
        } catch {
          /* stale node */
        }
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [actions, query, selectedKey, setWidgets, enabled]);

  return null;
}

CanvasShortcuts.propTypes = {
  setWidgets: PropTypes.func,
};
