import lodash from "lodash";
const { cloneDeep } = lodash;
import {
  createRowNode,
  createWidgetNode,
  createContainerNode,
  createColumnNode,
} from "./layoutDefaults.js";

/**
 * Traverses the tree and invokes callback for each node.
 */
export const walkTree = (node, visitor) => {
  if (!node) return;
  visitor(node);
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => walkTree(child, visitor));
    } else {
      walkTree(node.children, visitor);
    }
  }
};

/**
 * Finds a node by ID.
 */
export const findNodeById = (root, id) => {
  let found = null;
  walkTree(root, (node) => {
    if (node.id === id) {
      found = node;
    }
  });
  return found;
};

/**
 * Finds the parent of a node and the index of the node within the parent.
 */
export const findParentOf = (root, nodeId) => {
  let result = null;

  const traverse = (node) => {
    if (!node) return;

    if (node.children) {
      if (Array.isArray(node.children)) {
        const index = node.children.findIndex((c) => c.id === nodeId);
        if (index !== -1) {
          result = { parent: node, index };
          return;
        }
        node.children.forEach(traverse);
      } else {
        if (node.children.id === nodeId) {
          result = { parent: node, index: 0 };
          return;
        }
        traverse(node.children);
      }
    }
  };

  traverse(root);
  return result;
};

/**
 * Adds a new widget to a specific row.
 */
export const addWidgetToRow = (root, rowId, widgetKey, span = 6, sizing = "fill") => {
  const newRoot = cloneDeep(root);
  const row = findNodeById(newRoot, rowId);
  if (row && row.type === "row") {
    row.children.push(createWidgetNode(widgetKey, span, sizing));
  }
  return newRoot;
};

/**
 * Removes a node by ID.
 */
export const removeNode = (root, nodeId) => {
  const newRoot = cloneDeep(root);
  const parentInfo = findParentOf(newRoot, nodeId);
  if (parentInfo) {
    const { parent, index } = parentInfo;
    if (Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    } else {
      parent.children = null;
    }
  }
  return removeEmptyRows(newRoot);
};

/**
 * Moves a node to another row at a specific index.
 */
export const moveNode = (root, nodeId, targetRowId, targetIndex) => {
  const newRoot = cloneDeep(root);
  const node = findNodeById(newRoot, nodeId);
  if (!node) return root;

  // Remove node from its current place
  const parentInfo = findParentOf(newRoot, nodeId);
  if (parentInfo) {
    const { parent, index } = parentInfo;
    parent.children.splice(index, 1);
  }

  // Insert node into the target row
  const targetRow = findNodeById(newRoot, targetRowId);
  if (targetRow && targetRow.type === "row") {
    const insertIdx = targetIndex === undefined ? targetRow.children.length : targetIndex;
    targetRow.children.splice(insertIdx, 0, node);
  }

  return removeEmptyRows(newRoot);
};

/**
 * Sets node sizing property.
 */
export const setNodeSizing = (root, nodeId, sizing, fixedHeight = null) => {
  const newRoot = cloneDeep(root);
  const node = findNodeById(newRoot, nodeId);
  if (node) {
    node.sizing = sizing;
    if (sizing === "fixed") {
      node.fixedHeight = fixedHeight || 200;
    } else {
      delete node.fixedHeight;
    }
  }
  return newRoot;
};

/**
 * Sets node column span.
 */
export const setNodeSpan = (root, nodeId, span) => {
  const newRoot = cloneDeep(root);
  const node = findNodeById(newRoot, nodeId);
  if (node && typeof node.span === "number") {
    node.span = Math.max(1, Math.min(12, span));
  }
  return newRoot;
};

/**
 * Adds an empty row.
 */
export const addRow = (root, afterRowId = null) => {
  const newRoot = cloneDeep(root);
  const newRow = createRowNode([]);

  if (newRoot.type === "column") {
    if (afterRowId) {
      const index = newRoot.children.findIndex((r) => r.id === afterRowId);
      if (index !== -1) {
        newRoot.children.splice(index + 1, 0, newRow);
        return newRoot;
      }
    }
    newRoot.children.push(newRow);
  }
  return newRoot;
};

/**
 * Removes rows that have no children, unless it is the only row left.
 */
export const removeEmptyRows = (root) => {
  const cleanTree = (node) => {
    if (!node) return;

    if (node.type === "column" && Array.isArray(node.children)) {
      // Filter out empty rows, but preserve at least one row if it's the root column
      node.children = node.children.filter((child) => {
        if (child.type === "row") {
          return child.children.length > 0;
        }
        return true;
      });

      if (node.id === root.id && node.children.length === 0) {
        node.children.push(createRowNode([]));
      }

      node.children.forEach(cleanTree);
    } else if (node.type === "container" && node.children) {
      cleanTree(node.children);
    }
  };

  const newRoot = cloneDeep(root);
  cleanTree(newRoot);
  return newRoot;
};

/**
 * Groups multiple nodes in the same row into a nested container.
 */
export const wrapInContainer = (root, nodeIds) => {
  if (!Array.isArray(nodeIds) || nodeIds.length === 0) return root;

  const newRoot = cloneDeep(root);
  const firstId = nodeIds[0];
  const parentInfo = findParentOf(newRoot, firstId);
  if (!parentInfo || parentInfo.parent.type !== "row") return root;

  const { parent: row } = parentInfo;

  // Extract all the matching nodes from the row in order
  const nodesToWrap = [];
  const indices = nodeIds
    .map((id) => row.children.findIndex((c) => c.id === id))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b);

  if (indices.length === 0) return root;

  const firstIndex = indices[0];

  // Calculate sum span
  let totalSpan = 0;
  indices.forEach((idx) => {
    const child = row.children[idx];
    if (child) {
      totalSpan += child.span || 6;
      nodesToWrap.push(child);
    }
  });

  // Create container
  const container = createContainerNode(Math.min(12, totalSpan), "auto");
  container.children = createColumnNode([
    createRowNode(nodesToWrap),
  ]);

  // Remove nodes from parent row and insert container
  const childrenLeft = row.children.filter((child) => !nodeIds.includes(child.id));
  childrenLeft.splice(firstIndex, 0, container);
  row.children = childrenLeft;

  return removeEmptyRows(newRoot);
};

/**
 * Unwraps a container, putting its inner nodes back into its parent row.
 */
export const unwrapContainer = (root, containerId) => {
  const newRoot = cloneDeep(root);
  const parentInfo = findParentOf(newRoot, containerId);
  if (!parentInfo || parentInfo.parent.type !== "row") return root;

  const { parent: parentRow, index: containerIndex } = parentInfo;
  const container = parentRow.children[containerIndex];

  if (container.type !== "container" || !container.children) return root;

  // Extract children from container's inner rows
  const innerNodes = [];
  walkTree(container.children, (node) => {
    if (node.type === "widget" || node.type === "container") {
      innerNodes.push(node);
    }
  });

  // Remove container and replace with its inner nodes
  parentRow.children.splice(containerIndex, 1, ...innerNodes);

  return removeEmptyRows(newRoot);
};
