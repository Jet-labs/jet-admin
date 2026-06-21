import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Trash2,
  Box,
  LayoutTemplate,
  Lock,
  Paintbrush,
  X,
  Settings2,
  Eye,
  Repeat2,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignVerticalJustifyStart,
  Minus,
  Plus,
  MoreHorizontal,
  Maximize2,
  GripVertical,
  Layers,
  Code2,
  Layers2,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Label, TemplateAutocompleteInput } from "@jet-admin/ui";
import { useAppPageStateTree } from "../../../../logic/appPageRuntime";

// ─── Design tokens (Jet Admin / Supabase-derived) ────────────────────────────
// All colors use Tailwind semantic tokens per DESIGN.md.

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function IconButton({ onClick, active, danger, title, disabled, children, className = "" }) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={title}
            className={[
              "inline-flex items-center justify-center rounded",
              "h-6 w-6 shrink-0 transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              "disabled:opacity-30 disabled:pointer-events-none",
              active
                ? "bg-primary/10 text-primary"
                : danger
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              className,
            ].join(" ")}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="z-[200] rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-md select-none pointer-events-none"
          >
            {title}
            <Tooltip.Arrow className="fill-foreground" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-border/40 mx-0.5 shrink-0" />;
}

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
      {children}
    </p>
  );
}

function ApplyButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 self-end text-[10px] font-semibold px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
    >
      {children}
    </button>
  );
}

function ClearButton({ onClick, children = "Clear" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[9px] font-medium text-destructive/80 hover:text-destructive px-1 py-0.5 rounded transition-colors"
    >
      {children}
    </button>
  );
}

// ─── Sizing toggle group ──────────────────────────────────────────────────────

const SIZING_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "fill", label: "Fill" },
  { value: "fixed", label: "px" },
];

function SizingGroup({ node, onUpdateSizing }) {
  return (
    <div className="flex items-center rounded-md border border-border/40 overflow-hidden bg-muted/20 h-6">
      {SIZING_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            if (value === "fixed") {
              const h = prompt("Fixed height in px:", node.fixedHeight || 200);
              if (h) onUpdateSizing(node.id, "fixed", parseInt(h, 10));
            } else {
              onUpdateSizing(node.id, value);
            }
          }}
          className={[
            "h-full px-1.5 text-[10px] font-medium transition-colors border-r border-border/30 last:border-0",
            node.sizing === value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Span stepper ─────────────────────────────────────────────────────────────

function SpanStepper({ node, onUpdateSpan }) {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton
        title="Narrow column"
        disabled={node.span <= 1}
        onClick={() => onUpdateSpan(node.id, node.span - 1)}
      >
        <Minus className="h-3 w-3" />
      </IconButton>
      <span className="font-mono text-[10px] text-muted-foreground w-5 text-center tabular-nums">
        {node.span}
      </span>
      <IconButton
        title="Widen column"
        disabled={node.span >= 12}
        onClick={() => onUpdateSpan(node.id, node.span + 1)}
      >
        <Plus className="h-3 w-3" />
      </IconButton>
    </div>
  );
}

// ─── Style Popover ─────────────────────────────────────────────────────────────

const PADDING_OPTIONS = ["", "4px", "8px", "12px", "16px", "24px"];
const MARGIN_OPTIONS = ["", "4px", "8px", "12px", "16px"];
const GAP_OPTIONS = ["", "0px", "4px", "8px", "12px", "16px", "24px"];
const RADIUS_OPTIONS = ["", "0px", "4px", "6px", "8px", "12px", "16px", "9999px"];
const ALIGN_OPTIONS = [
  { value: "", label: "Default", Icon: AlignVerticalJustifyStart },
  { value: "stretch", label: "Stretch", Icon: AlignVerticalJustifyStart },
  { value: "center", label: "Center", Icon: AlignCenterVertical },
  { value: "flex-start", label: "Start", Icon: AlignStartVertical },
  { value: "flex-end", label: "End", Icon: AlignEndVertical },
];

function StyleSelect({ label, value, options, onChange, formatLabel }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <select
        className="h-7 rounded-md border border-border/40 bg-background text-foreground text-[11px] px-2 outline-none focus:border-primary/60 transition-colors cursor-pointer"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatLabel ? formatLabel(opt) : opt || "Default"}
          </option>
        ))}
      </select>
    </div>
  );
}

function StylePopover({ node, onUpdateStyle }) {
  const showGap = node.type === "row" || node.type === "stack" || node.type === "column";
  const showRadius = node.type === "widget" || node.type === "container" || node.type === "stack";
  const showAlign = node.type === "row" || node.type === "stack";

  const update = (key) => (val) => onUpdateStyle(node.id, { [key]: val });

  const clearAll = () => {
    onUpdateStyle(node.id, {
      padding: undefined, margin: undefined, gap: undefined,
      borderRadius: undefined, alignItems: undefined,
    });
  };

  return (
    <Popover.Root>
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Style"
                className="inline-flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Paintbrush className="h-3 w-3" />
                <span className="hidden sm:inline">Style</span>
              </button>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6} className="z-[200] rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-md select-none pointer-events-none">
              Layout &amp; Spacing
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          className="z-[160] w-52 rounded-md border border-border/40 bg-background shadow-lg p-3 flex flex-col gap-2.5 outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-0.5">
            <SectionLabel>Style</SectionLabel>
            <ClearButton onClick={clearAll}>Clear all</ClearButton>
          </div>

          <StyleSelect
            label="Padding"
            value={node.style?.padding}
            options={PADDING_OPTIONS}
            onChange={update("padding")}
            formatLabel={(v) => v || "None (default)"}
          />

          <StyleSelect
            label="Margin"
            value={node.style?.margin}
            options={MARGIN_OPTIONS}
            onChange={update("margin")}
            formatLabel={(v) => v || "None (default)"}
          />

          {showGap && (
            <StyleSelect
              label="Gap / Spacing"
              value={node.style?.gap}
              options={GAP_OPTIONS}
              onChange={update("gap")}
              formatLabel={(v) => v || "Default"}
            />
          )}

          {showRadius && (
            <StyleSelect
              label="Border Radius"
              value={node.style?.borderRadius}
              options={RADIUS_OPTIONS}
              onChange={update("borderRadius")}
              formatLabel={(v) => (v === "9999px" ? "Pill" : v || "Theme default")}
            />
          )}

          {showAlign && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-muted-foreground">Alignment</Label>
              <div className="flex gap-1">
                {ALIGN_OPTIONS.filter((o) => o.value !== "").map(({ value, label, Icon }) => (
                  <Tooltip.Provider key={value} delayDuration={400}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          onClick={() => update("alignItems")(value)}
                          className={[
                            "flex-1 h-7 flex items-center justify-center rounded border transition-colors",
                            node.style?.alignItems === value
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          ].join(" ")}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={4} className="z-[200] rounded bg-foreground px-2 py-0.5 text-[10px] text-background">
                          {label}
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                ))}
              </div>
            </div>
          )}

          <Popover.Arrow className="fill-border/40" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─── Logic Popover ─────────────────────────────────────────────────────────────

function LogicPopover({ node, onUpdateCondition, onUpdateRepeat, liveStateTree }) {
  const hasCondition = !!node.condition;
  const hasRepeat = !!node.repeat;
  const hasAny = hasCondition || hasRepeat;

  const [conditionDraft, setConditionDraft] = useState(node.condition || "");
  const [repeatCollectionDraft, setRepeatCollectionDraft] = useState(node.repeat?.collection || "");
  const [repeatItemAliasDraft, setRepeatItemAliasDraft] = useState(node.repeat?.itemAlias || "item");
  const [repeatIndexAliasDraft, setRepeatIndexAliasDraft] = useState(node.repeat?.indexAlias || "index");

  useEffect(() => {
    setConditionDraft(node.condition || "");
    setRepeatCollectionDraft(node.repeat?.collection || "");
    setRepeatItemAliasDraft(node.repeat?.itemAlias || "item");
    setRepeatIndexAliasDraft(node.repeat?.indexAlias || "index");
  }, [node.id, node.condition, node.repeat?.collection, node.repeat?.itemAlias, node.repeat?.indexAlias]);

  const applyCondition = () => onUpdateCondition?.(node.id, conditionDraft || null);
  const clearCondition = () => { setConditionDraft(""); onUpdateCondition?.(node.id, null); };

  const applyRepeat = () => {
    if (repeatCollectionDraft.trim() && repeatItemAliasDraft.trim()) {
      onUpdateRepeat?.(node.id, {
        collection: repeatCollectionDraft,
        itemAlias: repeatItemAliasDraft,
        indexAlias: repeatIndexAliasDraft || undefined,
      });
    }
  };

  const clearRepeat = () => {
    setRepeatCollectionDraft(""); setRepeatItemAliasDraft("item"); setRepeatIndexAliasDraft("index");
    onUpdateRepeat?.(node.id, null);
  };

  if (!onUpdateCondition && !onUpdateRepeat) return null;

  return (
    <Popover.Root>
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Logic"
                className={[
                  "inline-flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-medium transition-colors relative",
                  hasAny
                    ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {hasRepeat ? <Repeat2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span className="hidden sm:inline">Logic</span>
                {hasAny && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6} className="z-[200] rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-md select-none pointer-events-none">
              Condition &amp; Repeat
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          className="z-[160] rounded-md border border-border/40 bg-background shadow-lg p-3 flex flex-col gap-4 outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Condition section */}
          {onUpdateCondition && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <SectionLabel>Show / Hide</SectionLabel>
                </div>
                {hasCondition && <ClearButton onClick={clearCondition} />}
              </div>
              <Label className="text-[10px] text-muted-foreground">
                Expression — truthy = visible
              </Label>
              <TemplateAutocompleteInput
                value={conditionDraft}
                onChange={setConditionDraft}
                placeholder="{{ state.variables.showSection }}"
                liveStateTree={liveStateTree}
                mode="js-template"
                className="text-foreground text-xs"
              />
              <ApplyButton onClick={applyCondition}>Apply condition</ApplyButton>
            </div>
          )}

          {onUpdateCondition && onUpdateRepeat && (
            <div className="h-px bg-border/30" />
          )}

          {/* Repeat section */}
          {onUpdateRepeat && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Repeat2 className="h-3 w-3 text-muted-foreground" />
                  <SectionLabel>Repeat</SectionLabel>
                </div>
                {hasRepeat && <ClearButton onClick={clearRepeat} />}
              </div>
              <Label className="text-[10px] text-muted-foreground">Collection expression</Label>
              <TemplateAutocompleteInput
                value={repeatCollectionDraft}
                onChange={setRepeatCollectionDraft}
                placeholder="{{ state.queries.users.data }}"
                liveStateTree={liveStateTree}
                mode="js-template"
                className="text-foreground text-xs"
              />
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <Label className="text-[10px] text-muted-foreground">Item alias</Label>
                  <input
                    type="text"
                    value={repeatItemAliasDraft}
                    onChange={(e) => setRepeatItemAliasDraft(e.target.value)}
                    placeholder="item"
                    className="h-7 rounded-md border border-border/40 bg-background text-foreground text-[11px] font-mono px-2 outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <Label className="text-[10px] text-muted-foreground">Index alias</Label>
                  <input
                    type="text"
                    value={repeatIndexAliasDraft}
                    onChange={(e) => setRepeatIndexAliasDraft(e.target.value)}
                    placeholder="index"
                    className="h-7 rounded-md border border-border/40 bg-background text-foreground text-[11px] font-mono px-2 outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground/50 leading-snug">
                Reference in widgets:{" "}
                <code className="font-mono text-amber-500/80 bg-muted/40 px-0.5 rounded">
                  {"{{ state.variables.<alias> }}"}
                </code>
              </p>
              <ApplyButton onClick={applyRepeat}>Apply repeat</ApplyButton>
            </div>
          )}

          <Popover.Arrow className="fill-border/40" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─── Overflow / More menu ──────────────────────────────────────────────────────

function MoreMenu({ node, onWrap, onUnwrap, onWrapZStack, onUnwrapZStack, onToggleLock, onEditWidget, onDelete, onClose }) {
  return (
    <Popover.Root>
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6} className="z-[200] rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-md select-none pointer-events-none">
              More actions
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          className="z-[160] min-w-[160px] rounded-md border border-border/40 bg-background shadow-lg py-1.5 outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {node.type === "widget" && onEditWidget && (
            <MoreMenuItem
              icon={<Settings2 className="h-3.5 w-3.5" />}
              label="Edit widget"
              onClick={() => {
                onEditWidget(node.widgetKey.split("_")[1]);
                onClose?.();
              }}
            />
          )}
          {node.type === "widget" && onToggleLock && (
            <MoreMenuItem
              icon={<Lock className="h-3.5 w-3.5" />}
              label="Lock (interact)"
              onClick={() => onToggleLock(node.id)}
            />
          )}

          {node.type !== "container" && node.type !== "z-stack" && (
            <MoreMenuItem
              icon={<Box className="h-3.5 w-3.5" />}
              label="Wrap in container"
              onClick={() => onWrap(node.id)}
            />
          )}
          {node.type === "container" && (
            <MoreMenuItem
              icon={<LayoutTemplate className="h-3.5 w-3.5" />}
              label="Unwrap container"
              onClick={() => onUnwrap(node.id)}
            />
          )}

          {/* Z-Stack actions */}
          {node.type !== "z-stack" && onWrapZStack && (
            <MoreMenuItem
              icon={<Layers2 className="h-3.5 w-3.5" />}
              label="Wrap in Z-Stack"
              onClick={() => onWrapZStack(node.id)}
            />
          )}
          {node.type === "z-stack" && onUnwrapZStack && (
            <MoreMenuItem
              icon={<Layers2 className="h-3.5 w-3.5" />}
              label="Unwrap Z-Stack"
              onClick={() => onUnwrapZStack(node.id)}
            />
          )}

          <div className="my-1 h-px bg-border/30 mx-2" />

          <MoreMenuItem
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Delete"
            danger
            onClick={() => onDelete(node.id)}
          />

          <Popover.Arrow className="fill-border/40" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MoreMenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2.5 w-full px-3 py-1.5 text-[11px] font-medium transition-colors",
        danger
          ? "text-destructive hover:bg-destructive/8"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Node type badge ──────────────────────────────────────────────────────────

const NODE_TYPE_ICONS = {
  row: <GripVertical className="h-2.5 w-2.5" />,
  column: <Layers className="h-2.5 w-2.5" />,
  container: <Box className="h-2.5 w-2.5" />,
  stack: <LayoutTemplate className="h-2.5 w-2.5" />,
  "z-stack": <Layers2 className="h-2.5 w-2.5" />,
  widget: <Code2 className="h-2.5 w-2.5" />,
};

function NodeTypeBadge({ type }) {
  return (
    <div className="flex items-center gap-1 pr-1.5 border-r border-border/30">
      <span className="text-muted-foreground/40">
        {NODE_TYPE_ICONS[type] ?? null}
      </span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
        {type}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const SIZING_NODE_TYPES = new Set(["row", "widget", "container", "stack", "z-stack"]);

export default function LayoutNodeToolbar({
  node,
  onUpdateSizing,
  onUpdateSpan,
  onWrap,
  onUnwrap,
  onWrapZStack,
  onUnwrapZStack,
  onDelete,
  onToggleLock,
  onUpdateStyle,
  onUpdateCondition,
  onUpdateRepeat,
  onClose,
  onEditWidget,
}) {
  const stateTree = useAppPageStateTree();
  const liveStateTree = useMemo(() => (stateTree ? { state: stateTree } : null), [stateTree]);

  const toolbarRef = useRef(null);
  const [placement, setPlacement] = useState("top");

  // Collision-detect: flip to bottom when too close to canvas top edge
  useEffect(() => {
    const check = () => {
      if (!toolbarRef.current) return;
      const parent = toolbarRef.current.parentElement;
      const canvas = parent?.closest(".layout-editor-canvas-container") ?? document.body;
      const parentTop = parent?.getBoundingClientRect().top ?? 0;
      const canvasTop = canvas.getBoundingClientRect().top;
      setPlacement(parentTop - canvasTop < 45 ? "bottom" : "top");
    };
    check();
    window.addEventListener("scroll", check, { capture: true, passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
    };
  }, [node.id]);

  const positionStyle =
    placement === "bottom"
      ? { top: "100%", bottom: "auto", marginTop: 4, marginBottom: 0 }
      : {};

  const hasSizing = SIZING_NODE_TYPES.has(node.type);
  const hasSpan = typeof node.span === "number";
  const hasStyle = !!onUpdateStyle;
  const hasLogic = !!(onUpdateCondition || onUpdateRepeat);

  return (
    /*
     * Outer wrapper: absolute bar that lives above (or below) the node.
     * overflow-visible so Radix popovers escape cleanly.
     * pointer-events-auto ensures clicks work even inside a no-events parent.
     */
    <div
      ref={toolbarRef}
      style={positionStyle}
      className={[
        "layout-node-toolbar",
        "absolute z-[100] pointer-events-auto",
        // When at top, pin to bottom of bar position (above the node)
        placement === "top" ? "bottom-full mb-1" : "",
        "left-0",
        // Prevent the toolbar from being clipped by any parent overflow:hidden
        // by limiting its own width to what it needs, with overflow visible
        "max-w-max",
      ].join(" ")}
      // Stop clicks from propagating to the canvas (deselect events etc.)
      onClick={(e) => e.stopPropagation()}
    >
      {/*
       * Inner pill: the visible chrome.
       * rounded-md per Jet Admin design system (6px button radius rule).
       * bg-background + border = flat card, no shadow (elevation 0).
       */}
      <div className="flex items-center gap-0.5 h-8 px-1.5 rounded-md border border-border/60 bg-card shadow-sm text-foreground whitespace-nowrap">

        {/* ── Node type badge ── */}
        <NodeTypeBadge type={node.type} />

        {/* ── Sizing toggles ── */}
        {hasSizing && (
          <>
            <SizingGroup node={node} onUpdateSizing={onUpdateSizing} />
            {(hasSpan || hasStyle || hasLogic) && <Divider />}
          </>
        )}

        {/* ── Span stepper ── */}
        {hasSpan && (
          <>
            <SpanStepper node={node} onUpdateSpan={onUpdateSpan} />
            {(hasStyle || hasLogic) && <Divider />}
          </>
        )}

        {/* ── Style popover ── */}
        {hasStyle && (
          <StylePopover node={node} onUpdateStyle={onUpdateStyle} />
        )}

        {/* ── Logic popover ── */}
        {hasLogic && (
          <LogicPopover
            node={node}
            onUpdateCondition={onUpdateCondition}
            onUpdateRepeat={onUpdateRepeat}
            liveStateTree={liveStateTree}
          />
        )}

        <Divider />

        {/* ── More menu (wrap/unwrap/lock/edit/delete) ── */}
        <MoreMenu
          node={node}
          onWrap={onWrap}
          onUnwrap={onUnwrap}
          onWrapZStack={onWrapZStack}
          onUnwrapZStack={onUnwrapZStack}
          onToggleLock={onToggleLock}
          onEditWidget={onEditWidget}
          onDelete={onDelete}
          onClose={onClose}
        />

        {/* ── Close ── */}
        {onClose && (
          <>
            <Divider />
            <IconButton title="Dismiss" onClick={onClose}>
              <X className="h-3 w-3" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}