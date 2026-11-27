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
import { subscribeCanvasDrag } from "./canvasDragStore";
import { findSectionTemplate } from "./sectionTemplates";
import {
  createWidgetInstanceKey,
  parseWidgetKey,
} from "../../editor/appPageLayoutUtils";

/** Widget instance keys currently mounted on the canvas. */
function collectCraftWidgetKeys(query) {
  const keys = [];
  try {
    const nodes = query.getSerializedNodes();
    for (const node of Object.values(nodes || {})) {
      const key = node?.props?.widgetKey;
      if (node?.displayName === "CanvasWidgetSlot" && key) keys.push(key);
    }
  } catch {
    /* canvas not ready */
  }
  return keys;
}

/**
 * Saved snippets reuse the source page's widget instance keys. Inserting the
 * same snippet twice must not merge widget state, so give every inserted
 * widget a fresh instance key while keeping the underlying widget ID.
 */
function remapSnippetWidgetKeys(tree, existingKeys = []) {
  const keys = [...existingKeys];
  const addedKeys = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map(visit);
    if (node.type === "widget" && node.widgetKey) {
      const widgetID = parseWidgetKey(node.widgetKey);
      if (!widgetID) return node;
      const widgetKey = createWidgetInstanceKey(widgetID, keys);
      keys.push(widgetKey);
      addedKeys.push(widgetKey);
      return { ...node, widgetKey };
    }
    if (Array.isArray(node.children)) {
      return { ...node, children: node.children.map(visit) };
    }
    if (node.children && typeof node.children === "object") {
      return { ...node, children: visit(node.children) };
    }
    return node;
  };
  return { tree: visit(tree), widgetKeys: addedKeys };
}

const CANVAS_DISPLAY_NAMES = [
  "CanvasRow",
  "CanvasColumn",
  "CanvasContainer",
  "CanvasStack",
  "CanvasZStack",
];

/**
 * Build a React element tree for a section template. `Element` is needed for
 * canvas nodes so Craft can parse the children into a node tree.
 */
function buildTemplateElement(definition, resolver, keyPrefix = "template") {
  if (!definition) return null;
  // Container snippets come from craftToTree with a single inner column
  // object (`children: { type: "column", ... }`) instead of the array shape
  // used by built-in templates. Flatten that shape here.
  const childDefinitions = Array.isArray(definition.children)
    ? definition.children
    : Array.isArray(definition.children?.children)
      ? definition.children.children
      : [];
  const children = childDefinitions
    .map((child, index) =>
      buildTemplateElement(child, resolver, `${keyPrefix}-${index}`)
    )
    .filter(Boolean);
  const props = definition.props || {};

  switch (definition.type) {
    case "row":
      return (
        <Element key={keyPrefix} is={resolver.CanvasRow} canvas {...props}>
          {children}
        </Element>
      );
    case "container":
      return (
        <Element key={keyPrefix} is={resolver.CanvasContainer} canvas {...props}>
          <Element is={resolver.CanvasColumn} canvas>
            {children}
          </Element>
        </Element>
      );
    case "widget":
      return (
        <Element
          key={keyPrefix}
          is={resolver.CanvasWidgetSlot}
          widgetKey={definition.widgetKey}
          span={definition.span || 6}
          sizing={definition.sizing || "fill"}
          width={definition.width ?? null}
          height={definition.height ?? null}
          fixedHeight={definition.fixedHeight || null}
          style={definition.style || {}}
          condition={definition.condition || null}
          repeat={definition.repeat || null}
          hideMode={definition.hideMode || null}
          keepMounted={!!definition.keepMounted}
          responsive={definition.responsive || null}
          locked={false}
        />
      );
    case "stack":
      return (
        <Element key={keyPrefix} is={resolver.CanvasStack} canvas {...props}>
          {children}
        </Element>
      );
    case "z-stack":
      return (
        <Element key={keyPrefix} is={resolver.CanvasZStack} canvas {...props}>
          {children}
        </Element>
      );
    case "column":
      return (
        <Element key={keyPrefix} is={resolver.CanvasColumn} canvas {...props}>
          {children}
        </Element>
      );
    default:
      return null;
  }
}

function buildTemplateTree(query, template) {
  const resolver = query.getOptions().resolver;
  return query
    .parseReactElement(buildTemplateElement(template.tree, resolver))
    .toNodeTree();
}

/**
 * Section templates are row-based; find the nearest column that may legally
 * contain a row (page root, a container's inner column, or an ancestor).
 */
function findTemplateColumn(query, nodeId) {
  let current = nodeId;
  for (let depth = 0; current && depth < 60; depth += 1) {
    let node = null;
    try {
      node = query.node(current).get();
    } catch {
      return "ROOT";
    }
    if (!node) return "ROOT";
    const displayName = node.data.displayName;
    if (displayName === "CanvasColumn") return current;
    if (displayName === "CanvasContainer") {
      const columnId = (node.data.nodes || [])[0];
      if (columnId) return columnId;
    }
    current = node.data.parent;
  }
  return "ROOT";
}

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

  const registerWidgetKeys = useCallback(
    (keys) => {
      if (!setWidgets || !Array.isArray(keys) || keys.length === 0) return;
      setWidgets((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        for (const key of keys) {
          if (!next.includes(key)) next.push(key);
        }
        return next;
      });
    },
    [setWidgets]
  );

  /** Insert a saved snippet into the nearest legal column. */
  const insertSnippetIntoColumn = useCallback(
    ({ targetNodeId, snippetTree }) => {
      if (!snippetTree) return null;
      const remapped = remapSnippetWidgetKeys(
        snippetTree,
        collectCraftWidgetKeys(query)
      );
      const columnId = findTemplateColumn(query, targetNodeId);
      const tree = buildTemplateTree(query, { tree: remapped.tree });
      actions.addNodeTree(tree, columnId);
      actions.selectNode(tree.rootNodeId);
      registerWidgetKeys(remapped.widgetKeys);
      return tree;
    },
    [query, actions, registerWidgetKeys]
  );

  const updateIndicatorAt = useCallback(
    (targetEl, clientX, clientY) => {
      const found = findCraftCanvasNode(query, targetEl);
      if (!found) {
        setDropIndicator(null);
        return;
      }

      let nodeId = found.nodeId;
      let displayName = found.displayName;

      if (displayName === "CanvasStack") {
        try {
          const stackNode = query.node(nodeId).get();
          const parentId = stackNode?.data?.parent;
          if (parentId) {
            const parentNode = query.node(parentId).get();
            if (parentNode?.data?.displayName === "CanvasZStack") {
              nodeId = parentId;
              displayName = "CanvasZStack";
            }
          }
        } catch {
          /* ignore */
        }
      }

      if (displayName === "CanvasZStack") {
        try {
          const zStackNode = query.node(nodeId).get();
          const childIds = zStackNode?.data?.nodes || [];
          let activeIndex = zStackNode?.data?.props?.activeLayerIndex;
          if (activeIndex === undefined || activeIndex === null) activeIndex = 0;
          const layerId = childIds[activeIndex];
          if (layerId) {
            const layerNode = query.node(layerId).get();
            const layerChildIds = layerNode?.data?.nodes || [];
            const layerEl = document.getElementById(layerId);
            const index = layerEl
              ? computeInsertionIndex(query, layerId, "CanvasStack", layerEl, clientX, clientY, layerChildIds)
              : layerChildIds.length;
            setDropIndicator({ nodeId: layerId, index, displayName: "CanvasStack" });
            return;
          }
        } catch {
          /* ignore */
        }
      }

      try {
        const targetNode = query.node(nodeId).get();
        const childIds = targetNode?.data?.nodes || [];
        const targetNodeEl = document.getElementById(nodeId) || targetEl;
        const index = targetNodeEl
          ? computeInsertionIndex(query, nodeId, displayName, targetNodeEl, clientX, clientY, childIds)
          : childIds.length;
        setDropIndicator({ nodeId, index, displayName });
      } catch {
        setDropIndicator(null);
      }
    },
    [query]
  );

  const performDrop = useCallback(
    ({ targetEl, clientX, clientY, widgetKey, layoutType, templateId, snippetTree }) => {
      clearDropIndicator();
      if (!enabled) return;
      if (!widgetKey && !layoutType && !templateId && !snippetTree) return;

      const found = findCraftCanvasNode(query, targetEl);
      let targetNodeId = found?.nodeId ?? "ROOT";
      let targetDisplayName = found?.displayName ?? "CanvasColumn";

      // Section snippets are structural rows. Insert them into the nearest
      // legal column instead of trying to nest a row inside a row/stack.
      if (templateId || snippetTree) {
        if (snippetTree) {
          try {
            insertSnippetIntoColumn({ targetNodeId, snippetTree });
          } catch (err) {
            console.error("[Html5DropBridge] Snippet insert failed:", err);
          }
          return;
        }
        const template = findSectionTemplate(templateId);
        if (!template?.tree) return;
        try {
          const columnId = findTemplateColumn(query, targetNodeId);
          const tree = buildTemplateTree(query, template);
          actions.addNodeTree(tree, columnId);
          actions.selectNode(tree.rootNodeId);
        } catch (err) {
          console.error("[Html5DropBridge] Template insert failed:", err);
        }
        return;
      }

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
            /* eslint-disable react/prop-types */
            actions.setProp(zStackId, (props) => {
              props.activeLayerIndex = freshChildIds.length - 1;
              if (!Array.isArray(props.layerOpacities)) props.layerOpacities = [];
              props.layerOpacities[freshChildIds.length - 1] = 1;
            });
            /* eslint-enable react/prop-types */
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
                ? computeInsertionIndex(query, layerId, "CanvasStack", layerEl, clientX, clientY, layerChildIds)
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
      const targetNodeEl = document.getElementById(targetNodeId);
      const insertIndex = targetNodeEl
        ? computeInsertionIndex(query, targetNodeId, targetDisplayName, targetNodeEl, clientX, clientY, targetChildIds)
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
                ? computeInsertionIndex(query, columnId, "CanvasColumn", colEl, clientX, clientY, colChildIds)
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
    [query, actions, setWidgets, enabled, clearDropIndicator, insertSnippetIntoColumn]
  );

  const handleDrop = useCallback(
    (event) => {
      const widgetKey = event.dataTransfer?.getData("widget");
      const layoutType = event.dataTransfer?.getData("layout-type");
      const templateId = event.dataTransfer?.getData("template-id");
      if (!widgetKey && !layoutType && !templateId) return;
      event.preventDefault();
      event.stopPropagation();
      performDrop({
        targetEl: event.target,
        clientX: event.clientX,
        clientY: event.clientY,
        widgetKey,
        layoutType,
        templateId,
      });
    },
    [performDrop]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeCanvasDrag(({ phase, event, state }) => {
      const canvasEl = document.getElementById("craft-canvas-root");
      if (!canvasEl || !state) return;

      if (phase === "move" && event) {
        const targetEl = document.elementFromPoint(event.clientX, event.clientY);
        if (targetEl && canvasEl.contains(targetEl)) {
          updateIndicatorAt(targetEl, event.clientX, event.clientY);
        } else {
          setDropIndicator(null);
        }
        return;
      }

      if (phase === "end" && event) {
        const targetEl = document.elementFromPoint(event.clientX, event.clientY);
        if (!targetEl || !canvasEl.contains(targetEl)) {
          clearDropIndicator();
          return;
        }
        const payload = state.payload || {};
        performDrop({
          targetEl,
          clientX: event.clientX,
          clientY: event.clientY,
          widgetKey: payload.kind === "widget" ? payload.widgetKey : null,
          layoutType: payload.kind === "layout" ? payload.layoutType : null,
          templateId: payload.kind === "template" ? payload.templateId : null,
          snippetTree: payload.kind === "snippet" ? payload.tree : null,
        });
        return;
      }

      if (phase === "cancel") clearDropIndicator();
    });
  }, [enabled, performDrop, updateIndicatorAt, clearDropIndicator]);

  useEffect(() => {
    if (!enabled) return;
    const canvasEl = document.getElementById("craft-canvas-root");
    if (!canvasEl) return;

    const nativeDragOver = (e) => {
      if (
        e.dataTransfer?.types?.includes("widget") ||
        e.dataTransfer?.types?.includes("layout-type") ||
        e.dataTransfer?.types?.includes("template-id")
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

  // Palette "insert" (click) support for built-in templates and saved snippets.
  useEffect(() => {
    if (!enabled) return undefined;
    const insertTemplateTree = (treeDefinition) => {
      if (!treeDefinition?.tree) return;
      try {
        const selected = query.getEvent("selected").first();
        const columnId = findTemplateColumn(query, selected || "ROOT");
        const tree = buildTemplateTree(query, treeDefinition);
        actions.addNodeTree(tree, columnId);
        actions.selectNode(tree.rootNodeId);
      } catch (err) {
        console.error("[Html5DropBridge] Template insert failed:", err);
      }
    };
    const onInsertTemplate = (event) => {
      insertTemplateTree(findSectionTemplate(event.detail?.templateId));
    };
    const onInsertSnippet = (event) => {
      try {
        const selected = query.getEvent("selected").first();
        insertSnippetIntoColumn({
          targetNodeId: selected || "ROOT",
          snippetTree: event.detail?.tree,
        });
      } catch (err) {
        console.error("[Html5DropBridge] Snippet insert failed:", err);
      }
    };
    window.addEventListener("craft-insert-template", onInsertTemplate);
    window.addEventListener("craft-insert-snippet", onInsertSnippet);
    return () => {
      window.removeEventListener("craft-insert-template", onInsertTemplate);
      window.removeEventListener("craft-insert-snippet", onInsertSnippet);
    };
  }, [enabled, query, actions, insertSnippetIntoColumn]);

  // Render visual drop indicator overlay
  if (!dropIndicator || !enabled) return null;

  const targetEl = document.getElementById(dropIndicator.nodeId);
  if (!targetEl) return null;

  const targetNode = query.node(dropIndicator.nodeId).get();
  const childIds = targetNode?.data?.nodes || [];
  const indicatorChildId = childIds[Math.min(dropIndicator.index, childIds.length - 1)];
  const canvasRect = document.getElementById("craft-canvas-root")?.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  let snapGuides = null;
  if (dropIndicator.displayName === "CanvasRow" && canvasRect) {
    const gap = parseFloat(getComputedStyle(targetEl).gap) || 8;
    const usableWidth = targetRect.width - 11 * gap;
    const columnWidth = Math.max(1, usableWidth / 12);
    snapGuides = Array.from({ length: 12 }).map((_, index) => (
      <div
        key={`snap-${index}`}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${targetRect.left - canvasRect.left + index * (columnWidth + gap)}px`,
          top: `${targetRect.top - canvasRect.top}px`,
          width: `${columnWidth}px`,
          height: `${targetRect.height}px`,
          borderLeft: "1px solid hsl(var(--primary) / 0.22)",
          borderRight: index === 11 ? "1px solid hsl(var(--primary) / 0.22)" : "none",
          backgroundColor: "hsl(var(--primary) / 0.035)",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
    ));
  }

  let indicatorStyle = { display: "none" };

  if (childIds.length === 0 || dropIndicator.displayName === "CanvasZStack") {
    // Highlight the empty container or Z-Stack layer addition
    const rect = targetRect;
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
    <>
      {snapGuides}
      <div
        id="craft-html5-drop-overlay"
        style={indicatorStyle}
      />
    </>
  );
}

Html5DropBridge.propTypes = {
  setWidgets: PropTypes.func,
};
