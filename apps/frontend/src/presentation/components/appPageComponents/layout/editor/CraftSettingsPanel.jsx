/**
 * CraftSettingsPanel.jsx
 *
 * Sidebar Settings & Layers Panel for the Craft.js editor.
 *
 * Fixes applied:
 *  - Replaced setTimeout race conditions with synchronous Craft.js query lookups.
 *  - Fixed handleAddZStackLayer to open the widget IDE instead of creating invalid keys.
 *  - Documented the Craft.js move index quirk (index + 1 for drop-after).
 *  - Standardized spacing to p-2/gap-2 per UI guidelines.
 *  - Fixed text-primary-foreground → text-foreground (near-black on green, per §8.1).
 */
import { useEditor } from "@craftjs/core";
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import {
  ArrowDown,
  ArrowUp,
  Box,
  Code2,
  Columns,
  Eye,
  FolderOpen,
  Layers,
  Lock,
  Plus,
  Repeat,
  Rows,
  Settings2,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CanvasContainer } from "../components/CanvasContainer.jsx";
import { CanvasStack } from "../components/CanvasStack.jsx";
import { CanvasZStack } from "../components/CanvasZStack.jsx";

function getNodeMeta(displayName, props = {}) {
  switch (displayName) {
    case "CanvasColumn":
      return { label: "Main Canvas", icon: Columns, color: "text-muted-foreground" };
    case "CanvasRow":
      return { label: "Grid Row", icon: Rows, color: "text-muted-foreground" };
    case "CanvasWidgetSlot": {
      const wk = props.widgetKey || "";
      const widgetName = wk.replace(/^widget_/, "").split("_")[0] || "Widget";
      return { label: `Widget: ${widgetName}`, icon: Code2, color: "text-muted-foreground" };
    }
    case "CanvasContainer":
      return { label: "Card Container", icon: Box, color: "text-muted-foreground" };
    case "CanvasStack":
      return { label: "Flex Stack", icon: Layers, color: "text-muted-foreground" };
    case "CanvasZStack":
      return { label: "Z-Stack", icon: Layers, color: "text-muted-foreground" };
    default:
      return { label: displayName || "Element", icon: Box, color: "text-muted-foreground" };
  }
}

/**
 * Moves a node up or down within its parent.
 * Craft.js move() uses "insert before index N" semantics, so to move
 * a node from index i to index i+1 (downward), we pass i+2 because
 * the node is first removed, shifting subsequent indices down by 1.
 */
function moveNodeInCraft(actions, nodeId, parentId, direction, siblings) {
  const index = siblings.indexOf(nodeId);
  if (direction === "up" && index > 0) {
    actions.move(nodeId, parentId, index - 1);
  } else if (direction === "down" && index < siblings.length - 1) {
    // After removing the node at `index`, the target position shifts.
    // To place it after the next sibling (originally at index+1), we use index+2.
    actions.move(nodeId, parentId, index + 2);
  }
}

export default function CraftSettingsPanel({
  onChangeLayout,
  widgets,
  setWidgets,
  onEditWidget,
}) {
  const [activeTab, setActiveTab] = useState("settings");

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

  const [lastNodeId, setLastNodeId] = useState(null);
  const [localWidthMode, setLocalWidthMode] = useState("auto");
  const [localHeightMode, setLocalHeightMode] = useState("auto");

  if (selectedNodeId !== lastNodeId) {
    setLastNodeId(selectedNodeId);
    
    const w = nodeProps.width;
    let wm = "auto";
    if (w === "grow") wm = "grow";
    else if (typeof w === "string" && w.endsWith("%")) wm = "percent";
    else if (w != null && w !== "") wm = "px";
    setLocalWidthMode(wm);

    const h = nodeProps.height;
    let hm = "auto";
    if (h === "grow") hm = "grow";
    else if (typeof h === "string" && h.endsWith("%")) hm = "percent";
    else if (h != null && h !== "") hm = "px";
    setLocalHeightMode(hm);
  }

  const widthVal = useMemo(() => {
    const w = nodeProps.width;
    if (w == null || w === "" || w === "grow") return "";
    const parsed = parseInt(w);
    return isNaN(parsed) ? "" : parsed;
  }, [nodeProps.width]);

  const heightVal = useMemo(() => {
    const h = nodeProps.height;
    if (h == null || h === "" || h === "grow") return "";
    const parsed = parseInt(h);
    return isNaN(parsed) ? "" : parsed;
  }, [nodeProps.height]);

  const handleWidthModeChange = (mode) => {
    setLocalWidthMode(mode);
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      if (mode === "auto") {
        props.width = null;
      } else if (mode === "grow") {
        props.width = "grow";
      } else if (mode === "percent") {
        props.width = "50%";
      } else if (mode === "px") {
        props.width = 200;
      }
    });
  };

  const handleWidthValueChange = (val) => {
    if (!selectedNodeId) return;
    if (val === "") {
      actions.setProp(selectedNodeId, (props) => {
        props.width = "";
      });
      return;
    }
    const parsed = parseInt(val);
    actions.setProp(selectedNodeId, (props) => {
      if (localWidthMode === "percent") {
        props.width = !isNaN(parsed) ? `${Math.max(0, Math.min(100, parsed))}%` : "";
      } else if (localWidthMode === "px") {
        props.width = !isNaN(parsed) ? Math.max(0, parsed) : "";
      }
    });
  };

  const handleHeightModeChange = (mode) => {
    setLocalHeightMode(mode);
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      if (mode === "auto") {
        props.height = null;
      } else if (mode === "grow") {
        props.height = "grow";
      } else if (mode === "percent") {
        props.height = "50%";
      } else if (mode === "px") {
        props.height = 200;
      }
    });
  };

  const handleHeightValueChange = (val) => {
    if (!selectedNodeId) return;
    if (val === "") {
      actions.setProp(selectedNodeId, (props) => {
        props.height = "";
      });
      return;
    }
    const parsed = parseInt(val);
    actions.setProp(selectedNodeId, (props) => {
      if (localHeightMode === "percent") {
        props.height = !isNaN(parsed) ? `${Math.max(0, Math.min(100, parsed))}%` : "";
      } else if (localHeightMode === "px") {
        props.height = !isNaN(parsed) ? Math.max(0, parsed) : "";
      }
    });
  };

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

    // Craft.js updates state synchronously within actions — query immediately
    const freshParent = query.node(pId).get();
    const newContainerId = freshParent?.data?.nodes?.[siblingIndex];
    if (newContainerId) {
      actions.move(selectedNodeId, newContainerId, 0);
      actions.selectNode(newContainerId);
    }
  };

  const handleWrapInZStack = () => {
    if (!selectedNodeId) return;
    const node = query.node(selectedNodeId).get();
    const pId = node.data.parent;
    const siblingIndex = query.node(pId).get()?.data?.nodes?.indexOf(selectedNodeId) ?? 0;

    // Create a Z-Stack with a CanvasStack layer inside it
    const zStackTree = query
      .parseReactElement(<CanvasZStack span={nodeProps.span ?? 12} sizing="fill" />)
      .toNodeTree();

    actions.addNodeTree(zStackTree, pId, siblingIndex);

    const freshParent = query.node(pId).get();
    const newZStackId = freshParent?.data?.nodes?.[siblingIndex];
    if (newZStackId) {
      // Create a CanvasStack layer inside the Z-Stack
      const layerTree = query
        .parseReactElement(<CanvasStack span={12} sizing="fill" direction="vertical" gap={0} />)
        .toNodeTree();
      actions.addNodeTree(layerTree, newZStackId, 0);

      // Get the new layer ID
      const freshZStack = query.node(newZStackId).get();
      const layerId = freshZStack?.data?.nodes?.[0];
      if (layerId) {
        // Move the selected node into the layer
        actions.move(selectedNodeId, layerId, 0);
      }
      actions.selectNode(newZStackId);
    }
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
    try {
      const resolver = query.getOptions().resolver;
      const _CanvasStack = resolver["CanvasStack"];
      const layerTree = query
        .parseReactElement(
          <CanvasStack span={12} sizing="fill" direction="vertical" gap={0} />
        )
        .toNodeTree();

      const currentLayerCount = selectedNode?.data?.nodes?.length || 0;
      actions.addNodeTree(layerTree, selectedNodeId);

      actions.setProp(selectedNodeId, (props) => {
        props.activeLayerIndex = currentLayerCount;
        if (!Array.isArray(props.layerOpacities)) props.layerOpacities = [];
        props.layerOpacities[currentLayerCount] = 1;
      });
    } catch (err) {
      console.error("[CraftSettingsPanel] Failed to add Z-Stack layer:", err);
    }
  };

  const handleDeleteZStackLayer = (layerIdx) => {
    if (displayName !== "CanvasZStack" || !selectedNodeId) return;
    const childIds = selectedNode?.data?.nodes || [];
    const layerId = childIds[layerIdx];
    if (!layerId) return;
    try {
      actions.delete(layerId);
      actions.setProp(selectedNodeId, (props) => {
        // Remove opacity entry for deleted layer
        if (Array.isArray(props.layerOpacities)) {
          props.layerOpacities.splice(layerIdx, 1);
        }
        
        const currentActive = props.activeLayerIndex || 0;
        if (layerIdx === currentActive) {
          // If we deleted the active layer, set active to the previous layer, or 0
          props.activeLayerIndex = Math.max(0, layerIdx - 1);
        } else if (layerIdx < currentActive) {
          // If we deleted a layer before the active layer, shift active index down by 1
          props.activeLayerIndex = currentActive - 1;
        }

        // Ensure it doesn't exceed the new bounds
        const remainingCount = childIds.length - 1;
        if (props.activeLayerIndex >= remainingCount) {
          props.activeLayerIndex = Math.max(0, remainingCount - 1);
        }
      });
    } catch (err) {
      console.error("[CraftSettingsPanel] Failed to delete Z-Stack layer:", err);
    }
  };

  const handleMoveZStackLayer = (layerIdx, direction) => {
    if (displayName !== "CanvasZStack" || !selectedNodeId) return;
    const childIds = selectedNode?.data?.nodes || [];
    const layerId = childIds[layerIdx];
    if (!layerId) return;
    const targetIdx = direction === "up" ? layerIdx - 1 : layerIdx + 1;
    if (targetIdx < 0 || targetIdx >= childIds.length) return;
    try {
      // Craft.js move uses "insert before index" semantics
      const craftIndex = direction === "up" ? layerIdx - 1 : layerIdx + 2;
      actions.move(layerId, selectedNodeId, craftIndex);
      // Swap opacities to match the new order
      actions.setProp(selectedNodeId, (props) => {
        if (Array.isArray(props.layerOpacities)) {
          const opacities = [...props.layerOpacities];
          const temp = opacities[layerIdx];
          opacities[layerIdx] = opacities[targetIdx];
          opacities[targetIdx] = temp;
          props.layerOpacities = opacities;
        }
        // Update active layer to follow the moved layer
        if (props.activeLayerIndex === layerIdx) {
          props.activeLayerIndex = targetIdx;
        } else if (props.activeLayerIndex === targetIdx) {
          props.activeLayerIndex = layerIdx;
        }
      });
    } catch (err) {
      console.error("[CraftSettingsPanel] Failed to move Z-Stack layer:", err);
    }
  };

  const handleSetLayerOpacity = (layerIdx, opacity) => {
    if (displayName !== "CanvasZStack" || !selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      if (!Array.isArray(props.layerOpacities)) props.layerOpacities = [];
      props.layerOpacities[layerIdx] = Math.max(0, Math.min(1, opacity));
    });
  };

  const handleMoveNode = (direction) => {
    if (!selectedNodeId || !parentId) return;
    const siblings = parentNode?.data?.nodes || [];
    moveNodeInCraft(actions, selectedNodeId, parentId, direction, siblings);
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
          className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
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
          className={`flex-1 p-2 text-[11px] font-semibold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
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
          className={`flex-1 p-2 text-[11px] font-semibold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
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
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Page Node Tree
            </div>
            <div className="flex flex-col gap-2 bg-muted/20 p-2 rounded border border-border/30">
              {renderLayersTree("ROOT")}
            </div>
          </div>
        ) : !selectedNodeId || selectedNodeId === "ROOT" ? (
          <div className="flex flex-col items-center justify-center text-center p-2 text-muted-foreground">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs font-medium">Select an element on canvas</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[200px]">
              Click any row, container, stack or widget on the left to configure spacing, styles, and logic.
            </p>
          </div>
        ) : (
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
                {displayName === "CanvasWidgetSlot" && (
                  <button
                    onClick={() => {
                      actions.setProp(selectedNodeId, (props) => {
                        props.locked = !props.locked;
                      });
                    }}
                    className={`p-2 rounded transition-colors ${
                      nodeProps.locked
                        ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={nodeProps.locked ? "Unlock Widget" : "Lock Widget"}
                  >
                    {nodeProps.locked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
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
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Component Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWrapInContainer}
                  className="p-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Box className="h-3 w-3" /> Wrap Container
                </button>
                <button
                  onClick={handleWrapInZStack}
                  className="p-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Layers className="h-3 w-3" /> Wrap Z-Stack
                </button>
                {(displayName === "CanvasContainer" || displayName === "CanvasStack" || displayName === "CanvasZStack") && (
                  <button
                    onClick={handleUnwrapNode}
                    className="p-2 text-[10px] text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2 col-span-2"
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

              {isRowChild && (
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
                        className="w-full h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground">Height Mode</span>
                <select
                  value={nodeProps.sizing || "auto"}
                  onChange={(e) => handleUpdateSizing(e.target.value, nodeProps.fixedHeight)}
                  className="w-full bg-background border border-border rounded p-2 text-xs"
                >
                  <option value="auto">Auto (Size to content)</option>
                  <option value="fill">Fill (Stretch parent height)</option>
                  <option value="fixed">Fixed Height (Specify px)</option>
                </select>
              </div>

              {nodeProps.sizing === "fixed" && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Height (px)</span>
                  <input
                    type="number"
                    min="40"
                    max="1200"
                    value={nodeProps.fixedHeight || 200}
                    onChange={(e) => handleUpdateSizing("fixed", parseInt(e.target.value))}
                    className="w-20 bg-background border border-border rounded p-2 text-xs"
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
                      className="bg-background border border-border rounded p-2 text-xs"
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
                      className="bg-background border border-border rounded p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
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
                            ? "bg-background shadow-sm text-primary font-bold"
                            : "hover:bg-background/40 text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nodeProps.wrap || false}
                    onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.wrap = e.target.checked; })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] text-foreground">Wrap Children</span>
                </label>
              </div>
            )}

            {/* ZStack specific controls */}
            {displayName === "CanvasZStack" && (
              <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Z-Stack Layers
                </div>
                {(selectedNode.data.nodes || []).length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {(selectedNode.data.nodes || []).map((layerNodeId, idx) => {
                      const isActive = (nodeProps.activeLayerIndex || 0) === idx;
                      const layerCount = selectedNode.data.nodes.length;
                      const layerOpacity = (nodeProps.layerOpacities || [])[idx] ?? 1;
                      return (
                        <div
                          key={layerNodeId}
                          className={`flex flex-col gap-1.5 p-2 rounded cursor-pointer transition-all text-[11px] ${
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted/50 text-muted-foreground border border-transparent"
                          }`}
                          onClick={() => actions.setProp(selectedNodeId, (props) => { props.activeLayerIndex = idx; })}
                        >
                          {/* Layer header row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Layers className={`h-3 w-3 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/60"}`} />
                              <span className="font-medium">Layer {idx + 1}</span>
                              {isActive && <span className="text-[7px] bg-primary/20 text-primary px-1 rounded font-mono uppercase">active</span>}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {/* Move Up */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMoveZStackLayer(idx, "up"); }}
                                disabled={idx === 0}
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                title="Move layer up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              {/* Move Down */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMoveZStackLayer(idx, "down"); }}
                                disabled={idx === layerCount - 1}
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                title="Move layer down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              {/* Delete */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteZStackLayer(idx); }}
                                className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                                title={`Delete Layer ${idx + 1}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {/* Opacity slider */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9px] text-muted-foreground shrink-0 w-10">Opacity</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={Math.round(layerOpacity * 100)}
                              onChange={(e) => handleSetLayerOpacity(idx, parseInt(e.target.value) / 100)}
                              className="flex-1 h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{Math.round(layerOpacity * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground/60 italic p-2 text-center">
                    No layers yet. Add a layer to get started.
                  </div>
                )}
                <button
                  onClick={handleAddZStackLayer}
                  className="w-full p-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
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
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Width</span>
                    {isRowChild ? (
                      <input
                        type="text"
                        disabled
                        placeholder="Grid span aligned"
                        className="bg-muted border border-border rounded p-2 text-xs w-full cursor-not-allowed text-muted-foreground"
                      />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <select
                          value={localWidthMode}
                          onChange={(e) => handleWidthModeChange(e.target.value)}
                          className="bg-background border border-border rounded p-1.5 text-[11px] w-full"
                        >
                          <option value="auto">Auto / Fill</option>
                          <option value="px">Fixed (px)</option>
                          <option value="percent">Percent (%)</option>
                          <option value="grow">Grow (Flex)</option>
                        </select>
                        {(localWidthMode === "px" || localWidthMode === "percent") && (
                          <input
                            type="number"
                            min="0"
                            max={localWidthMode === "percent" ? "100" : undefined}
                            placeholder={localWidthMode === "px" ? "px" : "%"}
                            value={widthVal}
                            onChange={(e) => handleWidthValueChange(e.target.value)}
                            className="bg-background border border-border rounded p-1.5 text-xs w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Height</span>
                    <div className="flex flex-col gap-1">
                      <select
                        value={localHeightMode}
                        onChange={(e) => handleHeightModeChange(e.target.value)}
                        className="bg-background border border-border rounded p-1.5 text-[11px] w-full"
                      >
                        <option value="auto">Auto / Fill</option>
                        <option value="px">Fixed (px)</option>
                        <option value="percent">Percent (%)</option>
                        <option value="grow">Grow (Flex)</option>
                      </select>
                      {(localHeightMode === "px" || localHeightMode === "percent") && (
                        <input
                          type="number"
                          min="0"
                          max={localHeightMode === "percent" ? "100" : undefined}
                          placeholder={localHeightMode === "px" ? "px" : "%"}
                          value={heightVal}
                          onChange={(e) => handleHeightValueChange(e.target.value)}
                          className="bg-background border border-border rounded p-1.5 text-xs w-full"
                        />
                      )}
                    </div>
                  </div>
                </div>

                    <div className="flex items-center justify-between p-2 bg-muted/20 border border-border/50 rounded">
                  <div className="flex items-center gap-2">
                    {nodeProps.locked ? (
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-[11px] font-medium text-foreground">
                      {nodeProps.locked ? "Widget is Locked" : "Widget is Unlocked"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.setProp(selectedNodeId, (props) => {
                        props.locked = !props.locked;
                      });
                    }}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      nodeProps.locked
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {nodeProps.locked ? "Unlock" : "Lock"}
                  </button>
                </div>

                <button
                  onClick={() => onEditWidget?.(nodeProps.widgetKey?.replace(/^widget_/, "").split("_")[0])}
                  className="w-full p-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded text-[11px] font-medium flex items-center justify-center gap-2"
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
                    placeholder="e.g. 8px"
                    value={nodeProps.style?.padding || ""}
                    onChange={(e) => handleUpdateStyle("padding", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Margin</span>
                  <input
                    type="text"
                    placeholder="e.g. 8px"
                    value={nodeProps.style?.margin || ""}
                    onChange={(e) => handleUpdateStyle("margin", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Corner Radius</span>
                  <input
                    type="text"
                    placeholder="e.g. 6px"
                    value={nodeProps.style?.borderRadius || ""}
                    onChange={(e) => handleUpdateStyle("borderRadius", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Background Color</span>
                  <input
                    type="text"
                    placeholder="e.g. #ffffff"
                    value={nodeProps.style?.backgroundColor || ""}
                    onChange={(e) => handleUpdateStyle("backgroundColor", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Conditions & Loop Logic */}
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Visibility & Loop Logic
              </div>

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

              <div className="flex flex-col gap-2">
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
                  <div className="grid grid-cols-2 gap-2">
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
                        className="bg-background border border-border rounded p-2 text-xs text-foreground"
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
                        className="bg-background border border-border rounded p-2 text-xs text-foreground"
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
