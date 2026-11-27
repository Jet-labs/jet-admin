/* eslint-disable react/prop-types */
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
import { evaluateVisibilityCondition } from "../../../../../logic/evaluationEngine";
import {
  ArrowDown,
  ArrowUp,
  Box,
  ChevronLeft,
  ChevronRight,
  Code2,
  Columns,
  Eye,
  FolderOpen,
  GripVertical,
  Layers,
  Lock,
  Pencil,
  Plus,
  Repeat,
  Rows,
  Search,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Unlock,
} from "lucide-react";
import { useLayoutBreakpoint } from "../engine/LayoutViewportContext.jsx";
import { BREAKPOINT_LABELS } from "../engine/responsive.js";
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

const parsePxValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
};

const parseSpacingValue = (value) => {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { top: "", right: "", bottom: "", left: "" };
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
};

const buildSpacingValue = ({ top, right, bottom, left }) => {
  const raw = [(top || "").trim(), (right || "").trim(), (bottom || "").trim(), (left || "").trim()];
  if (raw.every((value) => !value)) return "";
  const [t, r, b, l] = raw.map((value) => value || "0");
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  if (r === l) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
};

/**
 * Four-sided spacing editor. Keeps the existing CSS shorthand support while
 * making the common padding/margin workflow visual.
 */
function BoxSpacingControl({ label, value, onChange }) {
  const sides = parseSpacingValue(value);
  const setSide = (side, next) => {
    onChange(buildSpacingValue({ ...sides, [side]: next }));
  };
  const input = (side) => (
    <input
      type="text"
      value={sides[side]}
      onChange={(e) => setSide(side, e.target.value)}
      placeholder="0"
      aria-label={`${label} ${side}`}
      className="min-w-0 rounded border border-border bg-background px-1 py-1 text-center font-mono text-[10px] text-foreground placeholder:text-muted-foreground/30"
    />
  );
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] font-mono text-muted-foreground/60">
          {value || "auto"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <span />
        {input("top")}
        <span />
        {input("left")}
        <span className="flex items-center justify-center rounded bg-muted/40 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {input("right")}
        <span />
        {input("bottom")}
        <span />
      </div>
    </div>
  );
}

const COLOR_PRESETS = [
  "transparent",
  "#ffffff",
  "#f8fafc",
  "#e2e8f0",
  "#0f172a",
  "#1e293b",
  "#334155",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

function ColorField({ label, value, onChange, placeholder = "e.g. #ffffff" }) {
  const current = value ?? "";
  const isHex = /^#[0-9a-f]{6}$/i.test(current);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={isHex ? current : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded border border-border bg-background p-0.5"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded border border-border bg-background p-1.5 text-xs text-foreground placeholder:text-muted-foreground/30"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-4 w-4 rounded border transition-transform hover:scale-110 ${
              current === color ? "border-primary ring-1 ring-primary/40" : "border-border"
            }`}
            style={
              color === "transparent"
                ? {
                    backgroundImage:
                      "linear-gradient(135deg, transparent 45%, hsl(var(--destructive)) 45%, hsl(var(--destructive)) 55%, transparent 55%)",
                  }
                : { backgroundColor: color }
            }
            title={color}
            aria-label={`Use ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Compact numeric spacing control with quick presets. Used for page,
 * grid, container and flex gaps/padding so the common values are one
 * click away instead of requiring raw CSS.
 */
function NumericSpacingControl({
  label,
  value,
  onChange,
  presets = [0, 4, 8, 12, 16, 24],
  help,
  suffix = "px",
}) {
  const numericValue = parsePxValue(value);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] font-mono text-muted-foreground">
          {numericValue === "" ? "auto" : `${numericValue}${suffix}`}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          max="200"
          value={numericValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="auto"
          className="min-w-0 flex-1 bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground"
        />
        <span className="text-[10px] text-muted-foreground">{suffix}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => {
          const active = numericValue !== "" && Number(numericValue) === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(String(preset))}
              className={`min-w-[26px] rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
      {help && (
        <span className="text-[9px] leading-tight text-muted-foreground/70">{help}</span>
      )}
    </div>
  );
}

/**
 * Live preview badge for a visibility condition, evaluated against the
 * editor-time state tree (variable defaults + data-source aliases).
 * Mirrors LayoutRenderer fail-closed semantics: empty => always,
 * error => error (hidden in viewer), truthy non-boolean => warning.
 */
function ConditionPreviewBadge({ condition, editorLiveStateTree }) {
  const { label, tone, title } = useMemo(() => {
    if (typeof condition !== "string" || !condition.trim()) {
      return { label: "always", tone: "text-muted-foreground bg-muted/50 border-border/50", title: "No condition — always shown" };
    }
    const inner = editorLiveStateTree?.state || {};
    const res = evaluateVisibilityCondition(condition, inner, { silent: true });
    if (res.isEmpty) return { label: "always", tone: "text-muted-foreground bg-muted/50 border-border/50", title: "No condition — always shown" };
    if (res.hasError) {
      return {
        label: "error → hidden",
        tone: "text-destructive bg-destructive/10 border-destructive/30",
        title: `Condition errors in viewer it hides (fail-closed). ${res.missingMustaches ? "Missing {{ }}? " : ""}${(res.errors[0]?.message || "evaluation error")}`,
      };
    }
    if (res.missingMustaches) {
      return {
        label: "no {{ }}?",
        tone: "text-amber-700 bg-amber-500/10 border-amber-500/40",
        title: "Condition has no {{ }} — it is treated as literal text (always truthy). Wrap JS in {{ }}.",
      };
    }
    if (res.isNonBoolean) {
      return {
        label: `truthy (${typeof res.rawValue})`,
        tone: "text-amber-600 bg-amber-500/10 border-amber-500/30",
        title: `Returns ${typeof res.rawValue} (${JSON.stringify(res.rawValue)?.slice(0, 80)}), not boolean. It shows because truthy, but prefer === / > / && returning boolean. Note: "false", [], {} are truthy.`,
      };
    }
    return res.visible
      ? { label: "shown", tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", title: "Condition is true with defaults — shown in viewer" }
      : { label: "hidden", tone: "text-amber-600 bg-amber-500/10 border-amber-500/30", title: "Condition is false with defaults — hidden in viewer" };
  }, [condition, editorLiveStateTree]);

  return (
    <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${tone}`} title={title}>
      {label}
    </span>
  );
}

/**
 * Quick-insert chips for common visibility patterns (variables, queries,
 * && / || combinators). Appends snippets to the condition input.
 */
function ConditionQuickInserts({ editorLiveStateTree, onInsert, onClear }) {
  const inner = editorLiveStateTree?.state || {};
  const varKeys = Object.keys(inner.variables || {}).slice(0, 8);
  const queryKeys = [...Object.keys(inner.queries || {}), ...Object.keys(inner.workflows || {})].slice(0, 6);
  if (varKeys.length === 0 && queryKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {varKeys.map((k) => (
        <button
          key={`var-${k}`}
          type="button"
          onClick={() => onInsert(`{{ state.variables.${k} }}`)}
          className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/60 bg-muted/40 text-foreground hover:bg-muted hover:border-border"
          title={`Insert {{ state.variables.${k} }}`}
        >
          {k}
        </button>
      ))}
      {queryKeys.map((k) => (
        <button
          key={`q-${k}`}
          type="button"
          onClick={() => onInsert(`{{ state.queries.${k}.data.length }}`)}
          className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary hover:bg-primary/20"
          title={`Insert {{ state.queries.${k}.data.length }}`}
        >
          {k}.len
        </button>
      ))}
      <button
        type="button"
        onClick={() => onInsert("&&")}
        className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground hover:text-foreground"
        title="AND combinator"
      >
        &&
      </button>
      <button
        type="button"
        onClick={() => onInsert("||")}
        className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground hover:text-foreground"
        title="OR combinator"
      >
        ||
      </button>
      <button
        type="button"
        onClick={onClear}
        className="text-[9px] px-1.5 py-0.5 rounded text-muted-foreground hover:text-destructive"
        title="Clear condition (always show)"
      >
        clear
      </button>
    </div>
  );
}

export default function CraftSettingsPanel({
  setWidgets,
  onEditWidget,
  editorLiveStateTree,
}) {
  const [activeTab, setActiveTab] = useState("settings");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [layerSearch, setLayerSearch] = useState("");
  const [draggedLayerId, setDraggedLayerId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [renamingLayerId, setRenamingLayerId] = useState(null);
  const [renameLayerValue, setRenameLayerValue] = useState("");
  const breakpointTier = useLayoutBreakpoint();

  const { selectedNodeId, selectedNode, selectedCount, selectedIds, actions, query, allNodes } = useEditor((state) => {
    const ids = Array.from(state.events.selected || []);
    const id = ids.length > 0 ? ids[0] : null;
    return {
      selectedNodeId: id,
      selectedNode: id ? state.nodes[id] : null,
      selectedCount: ids.length,
      selectedIds: ids,
      allNodes: state.nodes,
    };
  });

  const nodeProps = selectedNode?.data?.props ?? {};
  const displayName = selectedNode?.data?.displayName ?? "";
  const parentId = selectedNode?.data?.parent;
  const parentNode = parentId ? allNodes[parentId] : null;
  const isRowChild = parentNode?.data?.displayName === "CanvasRow";

  // Page settings are the root CanvasColumn (Craft node "ROOT"). Container
  // content spacing lives on the inner CanvasColumn, not the outer card.
  const pageProps = allNodes["ROOT"]?.data?.props ?? {};
  const pageStyle = pageProps.style ?? {};
  const containerChildId =
    displayName === "CanvasContainer" ? selectedNode?.data?.nodes?.[0] : null;
  const containerChildNode = containerChildId ? allNodes[containerChildId] : null;
  const containerUsesInnerColumn =
    containerChildNode?.data?.displayName === "CanvasColumn";
  const containerGapStyle = containerUsesInnerColumn
    ? containerChildNode?.data?.props?.style ?? {}
    : nodeProps.style ?? {};

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

  const handleUpdateResponsive = (tier, patch) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      const next = { ...(props.responsive || {}) };
      const entry = { ...(next[tier] || {}), ...patch };
      Object.keys(entry).forEach((key) => {
        if (entry[key] === "" || entry[key] == null || entry[key] === false) {
          delete entry[key];
        }
      });
      if (Object.keys(entry).length) next[tier] = entry;
      else delete next[tier];
      props.responsive = Object.keys(next).length ? next : null;
    });
  };

  const handleResetResponsive = (tier) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      if (!props.responsive) return;
      const next = { ...props.responsive };
      delete next[tier];
      props.responsive = Object.keys(next).length ? next : null;
    });
  };

  const handleEqualizeRow = () => {
    if (!selectedNodeId || !isRowChild) return;
    const childIds = parentNode?.data?.nodes || [];
    if (!childIds.length) return;
    const base = Math.floor(12 / childIds.length);
    const remainder = 12 % childIds.length;
    childIds.forEach((childId, index) => {
      actions.setProp(childId, (props) => {
        props.span = base + (index < remainder ? 1 : 0);
      });
    });
  };

  const handleFillRemaining = () => {
    if (!selectedNodeId || !isRowChild) return;
    const childIds = parentNode?.data?.nodes || [];
    const otherSum = childIds.reduce((sum, childId) => {
      if (childId === selectedNodeId) return sum;
      return sum + (query.node(childId).get()?.data?.props?.span || 6);
    }, 0);
    handleUpdateSpan(Math.max(1, 12 - otherSum));
  };

  const handleMoveSibling = (direction) => {
    if (!selectedNodeId || !parentNode) return;
    const siblings = parentNode.data.nodes || [];
    const index = siblings.indexOf(selectedNodeId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= siblings.length) return;
    actions.move(selectedNodeId, parentId, nextIndex);
  };

  const handleUpdateStyle = (styleKey, value) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      const next = { ...(props.style || {}) };
      if (value === "" || value == null) delete next[styleKey];
      else next[styleKey] = value;
      props.style = next;
    });
  };

  const handleUpdatePageStyle = (styleKey, value) => {
    actions.setProp("ROOT", (props) => {
      const next = { ...(props.style || {}) };
      if (value === "" || value == null) delete next[styleKey];
      else next[styleKey] = value;
      props.style = next;
    });
  };

  const handleUpdatePageSpacing = (styleKey, value) => {
    handleUpdatePageStyle(styleKey, value === "" ? "" : `${value}px`);
  };

  const handleUpdateContainerGap = (value) => {
    // Palette-created containers wrap rows in an inner CanvasColumn;
    // wrapped selections can place rows directly inside the container.
    const targetId = containerUsesInnerColumn ? containerChildId : selectedNodeId;
    if (!targetId) return;
    actions.setProp(targetId, (props) => {
      const next = { ...(props.style || {}) };
      if (value === "" || value == null) delete next.gap;
      else next.gap = `${value}px`;
      props.style = next;
    });
  };

  const handleUpdateCondition = (condition) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      props.condition = condition?.trim() || null;
    });
  };

  const handleUpdateHiddenBehavior = (behavior) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props) => {
      // behavior: 'collapse' | 'preserve-space' | 'collapse-keep-state'
      if (behavior === "preserve-space") {
        props.hideMode = "preserve-space";
        props.keepMounted = false;
      } else if (behavior === "collapse-keep-state") {
        props.hideMode = "collapse";
        props.keepMounted = true;
      } else {
        props.hideMode = null;
        props.keepMounted = false;
      }
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

  const layerSearchTerm = layerSearch.trim().toLowerCase();
  const layerMatches = (nodeId) => {
    const node = allNodes[nodeId];
    if (!node) return false;
    if (!layerSearchTerm) return true;
    const { label } = getNodeMeta(node.data.displayName, node.data.props);
    const customLabel = node.data.props?.label || "";
    const haystack = `${customLabel} ${label} ${node.data.displayName || ""} ${node.data.props?.widgetKey || ""}`.toLowerCase();
    if (haystack.includes(layerSearchTerm)) return true;
    return (node.data.nodes || []).some((childId) => layerMatches(childId));
  };

  const startLayerRename = (nodeId, currentName) => {
    setRenamingLayerId(nodeId);
    setRenameLayerValue(currentName || "");
  };

  const commitLayerRename = (nodeId) => {
    const value = renameLayerValue.trim();
    actions.setProp(nodeId, (props) => {
      props.label = value || null;
    });
    setRenamingLayerId(null);
    setRenameLayerValue("");
  };

  const cancelLayerRename = () => {
    setRenamingLayerId(null);
    setRenameLayerValue("");
  };

  const clearLayerDrag = () => {
    setDraggedLayerId(null);
    setDropTargetId(null);
  };

  const handleLayerDrop = (targetId) => {
    const source = draggedLayerId ? allNodes[draggedLayerId] : null;
    const target = allNodes[targetId];
    if (!source || !target || draggedLayerId === targetId) {
      clearLayerDrag();
      return;
    }
    const parentId = target.data.parent;
    if (!parentId || source.data.parent !== parentId) {
      clearLayerDrag();
      return;
    }
    const siblings = allNodes[parentId]?.data?.nodes || [];
    const from = siblings.indexOf(draggedLayerId);
    const to = siblings.indexOf(targetId);
    if (from < 0 || to < 0 || from === to) {
      clearLayerDrag();
      return;
    }
    // Craft move inserts before the target index after removing the source.
    actions.move(draggedLayerId, parentId, to > from ? to - 1 : to);
    clearLayerDrag();
  };

  const renderLayersTree = (nodeId = "ROOT", depth = 0) => {
    const node = allNodes[nodeId];
    if (!node || !layerMatches(nodeId)) return null;

    const hasChildren = node.data.nodes && node.data.nodes.length > 0;
    const isSelected = selectedIds.includes(nodeId);
    const isLocked = Boolean(node.data.props?.locked);
    const hasCondition = Boolean(node.data.props?.condition);
    const hasRepeat = Boolean(node.data.props?.repeat);
    const { label: defaultName, icon: Icon, color: iconColor } = getNodeMeta(node.data.displayName, node.data.props);
    const name = node.data.props?.label || defaultName;
    const isRenaming = renamingLayerId === nodeId;

    return (
      <div key={nodeId} className="flex flex-col">
        <div
          draggable={nodeId !== "ROOT"}
          onDragStart={(e) => {
            if (nodeId === "ROOT") return;
            e.stopPropagation();
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", nodeId);
            setDraggedLayerId(nodeId);
          }}
          onDragOver={(e) => {
            if (!draggedLayerId || draggedLayerId === nodeId) return;
            const source = allNodes[draggedLayerId];
            if (!source || source.data.parent !== node.data.parent) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDropTargetId(nodeId);
          }}
          onDragLeave={() => setDropTargetId((current) => (current === nodeId ? null : current))}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLayerDrop(nodeId);
          }}
          onDragEnd={clearLayerDrag}
          onClick={(e) => {
            e.stopPropagation();
            if (e.metaKey || e.ctrlKey) {
              const next = selectedIds.includes(nodeId)
                ? selectedIds.filter((id) => id !== nodeId)
                : [...selectedIds, nodeId];
              actions.selectNode(next);
              return;
            }
            actions.selectNode(nodeId);
          }}
          className={`group flex items-center justify-between gap-1 p-2 rounded cursor-pointer transition-all ${
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20 font-medium"
              : "hover:bg-muted/50 text-foreground border border-transparent"
          } ${draggedLayerId === nodeId ? "opacity-40" : ""} ${
            dropTargetId === nodeId ? "ring-1 ring-primary ring-inset" : ""
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 14)}px` }}
          title={nodeId === "ROOT" ? "Page root" : "Drag to reorder · Ctrl/Cmd-click to multi-select"}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {nodeId !== "ROOT" && (
              <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
            )}
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : iconColor}`} />
            {isRenaming ? (
              <input
                autoFocus
                value={renameLayerValue}
                onChange={(e) => setRenameLayerValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => commitLayerRename(nodeId)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") commitLayerRename(nodeId);
                  if (e.key === "Escape") cancelLayerRename();
                }}
                className="min-w-0 flex-1 rounded border border-primary/40 bg-background px-1 py-0.5 text-[11px] text-foreground outline-none"
              />
            ) : (
              <span
                className="truncate text-[11px]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startLayerRename(nodeId, name);
                }}
              >
                {name}
              </span>
            )}
            {(hasCondition || hasRepeat || isLocked) && (
              <span className="ml-0.5 flex shrink-0 items-center gap-0.5 text-muted-foreground/50">
                {hasCondition && <Eye className="h-2.5 w-2.5" aria-label="Has visibility condition" />}
                {hasRepeat && <Repeat className="h-2.5 w-2.5" aria-label="Repeats children" />}
                {isLocked && <Lock className="h-2.5 w-2.5" aria-label="Locked" />}
              </span>
            )}
          </div>
          {nodeId !== "ROOT" && (
            <div className="flex items-center gap-0.5 opacity-0 transition-all group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startLayerRename(nodeId, name);
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                title="Rename layer"
                aria-label="Rename layer"
              >
                <Pencil className="h-3 w-3" />
              </button>
              {node.data.displayName === "CanvasWidgetSlot" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.setProp(nodeId, (props) => {
                      props.locked = !props.locked;
                    });
                  }}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  title={isLocked ? "Unlock widget" : "Lock widget"}
                  aria-label={isLocked ? "Unlock widget" : "Lock widget"}
                >
                  {isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.delete(nodeId);
                  if (isSelected) actions.selectNode([]);
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                title="Delete element"
                aria-label="Delete element"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        {hasChildren && node.data.nodes.map((cid) => renderLayersTree(cid, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className={`border-l border-border/50 bg-card flex flex-col h-full shrink-0 z-40 transition-all duration-200 ${isCollapsed ? "w-10" : "w-[320px]"}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Collapsed icon strip */}
      {isCollapsed ? (
        <div className="flex flex-col items-center pt-2 gap-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Expand panel"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); setActiveTab("settings"); }}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${activeTab === "settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            title="Properties"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); setActiveTab("layers"); }}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${activeTab === "layers" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            title="Layers"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
      {/* Sidebar Tabs */}
            <div className="flex items-center border-b border-border/40 bg-muted/20 pr-1 select-none">
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
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Collapse panel"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {activeTab === "layers" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Page Node Tree
              </div>
              <span className="text-[9px] text-muted-foreground/60">
                drag to reorder
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
                placeholder="Search layers..."
                className="w-full rounded border border-border bg-background py-1.5 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground/40"
              />
              {layerSearch && (
                <button
                  type="button"
                  onClick={() => setLayerSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-1 py-0.5 text-[9px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  clear
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 bg-muted/20 p-2 rounded border border-border/30">
              {renderLayersTree("ROOT") || (
                <span className="p-2 text-center text-[10px] text-muted-foreground">
                  No layers match “{layerSearch}”.
                </span>
              )}
            </div>
            <span className="text-[9px] leading-tight text-muted-foreground/60">
              Drag rows to reorder siblings. Ctrl/Cmd-click to select multiple layers.
            </span>
          </div>
        ) : !selectedNodeId || selectedNodeId === "ROOT" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
              <Columns className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold text-foreground">Page Layout</div>
                <div className="text-[9px] text-muted-foreground">
                  Spacing for the page root container
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Page Spacing
              </div>
              <NumericSpacingControl
                label="Inner page padding"
                value={pageStyle.padding}
                onChange={(value) => handleUpdatePageSpacing("padding", value)}
                presets={[0, 8, 16, 24, 32]}
                help="Space inside the page frame, before the first top-level row."
              />
              <NumericSpacingControl
                label="Gap between blocks"
                value={pageStyle.gap ?? 8}
                onChange={(value) => handleUpdatePageSpacing("gap", value)}
                presets={[0, 4, 8, 12, 16, 24]}
                help="Vertical space between top-level rows and containers."
              />
            </div>

            <div className="pb-2 border-b border-border/30">
              <ColorField
                label="Page background"
                value={pageStyle.backgroundColor ?? ""}
                onChange={(value) => handleUpdatePageStyle("backgroundColor", value)}
                placeholder="transparent"
              />
            </div>

            <div className="rounded border border-dashed border-border/60 p-2 text-[9px] leading-relaxed text-muted-foreground">
              Tip: select a row to set its grid gap, a container to set its content gap,
              or a stack to set its flex gap. Click empty canvas space or press Esc to
              return to page settings.
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Select any row, container, stack or widget to edit its own spacing and logic.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedCount > 1 && (
              <div className="flex items-start gap-2 rounded border border-primary/25 bg-primary/5 p-2 text-[11px] leading-snug text-primary">
                <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {selectedCount} elements selected. Use the toolbar on the canvas to
                  equalize, distribute or delete them together.
                </span>
              </div>
            )}
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

            <div className="sticky top-0 z-20 -mx-2 flex items-center gap-1 border-b border-border/40 bg-card/95 px-2 py-1.5 backdrop-blur">
              {[
                ["Spacing", "inspector-spacing"],
                ["Layout", "inspector-layout"],
                ["Responsive", "inspector-responsive"],
                ["Style", "inspector-style"],
                ["Logic", "inspector-logic"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const target =
                      document.getElementById(id) ||
                      document.getElementById("inspector-style");
                    target?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded border border-border/60 bg-background px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto truncate text-[8px] text-muted-foreground/50">
                inspector
              </span>
            </div>

            {/* Quick Component Actions */}
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Component Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWrapInContainer}
                  className="p-2 text-xs text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Box className="h-3 w-3" /> Wrap Container
                </button>
                <button
                  onClick={handleWrapInZStack}
                  className="p-2 text-xs text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2"
                >
                  <Layers className="h-3 w-3" /> Wrap Z-Stack
                </button>
                {(displayName === "CanvasContainer" || displayName === "CanvasStack" || displayName === "CanvasZStack") && (
                  <button
                    onClick={handleUnwrapNode}
                    className="p-2 text-xs text-left hover:bg-muted rounded border border-border/50 text-foreground flex items-center gap-2 col-span-2"
                  >
                    <Plus className="h-3 w-3 rotate-45" /> Unwrap Children & Delete
                  </button>
                )}
              </div>
            </div>

            {/* Row / container spacing — kept near the top so it is discoverable */}
            {(displayName === "CanvasRow" || displayName === "CanvasContainer") && (
              <div id="inspector-spacing" className="flex scroll-mt-10 flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  {displayName === "CanvasRow" ? "Row Spacing" : "Container Spacing"}
                </div>

                {displayName === "CanvasRow" && (
                  <>
                    <NumericSpacingControl
                      label="Gap between widgets"
                      value={nodeProps.style?.gap ?? 8}
                      onChange={(value) =>
                        handleUpdateStyle("gap", value === "" ? "" : `${value}px`)
                      }
                      help="Space between grid columns and between wrapped rows."
                    />
                    <span className="text-[9px] leading-tight text-muted-foreground/70">
                      Row padding and margin are under Spacing &amp; Card style.
                    </span>
                  </>
                )}

                {displayName === "CanvasContainer" && (
                  <>
                    <NumericSpacingControl
                      label="Content gap"
                      value={containerGapStyle.gap ?? (containerUsesInnerColumn ? 8 : 0)}
                      onChange={handleUpdateContainerGap}
                      help="Vertical space between rows inside this container."
                    />
                    <span className="text-[9px] leading-tight text-muted-foreground/70">
                      Outer padding and margin are under Spacing &amp; Card style.
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Layout and Column Span */}
            <div id="inspector-layout" className="flex scroll-mt-10 flex-col gap-2 pb-2 border-b border-border/30">
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
                  <div className="grid grid-cols-5 gap-1">
                    {[3, 4, 6, 8, 12].map((span) => (
                      <button
                        key={span}
                        type="button"
                        onClick={() => handleUpdateSpan(span)}
                        className={`rounded border px-1 py-1 text-[10px] font-medium transition-colors ${
                          (nodeProps.span || 6) === span
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {span}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSibling(-1)}
                      className="flex-1 rounded border border-border bg-background px-1 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      ← Move
                    </button>
                    <button
                      type="button"
                      onClick={handleEqualizeRow}
                      className="flex-1 rounded border border-border bg-background px-1 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Equalize
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSibling(1)}
                      className="flex-1 rounded border border-border bg-background px-1 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Move →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    className="rounded border border-border bg-background px-1 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Fill remaining width
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Height Mode</span>
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
                  <span className="text-xs text-muted-foreground">Height (px)</span>
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

            {/* Per-breakpoint overrides */}
            {selectedNodeId && selectedNodeId !== "ROOT" && (
              <div
                id="inspector-responsive"
                className="flex scroll-mt-10 flex-col gap-2 pb-2 border-b border-border/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Responsive Overrides
                  </div>
                  <span className="rounded border border-border/50 bg-muted/30 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider text-muted-foreground">
                    editing · {BREAKPOINT_LABELS[breakpointTier]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "tablet", label: "Tablet", Icon: Tablet, range: "641–1023px" },
                    { id: "mobile", label: "Mobile", Icon: Smartphone, range: "≤ 640px" },
                  ].map(({ id, label, Icon, range }) => {
                    const override = nodeProps.responsive?.[id] || {};
                    const isCurrent = breakpointTier === id;
                    return (
                      <div
                        key={id}
                        className={`flex flex-col gap-1.5 rounded border p-1.5 ${
                          isCurrent
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 bg-background"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-semibold text-foreground">{label}</span>
                          <span className="ml-auto text-[8px] text-muted-foreground/60">
                            {range}
                          </span>
                        </div>
                        {displayName !== "CanvasRow" && displayName !== "CanvasColumn" && (
                          <label className="flex items-center justify-between gap-1 text-[9px] text-muted-foreground">
                            <span>Span</span>
                            <select
                              value={override.span ?? ""}
                              onChange={(e) =>
                                handleUpdateResponsive(id, {
                                  span: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="min-w-0 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground"
                            >
                              <option value="">Inherit</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((span) => (
                                <option key={span} value={span}>
                                  {span}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        {displayName === "CanvasStack" && (
                          <label className="flex items-center justify-between gap-1 text-[9px] text-muted-foreground">
                            <span>Direction</span>
                            <select
                              value={override.direction ?? ""}
                              onChange={(e) =>
                                handleUpdateResponsive(id, {
                                  direction: e.target.value || null,
                                })
                              }
                              className="min-w-0 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground"
                            >
                              <option value="">Inherit</option>
                              <option value="horizontal">Horizontal</option>
                              <option value="vertical">Vertical</option>
                            </select>
                          </label>
                        )}
                        <label className="flex items-center justify-between gap-1 text-[9px] text-muted-foreground">
                          <span>Visible</span>
                          <input
                            type="checkbox"
                            checked={!override.hidden}
                            onChange={(e) =>
                              handleUpdateResponsive(id, {
                                hidden: e.target.checked ? null : true,
                              })
                            }
                            className="h-3 w-3 accent-primary"
                            aria-label={`Visible on ${label}`}
                          />
                        </label>
                        {nodeProps.responsive?.[id] && (
                          <button
                            type="button"
                            onClick={() => handleResetResponsive(id)}
                            className="rounded border border-border/60 px-1 py-0.5 text-[8px] text-muted-foreground hover:text-foreground"
                          >
                            Reset {label.toLowerCase()}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[9px] leading-tight text-muted-foreground/70">
                  Mobile inherits a full-width span until overridden. Resize the canvas
                  with the device buttons to preview each tier.
                </span>
              </div>
            )}

            {/* Flex Stack specific controls */}
            {displayName === "CanvasStack" && (
              <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Flex Stack Alignment
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">Direction</span>
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
                    <span className="text-xs text-muted-foreground">Child gap (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="128"
                      value={nodeProps.gap ?? 8}
                      onChange={(e) => actions.setProp(selectedNodeId, (props) => { props.gap = parseInt(e.target.value) || 0; })}
                      className="bg-background border border-border rounded p-2 text-xs"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[0, 4, 8, 16, 24].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            actions.setProp(selectedNodeId, (props) => {
                              props.gap = preset;
                            })
                          }
                          className="min-w-[20px] rounded border border-border bg-background px-0.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Align Items</span>
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
                        className={`flex-1 text-xs py-1 rounded transition-colors ${
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
                  <div className="text-xs text-muted-foreground/60 italic p-2 text-center">
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
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
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
            <div id="inspector-style" className="flex scroll-mt-10 flex-col gap-2 pb-2 border-b border-border/30">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Spacing & Card style
              </div>
              <div className="grid grid-cols-1 gap-2">
                <BoxSpacingControl
                  label="Padding"
                  value={nodeProps.style?.padding ?? ""}
                  onChange={(value) => handleUpdateStyle("padding", value)}
                />
                <BoxSpacingControl
                  label="Margin"
                  value={nodeProps.style?.margin ?? ""}
                  onChange={(value) => handleUpdateStyle("margin", value)}
                />
              </div>

              <span className="text-[9px] leading-tight text-muted-foreground/70">
                Each side accepts CSS values: 8px, 1rem or 0. The box writes the equivalent
                shorthand back to the layout.
              </span>
              {displayName === "CanvasWidgetSlot" && (
                <span className="text-[9px] leading-tight text-muted-foreground/70">
                  These values wrap the layout slot. Widget-internal padding stays in the
                  widget configuration.
                </span>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Corner Radius</span>
                  <input
                    type="text"
                    placeholder="e.g. 6px"
                    value={nodeProps.style?.borderRadius ?? ""}
                    onChange={(e) => handleUpdateStyle("borderRadius", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Border Width</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="auto"
                    value={parsePxValue(nodeProps.style?.borderWidth)}
                    onChange={(e) =>
                      handleUpdateStyle(
                        "borderWidth",
                        e.target.value === "" ? "" : `${e.target.value}px`
                      )
                    }
                    className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <ColorField
                label="Background Color"
                value={nodeProps.style?.backgroundColor ?? ""}
                onChange={(value) => handleUpdateStyle("backgroundColor", value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Border Style</span>
                  <select
                    value={nodeProps.style?.borderStyle ?? "solid"}
                    onChange={(e) => handleUpdateStyle("borderStyle", e.target.value)}
                    className="bg-background border border-border rounded p-2 text-xs text-foreground"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Opacity</span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={nodeProps.style?.opacity ?? 1}
                    onChange={(e) =>
                      handleUpdateStyle(
                        "opacity",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="bg-background border border-border rounded p-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <ColorField
                label="Border Color"
                value={nodeProps.style?.borderColor ?? ""}
                onChange={(value) => handleUpdateStyle("borderColor", value)}
                placeholder="e.g. #334155"
              />

              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-mono">Box Shadow</span>
                <input
                  type="text"
                  placeholder="e.g. 0 8px 24px rgba(0,0,0,0.2)"
                  value={nodeProps.style?.boxShadow ?? ""}
                  onChange={(e) => handleUpdateStyle("boxShadow", e.target.value)}
                  className="bg-background border border-border rounded p-2 text-xs text-foreground placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            {/* Visibility Conditions & Loop Logic */}
            <div id="inspector-logic" className="flex scroll-mt-10 flex-col gap-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Visibility & Loop Logic
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] text-foreground">
                  <Eye className="h-3 w-3 text-amber-500" />
                  <span>Show Condition (If)</span>
                  <ConditionPreviewBadge
                    condition={nodeProps.condition}
                    editorLiveStateTree={editorLiveStateTree}
                  />
                </div>
                <div className="bg-background/50 border border-border/80 rounded p-2">
                  <TemplateAutocompleteInput
                    id={`condition_${selectedNodeId}`}
                    value={nodeProps.condition || ""}
                    onChange={handleUpdateCondition}
                    placeholder="{{ state.variables.isAdmin }}"
                    liveStateTree={editorLiveStateTree}
                  />
                </div>
                <ConditionQuickInserts
                  editorLiveStateTree={editorLiveStateTree}
                  onInsert={(snippet) =>
                    handleUpdateCondition(
                      nodeProps.condition ? `${nodeProps.condition} ${snippet}` : snippet
                    )
                  }
                  onClear={() => handleUpdateCondition("")}
                />
                <span className="text-[9px] text-muted-foreground/60 leading-tight">
                  Full JS inside {`{{ }}`}, e.g. {`{{ state.variables.dnsType === 'Domain' }}`}. Empty = always show. Error = hidden + logged (fail-closed). Truthy non-boolean shows but warns.
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-foreground">When hidden</span>
                  <select
                    value={
                      nodeProps.hideMode === "preserve-space"
                        ? "preserve-space"
                        : nodeProps.keepMounted
                          ? "collapse-keep-state"
                          : "collapse"
                    }
                    onChange={(e) => handleUpdateHiddenBehavior(e.target.value)}
                    className="w-full bg-background border border-border rounded p-2 text-xs"
                  >
                    <option value="collapse">Collapse (unmount, no space)</option>
                    <option value="preserve-space">Preserve space (hidden, keeps state)</option>
                    <option value="collapse-keep-state">Collapse but keep state (display:none)</option>
                  </select>
                  <span className="text-[9px] text-muted-foreground/60 leading-tight">
                    Collapse unmounts and loses form/table state. Preserve space keeps layout space + state. Keep-state collapses layout but preserves state.
                  </span>
                </div>
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
                    placeholder="{{ state.queries.my_query.data }}"
                    liveStateTree={editorLiveStateTree}
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
        </>
      )}
    </div>
  );
}
