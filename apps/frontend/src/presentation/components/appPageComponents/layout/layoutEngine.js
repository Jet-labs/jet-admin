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
 * Helper to ensure a row's children never exceed a total span of 12.
 * It will proportionally shrink the largest widgets to make room.
 * @param {Object} row 
 * @param {string} priorityNodeId ID of the node that was just added/moved/resized, so we avoid shrinking it if possible.
 */
export const balanceRow = (row, priorityNodeId = null) => {
  if (!row || !Array.isArray(row.children)) return row;

  let sum = row.children.reduce((acc, c) => acc + (c.span || 6), 0);
  let excess = sum - 12;

  // Enforce absolute max of 12 per widget
  row.children.forEach((c) => {
    if ((c.span || 6) > 12) c.span = 12;
  });

  // Iteratively reduce the largest span until excess is 0
  while (excess > 0) {
    let candidateIdx = -1;
    let maxScore = -9999;

    for (let i = 0; i < row.children.length; i++) {
      const c = row.children[i];
      const span = c.span || 6;
      if (span > 1) {
        // Heavily penalize shrinking the priority node
        const isPriority = c.id === priorityNodeId;
        const score = span - (isPriority ? 100 : 0);
        if (score > maxScore) {
          maxScore = score;
          candidateIdx = i;
        }
      }
    }

    // If we can't shrink anything further (all are 1), we must stop to prevent infinite loops.
    // In a 12-col grid, we shouldn't have > 12 widgets anyway, but if we do, they will wrap.
    if (candidateIdx === -1) break;

    row.children[candidateIdx].span--;
    excess--;
  }

  return row;
};

/**
 * Adds a new widget to a specific row.
 */
export const addWidgetToRow = (root, rowId, widgetKey, span = 6, sizing = "fill", targetIndex = -1) => {
  const newRoot = cloneDeep(root);
  const row = findNodeById(newRoot, rowId);
  if (row && Array.isArray(row.children)) {
    // If there's limited space, shrink the initial span of the new widget first
    const currentSpan = row.children.reduce((acc, c) => acc + (c.span || 6), 0);
    const available = Math.max(1, 12 - currentSpan);
    const initialSpan = Math.min(span, available);

    const node = createWidgetNode(widgetKey, initialSpan, sizing);
    if (targetIndex >= 0 && targetIndex <= row.children.length) {
      row.children.splice(targetIndex, 0, node);
    } else {
      row.children.push(node);
    }
    
    balanceRow(row, node.id);
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

  let originParentId = null;
  let originIndex = -1;

  // Remove node from its current place
  const parentInfo = findParentOf(newRoot, nodeId);
  if (parentInfo) {
    const { parent, index } = parentInfo;
    originParentId = parent.id;
    originIndex = index;
    if (Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    } else {
      parent.children = null;
    }
  }

  // Insert node into the target row
  const targetRow = findNodeById(newRoot, targetRowId);
  if (targetRow && Array.isArray(targetRow.children)) {
    let insertIdx = targetIndex === undefined ? targetRow.children.length : targetIndex;
    if (originParentId === targetRowId && originIndex !== -1 && originIndex < insertIdx) {
      insertIdx--;
    }
    targetRow.children.splice(insertIdx, 0, node);
    balanceRow(targetRow, node.id);
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
    
    const parentInfo = findParentOf(newRoot, nodeId);
    if (parentInfo && parentInfo.parent.type === "row") {
      balanceRow(parentInfo.parent, nodeId);
    }
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

/**
 * Sets node style overrides.
 */
export const setNodeStyle = (root, nodeId, style) => {
  const newRoot = cloneDeep(root);
  const node = findNodeById(newRoot, nodeId);
  if (node) {
    node.style = {
      ...(node.style || {}),
      ...style,
    };
  }
  return newRoot;
};
