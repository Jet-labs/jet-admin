/**
 * EditorClipboardBridge.jsx
 *
 * Duplicate / copy / paste for Craft.js canvas nodes.
 *
 * - Ctrl+C  copies the selected node subtree into an internal clipboard
 * - Ctrl+V  pastes the clipboard as a new subtree (fresh node IDs)
 * - Ctrl+D  duplicates the selected node in place (copy + paste)
 *
 * Implementation reuses the same proven pipeline as Html5DropBridge:
 * snapshot the craft node tree → rebuild a React element tree from the
 * resolver → query.parseReactElement().toNodeTree() → actions.addNodeTree().
 * No reliance on craft internals beyond public query/actions.
 */
import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, Element } from "@craftjs/core";

const CANVAS_COMPONENTS = new Set([
  "CanvasRow",
  "CanvasColumn",
  "CanvasContainer",
  "CanvasStack",
  "CanvasZStack",
]);
const CLONABLE_COMPONENTS = new Set([
  ...CANVAS_COMPONENTS,
  "CanvasWidgetSlot",
]);

/**
 * Deep-copy a craft node (and its descendants) into a plain snapshot object.
 * Returns null for nodes that are not part of the canvas component set.
 */
function snapshotSubtree(query, id) {
  const node = query.node(id).get();
  const displayName = node?.data?.displayName;
  if (!displayName || !CLONABLE_COMPONENTS.has(displayName)) return null;

  return {
    displayName,
    props: JSON.parse(JSON.stringify(node.data.props || {})),
    children: (node.data.nodes || [])
      .map((childId) => snapshotSubtree(query, childId))
      .filter(Boolean),
  };
}

/** Rebuild a craft-ready React element tree from a snapshot. */
function snapshotToElement(snapshot, resolver) {
  if (!snapshot) return null;
  const Component = resolver[snapshot.displayName];
  if (!Component) return null;

  const isCanvas = CANVAS_COMPONENTS.has(snapshot.displayName);
  const children = (snapshot.children || [])
    .map((child) => snapshotToElement(child, resolver))
    .filter(Boolean);

  return (
    <Element is={Component} canvas={isCanvas} {...snapshot.props}>
      {children.length ? children : null}
    </Element>
  );
}

export default function EditorClipboardBridge() {
  const { query, actions, enabled, selectedNodeIds } = useEditor((state) => ({
    enabled: state.options.enabled,
    selectedNodeIds: state.events.selected,
  }));

  const clipboardRef = useRef(null);

  const getSelectedId = useCallback(() => {
    const ids = Array.from(selectedNodeIds || []).filter((id) => id !== "ROOT");
    return ids.length ? ids[0] : null;
  }, [selectedNodeIds]);

  const copySelected = useCallback(() => {
    const id = getSelectedId();
    if (!id) return false;

    const snapshot = snapshotSubtree(query, id);
    if (!snapshot) return false;

    const node = query.node(id).get();
    clipboardRef.current = {
      snapshot,
      parentId: node?.data?.parent || "ROOT",
    };
    return true;
  }, [query, getSelectedId]);

  const pasteFromClipboard = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip) return;

    try {
      const resolver = query.getOptions().resolver;
      const element = snapshotToElement(clip.snapshot, resolver);
      if (!element) return;

      const tree = query.parseReactElement(element).toNodeTree();

      // Prefer the original parent; fall back to ROOT if it was deleted
      const parentId = query.node(clip.parentId).get()
        ? clip.parentId
        : "ROOT";
      const siblings = query.node(parentId).get()?.data?.nodes || [];

      actions.addNodeTree(tree, parentId, siblings.length);
    } catch (err) {
      console.error("[EditorClipboardBridge] Paste failed:", err);
    }
  }, [query, actions]);

  const duplicateSelected = useCallback(() => {
    if (!copySelected()) return;
    pasteFromClipboard();
  }, [copySelected, pasteFromClipboard]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Never hijack keys while typing in form controls
      const active = document.activeElement;
      if (
        active &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          active.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();

      if (key === "d") {
        // Ctrl+D would bookmark the page — always swallow it when editing
        e.preventDefault();
        duplicateSelected();
      } else if (key === "c" && getSelectedId()) {
        e.preventDefault();
        copySelected();
      } else if (key === "v") {
        e.preventDefault();
        pasteFromClipboard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, duplicateSelected, copySelected, pasteFromClipboard, getSelectedId]);

  return null;
}
