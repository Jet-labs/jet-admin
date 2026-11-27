import React, { useCallback, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import {
  AlignHorizontalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  CopyPlus,
  Equal,
  Group,
  Lock,
  StretchHorizontal,
  Trash2,
  Ungroup,
  Unlock,
} from "lucide-react";
import PropTypes from "prop-types";
import { runEditorCommand } from "./editorCommands";

const MIN_LASSO_DRAG = 4;
const CANVAS_ID = "craft-canvas-root";

const getCanvasElement = () => document.getElementById(CANVAS_ID);

const intersects = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const isInteractiveTarget = (target) => {
  if (!(target instanceof Element)) return true;
  return Boolean(
    target.closest(
      ".craft-node, [data-canvas-ui], button, a, input, textarea, select, [role='button'], [contenteditable='true']"
    )
  );
};

/**
 * CanvasSelectionLayer
 *
 * Screen-space marquee selection and a small multi-selection action bar.
 * Craft keeps the real selection state; this layer only translates pointer
 * gestures and DOM geometry into Craft actions.
 */
export default function CanvasSelectionLayer({ setWidgets }) {
  const { actions, query } = useEditor();
  const { selectedKey, enabled } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || [])
      .sort()
      .join("|"),
    enabled: state.options.enabled,
  }));
  const selectedIds = selectedKey ? selectedKey.split("|") : [];

  const lassoRef = useRef(null);
  const boxRef = useRef(null);
  const toolbarRef = useRef(null);
  const gridRef = useRef(null);
  const dragRef = useRef(null);

  const setLassoRect = useCallback((rect) => {
    const el = lassoRef.current;
    if (!el) return;
    if (!rect) {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
    el.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    el.style.width = `${Math.max(1, rect.width)}px`;
    el.style.height = `${Math.max(1, rect.height)}px`;
  }, []);

  const hideLasso = useCallback(() => setLassoRect(null), [setLassoRect]);

  const collectLassoHits = useCallback(
    (rect) => {
      const canvas = getCanvasElement();
      const page = canvas?.querySelector(".craft-canvas-page");
      if (!canvas || !page) return [];
      const canvasRect = canvas.getBoundingClientRect();
      const absolute = {
        left: rect.left + canvasRect.left,
        top: rect.top + canvasRect.top,
        right: rect.left + rect.width + canvasRect.left,
        bottom: rect.top + rect.height + canvasRect.top,
      };
      const hits = Array.from(page.querySelectorAll("[data-node-type]")).filter((el) =>
        intersects(el.getBoundingClientRect(), absolute)
      );
      // Keep only the deepest hit nodes, so selecting a row does not also
      // select every widget stacked inside it.
      const deepest = hits.filter(
        (el) => !hits.some((other) => other !== el && el.contains(other))
      );
      return deepest.map((el) => el.id).filter(Boolean);
    },
    []
  );

  const applySelection = useCallback(
    (ids, additive) => {
      if (!ids.length && !additive) {
        actions.selectNode([]);
        return;
      }
      let nextIds = ids;
      if (additive) {
        const existing = query.getEvent("selected").all();
        nextIds = Array.from(new Set([...existing, ...ids]));
      }
      const elements = nextIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const filtered = elements.filter(
        (el) => !elements.some((other) => other !== el && el.contains(other))
      );
      const unique = Array.from(new Set(filtered.map((el) => el.id)));
      actions.selectNode(unique);
    },
    [actions, query]
  );

  useEffect(() => {
    const canvas = getCanvasElement();
    if (!canvas || !enabled) return undefined;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      if (canvas.classList.contains("craft-canvas-space")) return;
      if (document.body.classList.contains("canvas-dragging")) return;
      if (isInteractiveTarget(event.target)) return;

      const canvasRect = canvas.getBoundingClientRect();
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX - canvasRect.left,
        startY: event.clientY - canvasRect.top,
        additive: event.shiftKey,
        moved: false,
      };
      document.body.classList.add("canvas-lasso-armed");
      try {
        canvas.setPointerCapture?.(event.pointerId);
      } catch {
        /* pointer capture may be unavailable */
      }
    };

    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const canvasRect = canvas.getBoundingClientRect();
      const x = event.clientX - canvasRect.left;
      const y = event.clientY - canvasRect.top;
      const dx = x - drag.startX;
      const dy = y - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < MIN_LASSO_DRAG) return;
      if (!drag.moved) {
        drag.moved = true;
        document.body.classList.add("canvas-lassoing");
      }
      event.preventDefault();
      const left = Math.min(drag.startX, x);
      const top = Math.min(drag.startY, y);
      const rect = {
        left,
        top,
        width: Math.abs(dx),
        height: Math.abs(dy),
      };
      drag.rect = rect;
      setLassoRect(rect);
    };

    const finishLasso = (event) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      document.body.classList.remove("canvas-lassoing", "canvas-lasso-armed");
      hideLasso();
      try {
        canvas.releasePointerCapture?.(event.pointerId);
      } catch {
        /* pointer capture may be unavailable */
      }
      if (event.type === "pointercancel") return;
      if (!drag.moved) {
        if (!drag.additive) applySelection([], false);
        return;
      }
      const ids = drag.rect ? collectLassoHits(drag.rect) : [];
      applySelection(ids, drag.additive);
    };

    const cancelLasso = () => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      document.body.classList.remove("canvas-lassoing", "canvas-lasso-armed");
      hideLasso();
      try {
        canvas.releasePointerCapture?.(drag.pointerId);
      } catch {
        /* pointer capture may be unavailable */
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") cancelLasso();
    };

    canvas.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", finishLasso, true);
    window.addEventListener("pointercancel", finishLasso, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", finishLasso, true);
      window.removeEventListener("pointercancel", finishLasso, true);
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.classList.remove("canvas-lassoing", "canvas-lasso-armed");
    };
  }, [applySelection, collectLassoHits, hideLasso, setLassoRect, enabled]);

  useEffect(() => {
    const canvas = getCanvasElement();
    if (!canvas) return undefined;
    canvas.classList.toggle("canvas-multi-select", enabled && selectedIds.length > 1);
    return () => canvas.classList.remove("canvas-multi-select");
  }, [selectedIds.length, enabled]);

  // Show the active 12-column grid when a row is the only selected node.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    if (!enabled || selectedIds.length !== 1) {
      grid.style.display = "none";
      return undefined;
    }
    let rowNode = null;
    try {
      rowNode = query.node(selectedIds[0]).get();
    } catch {
      /* stale */
    }
    if (rowNode?.data?.displayName !== "CanvasRow") {
      grid.style.display = "none";
      return undefined;
    }
    const rowEl = document.getElementById(selectedIds[0]);
    const canvas = getCanvasElement();
    if (!rowEl || !canvas) {
      grid.style.display = "none";
      return undefined;
    }

    const update = () => {
      const rowRect = rowEl.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      if (rowRect.width < 1 || rowRect.height < 1) {
        grid.style.display = "none";
        return;
      }
      const style = getComputedStyle(rowEl);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      const gap = parseFloat(style.columnGap) || 0;
      const contentWidth = Math.max(1, rowRect.width - padLeft - padRight);
      const columnWidth = Math.max(1, (contentWidth - gap * 11) / 12);
      const height = Math.max(1, rowRect.height - padTop - padBottom);
      grid.style.display = "block";
      grid.style.left = `${rowRect.left - canvasRect.left + padLeft}px`;
      grid.style.top = `${rowRect.top - canvasRect.top + padTop}px`;
      grid.style.width = `${contentWidth}px`;
      grid.style.height = `${height}px`;
      grid.style.backgroundImage =
        "repeating-linear-gradient(to right, hsl(var(--primary) / 0.22) 0, hsl(var(--primary) / 0.22) 1px, transparent 1px, transparent " +
        `${columnWidth + gap}px)`;
      grid.style.backgroundSize = `${columnWidth + gap}px 100%`;
    };

    update();
    const interval = setInterval(update, 250);
    canvas.addEventListener("craft-canvas-transform", update);
    window.addEventListener("resize", update);
    return () => {
      clearInterval(interval);
      canvas.removeEventListener("craft-canvas-transform", update);
      window.removeEventListener("resize", update);
      grid.style.display = "none";
    };
  }, [selectedIds, enabled, query]);

  // Keep the multi-selection bounding box glued to the canvas during pan,
  // zoom, layout hydration and resize without re-rendering React at 60fps.
  useEffect(() => {
    if (!enabled || selectedIds.length < 2) return undefined;

    const update = () => {
      const canvas = getCanvasElement();
      const box = boxRef.current;
      const toolbar = toolbarRef.current;
      if (!canvas || !box || !toolbar) return;
      const canvasRect = canvas.getBoundingClientRect();
      const rects = selectedIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((el) => el.getBoundingClientRect());
      if (!rects.length) {
        box.style.display = "none";
        toolbar.style.display = "none";
        return;
      }
      const left = Math.min(...rects.map((r) => r.left)) - canvasRect.left;
      const top = Math.min(...rects.map((r) => r.top)) - canvasRect.top;
      const right = Math.max(...rects.map((r) => r.right)) - canvasRect.left;
      const bottom = Math.max(...rects.map((r) => r.bottom)) - canvasRect.top;
      const width = Math.max(1, right - left);
      const height = Math.max(1, bottom - top);

      const visible =
        right > 0 && bottom > 0 && left < canvasRect.width && top < canvasRect.height;
      box.style.display = visible ? "block" : "none";
      if (!visible) {
        toolbar.style.display = "none";
        return;
      }

      box.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;

      toolbar.style.display = "flex";
      const toolbarWidth = toolbar.offsetWidth || 150;
      const toolbarHeight = toolbar.offsetHeight || 28;
      const toolbarLeft = Math.min(
        Math.max(8, left + width / 2 - toolbarWidth / 2),
        Math.max(8, canvasRect.width - toolbarWidth - 8)
      );
      const toolbarTop =
        top >= toolbarHeight + 12
          ? top - toolbarHeight - 8
          : Math.min(bottom + 8, canvasRect.height - toolbarHeight - 8);
      toolbar.style.transform = `translate3d(${toolbarLeft}px, ${Math.max(8, toolbarTop)}px, 0)`;
    };

    update();
    const interval = setInterval(update, 250);
    const canvas = getCanvasElement();
    canvas?.addEventListener("craft-canvas-transform", update);
    window.addEventListener("resize", update);
    return () => {
      clearInterval(interval);
      canvas?.removeEventListener("craft-canvas-transform", update);
      window.removeEventListener("resize", update);
    };
  }, [selectedIds, enabled]);

  const setSpans = (ids, resolveSpan) => {
    const groups = new Map();
    ids.forEach((id) => {
      try {
        const node = query.node(id).get();
        const parentId = node?.data?.parent;
        if (!parentId) return;
        const parent = query.node(parentId).get();
        if (parent?.data?.displayName !== "CanvasRow") return;
        if (!groups.has(parentId)) groups.set(parentId, []);
        const element = document.getElementById(id);
        const left = element ? element.getBoundingClientRect().left : 0;
        groups.get(parentId).push({ id, span: node?.data?.props?.span || 6, left });
      } catch {
        /* stale selection */
      }
    });
    groups.forEach((entries) => {
      entries.sort((a, b) => a.left - b.left);
      const spans = resolveSpan(entries);
      entries.forEach(({ id }, index) => {
        const span = spans[index];
        if (!span) return;
        actions.setProp(id, (props) => {
          props.span = Math.max(1, Math.min(12, span));
        });
      });
    });
  };

  const handleEqualize = () => {
    setSpans(selectedIds, (entries) => {
      const base = Math.floor(12 / entries.length);
      const remainder = 12 % entries.length;
      return entries.map((_, index) => base + (index < remainder ? 1 : 0));
    });
  };

  const handleDistribute = () => {
    setSpans(selectedIds, (entries) => {
      const total = entries.reduce((sum, entry) => sum + entry.span, 0) || 1;
      const exact = entries.map((entry) => (entry.span * 12) / total);
      const spans = exact.map((value) => Math.max(1, Math.floor(value)));
      let remainder = 12 - spans.reduce((sum, value) => sum + value, 0);
      const order = exact
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((a, b) => b.fraction - a.fraction);
      let cursor = 0;
      while (remainder > 0 && order.length) {
        spans[order[cursor % order.length].index] += 1;
        remainder -= 1;
        cursor += 1;
      }
      return spans;
    });
  };

  const handleMatchFirst = () => {
    setSpans(selectedIds, (entries) => entries.map(() => entries[0]?.span || 6));
  };

  const selectedWidgetIds = selectedIds.filter((id) => {
    try {
      return query.node(id).get()?.data?.displayName === "CanvasWidgetSlot";
    } catch {
      return false;
    }
  });
  const allSelectedWidgetsLocked =
    selectedWidgetIds.length > 0 &&
    selectedWidgetIds.every((id) => {
      try {
        return Boolean(query.node(id).get()?.data?.props?.locked);
      } catch {
        return false;
      }
    });

  const handleToggleLock = () => {
    if (!selectedWidgetIds.length) return;
    const nextLocked = !allSelectedWidgetsLocked;
    selectedWidgetIds.forEach((id) => {
      actions.setProp(id, (props) => {
        props.locked = nextLocked;
      });
    });
  };

  let sharedParent = null;
  if (selectedIds.length) {
    try {
      const parentId = query.node(selectedIds[0]).get()?.data?.parent;
      const sameParent = selectedIds.every((id) => {
        try {
          return query.node(id).get()?.data?.parent === parentId;
        } catch {
          return false;
        }
      });
      if (sameParent && parentId) {
        sharedParent = query.node(parentId).get();
      }
    } catch {
      /* stale selection */
    }
  }
  const canGroup =
    selectedIds.length > 1 &&
    sharedParent &&
    !["CanvasZStack", "ROOT"].includes(sharedParent.data.displayName);
  const canAlign =
    selectedIds.length > 0 &&
    sharedParent &&
    ["CanvasRow", "CanvasStack"].includes(sharedParent.data.displayName);
  const ungroupableIds = selectedIds.filter((id) => {
    try {
      const node = query.node(id).get();
      return (
        ["CanvasStack", "CanvasContainer"].includes(node?.data?.displayName) &&
        (node?.data?.nodes || []).length > 0
      );
    } catch {
      return false;
    }
  });

  const handleDeleteSelected = () => {
    const ids = selectedIds.filter((id) => id && id !== "ROOT");
    if (!ids.length) return;
    const widgetKeys = new Set();
    const collectWidgetKeys = (nodeId) => {
      try {
        const node = query.node(nodeId).get();
        const widgetKey = node?.data?.props?.widgetKey;
        if (widgetKey) widgetKeys.add(widgetKey);
        (node?.data?.nodes || []).forEach(collectWidgetKeys);
      } catch {
        /* stale node */
      }
    };
    ids.forEach(collectWidgetKeys);
    actions.delete(ids);
    actions.selectNode([]);
    if (widgetKeys.size && setWidgets) {
      setWidgets((prev) =>
        Array.isArray(prev) ? prev.filter((key) => !widgetKeys.has(key)) : prev
      );
    }
  };

  return (
    <>
      <div ref={gridRef} className="canvas-grid-overlay" aria-hidden="true" />
      <div ref={lassoRef} className="canvas-lasso-rect" aria-hidden="true" />
      {enabled && selectedIds.length > 1 && (
        <>
          <div ref={boxRef} className="canvas-multi-box" aria-hidden="true" data-canvas-ui>
            <span className="canvas-multi-count">{selectedIds.length} selected</span>
          </div>
          <div
            ref={toolbarRef}
            className="canvas-multi-toolbar"
            role="toolbar"
            aria-label="Multi-selection actions"
            data-canvas-ui
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="canvas-multi-action"
              onClick={handleEqualize}
              title="Equalize selected widths"
              aria-label="Equalize selected widths"
            >
              <Equal className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="canvas-multi-action"
              onClick={handleDistribute}
              title="Distribute selected widths across the row"
              aria-label="Distribute selected widths"
            >
              <AlignHorizontalDistributeCenter className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="canvas-multi-action"
              onClick={handleMatchFirst}
              title="Match the leftmost selected width"
              aria-label="Match leftmost selected width"
            >
              <StretchHorizontal className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="canvas-multi-action"
              onClick={() => runEditorCommand("duplicate-selection")}
              title="Duplicate selected elements"
              aria-label="Duplicate selected elements"
            >
              <CopyPlus className="h-3 w-3" />
            </button>
            {canGroup && (
              <button
                type="button"
                className="canvas-multi-action"
                onClick={() => runEditorCommand("group-selection")}
                title="Group selected elements"
                aria-label="Group selected elements"
              >
                <Group className="h-3 w-3" />
              </button>
            )}
            {ungroupableIds.length > 0 && (
              <button
                type="button"
                className="canvas-multi-action"
                onClick={() => runEditorCommand("ungroup-selection")}
                title="Ungroup selected containers"
                aria-label="Ungroup selected containers"
              >
                <Ungroup className="h-3 w-3" />
              </button>
            )}
            {canAlign && (
              <>
                <span className="canvas-multi-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="canvas-multi-action"
                  onClick={() => runEditorCommand("align-selection", "flex-start")}
                  title="Align selected items to the top"
                  aria-label="Align selected items to the top"
                >
                  <AlignVerticalJustifyStart className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="canvas-multi-action"
                  onClick={() => runEditorCommand("align-selection", "center")}
                  title="Align selected items to the middle"
                  aria-label="Align selected items to the middle"
                >
                  <AlignVerticalJustifyCenter className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="canvas-multi-action"
                  onClick={() => runEditorCommand("align-selection", "flex-end")}
                  title="Align selected items to the bottom"
                  aria-label="Align selected items to the bottom"
                >
                  <AlignVerticalJustifyEnd className="h-3 w-3" />
                </button>
              </>
            )}
            {selectedWidgetIds.length > 0 && (
              <button
                type="button"
                className="canvas-multi-action"
                onClick={handleToggleLock}
                title={
                  allSelectedWidgetsLocked
                    ? "Unlock selected widgets"
                    : "Lock selected widgets"
                }
                aria-label={
                  allSelectedWidgetsLocked
                    ? "Unlock selected widgets"
                    : "Lock selected widgets"
                }
              >
                {allSelectedWidgetsLocked ? (
                  <Unlock className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </button>
            )}
            <span className="canvas-multi-divider" aria-hidden="true" />
            <button
              type="button"
              className="canvas-multi-action text-destructive"
              onClick={handleDeleteSelected}
              title="Delete selected elements"
              aria-label="Delete selected elements"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </>
  );
}

CanvasSelectionLayer.propTypes = {
  setWidgets: PropTypes.func,
};
