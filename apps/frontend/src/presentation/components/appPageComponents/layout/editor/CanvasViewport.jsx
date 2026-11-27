import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  Focus,
  Maximize2,
  Minus,
  Monitor,
  Plus,
  RotateCcw,
  Ruler,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEditor } from "@craftjs/core";
import { Button } from "@jet-admin/ui";
import { LayoutViewportProvider } from "../engine/LayoutViewportContext.jsx";
import { subscribeCanvasDrag } from "./canvasDragStore";
import CanvasRulers from "./CanvasRulers.jsx";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAGE_WIDTH = 1120;

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

/**
 * CanvasViewport
 *
 * Transform-based editor viewport: the page is scaled/translated with CSS
 * instead of native scrolling, while editor overlays remain in screen space.
 */
export const CanvasViewport = forwardRef(function CanvasViewport(
  {
    children,
    overlay,
    pageWidth = PAGE_WIDTH,
    className = "",
    canvasWidth: controlledCanvasWidth = null,
    onCanvasWidthChange = null,
  },
  ref
) {
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const stageRef = useRef(null);
  const panStartRef = useRef(null);
  const panCommitTimerRef = useRef(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [internalCanvasWidth, setInternalCanvasWidth] = useState(pageWidth);
  const canvasWidth = controlledCanvasWidth ?? internalCanvasWidth;
  const setCanvasWidth = useCallback(
    (nextWidth) => {
      if (controlledCanvasWidth == null) setInternalCanvasWidth(nextWidth);
      onCanvasWidthChange?.(nextWidth);
    },
    [controlledCanvasWidth, onCanvasWidthChange]
  );
  const [spaceDown, setSpaceDown] = useState(false);
  const [panning, setPanning] = useState(false);
  const [rulersVisible, setRulersVisible] = useState(true);
  const [pageHeight, setPageHeight] = useState(640);
  const [minimapBlocks, setMinimapBlocks] = useState([]);
  const minimapSignatureRef = useRef("");
  const didInitialFitRef = useRef(false);
  const previousWidthRef = useRef(pageWidth);
  const { selectedKey } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || [])
      .sort()
      .join("|"),
  }));

  const applyTransform = useCallback((nextPan, nextZoom) => {
    panRef.current = nextPan;
    zoomRef.current = nextZoom;
    if (stageRef.current) {
      stageRef.current.style.transform = `translate3d(${nextPan.x}px, ${nextPan.y}px, 0) scale(${nextZoom})`;
    }
    if (pageRef.current) {
      pageRef.current.style.setProperty("--canvas-handle-scale", String(1 / nextZoom));
    }
    const container = containerRef.current;
    if (container) {
      container.style.setProperty("--canvas-pan-x", `${nextPan.x}px`);
      container.style.setProperty("--canvas-pan-y", `${nextPan.y}px`);
      container.style.setProperty("--canvas-zoom", String(nextZoom));
      container.dispatchEvent(new CustomEvent("craft-canvas-transform"));
    }
  }, []);

  const schedulePanCommit = useCallback(() => {
    if (panCommitTimerRef.current) clearTimeout(panCommitTimerRef.current);
    panCommitTimerRef.current = setTimeout(() => {
      panCommitTimerRef.current = null;
      setPan({ ...panRef.current });
    }, 120);
  }, []);

  useEffect(
    () => () => {
      if (panCommitTimerRef.current) clearTimeout(panCommitTimerRef.current);
    },
    []
  );

  const fit = useCallback(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;
    const padding = 56;
    const width = page.offsetWidth || canvasWidth;
    const height = page.offsetHeight || container.clientHeight;
    const nextZoom = clampZoom(
      Math.min(
        1,
        (container.clientWidth - padding) / Math.max(1, width),
        (container.clientHeight - padding) / Math.max(1, height)
      )
    );
    const nextX = (container.clientWidth - width * nextZoom) / 2;
    const nextY = Math.max(24, (container.clientHeight - height * nextZoom) / 2);
    applyTransform({ x: nextX, y: nextY }, nextZoom);
    setZoom(nextZoom);
    setPan({ x: nextX, y: nextY });
  }, [applyTransform, canvasWidth]);

  const reset = useCallback(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) {
      applyTransform({ x: 0, y: 0 }, 1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const width = page.offsetWidth || canvasWidth;
    const nextPan = { x: Math.max(24, (container.clientWidth - width) / 2), y: 24 };
    applyTransform(nextPan, 1);
    setZoom(1);
    setPan(nextPan);
  }, [applyTransform, canvasWidth]);

  useEffect(() => {
    if (previousWidthRef.current === canvasWidth) return;
    previousWidthRef.current = canvasWidth;
    const frame = requestAnimationFrame(() => fit());
    return () => cancelAnimationFrame(frame);
  }, [canvasWidth, fit]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      setPageHeight(Math.max(1, page.offsetHeight));
    });
    observer.observe(page);
    setPageHeight(Math.max(1, page.offsetHeight));
    return () => observer.disconnect();
  }, []);

  // Minimap section blocks: top-level rows/containers rendered as faint bars
  // so the map reads like the page, not just an empty viewport box.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const update = () => {
      const root = page.firstElementChild;
      if (!root) return;
      const pageRect = page.getBoundingClientRect();
      if (pageRect.width < 1 || pageRect.height < 1) return;
      const invZoom = 1 / Math.max(0.0001, zoomRef.current);
      const blocks = Array.from(root.children)
        .filter((element) => element.getAttribute("data-node-type"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            type: element.getAttribute("data-node-type"),
            left: (rect.left - pageRect.left) * invZoom,
            top: (rect.top - pageRect.top) * invZoom,
            width: rect.width * invZoom,
            height: rect.height * invZoom,
          };
        })
        .filter((block) => block.width > 0 && block.height > 0);
      const signature = blocks
        .map(
          (block) =>
            `${block.type}:${Math.round(block.left)}:${Math.round(block.top)}:${Math.round(
              block.width
            )}:${Math.round(block.height)}`
        )
        .join("|");
      if (signature === minimapSignatureRef.current) return;
      minimapSignatureRef.current = signature;
      setMinimapBlocks(blocks);
    };
    update();
    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => update())
        : null;
    observer?.observe(page, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pageHeight, canvasWidth, zoom]);

  const jumpFromMinimap = (event) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const map = minimapGeometry;
    const pageX =
      (event.clientX - rect.left - map.offsetX) / Math.max(0.0001, map.scale);
    const pageY =
      (event.clientY - rect.top - map.offsetY) / Math.max(0.0001, map.scale);
    const nextPan = {
      x: container.clientWidth / 2 - pageX * zoomRef.current,
      y: container.clientHeight / 2 - pageY * zoomRef.current,
    };
    applyTransform(nextPan, zoomRef.current);
    setPan(nextPan);
  };

  const minimapGeometry = (() => {
    const width = 132;
    const height = 88;
    const padding = 6;
    const scale = Math.min(
      (width - padding * 2) / Math.max(1, canvasWidth),
      (height - padding * 2) / Math.max(1, pageHeight),
      0.25
    );
    const pageDisplayWidth = canvasWidth * scale;
    const pageDisplayHeight = pageHeight * scale;
    return {
      width,
      height,
      scale,
      offsetX: (width - pageDisplayWidth) / 2,
      offsetY: (height - pageDisplayHeight) / 2,
      pageDisplayWidth,
      pageDisplayHeight,
    };
  })();

  const minimapViewport = (() => {
    const container = containerRef.current;
    if (!container) return null;
    const pageX = -pan.x / zoom;
    const pageY = -pan.y / zoom;
    const pageW = container.clientWidth / zoom;
    const pageH = container.clientHeight / zoom;
    const left = Math.max(0, pageX);
    const top = Math.max(0, pageY);
    const right = Math.min(canvasWidth, pageX + pageW);
    const bottom = Math.min(pageHeight, pageY + pageH);
    if (right <= left || bottom <= top) return null;
    return {
      left: minimapGeometry.offsetX + left * minimapGeometry.scale,
      top: minimapGeometry.offsetY + top * minimapGeometry.scale,
      width: Math.max(2, (right - left) * minimapGeometry.scale),
      height: Math.max(2, (bottom - top) * minimapGeometry.scale),
    };
  })();

  const zoomAt = useCallback(
    (nextZoom, clientX, clientY) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const currentZoom = zoomRef.current;
      const clamped = clampZoom(nextZoom);
      const scale = clamped / currentZoom;
      const currentPan = panRef.current;
      const nextPan = {
        x: x - (x - currentPan.x) * scale,
        y: y - (y - currentPan.y) * scale,
      };
      applyTransform(nextPan, clamped);
      setZoom(clamped);
      setPan(nextPan);
    },
    [applyTransform]
  );

  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    zoomAt(zoomRef.current + ZOOM_STEP, container.clientWidth / 2, container.clientHeight / 2);
  }, [zoomAt]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    zoomAt(zoomRef.current - ZOOM_STEP, container.clientWidth / 2, container.clientHeight / 2);
  }, [zoomAt]);

  const fitSelection = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const ids = selectedKey ? selectedKey.split("|").filter(Boolean) : [];
    const rects = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect());
    if (!rects.length) return;
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const containerRect = container.getBoundingClientRect();
    const nextZoom = clampZoom(
      Math.min(
        1.5,
        (container.clientWidth - 96) / width,
        (container.clientHeight - 96) / height
      )
    );
    const currentPan = panRef.current;
    const currentZoom = zoomRef.current;
    const stageX = (left - containerRect.left - currentPan.x) / currentZoom;
    const stageY = (top - containerRect.top - currentPan.y) / currentZoom;
    const stageW = width / currentZoom;
    const stageH = height / currentZoom;
    const nextPan = {
      x: container.clientWidth / 2 - (stageX + stageW / 2) * nextZoom,
      y: container.clientHeight / 2 - (stageY + stageH / 2) * nextZoom,
    };
    applyTransform(nextPan, nextZoom);
    setZoom(nextZoom);
    setPan(nextPan);
  }, [applyTransform, selectedKey]);

  useImperativeHandle(
    ref,
    () => ({ fit, reset, zoomIn, zoomOut, fitSelection, zoom }),
    [fit, reset, zoomIn, zoomOut, fitSelection, zoom]
  );

  useEffect(() => {
    const onCommand = (event) => {
      const command = event.detail?.command;
      if (!command) return;
      if (command === "fit") fit();
      else if (command === "fit-selection") fitSelection();
      else if (command === "reset") reset();
      else if (command === "zoom-in") zoomIn();
      else if (command === "zoom-out") zoomOut();
      else if (command === "device-desktop") setCanvasWidth(1120);
      else if (command === "device-tablet") setCanvasWidth(768);
      else if (command === "device-mobile") setCanvasWidth(390);
      else if (command === "toggle-rulers") setRulersVisible((visible) => !visible);
    };
    window.addEventListener("craft-canvas-command", onCommand);
    return () => window.removeEventListener("craft-canvas-command", onCommand);
  }, [fit, fitSelection, reset, zoomIn, zoomOut]);

  useEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return undefined;

    const tryInitialFit = () => {
      if (didInitialFitRef.current) return;
      if (page.offsetHeight > 0 && container.clientHeight > 0) {
        didInitialFitRef.current = true;
        fit();
      }
    };

    tryInitialFit();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(tryInitialFit) : null;
    observer?.observe(page);
    observer?.observe(container);
    const frame = requestAnimationFrame(tryInitialFit);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [fit]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const editable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const interactive =
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select, [role='button'], [role='menuitem']");
      if (editable || interactive) return;

      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        setSpaceDown(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        event.preventDefault();
        fit();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "1") {
        event.preventDefault();
        reset();
      }
      if (event.key === "=" || event.key === "+") {
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          zoomIn();
        }
      }
      if (event.key === "-" || event.key === "_") {
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          zoomOut();
        }
      }
    };

    const onKeyUp = (event) => {
      if (event.code === "Space") setSpaceDown(false);
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [fit, reset, zoomIn, zoomOut]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const factor = event.deltaY < 0 ? 1.08 : 0.92;
        zoomAt(zoomRef.current * factor, event.clientX, event.clientY);
        return;
      }
      const current = panRef.current;
      const nextPan = {
        x: current.x - (event.shiftKey ? event.deltaY : event.deltaX),
        y: current.y - (event.shiftKey ? 0 : event.deltaY),
      };
      applyTransform(nextPan, zoomRef.current);
      schedulePanCommit();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoomAt, applyTransform, schedulePanCommit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let frame = null;
    let pointer = null;
    const edge = 56;
    const speed = 12;

    const tick = () => {
      if (!pointer) {
        frame = null;
        return;
      }
      const rect = container.getBoundingClientRect();
      const left = pointer.x - rect.left;
      const top = pointer.y - rect.top;
      const right = rect.right - pointer.x;
      const bottom = rect.bottom - pointer.y;
      let dx = 0;
      let dy = 0;
      if (left < edge) dx = speed;
      else if (right < edge) dx = -speed;
      if (top < edge) dy = speed;
      else if (bottom < edge) dy = -speed;

      if (dx || dy) {
        applyTransform(
          { x: panRef.current.x + dx, y: panRef.current.y + dy },
          zoomRef.current
        );
        schedulePanCommit();
      }
      frame = requestAnimationFrame(tick);
    };

    const unsubscribe = subscribeCanvasDrag(({ phase, event }) => {
      if (phase === "start" || phase === "move") {
        if (event) pointer = { x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(tick);
        return;
      }
      if (phase === "end" || phase === "cancel") {
        pointer = null;
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      }
    });

    return () => {
      unsubscribe();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [applyTransform, schedulePanCommit]);

  const startPan = (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, input, textarea, select, [role='button']")
    ) {
      return;
    }
    if (event.button !== 1 && !(event.button === 0 && spaceDown)) return;
    event.preventDefault();
    event.stopPropagation();
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setPanning(true);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const movePan = (event) => {
    const start = panStartRef.current;
    if (!start) return;
    const nextPan = {
      x: start.panX + event.clientX - start.x,
      y: start.panY + event.clientY - start.y,
    };
    applyTransform(nextPan, zoomRef.current);
  };

  const endPan = () => {
    if (!panStartRef.current) return;
    panStartRef.current = null;
    setPanning(false);
    setPan({ ...panRef.current });
  };

  return (
    <div
      ref={containerRef}
      id="craft-canvas-root"
      className={`craft-canvas-area scrollbar-thin ${spaceDown ? "craft-canvas-space" : ""} ${
        panning ? "craft-canvas-panning" : ""
      } ${className}`}
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
    >
      <div
        ref={stageRef}
        className="craft-canvas-stage"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
        }}
      >
        <div
          ref={pageRef}
          className="craft-canvas-page"
          style={{ width: canvasWidth, "--canvas-handle-scale": String(1 / zoom) }}
          data-zoom={zoom}
          data-layout-viewport
        >
          <LayoutViewportProvider width={canvasWidth}>{children}</LayoutViewportProvider>
        </div>
      </div>

      {rulersVisible && <CanvasRulers pageWidth={canvasWidth} zoom={zoom} />}

      <div
        className="canvas-minimap"
        data-canvas-ui
        role="presentation"
        title="Click to jump to a page location"
        onPointerDown={jumpFromMinimap}
        style={{ width: minimapGeometry.width, height: minimapGeometry.height }}
      >
        <div
          className="canvas-minimap-page"
          style={{
            left: minimapGeometry.offsetX,
            top: minimapGeometry.offsetY,
            width: minimapGeometry.pageDisplayWidth,
            height: minimapGeometry.pageDisplayHeight,
          }}
        />
        {minimapBlocks.map((block, index) => (
          <div
            key={`${block.type}-${index}`}
            className={`canvas-minimap-block canvas-minimap-block-${block.type.toLowerCase()}`}
            style={{
              left: minimapGeometry.offsetX + block.left * minimapGeometry.scale,
              top: minimapGeometry.offsetY + block.top * minimapGeometry.scale,
              width: Math.max(1, block.width * minimapGeometry.scale),
              height: Math.max(1, block.height * minimapGeometry.scale),
            }}
          />
        ))}
        {minimapViewport && (
          <div
            className="canvas-minimap-viewport"
            style={minimapViewport}
          />
        )}
      </div>

      {overlay}

      <div className="craft-zoom-hud" role="toolbar" aria-label="Canvas zoom">
        <span className="px-1 font-mono text-[9px] text-muted-foreground" title="Canvas width">
          {canvasWidth}px
        </span>
        <Button
          type="button"
          variant={canvasWidth === 1120 ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setCanvasWidth(1120)}
          aria-label="Desktop canvas width"
          title="Desktop (1120px)"
        >
          <Monitor className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={canvasWidth === 768 ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setCanvasWidth(768)}
          aria-label="Tablet canvas width"
          title="Tablet (768px)"
        >
          <Tablet className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={canvasWidth === 390 ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setCanvasWidth(390)}
          aria-label="Mobile canvas width"
          title="Mobile (390px)"
        >
          <Smartphone className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={fitSelection}
          disabled={!selectedKey}
          aria-label="Fit selection"
          title="Fit selection"
        >
          <Focus className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={rulersVisible ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setRulersVisible((visible) => !visible)}
          aria-label="Toggle rulers"
          title="Toggle rulers"
        >
          <Ruler className="h-3.5 w-3.5" />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={zoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <button
          type="button"
          onClick={reset}
          className="h-7 min-w-[46px] rounded px-1 text-[11px] font-medium tabular-nums text-foreground hover:bg-muted"
          aria-label={`Reset zoom to 100%. Current zoom ${Math.round(zoom * 100)}%`}
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={zoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={fit}
          aria-label="Fit page to screen"
          title="Fit page (Ctrl/Cmd+0)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={reset}
          aria-label="Reset view"
          title="Reset view (Ctrl/Cmd+1)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});

CanvasViewport.propTypes = {
  children: PropTypes.node,
  overlay: PropTypes.node,
  pageWidth: PropTypes.number,
  className: PropTypes.string,
  canvasWidth: PropTypes.number,
  onCanvasWidthChange: PropTypes.func,
};

export default CanvasViewport;
