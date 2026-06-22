/**
 * SelectParentButton.jsx
 *
 * Floating button to select the parent node in the Craft.js editor.
 *
 * UI fix: text-primary-foreground → text-foreground (near-black on green, per §8.1).
 */
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { ArrowUp } from "lucide-react";

export function SelectParentButton() {
  const { id } = useNode();
  const { actions, parentId, parentDisplayName, enabled } = useEditor((state) => {
    const node = state.nodes[id];
    const pId = node?.data?.parent;
    const pNode = pId ? state.nodes[pId] : null;
    return {
      parentId: pId,
      parentDisplayName: pNode ? pNode.data.displayName : null,
      enabled: state.options.enabled,
    };
  });

  if (!enabled || !parentId || parentId === "ROOT") return null;

  const getLabel = (name) => {
    if (!name) return "Parent";
    if (name === "CanvasRow") return "Row";
    if (name === "CanvasStack") return "Stack";
    if (name === "CanvasContainer") return "Container";
    if (name === "CanvasZStack") return "Z-Stack";
    if (name === "CanvasColumn") return "Column";
    return name.replace(/^Canvas/, "");
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.selectNode(parentId);
      }}
      className="absolute -top-6 right-2 z-50 flex items-center gap-2 bg-primary text-foreground hover:bg-primary/90 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm cursor-pointer select-none pointer-events-auto transition-all border border-primary/20"
      title={`Select parent ${getLabel(parentDisplayName)}`}
    >
      <ArrowUp className="h-2.5 w-2.5" />
      {getLabel(parentDisplayName)}
    </button>
  );
}
