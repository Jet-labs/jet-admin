/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@craftjs/core";
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Copy,
  CopyPlus,
  ClipboardPaste,
  CornerUpLeft,
  Group,
  Lock,
  MousePointer2,
  Trash2,
  Ungroup,
  Unlock,
} from "lucide-react";
import PropTypes from "prop-types";
import { runEditorCommand } from "./editorCommands";

const isEditableTarget = (target) => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], .craft-zoom-hud, .craft-ruler, [data-canvas-ui]"
    )
  );
};

export default function CanvasContextMenu({ setWidgets }) {
  const { query, actions } = useEditor();
  const { selectedKey, enabled } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || [])
      .sort()
      .join("|"),
    enabled: state.options.enabled,
  }));
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setMenu(null);
      return undefined;
    }
    const canvas = document.getElementById("craft-canvas-root");
    if (!canvas) return undefined;

    const onContextMenu = (event) => {
      if (isEditableTarget(event.target)) return;
      const nodeEl = event.target instanceof Element
        ? event.target.closest("[data-node-type]")
        : null;
      if (!nodeEl || !canvas.contains(nodeEl)) return;
      const nodeId = nodeEl.id;
      if (!nodeId) return;

      try {
        const node = query.node(nodeId).get();
        if (!node) return;
        event.preventDefault();
        event.stopPropagation();
        const selected = query.getEvent("selected").all();
        if (!selected.includes(nodeId)) {
          actions.selectNode(nodeId);
        }
        setMenu({
          nodeId,
          parentId: node.data.parent,
          displayName: node.data.displayName,
          x: Math.min(event.clientX, Math.max(8, window.innerWidth - 236)),
          y: Math.min(event.clientY, Math.max(8, window.innerHeight - 300)),
        });
      } catch {
        /* not a live craft node */
      }
    };

    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      setMenu(null);
    };
    const close = () => setMenu(null);
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    canvas.addEventListener("contextmenu", onContextMenu, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("wheel", close, { passive: true });
    return () => {
      canvas.removeEventListener("contextmenu", onContextMenu, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("wheel", close);
    };
  }, [enabled, query, actions]);

  const node = useMemo(() => {
    if (!menu?.nodeId) return null;
    try {
      return query.node(menu.nodeId).get();
    } catch {
      return null;
    }
  }, [menu?.nodeId, query, selectedKey]);

  if (!menu || !node) return null;

  const selected = query.getEvent("selected").all();
  const nodeIds = selected.includes(menu.nodeId) ? selected : [menu.nodeId];
  const isWidget = node.data.displayName === "CanvasWidgetSlot";
  const isLocked = Boolean(node.data.props?.locked);
  const parent = menu.parentId ? (() => {
    try {
      return query.node(menu.parentId).get();
    } catch {
      return null;
    }
  })() : null;
  const canGroup =
    nodeIds.length > 1 &&
    parent &&
    !["CanvasZStack", "ROOT"].includes(parent.data.displayName);
  const canUngroup =
    ["CanvasStack", "CanvasContainer"].includes(node.data.displayName) &&
    (node.data.nodes || []).length > 0;
  const canAlign =
    parent && ["CanvasRow", "CanvasStack"].includes(parent.data.displayName);

  const close = () => setMenu(null);

  const deferCommand = (name, ...args) => {
    // The right-click selection may not have propagated to the clipboard
    // bridge yet; give Craft one tick before running the command.
    setTimeout(() => runEditorCommand(name, ...args), 0);
    close();
  };

  const handleDelete = () => {
    const widgetKeys = new Set();
    const collect = (id) => {
      try {
        const n = query.node(id).get();
        const key = n?.data?.props?.widgetKey;
        if (key) widgetKeys.add(key);
        (n?.data?.nodes || []).forEach(collect);
      } catch {
        /* stale */
      }
    };
    nodeIds.forEach(collect);
    actions.delete(nodeIds);
    actions.selectNode([]);
    if (widgetKeys.size && setWidgets) {
      setWidgets((prev) =>
        Array.isArray(prev) ? prev.filter((key) => !widgetKeys.has(key)) : prev
      );
    }
    close();
  };

  const handleLock = () => {
    if (!isWidget) return;
    actions.setProp(menu.nodeId, (props) => {
      props.locked = !props.locked;
    });
    close();
  };

  const items = [
    {
      id: "duplicate",
      label: "Duplicate",
      shortcut: "Ctrl+D",
      icon: CopyPlus,
      onSelect: () => deferCommand("duplicate-selection"),
    },
    {
      id: "copy",
      label: "Copy",
      shortcut: "Ctrl+C",
      icon: Copy,
      onSelect: () => deferCommand("copy"),
    },
    {
      id: "paste",
      label: "Paste",
      shortcut: "Ctrl+V",
      icon: ClipboardPaste,
      onSelect: () => deferCommand("paste"),
    },
    { separator: true },
    {
      id: "parent",
      label: "Select parent",
      icon: CornerUpLeft,
      disabled: !parent,
      onSelect: () => {
        if (parent) actions.selectNode(menu.parentId);
        close();
      },
    },
    {
      id: "siblings",
      label: "Select siblings",
      icon: MousePointer2,
      disabled: !parent?.data?.nodes?.length,
      onSelect: () => {
        if (parent?.data?.nodes) actions.selectNode(parent.data.nodes);
        close();
      },
    },
    ...(canGroup
      ? [
          {
            id: "group",
            label: `Group ${nodeIds.length} elements`,
            icon: Group,
            onSelect: () => deferCommand("group-selection"),
          },
        ]
      : []),
    ...(canUngroup
      ? [
          {
            id: "ungroup",
            label: "Ungroup",
            icon: Ungroup,
            onSelect: () => deferCommand("ungroup-selection"),
          },
        ]
      : []),
    ...(canAlign
      ? [
          { separator: true },
          {
            id: "align-top",
            label: "Align top",
            icon: AlignVerticalJustifyStart,
            onSelect: () => deferCommand("align-selection", "flex-start"),
          },
          {
            id: "align-middle",
            label: "Align middle",
            icon: AlignVerticalJustifyCenter,
            onSelect: () => deferCommand("align-selection", "center"),
          },
          {
            id: "align-bottom",
            label: "Align bottom",
            icon: AlignVerticalJustifyEnd,
            onSelect: () => deferCommand("align-selection", "flex-end"),
          },
        ]
      : []),
    ...(isWidget
      ? [
          {
            id: "lock",
            label: isLocked ? "Unlock widget" : "Lock widget",
            icon: isLocked ? Unlock : Lock,
            onSelect: handleLock,
          },
        ]
      : []),
    { separator: true },
    {
      id: "delete",
      label: nodeIds.length > 1 ? `Delete ${nodeIds.length} nodes` : "Delete",
      shortcut: "Del",
      icon: Trash2,
      danger: true,
      onSelect: handleDelete,
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Canvas node actions"
      data-canvas-context-menu
      className="fixed z-[400] min-w-[220px] overflow-hidden rounded-card border border-border bg-card py-1 shadow-2xl"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {node.data.displayName?.replace(/^Canvas/, "") || "Element"}
        </span>
        <span className="max-w-[110px] truncate font-mono text-[8px] text-muted-foreground/60">
          {menu.nodeId}
        </span>
      </div>
      {items.map((item, index) =>
        item.separator ? (
          <div key={`sep-${index}`} className="my-1 h-px bg-border/60" />
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={item.onSelect}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors ${
              item.danger
                ? "text-destructive hover:bg-destructive/10"
                : "text-foreground hover:bg-muted"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <kbd className="font-mono text-[8px] text-muted-foreground/60">
                {item.shortcut}
              </kbd>
            )}
          </button>
        )
      )}
    </div>,
    document.body
  );
}

CanvasContextMenu.propTypes = {
  setWidgets: PropTypes.func,
};
