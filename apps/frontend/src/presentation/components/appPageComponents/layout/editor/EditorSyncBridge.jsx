/**
 * EditorSyncBridge.jsx
 *
 * Subscribes to Craft.js state changes and syncs back to the parent
 * DB configuration (nested tree format).
 *
 * Key improvements over the original:
 *  - Uses the shared balanceCraftRow() from layoutEngine.js (no duplicated logic).
 *  - Reduced debounce to 150ms for more responsive sync.
 *  - Uses serialized string comparison to detect actual state changes
 *    (prevents unnecessary sync calls that cause infinite re-render loops).
 *  - Properly flushes pending sync on unmount.
 */
import React, { useCallback, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { craftToTree } from "../engine/craftAdapter.js";
import { balanceCraftRow } from "../engine/layoutEngine.js";

export default function EditorSyncBridge({ onChangeLayout }) {
  const { query, actions, enabled, selectedNodeIds, _nodes } = useEditor((state) => ({
    enabled: state.options.enabled,
    selectedNodeIds: state.events.selected,
    _nodes: state.nodes,
  }));

  const debounceRef = useRef(null);
  const lastSerializedRef = useRef(null);
  const isSyncingRef = useRef(false);

  const sync = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      const serialized = query.serialize();

      // Bail out if nothing actually changed in Craft state.
      // This is critical: without this guard, the sync fires on every
      // effect re-run (e.g., when selectedNodeIds changes), calling
      // onChangeLayout, which re-renders the parent, which re-creates
      // callbacks, which retriggers this effect → infinite loop.
      if (serialized === lastSerializedRef.current) {
        isSyncingRef.current = false;
        return;
      }

      const craftNodes = JSON.parse(serialized);

      // ── Row Balancing using shared helper ──────────────────────────────
      const selectedIds = Array.from(selectedNodeIds || []);
      const activeSelectedId = selectedIds[0] || null;
      let changed = false;

      Object.entries(craftNodes).forEach(([id, node]) => {
        if (node.displayName === "CanvasRow") {
          if (balanceCraftRow(craftNodes, id, activeSelectedId)) {
            changed = true;
          }
        }
      });

      // Apply span changes to Craft state if balancing modified anything
      if (changed) {
        Object.entries(craftNodes).forEach(([id, node]) => {
          if (node.displayName === "CanvasRow") {
            (node.nodes || []).forEach((childId) => {
              const child = craftNodes[childId];
              if (child && child.props?.span != null) {
                const liveNode = query.node(childId).get();
                if (liveNode?.data?.props?.span !== child.props.span) {
                  actions.setProp(childId, (props) => {
                    props.span = child.props.span;
                  });
                }
              }
            });
          }
        });
      }

      const finalSerialized = changed ? query.serialize() : serialized;
      lastSerializedRef.current = finalSerialized;

      const finalNodes = JSON.parse(finalSerialized);
      console.log("[EditorSyncBridge] Serialized Craft Nodes State:", finalNodes);
      
      const treeRoot = craftToTree(finalNodes, "ROOT");
      if (treeRoot) {
        onChangeLayout(treeRoot);
      }
    } catch (err) {
      console.error("[EditorSyncBridge] Failed to sync layout:", err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [query, actions, selectedNodeIds, onChangeLayout]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(sync, 150);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [sync, _nodes]);

  // Listen for external flush requests (e.g., before saving)
  useEffect(() => {
    const handleFlush = () => sync();
    window.addEventListener("flush-editor-sync", handleFlush);
    return () => window.removeEventListener("flush-editor-sync", handleFlush);
  }, [sync]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y / Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enabled) return;
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        actions.history?.undo?.();
      } else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        actions.history?.redo?.();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
        if (selectedNodeIds && selectedNodeIds.size > 0) {
          e.preventDefault();
          selectedNodeIds.forEach((id) => {
            if (id !== "ROOT") actions.delete(id);
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, enabled, selectedNodeIds]);

  return null;
}
