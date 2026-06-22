/**
 * craftAdapter.js
 *
 * Bidirectional transformer between Jet-Admin's nested tree JSON and Craft.js's
 * flat node map format.
 */

let _idCounter = 0;
const genId = (prefix = "node") => `${prefix}_${++_idCounter}_${Math.random().toString(36).slice(2, 7)}`;

const craftNode = (displayName, props, childIds = [], parent = "ROOT") => ({
  type: { resolvedName: displayName },
  isCanvas: ["CanvasColumn", "CanvasRow", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(displayName),
  props,
  displayName,
  custom: {},
  hidden: false,
  nodes: childIds,
  linkedNodes: {},
  parent,
});

export function treeNodeToCraft(node, parentId, out) {
  if (!node) return null;

  const id = node.id || genId(node.type);

  switch (node.type) {
    case "column": {
      const childIds = (node.children || []).map((child) => treeNodeToCraft(child, id, out));
      out[id] = craftNode("CanvasColumn", {
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
      }, childIds, parentId);
      break;
    }

    case "row": {
      const childIds = (node.children || []).map((child) => treeNodeToCraft(child, id, out));
      out[id] = craftNode("CanvasRow", {
        sizing: node.sizing || "auto",
        fixedHeight: node.fixedHeight || null,
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
      }, childIds, parentId);
      break;
    }

    case "widget": {
      out[id] = craftNode("CanvasWidgetSlot", {
        widgetKey: node.widgetKey || "",
        span: node.span || 6,
        sizing: node.sizing || "fill",
        width: node.width !== undefined ? node.width : null,
        height: node.height !== undefined ? node.height : null,
        fixedHeight: node.fixedHeight || null,
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
        locked: false,
      }, [], parentId);
      break;
    }

    case "container": {
      const innerColId = node.children?.id
        ? treeNodeToCraft(node.children, id, out)
        : (() => {
            const colId = genId("col");
            out[colId] = craftNode("CanvasColumn", { style: {}, condition: null, repeat: null }, [], id);
            return colId;
          })();

      out[id] = craftNode("CanvasContainer", {
        span: node.span || 12,
        sizing: node.sizing || "auto",
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
      }, [innerColId], parentId);
      break;
    }

    case "stack": {
      const childIds = (node.children || []).map((child) => treeNodeToCraft(child, id, out));
      out[id] = craftNode("CanvasStack", {
        span: node.span || 12,
        sizing: node.sizing || "auto",
        direction: node.direction || "vertical",
        wrap: node.wrap || false,
        gap: node.gap || 8,
        align: node.align || "stretch",
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
      }, childIds, parentId);
      break;
    }

    case "z-stack": {
      const childIds = (node.children || []).map((child) => treeNodeToCraft(child, id, out));
      out[id] = craftNode("CanvasZStack", {
        span: node.span || 12,
        sizing: node.sizing || "fill",
        style: node.style || {},
        condition: node.condition || null,
        repeat: node.repeat || null,
        activeLayerIndex: 0,
        layerOpacities: node.layerOpacities || [],
      }, childIds, parentId);
      break;
    }

    default:
      console.warn("[craftAdapter] Unknown node type:", node.type);
      return null;
  }

  if (out[id]) {
    (out[id].nodes || []).forEach((childId) => {
      if (out[childId]) out[childId].parent = id;
    });
  }

  return id;
}

export function treeToCraft(treeRoot) {
  const out = {};
  const rootId = treeRoot?.id || "ROOT";

  const childIds = (treeRoot?.children || []).map((child) => treeNodeToCraft(child, "ROOT", out));

  out["ROOT"] = craftNode("CanvasColumn", {
    style: treeRoot?.style || {},
    condition: treeRoot?.condition || null,
    repeat: treeRoot?.repeat || null,
  }, childIds, null);
  out["ROOT"].parent = null;
  out["ROOT"].id = "ROOT";

  Object.entries(out).forEach(([id, node]) => {
    node.id = id;
  });

  return JSON.stringify(out);
}

export function craftToTree(craftNodes, nodeId = "ROOT") {
  const craftNode = craftNodes[nodeId];
  if (!craftNode) return null;

  const { displayName, props, nodes: childIds = [] } = craftNode;
  const id = nodeId;

  switch (displayName) {
    case "CanvasColumn":
      return {
        id,
        type: "column",
        children: childIds.map((cid) => craftToTree(craftNodes, cid)).filter(Boolean),
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };

    case "CanvasRow":
      return {
        id,
        type: "row",
        sizing: props.sizing || "auto",
        ...(props.fixedHeight ? { fixedHeight: props.fixedHeight } : {}),
        children: childIds.map((cid) => craftToTree(craftNodes, cid)).filter(Boolean),
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };

    case "CanvasWidgetSlot":
      return {
        id,
        type: "widget",
        widgetKey: props.widgetKey || "",
        span: props.span || 6,
        sizing: props.sizing || "fill",
        ...(props.width !== undefined && props.width !== null ? { width: props.width } : {}),
        ...(props.height !== undefined && props.height !== null ? { height: props.height } : {}),
        ...(props.fixedHeight ? { fixedHeight: props.fixedHeight } : {}),
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };

    case "CanvasContainer": {
      const innerColId = childIds[0];
      const innerCol = innerColId ? craftToTree(craftNodes, innerColId) : null;
      return {
        id,
        type: "container",
        span: props.span || 12,
        sizing: props.sizing || "auto",
        children: innerCol ?? { id: `col_${id}`, type: "column", children: [] },
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };
    }

    case "CanvasStack":
      return {
        id,
        type: "stack",
        span: props.span || 12,
        sizing: props.sizing || "auto",
        direction: props.direction || "vertical",
        wrap: props.wrap || false,
        gap: props.gap || 8,
        align: props.align || "stretch",
        children: childIds.map((cid) => craftToTree(craftNodes, cid)).filter(Boolean),
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };

    case "CanvasZStack":
      return {
        id,
        type: "z-stack",
        span: props.span || 12,
        sizing: props.sizing || "fill",
        children: childIds.map((cid) => craftToTree(craftNodes, cid)).filter(Boolean),
        ...(props.layerOpacities && props.layerOpacities.length ? { layerOpacities: props.layerOpacities } : {}),
        ...(props.style && Object.keys(props.style).length ? { style: props.style } : {}),
        ...(props.condition ? { condition: props.condition } : {}),
        ...(props.repeat ? { repeat: props.repeat } : {}),
      };

    default:
      console.warn("[craftAdapter] Unknown Craft displayName:", displayName);
      return null;
  }
}
