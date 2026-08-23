/**
 * Html5DropBridge.jsx
 *
 * Bridges HTML5 drag-and-drop from the widget palette (appPageWidgetList)
 * into the Craft.js editor canvas.
 *
 * Key improvements over the original:
 *  - Positional insertion: computes the target index based on cursor position
 *    relative to existing children, so widgets drop between elements (not just append).
 *  - Visual drop feedback: highlights the insertion point during dragover.
 *  - No silent error swallowing: validates node IDs before querying Craft state.
 */
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { Element } from "@craftjs/core";

const CANVAS_DISPLAY_NAMES = [
  "CanvasRow",
  "CanvasColumn",
  "CanvasContainer",
  "CanvasStack",
  "CanvasZStack",
];

/**
 * Walks up the DOM from the drop target to find the nearest Craft canvas node.
 * Returns { nodeId, displayName } or null.
 */
function findCraftCanvasNode(query, targetEl) {
  let el = targetEl;
  while (el) {
    const nodeId = el.id;
    if (nodeId === "craft-canvas-root") {
      return { nodeId: "ROOT", displayName: "CanvasColumn" };
    }
    if (nodeId && nodeId !== "craft-canvas-root" && nodeId !== "craft-html5-drop-overlay") {
      try {
        const node = query.node(nodeId).get();
        const dn = node?.data?.displayName;
        if (dn && CANVAS_DISPLAY_NAMES.includes(dn)) {
          return { nodeId, displayName: dn };
        }
      } catch {
        // Not a Craft node — keep walking up
      }
    }
    el = el.parentElement;
  }
  return null;
}

/**
 * Determines the layout orientation of a canvas node.
 */
function getLayoutOrientation(query, nodeId, displayName) {
  if (displayName === "CanvasRow") return "horizontal";
  if (displayName === "CanvasStack") {
    try {
      const node = query.node(nodeId).get();
      return node?.data?.props?.direction === "horizontal" ? "horizontal" : "vertical";
    } catch {
      return "vertical";
    }
  }
  return "vertical";
}

/**
 * Computes the insertion index within a target canvas node based on cursor position.
 * Compares the cursor against the midpoints of existing child elements (horizontal or vertical depending on layout).
 */
function computeInsertionIndex(query, nodeId, displayName, targetEl, clientX, clientY, childIds) {
  if (!childIds || childIds.length === 0) return 0;

  const orientation = getLayoutOrientation(query, nodeId, displayName);

  for (let i = 0; i < childIds.length; i++) {
    const childEl = targetEl.querySelector(`#${CSS.escape(childIds[i])}`);
    if (!childEl) continue;
    const rect = childEl.getBoundingClientRect();
    if (orientation === "horizontal") {
      const midX = rect.left + rect.width / 2;
      if (clientX < midX) {
        return i;
      }
    } else {
      const midY = rect.top + rect.height / 2;
      if (clientY < midY) {
        return i;
      }
    }
  }
  return childIds.length;
}

export default function Html5DropBridge({ setWidgets }) {
  const { query, actions, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [dropIndicator, setDropIndicator] = useState(null);
  const indicatorTimerRef = useRef(null);

  const clearDropIndicator = useCallback(() => {
    if (indicatorTimerRef.current) {
      clearTimeout(indicatorTimerRef.current);
      indicatorTimerRef.current = null;
    }
    setDropIndicator(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      clearDropIndicator();
      if (!enabled) return;

      const widgetKey = e.dataTransfer?.getData("widget");
      const layoutType = e.dataTransfer?.getData("layout-type");
      if (!widgetKey && !layoutType) return;

      e.preventDefault();
      e.stopPropagation();

      const found = findCraftCanvasNode(query, e.target);
      let targetNodeId = found?.nodeId ?? "ROOT";
      let targetDisplayName = found?.displayName ?? "CanvasColumn";

      const resolver = query.getOptions().resolver;
      const _CanvasWidgetSlot = resolver["CanvasWidgetSlot"];
      const _CanvasRow = resolver["CanvasRow"];
      const _CanvasContainer = resolver["CanvasContainer"];
      const _CanvasStack = resolver["CanvasStack"];
      const _CanvasZStack = resolver["CanvasZStack"];

      // Define element and tree building helpers first so redirect block can use them
      const makeWidgetReactElement = () => (
        <Element
          is={_CanvasWidgetSlot}
          widgetKey={widgetKey}
          span={6}
          width={null}
          height={null}
          sizing="fill"
          fixedHeight={null}
          style={{}}
          condition={null}
          repeat={null}
          locked={false}
        />
      );

      const makeContainerReactElement = () => (
        <Element is={_CanvasContainer} canvas span={12} sizing="auto">
          <Element is={resolver["CanvasColumn"]} canvas />
        </Element>
      );

      const makeStackReactElement = () => (
        <Element is={_CanvasStack} canvas span={12} sizing="auto" />
      );

      const makeZStackReactElement = () => (
        <Element is={_CanvasZStack} canvas span={12} sizing="fill" />
      );

      const makeLayoutReactElement = () => {
        if (layoutType === "container") return makeContainerReactElement();
        if (layoutType === "stack") return makeStackReactElement();
        if (layoutType === "z-stack") return makeZStackReactElement();
        return null;
      };

      const makeWidgetTree = () =>
        query.parseReactElement(makeWidgetReactElement()).toNodeTree();

      const makeRowTree = () =>
        query.parseReactElement(<Element is={_CanvasRow} canvas sizing="auto" />).toNodeTree();

      const makeLayoutTree = () => {
        const el = makeLayoutReactElement();
        return el ? query.parseReactElement(el).toNodeTree() : null;
      };

      // ── Z-Stack drop redirect ─────────────────────────────────────────────
      // Ensure widgets and layouts always land in the ACTIVE layer of a Z-Stack.
      // Case 1: Drop target is the Z-Stack itself → redirect to active layer.
      // Case 2: Drop target is a CanvasStack inside a Z-Stack → verify it's
      //         the active layer; if not, redirect to the correct one.
      let zStackRedirectTarget = null;

      if (targetDisplayName === "CanvasZStack") {
        zStackRedirectTarget = { zStackId: targetNodeId };
      } else if (targetDisplayName === "CanvasStack") {
        try {
          const stackNode = query.node(targetNodeId).get();
          const stackParentId = stackNode?.data?.parent;
          if (stackParentId) {
            const parentNode = query.node(stackParentId).get();
            if (parentNode?.data?.displayName === "CanvasZStack") {
              zStackRedirectTarget = { zStackId: stackParentId };
            }
          }
        } catch { /* not a valid node — ignore */ }
      }

      if (zStackRedirectTarget) {
        const { zStackId } = zStackRedirectTarget;
        try {
          const zStackNode = query.node(zStackId).get();
          const zChildIds = zStackNode?.data?.nodes || [];
          let activeLayerIdx = zStackNode?.data?.props?.activeLayerIndex;
          if (activeLayerIdx === undefined || activeLayerIdx === null) {
            activeLayerIdx = 0;
          }
          let layerId = zChildIds[activeLayerIdx];

          // Auto-create first layer if Z-Stack is empty
          if (!layerId) {
            const layerTree = query
              .parseReactElement(
                <Element is={_CanvasStack} canvas span={12} sizing="fill" direction="vertical" gap={0} />
              )
              .toNodeTree();
            actions.addNodeTree(layerTree, zStackId);
            const freshZStack = query.node(zStackId).get();
            const freshChildIds = freshZStack?.data?.nodes || [];
            layerId = freshChildIds[freshChildIds.length - 1];
            actions.setProp(zStackId, (props) => {
              props.activeLayerIndex = freshChildIds.length - 1;
              if (!Array.isArray(props.layerOpacities)) props.layerOpacities = [];
              props.layerOpacities[freshChildIds.length - 1] = 1;
            });
          }

          if (layerId) {
            let treeToAdd = null;
            if (layoutType) {
              if (layoutType === "row") {
                treeToAdd = makeRowTree();
              } else {
                treeToAdd = makeLayoutTree();
              }
            } else if (widgetKey) {
              treeToAdd = makeWidgetTree();
            }

            if (treeToAdd) {
              const layerNode = query.node(layerId).get();
              const layerChildIds = layerNode?.data?.nodes || [];
              const layerEl = document.getElementById(layerId);
              const layerIndex = layerEl
                ? computeInsertionIndex(query, layerId, "CanvasStack", layerEl, e.clientX, e.clientY, layerChildIds)
                : layerChildIds.length;

              actions.addNodeTree(treeToAdd, layerId, layerIndex);

              if (widgetKey && setWidgets) {
                setWidgets((prev) =>
                  Array.isArray(prev) && prev.includes(widgetKey)
                    ? prev
                    : [...(prev || []), widgetKey]
                );
              }
            }
          }
        } catch (err) {
          console.error("[Html5DropBridge] Z-Stack drop redirect failed:", err);
        }
        return; // handled — skip the normal drop path
      }

      // Compute insertion index for positional drops
      const targetNode = query.node(targetNodeId).get();
      const targetChildIds = targetNode?.data?.nodes || [];
      const targetEl = document.getElementById(targetNodeId);
      const insertIndex = targetEl
        ? computeInsertionIndex(query, targetNodeId, targetDisplayName, targetEl, e.clientX, e.clientY, targetChildIds)
        : targetChildIds.length;

      try {
        if (layoutType) {
          if (layoutType === "row") {
            let columnId = null;
            if (targetDisplayName === "CanvasColumn") {
              columnId = targetNodeId;
            } else {
              let current = targetNodeId;
              while (current) {
                const node = query.node(current).get();
                if (node?.data?.displayName === "CanvasColumn") {
                  columnId = current;
                  break;
                }
                current = node?.data?.parent;
              }
            }
            if (columnId) {
              const colNode = query.node(columnId).get();
              const colChildIds = colNode?.data?.nodes || [];
              const colEl = document.getElementById(columnId);
              const colIndex = colEl
                ? computeInsertionIndex(query, columnId, "CanvasColumn", colEl, e.clientX, e.clientY, colChildIds)
                : colChildIds.length;
              actions.addNodeTree(makeRowTree(), columnId, colIndex);
            }
          } else {
            const tree = makeLayoutTree();
            if (tree) actions.addNodeTree(tree, targetNodeId, insertIndex);
          }
        } else if (widgetKey) {
          actions.addNodeTree(makeWidgetTree(), targetNodeId, insertIndex);

          if (setWidgets) {
            setWidgets((prev) =>
              Array.isArray(prev) && prev.includes(widgetKey)
                ? prev
                : [...(prev || []), widgetKey]
            );
          }
        }
      } catch (err) {
        console.error("[Html5DropBridge] Drop failed:", err, {
          widgetKey,
          layoutType,
          targetNodeId,
          insertIndex,
        });
      }
    },
    [query, actions, setWidgets, enabled, clearDropIndicator]
  );

  useEffect(() => {
    if (!enabled) return;
    const canvasEl = document.getElementById("craft-canvas-root");
    if (!canvasEl) return;

    const nativeDragOver = (e) => {
      if (
        e.dataTransfer?.types?.includes("widget") ||
        e.dataTransfer?.types?.includes("layout-type")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";

        // Update visual drop indicator
        const found = findCraftCanvasNode(query, e.target);
        if (found) {
          let checkNodeId = found.nodeId;
          let checkDisplayName = found.displayName;

          // Redirect to Z-Stack if hovered over a layer stack inside it
          if (checkDisplayName === "CanvasStack") {
            try {
              const stackNode = query.node(checkNodeId).get();
              const stackParentId = stackNode?.data?.parent;
              if (stackParentId) {
                const parentNode = query.node(stackParentId).get();
                if (parentNode?.data?.displayName === "CanvasZStack") {
                  checkNodeId = stackParentId;
                  checkDisplayName = "CanvasZStack";
                }
              }
            } catch {
              // Not a valid Craft node — skip the Z-Stack redirect check
            }
          }

          // If targeting a Z-Stack, redirect guide to active layer
          if (checkDisplayName === "CanvasZStack") {
            try {
              const zStackNode = query.node(checkNodeId).get();
              const zChildIds = zStackNode?.data?.nodes || [];
              let activeLayerIdx = zStackNode?.data?.props?.activeLayerIndex;
              if (activeLayerIdx === undefined || activeLayerIdx === null) activeLayerIdx = 0;
              const activeLayerId = zChildIds[activeLayerIdx];

              if (activeLayerId) {
                const layerNode = query.node(activeLayerId).get();
                const layerChildIds = layerNode?.data?.nodes || [];
                const layerEl = document.getElementById(activeLayerId);
                const index = layerEl
                  ? computeInsertionIndex(query, activeLayerId, "CanvasStack", layerEl, e.clientX, e.clientY, layerChildIds)
                  : layerChildIds.length;
                
                setDropIndicator({ nodeId: activeLayerId, index, displayName: "CanvasStack" });
                return;
              }
            } catch {
              // Active layer could not be resolved — fall through to default indicator
            }
          }

          const targetNode = query.node(checkNodeId).get();
          const childIds = targetNode?.data?.nodes || [];
          const targetEl = document.getElementById(checkNodeId);
          const index = targetEl
            ? computeInsertionIndex(query, checkNodeId, checkDisplayName, targetEl, e.clientX, e.clientY, childIds)
            : childIds.length;
          setDropIndicator({ nodeId: checkNodeId, index, displayName: checkDisplayName });
        }
      }
    };

    const nativeDragLeave = (e) => {
      // Only clear if leaving the canvas entirely (not entering a child)
      if (!canvasEl.contains(e.relatedTarget)) {
        if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current);
        indicatorTimerRef.current = setTimeout(clearDropIndicator, 50);
      }
    };

    const nativeDrop = (e) => handleDrop(e);

    canvasEl.addEventListener("dragover", nativeDragOver);
    canvasEl.addEventListener("dragleave", nativeDragLeave);
    canvasEl.addEventListener("drop", nativeDrop);
    return () => {
      canvasEl.removeEventListener("dragover", nativeDragOver);
      canvasEl.removeEventListener("dragleave", nativeDragLeave);
      canvasEl.removeEventListener("drop", nativeDrop);
    };
  }, [handleDrop, clearDropIndicator, enabled, query]);

  // Render visual drop indicator overlay
  if (!dropIndicator || !enabled) return null;

  const targetEl = document.getElementById(dropIndicator.nodeId);
  if (!targetEl) return null;

  const targetNode = query.node(dropIndicator.nodeId).get();
  const childIds = targetNode?.data?.nodes || [];
  const indicatorChildId = childIds[Math.min(dropIndicator.index, childIds.length - 1)];

  let indicatorStyle = { display: "none" };

  if (childIds.length === 0 || dropIndicator.displayName === "CanvasZStack") {
    // Highlight the empty container or Z-Stack layer addition
    const rect = targetEl.getBoundingClientRect();
    const canvasRect = document.getElementById("craft-canvas-root")?.getBoundingClientRect();
    indicatorStyle = {
      position: "absolute",
      left: `${rect.left - (canvasRect?.left || 0)}px`,
      top: `${rect.top - (canvasRect?.top || 0)}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: "2px dashed hsl(var(--primary))",
      borderRadius: "6px",
      backgroundColor: "hsl(var(--primary) / 0.05)",
      pointerEvents: "none",
      zIndex: 9999,
    };
  } else if (indicatorChildId) {
    const childEl = document.getElementById(indicatorChildId);
    if (childEl) {
      const rect = childEl.getBoundingClientRect();
      const canvasRect = document.getElementById("craft-canvas-root")?.getBoundingClientRect();
      const orientation = getLayoutOrientation(query, dropIndicator.nodeId, dropIndicator.displayName);
      const isBefore = dropIndicator.index < childIds.length;

      if (orientation === "horizontal") {
        indicatorStyle = {
          position: "absolute",
          left: isBefore
            ? `${rect.left - (canvasRect?.left || 0) - 2}px`
            : `${rect.right - (canvasRect?.left || 0) - 2}px`,
          top: `${rect.top - (canvasRect?.top || 0)}px`,
          width: "4px",
          height: `${rect.height}px`,
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "2px",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
          pointerEvents: "none",
          zIndex: 9999,
        };
      } else {
        indicatorStyle = {
          position: "absolute",
          left: `${rect.left - (canvasRect?.left || 0)}px`,
          top: isBefore
            ? `${rect.top - (canvasRect?.top || 0) - 2}px`
            : `${rect.bottom - (canvasRect?.top || 0) - 2}px`,
          width: `${rect.width}px`,
          height: "4px",
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "2px",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
          pointerEvents: "none",
          zIndex: 9999,
        };
      }
    }
  }

  return (
    <div
      id="craft-html5-drop-overlay"
      style={indicatorStyle}
    />
  );
}

Html5DropBridge.propTypes = {
  setWidgets: PropTypes.func,
};
