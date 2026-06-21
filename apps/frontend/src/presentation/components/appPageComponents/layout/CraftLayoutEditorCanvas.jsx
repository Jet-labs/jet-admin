/**
 * CraftLayoutEditorCanvas.jsx
 *
 * Full-featured page editor powered by @craftjs/core.
 * Uses a workspace split layout:
 *  - Left/Center: A clean rendering canvas (exactly matching runtime preview when not hovered/selected)
 *  - Right: A premium sidebar showing Settings/Properties and a hierarchical Layers tree
 *  - Top Bar: Undo/Redo actions + Mode toggle ("Design" vs "Preview")
 */
import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Editor, Frame, Element, useEditor, useNode } from "@craftjs/core";
import { Play, Eye, Settings, Undo2, Redo2 } from "lucide-react";
import { treeToCraft, craftToTree } from "./craftAdapter.js";
import { CanvasColumn } from "./craftComponents/CanvasColumn.jsx";
import { CanvasRow } from "./craftComponents/CanvasRow.jsx";
import { CanvasContainer } from "./craftComponents/CanvasContainer.jsx";
import { CanvasStack } from "./craftComponents/CanvasStack.jsx";
import { CanvasZStack } from "./craftComponents/CanvasZStack.jsx";
import { CanvasWidgetSlot } from "./craftComponents/CanvasWidgetSlot.jsx";
import { CraftEditorContext } from "./craftComponents/CraftEditorContext.js";
import CraftSettingsPanel from "./CraftNodeToolbar.jsx";
import "./layout.css";

// ─── Resolver map ─────────────────────────────────────────────────────────────

const RESOLVER = {
  CanvasColumn,
  CanvasRow,
  CanvasContainer,
  CanvasStack,
  CanvasZStack,
  CanvasWidgetSlot,
};

// ─── HTML5 → Craft DnD Bridge ─────────────────────────────────────────────────
// Widget palette (appPageWidgetList) drag-drops using HTML5 dataTransfer ("widget").
// We intercept this and programmatically add CanvasWidgetSlot nodes to Craft state.

function Html5DropBridge({ widgets, setWidgets }) {
  const { query, actions, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const handleDrop = useCallback(
    (e) => {
      if (!enabled) return;
      const widgetKey = e.dataTransfer?.getData("widget");
      const layoutType = e.dataTransfer?.getData("layout-type");
      if (!widgetKey && !layoutType) return; // not relevant drop — ignore

      e.preventDefault();
      e.stopPropagation();

      // Walk up the DOM from the drop target to find a Craft node
      let targetNodeId = null;
      let targetDisplayName = null;
      let el = e.target;
      while (el) {
        const nodeId = el.id;
        if (nodeId && nodeId !== "craft-html5-drop-overlay") {
          try {
            const node = query.node(nodeId).get();
            const dn = node?.data?.displayName;
            if (["CanvasRow", "CanvasColumn", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(dn)) {
              targetNodeId = nodeId;
              targetDisplayName = dn;
              break;
            }
          } catch (_) {
            // node not in Craft — keep walking up
          }
        }
        el = el.parentElement;
      }

      if (!targetNodeId) {
        targetNodeId = "ROOT";
        targetDisplayName = "CanvasColumn";
      }

      // Always pull component refs from the live resolver to avoid HMR stale-reference mismatches.
      // After any hot-module update the module-level imports may be new references that Craft.js
      // (which does a reverse lookup: component → name) no longer recognises.
      const resolver = query.getOptions().resolver;
      const _CanvasWidgetSlot = resolver["CanvasWidgetSlot"];
      const _CanvasRow        = resolver["CanvasRow"];
      const _CanvasColumn     = resolver["CanvasColumn"];
      const _CanvasContainer  = resolver["CanvasContainer"];
      const _CanvasStack      = resolver["CanvasStack"];
      const _CanvasZStack     = resolver["CanvasZStack"];

      // Helpers to create React elements
      const makeWidgetReactElement = () => (
        <Element
          is={_CanvasWidgetSlot}
          widgetKey={widgetKey}
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
          <Element is={_CanvasColumn} canvas />
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
        if (layoutType === "stack")     return makeStackReactElement();
        if (layoutType === "z-stack")   return makeZStackReactElement();
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

      if (layoutType) {
        if (layoutType === "row") {
          // Rows can only live inside a CanvasColumn — walk up to find one
          let columnId = null;
          if (targetDisplayName === "CanvasColumn") {
            columnId = targetNodeId;
          } else {
            let current = targetNodeId;
            while (current) {
              const node = query.node(current).get();
              if (node?.data?.displayName === "CanvasColumn") { columnId = current; break; }
              current = node?.data?.parent;
            }
          }
          if (columnId) actions.addNodeTree(makeRowTree(), columnId);
        } else {
          // Container, Stack, ZStack — drop directly into the target canvas
          const tree = makeLayoutTree();
          if (tree) actions.addNodeTree(tree, targetNodeId);
        }
      } else if (widgetKey) {
        // Always add widget directly — no auto-wrapping in rows
        actions.addNodeTree(makeWidgetTree(), targetNodeId);

        // Track in parent widgets list
        if (setWidgets) {
          setWidgets((prev) => (Array.isArray(prev) && prev.includes(widgetKey) ? prev : [...(prev || []), widgetKey]));
        }
      }
    },
    [query, actions, setWidgets, enabled]
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
      }
    };
    const nativeDrop = (e) => handleDrop(e);

    canvasEl.addEventListener("dragover", nativeDragOver);
    canvasEl.addEventListener("drop", nativeDrop);
    return () => {
      canvasEl.removeEventListener("dragover", nativeDragOver);
      canvasEl.removeEventListener("drop", nativeDrop);
    };
  }, [handleDrop, enabled]);

  return null;
}

// ─── Editor sync bridge ───────────────────────────────────────────────────────
// Subscribes to Craft state changes and syncs back to parent DB configuration.

function EditorSyncBridge({ onChangeLayout, widgets, setWidgets }) {
  const { query, actions, enabled, selectedNodeIds, _nodes } = useEditor((state) => ({
    enabled: state.options.enabled,
    selectedNodeIds: state.events.selected,
    _nodes: state.nodes,
  }));

  const debounceRef = useRef(null);
  const lastSerializedRef = useRef(query.serialize());

  const sync = useCallback(() => {
    try {
      const serialized = query.serialize();
      if (serialized === lastSerializedRef.current) return;
      
      // ─── Row Balancing ─────────────────────────────────────────────────────
      let changed = false;
      const craftNodes = JSON.parse(serialized);
      const selectedIds = Array.from(selectedNodeIds || []);
      const activeSelectedId = selectedIds[0] || null;

      Object.entries(craftNodes).forEach(([id, node]) => {
        if (node.displayName === "CanvasRow") {
          const childIds = node.nodes || [];
          const children = childIds.map(cid => {
            const cNode = craftNodes[cid];
            if (cNode) {
              return { id: cid, ...cNode };
            }
            return null;
          }).filter(Boolean);
          
          let sum = children.reduce((acc, c) => acc + (c.props?.span || 6), 0);
          let excess = sum - 12;
          
          if (excess > 0) {
            const spans = children.map(c => ({
              id: c.id,
              span: c.props?.span || 6
            }));
            
            // Enforce max span of 12
            spans.forEach(s => {
              if (s.span > 12) s.span = 12;
            });
            
            while (excess > 0) {
              let candidateIdx = -1;
              let maxScore = -9999;
              
              for (let i = 0; i < spans.length; i++) {
                const s = spans[i];
                if (s.span > 1) {
                  const isSelected = activeSelectedId === s.id;
                  const score = s.span - (isSelected ? 100 : 0);
                  if (score > maxScore) {
                    maxScore = score;
                    candidateIdx = i;
                  }
                }
              }
              
              if (candidateIdx === -1) break;
              spans[candidateIdx].span--;
              excess--;
            }
            
            spans.forEach(s => {
              const originalNode = craftNodes[s.id];
              if (originalNode && originalNode.props?.span !== s.span) {
                actions.setProp(s.id, (props) => {
                  props.span = s.span;
                });
                changed = true;
              }
            });
          }
        }
      });

      // If we modified spans, we re-serialize so we sync the correct visual spans
      const finalSerialized = changed ? query.serialize() : serialized;
      lastSerializedRef.current = finalSerialized;

      const finalNodes = JSON.parse(finalSerialized);
      const treeRoot = craftToTree(finalNodes, "ROOT");
      if (treeRoot) {
        onChangeLayout(treeRoot);
      }
    } catch (err) {
      console.error("[CraftEditor] Failed to sync layout:", err);
    }
  }, [query, actions, selectedNodeIds, onChangeLayout]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(sync, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Run sync immediately on unmount/cleanup to capture final state
      sync();
    };
  }, [sync, _nodes]);

  useEffect(() => {
    const handleFlush = () => {
      sync();
    };
    window.addEventListener("flush-editor-sync", handleFlush);
    return () => {
      window.removeEventListener("flush-editor-sync", handleFlush);
    };
  }, [sync]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enabled) return;
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        actions.history?.undo?.();
      } else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        actions.history?.redo?.();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
        if (selectedNodeIds && selectedNodeIds.size > 0) {
          e.preventDefault();
          selectedNodeIds.forEach((id) => {
            if (id !== "ROOT") actions.delete(id);
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, enabled, selectedNodeIds]);

  return null;
}

// ─── Editor Header Bar ──────────────────────────────────────────────────────

function EditorHeader({ previewMode, setPreviewMode }) {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: state.options.enabled && query.history.canUndo(),
    canRedo: state.options.enabled && query.history.canRedo(),
  }));

  return (
    <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card gap-2 shrink-0 h-12 select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">Page Builder</span>
        <span className="text-[10px] text-muted-foreground/60 pl-2 border-l border-border/50">
          {previewMode ? "Preview Mode active" : "Drag elements to organize layout"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo (only active in design mode) */}
        {!previewMode && (
          <div className="flex items-center gap-2 mr-2 border-r border-border/40 pr-2">
            <button
              type="button"
              disabled={!canUndo}
              onClick={() => actions.history?.undo?.()}
              className="h-7 px-2 text-[11px] font-medium rounded-md border border-border/50 bg-background text-muted-foreground cursor-pointer transition-all whitespace-nowrap inline-flex items-center gap-2 hover:not-disabled:bg-muted hover:not-disabled:text-foreground hover:not-disabled:border-border disabled:opacity-35 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={() => actions.history?.redo?.()}
              className="h-7 px-2 text-[11px] font-medium rounded-md border border-border/50 bg-background text-muted-foreground cursor-pointer transition-all whitespace-nowrap inline-flex items-center gap-2 hover:not-disabled:bg-muted hover:not-disabled:text-foreground hover:not-disabled:border-border disabled:opacity-35 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3 w-3" /> Redo
            </button>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex bg-muted/60 p-0.5 rounded-md border border-border/40 gap-2">
          <button
            type="button"
            className={`flex items-center gap-2 text-[11px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-all ${
              !previewMode
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(false);
              // Enable Craft editing
              actions.setOptions((options) => { options.enabled = true; });
            }}
          >
            <Settings className="h-3 w-3" /> Design
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 text-[11px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-all ${
              previewMode
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(true);
              // Disable Craft editing to allow full page interaction
              actions.setOptions((options) => { options.enabled = false; });
              actions.selectNode([]); // Clear selection
            }}
          >
            <Play className="h-3 w-3" /> Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function CraftLayoutEditorCanvas({
  layout,
  onChangeLayout,
  renderWidget,
  tenantID,
  widgets,
  setWidgets,
  onEditWidget,
}) {
  const [previewMode, setPreviewMode] = useState(false);

  // Convert current layout tree → Craft JSON string for seeding frame
  const craftInitialState = useMemo(() => {
    if (!layout) return null;
    try {
      return treeToCraft(layout);
    } catch (err) {
      console.error("[CraftEditor] Failed to convert layout to Craft format:", err);
      return null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderWidgetRef = useRef(renderWidget);
  useEffect(() => { renderWidgetRef.current = renderWidget; }, [renderWidget]);

  const stableRenderWidget = useCallback((...args) => renderWidgetRef.current?.(...args), []);

  return (
    <div className="craft-editor-root">
      <CraftEditorContext.Provider value={{ renderWidget: stableRenderWidget, previewMode }}>
        <Editor
          resolver={RESOLVER}
          enabled={true}
          onNodesChange={() => {
            // Polling EditorSyncBridge handles actual synchronization
          }}
        >
          {/* Functional bridges */}
          <EditorSyncBridge
            onChangeLayout={onChangeLayout}
            widgets={widgets}
            setWidgets={setWidgets}
          />

          {/* Top control bar */}
          <EditorHeader previewMode={previewMode} setPreviewMode={setPreviewMode} />

          {/* Main workspace layout */}
          <div className="craft-editor-workspace">
            {/* Left/Center canvas container */}
            <div
              id="craft-canvas-root"
              className="craft-canvas-area scrollbar-thin"
            >
              <Html5DropBridge widgets={widgets} setWidgets={setWidgets} />

              {craftInitialState ? (
                <Frame data={craftInitialState}>
                  <Element is={CanvasColumn} canvas />
                </Frame>
              ) : (
                <Frame>
                  <Element is={CanvasColumn} canvas>
                    <Element is={CanvasRow} canvas sizing="auto" />
                  </Element>
                </Frame>
              )}
            </div>

            {/* Right sidebar settings & layers panel */}
            {!previewMode && (
              <CraftSettingsPanel
                onChangeLayout={onChangeLayout}
                widgets={widgets}
                setWidgets={setWidgets}
                onEditWidget={onEditWidget}
              />
            )}
          </div>
        </Editor>
      </CraftEditorContext.Provider>
    </div>
  );
}
