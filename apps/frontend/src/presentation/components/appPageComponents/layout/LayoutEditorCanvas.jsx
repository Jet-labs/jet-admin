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
} from "./layoutEngine.js";
import { createRowNode, createWidgetNode } from "./layoutDefaults.js";
import LayoutDropIndicator from "./LayoutDropIndicator.jsx";
import LayoutResizeHandle from "./LayoutResizeHandle.jsx";
import LayoutNodeToolbar from "./LayoutNodeToolbar.jsx";
import "./layout.css";

export default function LayoutEditorCanvas({
  layout,
  onChangeLayout,
  renderWidget,
  tenantID,
  widgets,
  setWidgets,
}) {
  const [activeNode, setActiveNode] = useState(null);

  // Layout Engine Callback Wrappers
  const handleUpdateSizing = (nodeId, sizing, fixedHeight) => {
    const updated = setNodeSizing(layout, nodeId, sizing, fixedHeight);
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
    let updated = addWidgetToRow(layout, targetRowId, widgetKey, 6, "fill");
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
  const renderEditorNode = (node) => {
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
        const hasChildren = node.children && node.children.length > 0;
        return (
          <div className="layout-row layout-row-edit" id={node.id}>
            {hasChildren ? (
              <>
                {/* Cell drop target before first item */}
                <LayoutDropIndicator
                  type="cell"
                  onDropNode={(action) => {
                    if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, 0);
                    else handleMoveWidget(action.nodeId, node.id, 0);
                  }}
                />
                {node.children.map((child, idx) => (
                  <React.Fragment key={child.id}>
                    {renderEditorNode(child)}
                    {/* Cell drop target after this item */}
                    <LayoutDropIndicator
                      type="cell"
                      onDropNode={(action) => {
                        if (action.type === "new") handleDropNewWidget(action.widgetKey, node.id, idx + 1);
                        else handleMoveWidget(action.nodeId, node.id, idx + 1);
                      }}
                    />
                  </React.Fragment>
                ))}
              </>
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
        const spanClass = `col-span-${node.span || 6}`;
        const sizingClass = `sizing-${node.sizing || "fill"}`;
        const slotStyle = {};
        if (node.sizing === "fixed" && node.fixedHeight) {
          slotStyle["--fixed-height"] = `${node.fixedHeight}px`;
        }

        return (
          <div
            className={`layout-widget-slot layout-widget-slot-edit ${spanClass} ${sizingClass} ${
              isActive ? "active-node" : ""
            }`}
            style={slotStyle}
            id={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Node Action Toolbar */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onDelete={handleDelete}
              />
            )}

            {/* Resize Handle */}
            <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />

            <div className="layout-widget-wrapper pointer-events-none select-none">
              {renderWidget(node.widgetKey, node.sizing)}
            </div>
          </div>
        );

      case "container":
        const containerSpan = `col-span-${node.span || 12}`;
        const containerSizing = `sizing-${node.sizing || "auto"}`;
        const containerStyle = { ...(node.style || {}) };
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
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("moveNodeId", node.id);
            }}
          >
            {/* Node Action Toolbar */}
            {isActive && (
              <LayoutNodeToolbar
                node={node}
                onUpdateSizing={handleUpdateSizing}
                onUpdateSpan={handleUpdateSpan}
                onWrap={handleWrap}
                onUnwrap={handleUnwrap}
                onDelete={handleDelete}
              />
            )}

            {/* Resize Handle */}
            <LayoutResizeHandle node={node} onResize={handleUpdateSpan} />

            {renderEditorNode(node.children)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="h-full min-h-full w-full overflow-y-auto bg-slate-50/50 p-4 border border-slate-200/50 rounded-lg"
      onClick={() => setActiveNode(null)}
    >
      {renderEditorNode(layout)}
    </div>
  );
}
