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
  setNodeStyle,
} from "./layoutEngine.js";
import { createRowNode, createWidgetNode } from "./layoutDefaults.js";
import LayoutDropIndicator from "./LayoutDropIndicator.jsx";
import LayoutResizeHandle from "./LayoutResizeHandle.jsx";
import LayoutNodeToolbar from "./LayoutNodeToolbar.jsx";
import { Lock, GripVertical } from "lucide-react";
import "./layout.css";

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
            </div>

            {/* Node Action Toolbar for Row */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
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
                onDelete={handleDelete}
                onToggleLock={handleToggleLock}
                onUpdateStyle={handleUpdateStyle}
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
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
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
                onDelete={handleDelete}
                onUpdateStyle={handleUpdateStyle}
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
