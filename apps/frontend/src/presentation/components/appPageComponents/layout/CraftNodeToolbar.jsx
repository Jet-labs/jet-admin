/**
 * CraftNodeToolbar.jsx -> Sidebar Settings & Layers Panel
 *
 * Full-featured sidebar layout control panel that sits to the right of the
 * editor canvas, replacing the floating and clipping popover menu.
 * Contains:
 *   - Tab 1: Properties (Spacing, Alignment, Sizing, Logic, Custom Styles)
 *   - Tab 2: Layers (Hierarchical interactive tree-view of all nodes in canvas)
 */
import React, { useState, useMemo, useEffect } from "react";
import { useEditor } from "@craftjs/core";
import {
  Trash2,
  Box,
  Layers,
  Settings2,
  Eye,
  Repeat,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignVerticalJustifyStart,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  FolderOpen,
  Code2,
  Sparkles,
  Rows,
  Columns,
  Minus,
  Plus
} from "lucide-react";
import { Label, TemplateAutocompleteInput } from "@jet-admin/ui";
import { CanvasContainer } from "./craftComponents/CanvasContainer.jsx";
import { CanvasWidgetSlot } from "./craftComponents/CanvasWidgetSlot.jsx";
import { CanvasZStack } from "./craftComponents/CanvasZStack.jsx";
import { CanvasRow } from "./craftComponents/CanvasRow.jsx";
import { CanvasStack } from "./craftComponents/CanvasStack.jsx";

// Get human readable names and icons for resolver types
function getNodeMeta(displayName, props = {}) {
  switch (displayName) {
    case "CanvasColumn":
      return { label: "Main Canvas", icon: Columns, color: "text-blue-500" };
    case "CanvasRow":
      return { label: "Grid Row", icon: Rows, color: "text-indigo-500" };
    case "CanvasWidgetSlot":
      const wk = props.widgetKey || "";
      const widgetName = wk.replace(/^widget_/, "").split("_")[0] || "Widget";
      return { label: `Widget: ${widgetName}`, icon: Code2, color: "text-amber-500" };
    case "CanvasContainer":
      return { label: "Card Container", icon: Box, color: "text-emerald-500" };
    case "CanvasStack":
      return { label: "Flex Stack", icon: Layers, color: "text-purple-500" };
    case "CanvasZStack":
      return { label: "Z-Stack", icon: Layers, color: "text-pink-500" };
    default:
      return { label: displayName || "Element", icon: Box, color: "text-muted-foreground" };
  }
}

export default function CraftSettingsPanel({
  onChangeLayout,
  widgets,
  setWidgets,
  onEditWidget,
}) {
  const [activeTab, setActiveTab] = useState("settings"); // "settings" | "layers"

  const { selectedNodeId, selectedNode, actions, query, allNodes } = useEditor((state) => {
    const id = state.events.selected?.size > 0
      ? [...state.events.selected][0]
      : null;
    return {
      selectedNodeId: id,
      selectedNode: id ? state.nodes[id] : null,
      allNodes: state.nodes,
    };
  });

  const nodeProps = selectedNode?.data?.props ?? {};
  const displayName = selectedNode?.data?.displayName ?? "";
  const parentId = selectedNode?.data?.parent;
  const parentNode = parentId ? allNodes[parentId] : null;
  const isRowChild = parentNode?.data?.displayName === "CanvasRow";

  const { label: nodeLabel, icon: NodeIcon, color: nodeColor } = useMemo(
    () => getNodeMeta(displayName, nodeProps),
    [displayName, nodeProps]
  );

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleUpdateSizing = (sizing, fixedHeight) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      props.sizing = sizing;
      props.fixedHeight = sizing === "fixed" ? (fixedHeight || 200) : null;
    });
  };

  const handleUpdateSpan = (span) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      props.span = Math.max(1, Math.min(12, span));
    });
  };

  const handleUpdateSize = (dim, value) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      // null clears the fixed dimension (fills available space)
      props[dim] = value === "" || value == null ? null : Math.max(dim === "width" ? 40 : 24, parseInt(value) || 0);
    });
  };

  const handleUpdateStyle = (styleKey, value) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      props.style = { ...(props.style || {}), [styleKey]: value };
    });
  };

  const handleUpdateCondition = (condition) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      props.condition = condition?.trim() || null;
    });
  };

  const handleUpdateRepeat = (repeatData) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      if (repeatData?.collection?.trim() && repeatData?.itemAlias?.trim()) {
        props.repeat = {
          collection: repeatData.collection.trim(),
          itemAlias: repeatData.itemAlias.trim(),
          ...(repeatData.indexAlias?.trim() ? { indexAlias: repeatData.indexAlias.trim() } : {}),
        };
      } else {
        props.repeat = null;
      }
    });
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    const key = nodeProps.widgetKey;
    actions.delete(selectedNodeId);
    actions.selectNode([]);
    if (displayName === "CanvasWidgetSlot" && key && setWidgets) {
      setWidgets((prev) => (prev || []).filter((k) => k !== key));
    }
  };

  const handleWrapInContainer = () => {
    if (!selectedNodeId) return;
    const node = query.node(selectedNodeId).get();
    const pId = node.data.parent;
    const siblingIndex = query.node(pId).get()?.data?.nodes?.indexOf(selectedNodeId) ?? 0;

    const containerTree = query
      .parseReactElement(<CanvasContainer span={nodeProps.span ?? 12} sizing={nodeProps.sizing ?? "auto"} />)
      .toNodeTree();

    actions.addNodeTree(containerTree, pId, siblingIndex);

    setTimeout(() => {
      const freshParent = query.node(pId).get();
      const newContainerId = freshParent?.data?.nodes?.[siblingIndex];
      if (newContainerId) {
        actions.move(selectedNodeId, newContainerId, 0);
        actions.selectNode(newContainerId);
      }
    }, 50);
  };

  const handleWrapInZStack = () => {
    if (!selectedNodeId) return;
    const node = query.node(selectedNodeId).get();
    const pId = node.data.parent;
    const siblingIndex = query.node(pId).get()?.data?.nodes?.indexOf(selectedNodeId) ?? 0;

    const zStackTree = query
      .parseReactElement(<CanvasZStack span={nodeProps.span ?? 12} sizing="fill" />)
      .toNodeTree();

    actions.addNodeTree(zStackTree, pId, siblingIndex);

    setTimeout(() => {
      const freshParent = query.node(pId).get();
      const newZStackId = freshParent?.data?.nodes?.[siblingIndex];
      if (newZStackId) {
        actions.move(selectedNodeId, newZStackId, 0);
        actions.selectNode(newZStackId);
      }
    }, 50);
  };

  const handleUnwrapNode = () => {
    if (!selectedNodeId) return;
    const node = query.node(selectedNodeId).get();
    const pId = node.data.parent;
    const childIds = [...(node.data.nodes || [])];
    childIds.forEach((cid, i) => actions.move(cid, pId, i));
    actions.delete(selectedNodeId);
    actions.selectNode(pId);
  };

  const handleAddZStackLayer = () => {
    if (displayName !== "CanvasZStack" || !selectedNodeId) return;
    // Add a new WidgetSlot inside the ZStack
    const widgetTree = query
      .parseReactElement(
        <Element
          is={CanvasWidgetSlot}
          widgetKey={`widget_new_${Date.now()}`}
          span={12}
          sizing="fill"
        />
      )
      .toNodeTree();
    actions.addNodeTree(widgetTree, selectedNodeId);
  };

  const handleMoveNode = (direction) => {
    if (!selectedNodeId || !parentId) return;
    const siblings = parentNode?.data?.nodes || [];
    const index = siblings.indexOf(selectedNodeId);
    if (direction === "up" && index > 0) {
      actions.move(selectedNodeId, parentId, index - 1);
    } else if (direction === "down" && index < siblings.length - 1) {
      actions.move(selectedNodeId, parentId, index + 2); // craft needs target index + 1 for drop-after
    }
  };

  // ── Layers tree walker ───────────────────────────────────────────────────────

  const renderLayersTree = (nodeId = "ROOT", depth = 0) => {
    const node = allNodes[nodeId];
    if (!node) return null;

    const hasChildren = node.data.nodes && node.data.nodes.length > 0;
    const isSelected = selectedNodeId === nodeId;
    const { label: name, icon: Icon, color: iconColor } = getNodeMeta(node.data.displayName, node.data.props);

    return (
      <div key={nodeId} className="flex flex-col">
        <div
          onClick={(e) => {
            e.stopPropagation();
            actions.selectNode(nodeId);
          }}
          className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-all ${
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20 font-medium"
              : "hover:bg-muted/50 text-foreground border border-transparent"
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 14)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : iconColor}`} />
            <span className="text-[11px] truncate">{name}</span>
          </div>
          {nodeId !== "ROOT" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.delete(nodeId);
                if (isSelected) actions.selectNode([]);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded transition-all"
              title="Delete Element"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        {hasChildren && node.data.nodes.map((cid) => renderLayersTree(cid, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className="w-[320px] border-l border-border/50 bg-card flex flex-col h-full shrink-0 z-40"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sidebar Tabs */}
      <div className="flex border-b border-border/40 bg-muted/20">
        <div
          className={`flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
            activeTab === "settings"
              ? "text-primary border-primary bg-card"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings2 className="h-3.5 w-3.5 inline mr-1" />
          Properties
        </div>
        <div
          className={`flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
            activeTab === "layers"
              ? "text-primary border-primary bg-card"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
          onClick={() => setActiveTab("layers")}
        >
          <FolderOpen className="h-3.5 w-3.5 inline mr-1" />
          Layers
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {activeTab === "layers" ? (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Page Node Tree
            </div>
            <div className="flex flex-col gap-2 bg-muted/20 p-2 rounded-md border border-border/30">
              {renderLayersTree("ROOT")}
            </div>
          </div>
        ) : !selectedNodeId || selectedNodeId === "ROOT" ? (
          // Empty state placeholder
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-muted-foreground">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-3 animate-pulse" />
            <p className="text-xs font-medium">Select an element on canvas</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[200px]">
              Click any row, container, stack or widget on the left to configure spacing, styles, and logic.
            </p>
          </div>
        ) : (
          // Real settings panel
          <div className="flex flex-col gap-2">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                {NodeIcon && <NodeIcon className={`h-4 w-4 ${nodeColor}`} />}
                <div>
                  <div className="text-xs font-semibold text-foreground">{nodeLabel}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">ID: #{selectedNodeId}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveNode("up")}
                  className="p-2 hover:bg-muted rounded text-muted-foreground"
                  title="Move Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleMoveNode("down")}
                  className="p-2 hover:bg-muted rounded text-muted-foreground"
                  title="Move Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="p-2 hover:bg-destructive/10 rounded text-destructive"
                  title="Delete element"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Quick Component Actions */}
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Component Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWrapInContainer}
                  className="px-2 py-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Box className="h-3 w-3" /> Wrap Container
                </button>
                <button
                  onClick={handleWrapInZStack}
                  className="px-2 py-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Layers className="h-3 w-3" /> Wrap Z-Stack
                </button>
                {(displayName === "CanvasContainer" || displayName === "CanvasStack" || displayName === "CanvasZStack") && (
                  <button
                    onClick={handleUnwrapNode}
                    className="px-2 py-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2 col-span-2"
                  >
                    <Plus className="h-3 w-3 rotate-45" /> Unwrap Children & Delete
                  </button>
                )}
              </div>
            </div>

            {/* Layout and Column Span */}
            <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Layout & Sizing
              </div>

              {/* Column span — only relevant for non-widget row children */}
              {isRowChild && displayName !== "CanvasWidgetSlot" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Grid Column Span</span>
                    <span className="font-semibold text-primary">{nodeProps.span || 6} / 12</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={nodeProps.span || 6}
                    onChange={(e) => handleUpdateSpan(parseInt(e.target.value))}
                    className="w-full h-1 bg-muted rounded-md appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground">Height Mode</span>
                <select
                  value={nodeProps.sizing || "auto"}
                  onChange={(e) => handleUpdateSizing(e.target.value, nodeProps.fixedHeight)}
                  className="w-full bg-background border border-border rounded px-2 py-2 text-xs"
                >
                  <option value="auto">Auto (Size to content)</option>
                  <option value="fill">Fill (Stretch parent height)</option>
                  <option value="fixed">Fixed Height (Specify px)</option>
                </select>
              </div>

              {nodeProps.sizing === "fixed" && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">Height (px)</span>
                  <input
                    type="number"
                    min="40"
                    max="1200"
                    value={nodeProps.fixedHeight || 200}
                    onChange={(e) => handleUpdateSizing("fixed", parseInt(e.target.value))}
                    className="w-20 bg-background border border-border rounded px-2 py-2 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Flex Stack specific controls */}
            {displayName === "CanvasStack" && (
              <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Flex Stack Alignment
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground">Direction</span>
                    <select
                      value={nodeProps.direction || "vertical"}
                      onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.direction = e.target.value; })}
                      className="bg-background border border-border rounded px-2 py-2 text-xs"
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground">Gap (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="128"
                      value={nodeProps.gap ?? 8}
                      onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.gap = parseInt(e.target.value) || 0; })}
                      className="bg-background border border-border rounded px-2 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">Align Items</span>
                  <div className="flex bg-muted/40 p-2 rounded border border-border/40 gap-2">
                    {[
                      { val: "stretch", label: "Stretch" },
                      { val: "flex-start", label: "Start" },
                      { val: "center", label: "Center" },
                      { val: "flex-end", label: "End" }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => actions.setProp(selectedNodeId, (props) => { props.align = item.val; })}
                        className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                          (nodeProps.align || "stretch") === item.val
                            ? "bg-background shadow-xs text-primary font-bold"
                            : "hover:bg-background/40 text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeProps.wrap || false}
                    onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.wrap = e.target.checked; })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] text-foreground">Wrap Children Wrap</span>
                </label>
              </div>
            )}

            {/* ZStack specific controls */}
            {displayName === "CanvasZStack" && (
              <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Z-Layers Management
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground">Active Editing Layer</span>
                  <select
                    value={nodeProps.activeLayerIndex || 0}
                    onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.activeLayerIndex = parseInt(e.target.value); })}
                    className="w-full bg-background border border-border rounded px-2 py-2 text-xs"
                  >
                    {(selectedNode.data.nodes || []).map((_, idx) => (
                      <option key={idx} value={idx}>
                        Layer {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddZStackLayer}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-3 w-3" /> Add Layer
                </button>
              </div>
            )}

            {/* Widget Slot specific options */}
            {displayName === "CanvasWidgetSlot" && (
              <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Widget Configuration
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Width (px)</span>
                    <input type="number" min="40" placeholder="auto" value={nodeProps.width ?? ""} onChange={(e) => handleUpdateSize("width", e.target.value)} className="bg-background border border-border rounded px-2 py-1.5 text-xs w-full" />
                    <span className="text-[8px] text-muted-foreground/50">blank = fill</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Height (px)</span>
                    <input type="number" min="24" placeholder="auto" value={nodeProps.height ?? ""} onChange={(e) => handleUpdateSize("height", e.target.value)} className="bg-background border border-border rounded px-2 py-1.5 text-xs w-full" />
                    <span className="text-[8px] text-muted-foreground/50">blank = auto</span>
                  </div>
                </div>
                <button
                  onClick={() => onEditWidget?.(nodeProps.widgetKey?.replace(/^widget_/, "").split("_")[0])}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded text-[11px] font-medium flex items-center justify-center gap-2"
                >
                  <Code2 className="h-3 w-3" /> Edit Widget Logic & Script
                </button>
              </div>
            )}

            {/* Styling spacing and bounds */}
            <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Spacing & Card style
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Padding</span>
                  <input
                    type="text"
                    placeholder="e.g. 12px"
                    value={nodeProps.style?.padding || ""}
                    onChange={(e) => handleUpdateStyle("padding", e.target.value)}
                    className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Margin</span>
                  <input
                    type="text"
                    placeholder="e.g. 8px"
                    value={nodeProps.style?.margin || ""}
                    onChange={(e) => handleUpdateStyle("margin", e.target.value)}
                    className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Corner Radius</span>
                  <input
                    type="text"
                    placeholder="e.g. 8px"
                    value={nodeProps.style?.borderRadius || ""}
                    onChange={(e) => handleUpdateStyle("borderRadius", e.target.value)}
                    className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Background Color</span>
                  <input
                    type="text"
                    placeholder="e.g. #ffffff"
                    value={nodeProps.style?.backgroundColor || ""}
                    onChange={(e) => handleUpdateStyle("backgroundColor", e.target.value)}
                    className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Conditions & Loop Logic */}
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Visibility & Loop Logic
              </div>

              {/* Visibility Condition (If) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] text-foreground">
                  <Eye className="h-3 w-3 text-amber-500" />
                  <span>Show Condition (If)</span>
                </div>
                <div className="bg-background/50 border border-border/80 rounded p-2">
                  <TemplateAutocompleteInput
                    id={`condition_${selectedNodeId}`}
                    value={nodeProps.condition || ""}
                    onChange={handleUpdateCondition}
                    placeholder="{{ user.isAdmin }}"
                  />
                </div>
                <span className="text-[9px] text-muted-foreground/60 leading-tight">
                  Enter JavaScript expression. Renders component only if truthy.
                </span>
              </div>

              {/* Repeat Loop (For each) */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-[11px] text-foreground">
                  <Repeat className="h-3 w-3 text-violet-500" />
                  <span>Loop Repeat (For each)</span>
                </div>
                <div className="flex flex-col gap-2 bg-background/50 border border-border/80 rounded p-2">
                  <span className="text-[9px] text-muted-foreground font-mono">Collection Data Source</span>
                  <TemplateAutocompleteInput
                    id={`repeat_collection_${selectedNodeId}`}
                    value={nodeProps.repeat?.collection || ""}
                    onChange={(val) =>
                      handleUpdateRepeat({
                        ...nodeProps.repeat,
                        collection: val,
                        itemAlias: nodeProps.repeat?.itemAlias || "item",
                      })
                    }
                    placeholder="{{ queryGetUsers.data }}"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] text-muted-foreground uppercase">Row Item Alias</span>
                      <input
                        type="text"
                        placeholder="item"
                        value={nodeProps.repeat?.itemAlias || ""}
                        onChange={(e) =>
                          handleUpdateRepeat({
                            ...nodeProps.repeat,
                            itemAlias: e.target.value,
                          })
                        }
                        className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] text-muted-foreground uppercase">Row Index Alias</span>
                      <input
                        type="text"
                        placeholder="index"
                        value={nodeProps.repeat?.indexAlias || ""}
                        onChange={(e) =>
                          handleUpdateRepeat({
                            ...nodeProps.repeat,
                            indexAlias: e.target.value,
                          })
                        }
                        className="bg-background border border-border rounded px-2 py-2 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground/60 leading-tight">
                  Loops this component for each item in the collection datasource.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
