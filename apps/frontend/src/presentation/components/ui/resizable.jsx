/**
 * Resizable panel components — react-resizable-panels v2.x
 *
 * Exports: ResizablePanelGroup | ResizablePanel | ResizableHandle
 */

import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

// ─── Context ────────────────────────────────────────────────────────────────

const ResizableContext = React.createContext(null);

// ─── ResizablePanelGroup ────────────────────────────────────────────────────

const ResizablePanelGroup = ({ className, children, direction = "horizontal", ...props }) => {
  // panelId → { ref: React.MutableRefObject<ImperativePanelHandle>, props }
  const panelsRegistry = React.useRef(new Map());
  // panelId → (isCollapsed: boolean) => void
  const listeners = React.useRef(new Map());

  const registerPanel = React.useCallback((id, ref, panelProps) => {
    panelsRegistry.current.set(id, { ref, props: panelProps });
    return () => panelsRegistry.current.delete(id);
  }, []);

  const getPanel = React.useCallback((id) => panelsRegistry.current.get(id), []);

  const registerListener = React.useCallback((id, cb) => {
    listeners.current.set(id, cb);
    return () => listeners.current.delete(id);
  }, []);

  const notifyListeners = React.useCallback((id, isCollapsed) => {
    listeners.current.get(id)?.(isCollapsed);
  }, []);

  // v2 injects `*{cursor:ew-resize !important}` into <head> while dragging.
  // disableGlobalCursorStyles() prevents this so our button's cursor:pointer works.
  // We manually restore the resize cursor via CSS on the handle element.
  React.useEffect(() => {
    ResizablePrimitive.disableGlobalCursorStyles?.();
    return () => ResizablePrimitive.enableGlobalCursorStyles?.();
  }, []);

  return (
    <ResizableContext.Provider
      value={{ registerPanel, getPanel, registerListener, notifyListeners, direction }}
    >
      <ResizablePrimitive.PanelGroup
        direction={direction}
        className={[
          "flex h-full w-full",
          direction === "vertical" ? "flex-col" : "",
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </ResizablePrimitive.PanelGroup>
    </ResizableContext.Provider>
  );
};

ResizablePanelGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  direction: PropTypes.oneOf(["horizontal", "vertical"]),
};

// ─── ResizablePanel ─────────────────────────────────────────────────────────

const ResizablePanel = React.forwardRef((
  { className, id, collapsible = true, collapsedSize = 0, onCollapse, onExpand, ...props },
  forwardedRef
) => {
  const context = React.useContext(ResizableContext);

  // Stable panel id — used both as the `id` prop on <Panel> and as the
  // registry key. Because we pass it as `id`, the library's useUniqueId()
  // uses it verbatim, so data-panel-id on the DOM matches our key exactly.
  const panelId = React.useMemo(
    () => id ?? `panel-${Math.random().toString(36).slice(2, 11)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  // localRef receives ImperativePanelHandle from forwardRef on <Panel>
  const localRef = React.useRef(null);
  const combinedRef = React.useCallback(
    (handle) => {
      localRef.current = handle;
      if (typeof forwardedRef === "function") forwardedRef(handle);
      else if (forwardedRef) forwardedRef.current = handle;
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    if (!context) return;
    return context.registerPanel(panelId, localRef, {
      collapsible,
      collapsedSize,
      defaultSize: props.defaultSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, panelId, collapsible, collapsedSize, props.defaultSize]);

  const handleCollapse = () => {
    onCollapse?.();
    context?.notifyListeners(panelId, true);
  };

  const handleExpand = () => {
    onExpand?.();
    context?.notifyListeners(panelId, false);
  };

  return (
    <ResizablePrimitive.Panel
      ref={combinedRef}
      id={panelId}
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      onCollapse={handleCollapse}
      onExpand={handleExpand}
      className={className}
      {...props}
    />
  );
});

ResizablePanel.displayName = "ResizablePanel";
ResizablePanel.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  collapsible: PropTypes.bool,
  collapsedSize: PropTypes.number,
  onCollapse: PropTypes.func,
  onExpand: PropTypes.func,
  defaultSize: PropTypes.number,
};

// ─── ResizableHandle ────────────────────────────────────────────────────────

const ResizableHandle = ({ withHandle = true, className, id: idProp, ...props }) => {
  const context = React.useContext(ResizableContext);
  const direction = context?.direction ?? "horizontal";

  // Stable ID for the handle element — used to find it in the DOM
  const handleId = React.useMemo(
    () => idProp ?? `handle-${Math.random().toString(36).slice(2, 11)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idProp]
  );

  const [targetPanelId, setTargetPanelId] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isPrev, setIsPrev] = React.useState(true);

  // Walk DOM siblings to find which panel this handle controls.
  //
  // KEY FIX: PanelResizeHandle is NOT a forwardRef component in v2 — we can't
  // attach a ref to it. Instead we give it a known `id` and use
  // document.getElementById() to get the actual DOM element, then walk its
  // siblings (which ARE the Panel root divs with data-panel-id).
  React.useLayoutEffect(() => {
    if (!context) return;

    const el = document.getElementById(handleId);
    if (!el) return;

    const prevEl = el.previousElementSibling;
    const nextEl = el.nextElementSibling;

    // v2 sets data-panel-id on every Panel root element
    const getPanelId = (sibling) => sibling?.getAttribute("data-panel-id") ?? null;

    const prevId = getPanelId(prevEl);
    const nextId = getPanelId(nextEl);

    const prevData = prevId ? context.getPanel(prevId) : null;
    const nextData = nextId ? context.getPanel(nextId) : null;

    let selectedId = null;
    let selectedIsPrev = true;

    if (prevData?.props?.collapsible && !nextData?.props?.collapsible) {
      selectedId = prevId;
      selectedIsPrev = true;
    } else if (nextData?.props?.collapsible && !prevData?.props?.collapsible) {
      selectedId = nextId;
      selectedIsPrev = false;
    } else {
      // Both collapsible or neither — pick the smaller one
      const prevSize = prevData?.props?.defaultSize ?? 50;
      const nextSize = nextData?.props?.defaultSize ?? 50;
      if (prevSize <= nextSize) {
        selectedId = prevId;
        selectedIsPrev = true;
      } else {
        selectedId = nextId;
        selectedIsPrev = false;
      }
    }

    if (!selectedId) return;

    setTargetPanelId(selectedId);
    setIsPrev(selectedIsPrev);

    // Sync initial collapsed state
    const entry = context.getPanel(selectedId);
    try {
      setIsCollapsed(entry?.ref?.current?.isCollapsed?.() ?? false);
    } catch { /* handle not ready yet */ }

    return context.registerListener(selectedId, (collapsed) => {
      setIsCollapsed(collapsed);
    });
  }, [context, handleId]);

  const handleCollapseToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!context || !targetPanelId) return;

    const entry = context.getPanel(targetPanelId);
    const api = entry?.ref?.current;
    if (!api) return;

    try {
      if (api.isCollapsed()) {
        api.expand();
        context.notifyListeners(targetPanelId, false);
        setIsCollapsed(false);
      } else {
        api.collapse();
        context.notifyListeners(targetPanelId, true);
        setIsCollapsed(true);
      }
    } catch (err) {
      console.warn("[ResizableHandle] collapse/expand error:", err);
    }
  };

  const isVertical = direction === "vertical";

  const getIcon = () => {
    const cls = "h-3 w-3";
    if (isVertical) {
      if (isPrev) return isCollapsed ? <ChevronDown className={cls} /> : <ChevronUp className={cls} />;
      return isCollapsed ? <ChevronUp className={cls} /> : <ChevronDown className={cls} />;
    }
    if (isPrev) return isCollapsed ? <ChevronRight className={cls} /> : <ChevronLeft className={cls} />;
    return isCollapsed ? <ChevronLeft className={cls} /> : <ChevronRight className={cls} />;
  };

  return (
    <ResizablePrimitive.PanelResizeHandle
      id={handleId}
      className={[
        "group relative flex items-center justify-center bg-border",
        "transition-colors hover:bg-primary focus-visible:outline-none",
        "focus-visible:ring-1 focus-visible:ring-primary/30 z-50",
        // Restore drag cursor manually since disableGlobalCursorStyles() above
        // suppresses the library's automatic cursor injection.
        isVertical
          ? "h-px w-full cursor-ns-resize hover:h-0.5"
          : "w-px h-full cursor-ew-resize hover:w-0.5",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {withHandle && (
        <button
          type="button"
          // Stop the resize handle treating pointer-down as a drag start
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleCollapseToggle}
          className="absolute z-50 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105"
          style={{ cursor: "pointer" }}
        >
          {getIcon()}
        </button>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

ResizableHandle.displayName = "ResizableHandle";
ResizableHandle.propTypes = {
  withHandle: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };