/**
 * EditorGroupingBridge
 *
 * Group / ungroup and multi-selection alignment commands for the canvas.
 * Grouping wraps the selected siblings in a Flex Stack, preserving their
 * order; ungrouping dissolves a selected stack/container back into its
 * parent. Commands are exposed on the shared editorCommands bus so the
 * context menu and multi-selection toolbar can reuse the same behavior.
 */
import { useEffect } from "react";
import { useEditor, Element } from "@craftjs/core";
import { registerEditorCommand } from "./editorCommands";

const isDescendantOfSelection = (query, ids, id) => {
  try {
    const ancestors = query.node(id).ancestors(true);
    return ids.some((other) => other !== id && ancestors.includes(other));
  } catch {
    return false;
  }
};

export default function EditorGroupingBridge() {
  const { query, actions, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    if (!enabled) return undefined;

    const getSelectedIds = () =>
      Array.from(query.getEvent("selected").all() || []).filter(
        (id) => id && id !== "ROOT"
      );

    const unregisterGroup = registerEditorCommand("group-selection", () => {
      const ids = getSelectedIds();
      if (ids.length < 2) return;

      const roots = ids.filter(
        (id) => !isDescendantOfSelection(query, ids, id)
      );
      if (roots.length < 2) return;

      let parentId = null;
      try {
        parentId = query.node(roots[0]).get()?.data?.parent;
      } catch {
        return;
      }
      if (!parentId) return;

      const parentNode = query.node(parentId).get();
      if (!parentNode || parentNode.data.displayName === "CanvasZStack") return;

      const sameParent = roots.every((id) => {
        try {
          return query.node(id).get()?.data?.parent === parentId;
        } catch {
          return false;
        }
      });
      if (!sameParent) return;

      const siblings = parentNode.data.nodes || [];
      const ordered = [...roots].sort(
        (a, b) => siblings.indexOf(a) - siblings.indexOf(b)
      );
      const insertIndex = Math.max(0, siblings.indexOf(ordered[0]));

      try {
        const resolver = query.getOptions().resolver;
        const groupTree = query
          .parseReactElement(
            <Element
              is={resolver.CanvasStack}
              canvas
              span={12}
              sizing="auto"
              direction="vertical"
              gap={8}
              align="stretch"
              label="Group"
            />
          )
          .toNodeTree();
        const groupId = groupTree.rootNodeId;
        actions.addNodeTree(groupTree, parentId, insertIndex);
        ordered.forEach((id, index) => {
          actions.move(id, groupId, index);
        });
        actions.selectNode([groupId]);
      } catch (error) {
        console.error("[EditorGroupingBridge] Group failed:", error);
      }
    });

    const unregisterUngroup = registerEditorCommand("ungroup-selection", () => {
      const ids = getSelectedIds();
      if (!ids.length) return;

      ids.forEach((id) => {
        let node = null;
        try {
          node = query.node(id).get();
        } catch {
          return;
        }
        const displayName = node?.data?.displayName;
        const parentId = node?.data?.parent;
        if (!parentId) return;

        const parentNode = query.node(parentId).get();
        const siblings = parentNode?.data?.nodes || [];
        const groupIndex = siblings.indexOf(id);
        if (groupIndex < 0) return;

        if (displayName === "CanvasStack") {
          const children = [...(node.data.nodes || [])];
          children.forEach((childId, index) => {
            actions.move(childId, parentId, groupIndex + index);
          });
          actions.delete(id);
        } else if (displayName === "CanvasContainer") {
          const columnId = (node.data.nodes || [])[0];
          const column = columnId ? query.node(columnId).get() : null;
          const grandChildren = [...(column?.data?.nodes || [])];
          grandChildren.forEach((childId, index) => {
            actions.move(childId, parentId, groupIndex + index);
          });
          actions.delete(id);
        }
      });
    });

    const unregisterAlign = registerEditorCommand("align-selection", (mode) => {
      if (!["flex-start", "center", "flex-end", "stretch"].includes(mode)) return;
      const ids = getSelectedIds();
      if (!ids.length) return;
      let parentId = null;
      try {
        parentId = query.node(ids[0]).get()?.data?.parent;
      } catch {
        return;
      }
      if (!parentId) return;
      const shared = ids.every((id) => {
        try {
          return query.node(id).get()?.data?.parent === parentId;
        } catch {
          return false;
        }
      });
      if (!shared) return;

      const parent = query.node(parentId).get();
      if (parent?.data?.displayName === "CanvasRow") {
        actions.setProp(parentId, (nodeProps) => {
          nodeProps.style = { ...(nodeProps.style || {}), alignItems: mode };
        });
      } else if (parent?.data?.displayName === "CanvasStack") {
        actions.setProp(parentId, (nodeProps) => {
          nodeProps.align = mode;
        });
      }
    });

    return () => {
      unregisterGroup();
      unregisterUngroup();
      unregisterAlign();
    };
  }, [actions, enabled, query]);

  return null;
}
