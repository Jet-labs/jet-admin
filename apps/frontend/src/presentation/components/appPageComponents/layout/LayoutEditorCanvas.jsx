import React, { useState } from "react";
import {
  findNodeById,
  findParentOf,
  addWidgetToRow,
  removeNode,
  moveNode,
  setNodeSizing,
  setNodeSpan,
  addRow,
  wrapInContainer,
  unwrapContainer,
  wrapInZStack,
  addWidgetToZStack,
  setNodeStyle,
  setNodeCondition,
  setNodeRepeat,
} from "./layoutEngine.js";
import { createRowNode, createWidgetNode } from "./layoutDefaults.js";
import LayoutDropIndicator from "./LayoutDropIndicator.jsx";
import LayoutResizeHandle from "./LayoutResizeHandle.jsx";
import LayoutNodeToolbar from "./LayoutNodeToolbar.jsx";
import { Lock, GripVertical, Eye, Repeat } from "lucide-react";
import "./layout.css";

/**
 * Small inline badge shown on layout nodes that have condition or repeat configured.
 */
const LogicBadges = ({ node }) => {
  const hasCondition = !!node.condition;
  const hasRepeat = !!node.repeat;
  if (!hasCondition && !hasRepeat) return null;

  return (
    <div className="flex items-center gap-1 ml-1">
      {hasCondition && (
        <span
          className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[8px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30"
          title={`Condition: ${node.condition}`}
        >
          <Eye style={{ width: 8, height: 8 }} />
          If
        </span>
      )}
      {hasRepeat && (
        <span
          className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[8px] font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30"
          title={`Repeat: ${node.repeat.collection} as ${node.repeat.itemAlias}`}
        >
          <Repeat style={{ width: 8, height: 8 }} />
          Loop
        </span>
      )}
    </div>
  );
};

export default function LayoutEditorCanvas({
  layout,
  onChangeLayout,
  renderWidget,
  tenantID,
  widgets,
  setWidgets,
  onEditWidget,
}) {
  const [activeNode, setActiveNode] = useState(null);
  const [lockedNodeIds, setLockedNodeIds] = useState(new Set());
  const [draggableNodeId, setDraggableNodeId] = useState(null);
  const [activeLayers, setActiveLayers] = useState({});

  const handleToggleLock = (nodeId) => {
    let nowLocked = false;
    setLockedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        nowLocked = false;
      } else {
        next.add(nodeId);
        nowLocked = true;
      }
      return next;
    });
    if (nowLocked) {
      setActiveNode(null);
    } else {
      setActiveNode(findNodeById(layout, nodeId));
    }
  };

  // Layout Engine Callback Wrappers
  const handleUpdateSizing = (nodeId, sizing, fixedHeight) => {
    const updated = setNodeSizing(layout, nodeId, sizing, fixedHeight);
    onChangeLayout(updated);
    if (activeNode?.id === nodeId) {
      setActiveNode(findNodeById(updated, nodeId));
    }
  };

  const handleUpdateStyle = (nodeId, style) => {
    const updated = setNodeStyle(layout, nodeId, style);
    onChangeLayout(updated);
    if (activeNode?.id === nodeId) {
      setActiveNode(findNodeById(updated, nodeId));
    }
  };

  const handleUpdateSpan = (nodeId, span) => {
    const updated = setNodeSpan(layout, nodeId, span);
    onChangeLayout(updated);
  };

  const handleWrap = (nodeId) => {
    const updated = wrapInContainer(layout, [nodeId]);
    onChangeLayout(updated);
    setActiveNode(null);
  };

  const handleUnwrap = (containerId) => {
    const updated = unwrapContainer(layout, containerId);
    onChangeLayout(updated);
    setActiveNode(null);
  };

  const handleWrapZStack = (nodeId) => {
    const updated = wrapInZStack(layout, [nodeId]);
    onChangeLayout(updated);
    setActiveNode(null);
  };

  const handleUnwrapZStack = (zStackId) => {
    // Pull all children of the z-stack back into the parent row
    const zStack = findNodeById(layout, zStackId);
    if (!zStack || zStack.type !== "z-stack") return;
    const parentInfo = findParentOf(layout, zStackId);
    if (!parentInfo || parentInfo.parent.type !== "row") return;

    const newRoot = JSON.parse(JSON.stringify(layout));
    const parentRow = findNodeById(newRoot, parentInfo.parent.id);
    const idx = parentRow.children.findIndex((c) => c.id === zStackId);
    if (idx === -1) return;

    const innerNodes = (zStack.children || []).map((child) => ({
      ...child,
      span: zStack.span || 12,
      sizing: "fill",
    }));
    parentRow.children.splice(idx, 1, ...innerNodes);
    onChangeLayout(newRoot);
    setActiveNode(null);
  };

  const handleDelete = (nodeId) => {
    const node = findNodeById(layout, nodeId);
    const updated = removeNode(layout, nodeId);
    onChangeLayout(updated);
    setActiveNode(null);

    // If deleting a widget, we should remove it from the widgets list
    if (node && node.type === "widget" && widgets && setWidgets) {
      const idx = widgets.indexOf(node.widgetKey);
      if (idx !== -1) {
        const nextWidgets = [...widgets];
        nextWidgets.splice(idx, 1);
        setWidgets(nextWidgets);
      }
    }
  };

  // ── Condition & Repeat Handlers ──
  const handleUpdateCondition = (nodeId, condition) => {
    const updated = setNodeCondition(layout, nodeId, condition);
    onChangeLayout(updated);
    if (activeNode?.id === nodeId) {
      setActiveNode(findNodeById(updated, nodeId));
    }
  };

  const handleUpdateRepeat = (nodeId, repeat) => {
    const updated = setNodeRepeat(layout, nodeId, repeat);
    onChangeLayout(updated);
    if (activeNode?.id === nodeId) {
      setActiveNode(findNodeById(updated, nodeId));
    }
  };

  const handleDropNewWidget = (widgetKey, targetRowId, targetIndex) => {
    let updated = addWidgetToRow(layout, targetRowId, widgetKey, 6, "fill", targetIndex);
    onChangeLayout(updated);

    // Add to widgets list
    if (widgets && setWidgets) {
      setWidgets([...widgets, widgetKey]);
    }
  };

  const handleMoveWidget = (nodeId, targetRowId, targetIndex) => {
    const updated = moveNode(layout, nodeId, targetRowId, targetIndex);
    onChangeLayout(updated);
  };

  const handleDropOnRowIndicator = (action, afterRowId) => {
    // If the node being moved is a row, reorder it directly under the column
    if (action.type === "move") {
      const nodeToMove = findNodeById(layout, action.nodeId);
      if (nodeToMove && nodeToMove.type === "row") {
        const newRoot = JSON.parse(JSON.stringify(layout));
        const indexToRemove = newRoot.children.findIndex((r) => r.id === action.nodeId);
        if (indexToRemove !== -1) {
          const [rowNode] = newRoot.children.splice(indexToRemove, 1);
          let insertIndex = 0;
          if (afterRowId) {
            const afterIdx = newRoot.children.findIndex((r) => r.id === afterRowId);
            insertIndex = afterIdx !== -1 ? afterIdx + 1 : 0;
          }
          newRoot.children.splice(insertIndex, 0, rowNode);
          onChangeLayout(newRoot);
        }
        return;
      }
    }

    // 1. Create a new empty row
    let updated = addRow(layout, afterRowId);
    const parentCol = updated; // Root is column
    const newRowIndex = afterRowId
      ? parentCol.children.findIndex((r) => r.id === afterRowId) + 1
      : 0;
    const newRow = parentCol.children[newRowIndex];

    // 2. Perform the drop action in the new row
    if (action.type === "new") {
      updated = addWidgetToRow(updated, newRow.id, action.widgetKey, 12, "fill");
      if (widgets && setWidgets) {
        setWidgets([...widgets, action.widgetKey]);
      }
    } else if (action.type === "move") {
      updated = moveNode(updated, action.nodeId, newRow.id, 0);
    }
    onChangeLayout(updated);
  };

  // Recursive Editor Renderer
  const renderEditorNode = (node, parentRowId = null, childIndex = 0) => {
    if (!node) return null;

    const isActive = activeNode?.id === node.id;

    switch (node.type) {
      case "column":
        return (
          <div className="layout-column" id={node.id}>
            {/* Drop before the first row */}
            <LayoutDropIndicator
              type="row"
              onDropNode={(action) => handleDropOnRowIndicator(action, null)}
            />
            {node.children?.map((child, index) => (
              <React.Fragment key={child.id}>
                {renderEditorNode(child)}
                {/* Drop after this row */}
                <LayoutDropIndicator
                  type="row"
                  onDropNode={(action) => handleDropOnRowIndicator(action, child.id)}
                />
              </React.Fragment>
            ))}
          </div>
        );

      case "row":
        const totalSpan = node.children ? node.children.reduce((acc, child) => acc + (child.span || 6), 0) : 0;
        const hasChildren = node.children && node.children.length > 0;
        const rowSizingClass = `sizing-${node.sizing || "auto"}`;
        const rowStyle = {};
        if (node.sizing === "fixed" && node.fixedHeight) {
          rowStyle["--fixed-height"] = `${node.fixedHeight}px`;
          rowStyle.height = `${node.fixedHeight}px`;
        }

        return (
          <div
            className={`layout-row layout-row-edit ${rowSizingClass} ${isActive ? "active-node" : ""}`}
            style={rowStyle}
            id={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable={draggableNodeId === node.id}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Real React element for label & grab handle - replaces pseudo ::before */}
            <div className="layout-node-header">
              <div
                className="layout-node-grip"
                onMouseEnter={() => setDraggableNodeId(node.id)}
                onMouseLeave={() => setDraggableNodeId(null)}
                title="Drag row to reorder"
              >
                <GripVertical className="h-2.5 w-2.5" />
                <span>ROW</span>
              </div>
              <LogicBadges node={node} />
            </div>

            {/* Node Action Toolbar for Row */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onWrapZStack={handleWrapZStack}
                onUnwrapZStack={handleUnwrapZStack}
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
                onUpdateCondition={handleUpdateCondition}
                onUpdateRepeat={handleUpdateRepeat}
                onClose={() => setActiveNode(null)}
              />
            )}

            {hasChildren ? (
              (() => {
                let currentLineSpan = 0;
                const gridCells = [];
                node.children.forEach((child, idx) => {
                  const childSpan = child.span || 6;
                  if (currentLineSpan + childSpan > 12) {
                    const holeSpan = 12 - currentLineSpan;
                    if (holeSpan > 0) {
                      gridCells.push(
                        <LayoutDropIndicator
                          key={`hole-before-${child.id}`}
                          type="cell"
                          className={`layout-row-remaining-drop col-span-${holeSpan}`}
                          onDropNode={(action) => {
                            if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, idx);
                            else handleMoveWidget(action.nodeId, node.id, idx);
                          }}
                        >
                          + Add Widget
                        </LayoutDropIndicator>
                      );
                    }
                    currentLineSpan = 0;
                  }
                  
                  currentLineSpan += childSpan;
                  gridCells.push(
                    <React.Fragment key={child.id}>
                      {renderEditorNode(child, node.id, idx)}
                    </React.Fragment>
                  );
                });

                const finalHoleSpan = 12 - currentLineSpan;
                if (finalHoleSpan > 0) {
                  gridCells.push(
                    <LayoutDropIndicator
                      key="hole-trailing"
                      type="cell"
                      className={`layout-row-remaining-drop col-span-${finalHoleSpan}`}
                      onDropNode={(action) => {
                        if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, node.children.length);
                        else handleMoveWidget(action.nodeId, node.id, node.children.length);
                      }}
                    >
                      + Add Widget
                    </LayoutDropIndicator>
                  );
                }
                return <>{gridCells}</>;
              })()
            ) : (
              <LayoutDropIndicator
                type="cell"
                className="layout-row-empty-drop"
                onDropNode={(action) => {
                  if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, 0);
                  else handleMoveWidget(action.nodeId, node.id, 0);
                }}
              >
                Drag and drop a widget here to populate row
              </LayoutDropIndicator>
            )}
          </div>
        );

      case "widget":
        const isLocked = lockedNodeIds.has(node.id);
        const spanClass = `col-span-${node.span || 6}`;
        const sizingClass = `sizing-${node.sizing || "fill"}`;
        const slotStyle = {
          padding: node.style?.padding,
          margin: node.style?.margin,
          borderRadius: node.style?.borderRadius,
          ...(node.style || {}),
        };
        if (node.sizing === "fixed" && node.fixedHeight) {
          slotStyle["--fixed-height"] = `${node.fixedHeight}px`;
        }

        return (
          <div
            className={`layout-widget-slot layout-widget-slot-edit ${spanClass} ${sizingClass} ${
              isActive && !isLocked ? "active-node" : ""
            } ${isLocked ? "layout-widget-locked" : ""}`}
            style={slotStyle}
            id={node.id}
            onClick={(e) => {
              if (isLocked) return;
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable={!isLocked}
            onDragStart={(e) => {
              e.stopPropagation(); // CRITICAL: Stop bubbling to prevent row drag start!
              if (isLocked) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Absolute positioning left/right drop indicators */}
            {parentRowId && (
              <>
                <LayoutDropIndicator
                  type="cell-left"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex);
                  }}
                />
                <LayoutDropIndicator
                  type="cell-right"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex + 1);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex + 1);
                  }}
                />
              </>
            )}
            {/* Tiny interactive lock button on the top outside edge */}
            <div className="absolute right-0 top-0 -translate-y-full z-50">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(node.id);
                }}
                className={`shadow-sm rounded-t-[3px] rounded-b-none border border-b-0 flex items-center justify-center transition-all ${
                  isLocked
                    ? "bg-amber-500 hover:bg-amber-600 text-foreground border-amber-400"
                    : "bg-background hover:bg-muted text-muted-foreground border-border hover:text-foreground"
                }`}
                style={{ width: "32px", height: "12px", padding: "0" }}
                title={isLocked ? "Unlock widget layout" : "Lock layout & interact with widget"}
              >
                <Lock style={{ width: "7px", height: "7px" }} />
              </button>
            </div>

            {/* Node Action Toolbar */}
            {isActive && !isLocked && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onWrapZStack={handleWrapZStack}
                onUnwrapZStack={handleUnwrapZStack}
                onDelete={handleDelete}
                onToggleLock={handleToggleLock}
                onUpdateStyle={handleUpdateStyle}
                onUpdateCondition={handleUpdateCondition}
                onUpdateRepeat={handleUpdateRepeat}
                onClose={() => setActiveNode(null)}
                onEditWidget={onEditWidget}
              />
            )}

            {/* Resize Handle */}
            {!isLocked && <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />}

            <div
              className={`layout-widget-wrapper h-full w-full ${
                isLocked ? "pointer-events-auto" : "pointer-events-none select-none"
              }`}
              style={{
                borderRadius: node.style?.borderRadius,
                padding: node.style?.padding,
                margin: node.style?.margin,
                overflow: node.style?.borderRadius ? "hidden" : undefined,
              }}
            >
              {renderWidget(node.widgetKey, node.sizing)}
            </div>
          </div>
        );

      case "container":
        const containerSpan = `col-span-${node.span || 12}`;
        const containerSizing = `sizing-${node.sizing || "auto"}`;
        const containerStyle = {
          padding: node.style?.padding,
          margin: node.style?.margin,
          borderRadius: node.style?.borderRadius,
          overflow: node.style?.borderRadius ? "hidden" : undefined,
          ...(node.style || {}),
        };
        if (node.sizing === "fixed" && node.fixedHeight) {
          containerStyle["--fixed-height"] = `${node.fixedHeight}px`;
        }

        return (
          <div
            className={`layout-container layout-container-edit ${containerSpan} ${containerSizing} ${
              isActive ? "active-node" : ""
            }`}
            style={containerStyle}
            id={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable={draggableNodeId === node.id}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Real React element for label & grab handle - replaces pseudo ::before */}
            <div className="layout-node-header">
              <div
                className="layout-node-grip"
                onMouseEnter={() => setDraggableNodeId(node.id)}
                onMouseLeave={() => setDraggableNodeId(null)}
                title="Drag container to reorder"
              >
                <GripVertical className="h-2.5 w-2.5" />
                <span>CONTAINER</span>
              </div>
              <LogicBadges node={node} />
            </div>

            {/* Absolute positioning left/right drop indicators */}
            {parentRowId && (
              <>
                <LayoutDropIndicator
                  type="cell-left"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex);
                  }}
                />
                <LayoutDropIndicator
                  type="cell-right"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex + 1);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex + 1);
                  }}
                />
              </>
            )}
            {/* Node Action Toolbar */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onWrapZStack={handleWrapZStack}
                onUnwrapZStack={handleUnwrapZStack}
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
                onUpdateCondition={handleUpdateCondition}
                onUpdateRepeat={handleUpdateRepeat}
                onClose={() => setActiveNode(null)}
              />
            )}

            {/* Resize Handle */}
            <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />

            {renderEditorNode(node.children)}
          </div>
        );

      case "stack":
        const stackSpan = `col-span-${node.span || 12}`;
        const stackSizing = `sizing-${node.sizing || "auto"}`;
        const stackStyle = {
          flexDirection: node.direction === "horizontal" ? "row" : "column",
          flexWrap: node.wrap ? "wrap" : "nowrap",
          gap: node.style?.gap ?? (typeof node.gap === "number" ? `${node.gap}px` : "8px"),
          alignItems: node.style?.alignItems ?? node.align ?? "stretch",
          padding: node.style?.padding,
          margin: node.style?.margin,
          borderRadius: node.style?.borderRadius,
          ...(node.style || {}),
        };
        if (node.sizing === "fixed" && node.fixedHeight) {
          stackStyle["--fixed-height"] = `${node.fixedHeight}px`;
        }

        return (
          <div
            className={`layout-stack layout-stack-edit ${stackSpan} ${stackSizing} ${
              isActive ? "active-node" : ""
            }`}
            style={stackStyle}
            id={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable={draggableNodeId === node.id}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Real React element for label & grab handle - replaces pseudo ::before */}
            <div className="layout-node-header">
              <div
                className="layout-node-grip"
                onMouseEnter={() => setDraggableNodeId(node.id)}
                onMouseLeave={() => setDraggableNodeId(null)}
                title="Drag stack to reorder"
              >
                <GripVertical className="h-2.5 w-2.5" />
                <span>STACK</span>
              </div>
              <LogicBadges node={node} />
            </div>

            {/* Absolute positioning left/right drop indicators */}
            {parentRowId && (
              <>
                <LayoutDropIndicator
                  type="cell-left"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex);
                  }}
                />
                <LayoutDropIndicator
                  type="cell-right"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex + 1);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex + 1);
                  }}
                />
              </>
            )}
            {/* Node Action Toolbar */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onWrapZStack={handleWrapZStack}
                onUnwrapZStack={handleUnwrapZStack}
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
                onUpdateCondition={handleUpdateCondition}
                onUpdateRepeat={handleUpdateRepeat}
                onClose={() => setActiveNode(null)}
              />
            )}

            {/* Resize Handle */}
            <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />

            {node.children && node.children.length > 0 ? (
              node.children.map((child) => renderEditorNode(child))
            ) : (
              <LayoutDropIndicator
                type="cell"
                className="layout-row-empty-drop"
                onDropNode={(action) => {
                  if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, 0);
                  else handleMoveWidget(action.nodeId, node.id, 0);
                }}
              >
                Empty Stack (Drop widgets here)
              </LayoutDropIndicator>
            )}
          </div>
        );

      case "z-stack": {
        const zStackSpan = `col-span-${node.span || 12}`;
        const zStackSizing = `sizing-${node.sizing || "fill"}`;
        const zStackStyle = {
          padding: node.style?.padding,
          margin: node.style?.margin,
          borderRadius: node.style?.borderRadius,
          ...(node.style || {}),
        };
        if (node.sizing === "fixed" && node.fixedHeight) {
          zStackStyle["--fixed-height"] = `${node.fixedHeight}px`;
        }

        const handleDropOnZStack = (action) => {
          if (action.type === "new") {
            // action.widgetKey = "widget_<uuid>_<timestamp>" from the widget drag
            const updated = addWidgetToZStack(layout, node.id, action.widgetKey);
            onChangeLayout(updated);
            if (widgets && setWidgets) setWidgets([...widgets, action.widgetKey]);

            // Automatically focus the newly added layer
            const newIndex = (node.children?.length || 0);
            setActiveLayers(prev => ({ ...prev, [node.id]: newIndex }));
          } else if (action.type === "move") {
            const sourceNode = findNodeById(layout, action.nodeId);
            if (!sourceNode) return;
            if (!["widget", "container", "stack", "z-stack"].includes(sourceNode.type)) return;

            const newRoot = JSON.parse(JSON.stringify(layout));
            const parentInfo = findParentOf(newRoot, action.nodeId);
            if (parentInfo && Array.isArray(parentInfo.parent.children)) {
              parentInfo.parent.children.splice(parentInfo.index, 1);
            }
            const targetZStack = findNodeById(newRoot, node.id);
            if (targetZStack) {
              if (!Array.isArray(targetZStack.children)) targetZStack.children = [];
              targetZStack.children.push(JSON.parse(JSON.stringify(sourceNode)));
            }
            onChangeLayout(newRoot);

            // Focus the moved layer
            const newIndex = (targetZStack?.children?.length || 1) - 1;
            setActiveLayers(prev => ({ ...prev, [node.id]: newIndex }));
          }
        };

        const hasLayers = node.children && node.children.length > 0;
        const activeLayerIndex = Math.min(
          activeLayers[node.id] || 0,
          Math.max(0, (node.children?.length || 1) - 1)
        );

        return (
          <div
            className={`layout-z-stack layout-z-stack-edit ${zStackSpan} ${zStackSizing} ${
              isActive ? "active-node" : ""
            }`}
            style={zStackStyle}
            id={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable={draggableNodeId === node.id}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Header label & Layer Tabs */}
            <div className="layout-node-header flex flex-col gap-1.5 p-1 bg-muted/20 border-b border-border/40 rounded-t">
              <div className="flex items-center justify-between w-full">
                <div
                  className="layout-node-grip"
                  onMouseEnter={() => setDraggableNodeId(node.id)}
                  onMouseLeave={() => setDraggableNodeId(null)}
                  title="Drag z-stack to reorder"
                >
                  <GripVertical className="h-2.5 w-2.5" />
                  <span>Z-STACK</span>
                </div>
                <LogicBadges node={node} />
              </div>

              {/* Layer Selection Tabs */}
              {hasLayers && (
                <div className="flex flex-wrap gap-1 items-center mt-1 border-t border-border/20 pt-1.5 w-full">
                  {node.children.map((child, idx) => (
                    <button
                      key={child.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLayers(prev => ({ ...prev, [node.id]: idx }));
                      }}
                      className={`px-2 py-0.5 text-[10px] rounded transition-all select-none ${
                        activeLayerIndex === idx
                          ? "bg-primary text-primary-foreground shadow-sm font-semibold border border-primary/20"
                          : "bg-background/50 hover:bg-background text-muted-foreground hover:text-foreground border border-border/30"
                      }`}
                    >
                      Layer {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Left/right drop indicators for reordering within parent row */}
            {parentRowId && (
              <>
                <LayoutDropIndicator
                  type="cell-left"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex);
                  }}
                />
                <LayoutDropIndicator
                  type="cell-right"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, parentRowId, childIndex + 1);
                    else handleMoveWidget(action.nodeId, parentRowId, childIndex + 1);
                  }}
                />
              </>
            )}

            {/* Node Action Toolbar */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onWrapZStack={handleWrapZStack}
                onUnwrapZStack={handleUnwrapZStack}
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
                onUpdateCondition={handleUpdateCondition}
                onUpdateRepeat={handleUpdateRepeat}
                onClose={() => setActiveNode(null)}
              />
            )}

            {/* Resize handle */}
            <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />

            {/*
             * ── Editor Layers Overlapping Container ──────────────────────────
             * All layers stack inside a single CSS grid cell. The active layer index is fully
             * interactive (pointer-events: auto, opacity: 1), while other layers are ghosted 
             * in the background (opacity: 0.15, pointer-events: none) so they don't block clicks.
             */}
            {hasLayers && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100%",
                  gridTemplateRows: "100%",
                  width: "100%",
                  overflow: "visible",
                  minHeight: 80,
                }}
              >
                {node.children.map((child, idx) => {
                  const isLayerActive = idx === activeLayerIndex;
                  return (
                    <div
                      key={child.id}
                      style={{
                        gridArea: "1 / 1 / 2 / 2",
                        width: "100%",
                        zIndex: isLayerActive ? 10 : 1,
                        opacity: isLayerActive ? 1 : 0.15,
                        pointerEvents: isLayerActive ? "auto" : "none",
                        transition: "opacity 0.2s ease, z-index 0.2s ease",
                        position: "relative",
                        boxSizing: "border-box",
                        overflow: "visible",
                      }}
                    >
                      {/* Layer number badge */}
                      <span className="layout-z-stack-layer-badge">Layer {idx + 1}</span>
                      {renderEditorNode(child)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drop zone — always in flow, never covered by layers */}
            <LayoutDropIndicator
              type="cell"
              className="layout-row-empty-drop"
              style={{ marginTop: hasLayers ? 4 : 0, flexShrink: 0 }}
              onDropNode={handleDropOnZStack}
            >
              {hasLayers ? "+ Add Layer" : "Drop widgets here to stack as layers"}
            </LayoutDropIndicator>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className="layout-editor-canvas-container h-full min-h-full w-full overflow-y-auto bg-transparent p-1"
      onClick={() => setActiveNode(null)}
    >
      {renderEditorNode(layout)}
    </div>
  );
}
