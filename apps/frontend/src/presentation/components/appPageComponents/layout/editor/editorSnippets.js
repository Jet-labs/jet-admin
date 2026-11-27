import { craftToTree } from "../engine/craftAdapter.js";
import { getWidgetByIDAPI } from "../../../../../data/apis/widget";

const MAX_CAPTURE_NODES = 500;

/**
 * Capture one Craft node subtree as the canonical nested layout JSON.
 * Used by saved snippets and composite widget creation.
 */
export function captureCraftNodeAsLayout(query, nodeId) {
  if (!nodeId) return null;
  const snapshot = query.node(nodeId).toNodeTree();
  const entries = Object.entries(snapshot.nodes || {});
  if (entries.length > MAX_CAPTURE_NODES) {
    throw new Error(
      `Selection is too large to capture (${entries.length} nodes; max ${MAX_CAPTURE_NODES}).`
    );
  }
  const flat = {};
  for (const [id, node] of entries) {
    const data = node?.data;
    if (!data?.displayName) continue;
    flat[id] = {
      displayName: data.displayName,
      props: data.props || {},
      nodes: data.nodes || [],
    };
  }
  const tree = craftToTree(flat, snapshot.rootNodeId);
  if (!tree) throw new Error("The selected node could not be captured.");
  return tree;
}

const widgetIDFromKey = (widgetKey) => {
  if (typeof widgetKey !== "string") return null;
  const match = widgetKey.match(/^widget_([0-9a-f-]{36})/i);
  return match?.[1] || null;
};

/**
 * Convert a captured page layout into a composite layout by embedding each
 * referenced widget definition inline. This makes the composite a complete,
 * versionable, library-publishable asset instead of a set of live references.
 */
export async function captureCompositeLayout({ query, nodeId, tenantID }) {
  const layout = captureCraftNodeAsLayout(query, nodeId);
  if (!layout) return null;
  const cache = new Map();

  const visit = async (node) => {
    if (!node || typeof node !== "object") return node;
    if (node.type === "widget") {
      const widgetID = widgetIDFromKey(node.widgetKey);
      if (!widgetID) throw new Error("A selected widget has no saved definition.");
      if (!cache.has(widgetID)) {
        cache.set(
          widgetID,
          getWidgetByIDAPI({ tenantID, widgetID }).then((widget) => widget)
        );
      }
      const widget = await cache.get(widgetID);
      if (!widget) throw new Error("A selected widget definition could not be loaded.");
      if (widget.widgetType === "composite") {
        throw new Error(
          "Nested composite widgets are not supported yet. Expand the child composite first."
        );
      }
      return {
        ...node,
        type: "inline-widget",
        inlineWidget: {
          widgetType: widget.widgetType,
          widgetConfig: widget.widgetConfig || {},
          widgetTitle: widget.widgetTitle || widget.widgetType,
        },
      };
    }
    if (Array.isArray(node.children)) {
      const children = [];
      for (const child of node.children) children.push(await visit(child));
      return { ...node, children };
    }
    if (node.children && typeof node.children === "object") {
      return { ...node, children: await visit(node.children) };
    }
    return node;
  };

  return visit(layout);
}

export function countLayoutNodes(node) {
  if (!node || typeof node !== "object") return 0;
  if (Array.isArray(node)) {
    return node.reduce((sum, child) => sum + countLayoutNodes(child), 0);
  }
  return (
    1 +
    (Array.isArray(node.children)
      ? node.children.reduce((sum, child) => sum + countLayoutNodes(child), 0)
      : 0)
  );
}
