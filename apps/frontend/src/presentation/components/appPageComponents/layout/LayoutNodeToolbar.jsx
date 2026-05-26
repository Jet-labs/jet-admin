import React, { useState, useEffect, useRef } from "react";
import { Trash, Box, Layout, Lock, Paintbrush, X } from "lucide-react";

export default function LayoutNodeToolbar({
  node,
  onUpdateSizing,
  onUpdateSpan,
  onWrap,
  onUnwrap,
  onDelete,
  onToggleLock,
  onUpdateStyle,
  onClose,
}) {
  const [showStyles, setShowStyles] = useState(false);
  const [position, setPosition] = useState("top");
  const toolbarRef = useRef(null);

  useEffect(() => {
    const checkPosition = () => {
      if (!toolbarRef.current) return;
      const parentEl = toolbarRef.current.parentElement;
      if (!parentEl) return;
      
      const parentRect = parentEl.getBoundingClientRect();
      const canvasEl = parentEl.closest(".layout-editor-canvas-container") || document.body;
      const canvasRect = canvasEl.getBoundingClientRect();

      // If the top of the node is within 45px of the top of the editor canvas,
      // flip the toolbar to the bottom (outside) of the element
      if (parentRect.top - canvasRect.top < 45) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    };

    checkPosition();

    // Listen to scroll events on any element (capture phase) and window resize
    window.addEventListener("scroll", checkPosition, { capture: true, passive: true });
    window.addEventListener("resize", checkPosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkPosition, { capture: true });
      window.removeEventListener("resize", checkPosition);
    };
  }, [node.id]);

  const toolbarStyle = position === "bottom"
    ? { top: "100%", bottom: "auto", marginTop: "4px" }
    : {};

  return (
    <div ref={toolbarRef} className="layout-node-toolbar relative" style={toolbarStyle}>
      <span className="font-semibold px-1 text-muted-foreground/50 select-none uppercase text-[9px]">
        {node.type}
      </span>

      {/* Sizing Toggles */}
      {(node.type === "row" || node.type === "widget" || node.type === "container" || node.type === "stack") && (
        <div className="flex items-center border-r border-muted-foreground/30 pr-1 mr-1 gap-0.5">
          <button
            type="button"
            className={node.sizing === "auto" ? "active" : ""}
            onClick={() => onUpdateSizing(node.id, "auto")}
            title="Auto height (content driven)"
          >
            Auto
          </button>
          <button
            type="button"
            className={node.sizing === "fill" ? "active" : ""}
            onClick={() => onUpdateSizing(node.id, "fill")}
            title="Fill height (stretch)"
          >
            Fill
          </button>
          <button
            type="button"
            className={node.sizing === "fixed" ? "active" : ""}
            onClick={() => {
              const height = prompt("Enter fixed height in pixels:", node.fixedHeight || 200);
              if (height) onUpdateSizing(node.id, "fixed", parseInt(height, 10));
            }}
            title="Fixed height"
          >
            Fixed
          </button>
        </div>
      )}

      {/* Span controls */}
      {typeof node.span === "number" && (
        <div className="flex items-center border-r border-muted-foreground/30 pr-1 mr-1 gap-1">
          <button
            type="button"
            onClick={() => onUpdateSpan(node.id, node.span - 1)}
            disabled={node.span <= 1}
            title="Decrease width"
          >
            -
          </button>
          <span className="font-mono text-xs w-4 text-center">{node.span}</span>
          <button
            type="button"
            onClick={() => onUpdateSpan(node.id, node.span + 1)}
            disabled={node.span >= 12}
            title="Increase width"
          >
            +
          </button>
        </div>
      )}

      {/* Style editor toggle */}
      {onUpdateStyle && (
        <div className="flex items-center border-r border-muted-foreground/30 pr-1 mr-1 gap-1">
          <button
            type="button"
            className={showStyles ? "active flex items-center gap-1" : "flex items-center gap-1"}
            onClick={() => setShowStyles(!showStyles)}
            title="Edit Layout & Spacing Styles"
          >
            <Paintbrush className="h-3 w-3" />
            Style
          </button>
        </div>
      )}

      {/* Interaction lock */}
      {node.type === "widget" && onToggleLock && (
        <div className="flex items-center border-r border-muted-foreground/30 pr-1 mr-1 gap-1">
          <button
            type="button"
            onClick={() => onToggleLock(node.id)}
            title="Interact Mode (Lock & Test Widget)"
            className="flex items-center gap-1 text-xs text-primary font-semibold"
          >
            <Lock className="h-3 w-3" />
            Lock & Interact
          </button>
        </div>
      )}

      {/* Nesting wrappers */}
      <div className="flex items-center border-r border-muted-foreground/30 pr-1 mr-1 gap-1">
        {node.type !== "container" && (
          <button
            type="button"
            onClick={() => onWrap(node.id)}
            title="Wrap in container"
          >
            <Box className="h-3 w-3" />
          </button>
        )}
        {node.type === "container" && (
          <button
            type="button"
            onClick={() => onUnwrap(node.id)}
            title="Unwrap container"
          >
            <Layout className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Delete button */}
      <button
        type="button"
        className="delete-btn"
        onClick={() => onDelete(node.id)}
        title="Delete"
      >
        <Trash className="h-3 w-3" />
      </button>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          className="close-btn border-l border-muted-foreground/30 pl-1.5 ml-1"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close Toolbar"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Floating Style Dropdown */}
      {showStyles && onUpdateStyle && (
        <div 
          className="absolute top-full left-0 mt-1.5 bg-foreground border border-border/30 rounded-md p-3 flex flex-col gap-2.5 z-[150] shadow-2xl text-background min-w-[200px] select-none pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-wider border-b border-border/20 pb-1 flex justify-between items-center">
            <span>Style Settings</span>
            <button 
              type="button" 
              className="text-[9px] text-destructive cursor-pointer font-medium px-1 py-0.5 rounded hover:bg-foreground/80"
              onClick={() => {
                onUpdateStyle(node.id, {
                  padding: undefined,
                  margin: undefined,
                  gap: undefined,
                  borderRadius: undefined,
                  alignItems: undefined,
                });
                setShowStyles(false);
              }}
            >
              Clear All
            </button>
          </div>
          
          {/* Padding config */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground/60 font-semibold">Padding</label>
            <select
              className="bg-foreground/80 border border-border/30 rounded text-xs px-1.5 py-1 text-background outline-none focus:border-primary"
              value={node.style?.padding || ""}
              onChange={(e) => onUpdateStyle(node.id, { padding: e.target.value || undefined })}
            >
              <option value="">Default (None)</option>
              <option value="4px">4px (xs)</option>
              <option value="8px">8px (sm)</option>
              <option value="12px">12px (md)</option>
              <option value="16px">16px (lg)</option>
              <option value="24px">24px (xl)</option>
            </select>
          </div>

          {/* Margin config */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground/60 font-semibold">Margin</label>
            <select
              className="bg-foreground/80 border border-border/30 rounded text-xs px-1.5 py-1 text-background outline-none focus:border-primary"
              value={node.style?.margin || ""}
              onChange={(e) => onUpdateStyle(node.id, { margin: e.target.value || undefined })}
            >
              <option value="">Default (None)</option>
              <option value="4px">4px (xs)</option>
              <option value="8px">8px (sm)</option>
              <option value="12px">12px (md)</option>
              <option value="16px">16px (lg)</option>
            </select>
          </div>

          {/* Gap config (rows, stacks) */}
          {(node.type === "row" || node.type === "stack" || node.type === "column") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground/60 font-semibold">Gap / Spacing</label>
              <select
                className="bg-foreground/80 border border-border/30 rounded text-xs px-1.5 py-1 text-background outline-none focus:border-primary"
                value={node.style?.gap || ""}
                onChange={(e) => onUpdateStyle(node.id, { gap: e.target.value || undefined })}
              >
                <option value="">Default</option>
                <option value="0px">0px (None)</option>
                <option value="4px">4px (xs)</option>
                <option value="8px">8px (sm)</option>
                <option value="12px">12px (md)</option>
                <option value="16px">16px (lg)</option>
                <option value="24px">24px (xl)</option>
              </select>
            </div>
          )}

          {/* Border Radius config */}
          {(node.type === "widget" || node.type === "container" || node.type === "stack") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground/60 font-semibold">Border Radius</label>
              <select
                className="bg-foreground/80 border border-border/30 rounded text-xs px-1.5 py-1 text-background outline-none focus:border-primary"
                value={node.style?.borderRadius || ""}
                onChange={(e) => onUpdateStyle(node.id, { borderRadius: e.target.value || undefined })}
              >
                <option value="">Theme Default (Rounded)</option>
                <option value="0px">Sharp (0px)</option>
                <option value="4px">4px (xs)</option>
                <option value="6px">6px (sm)</option>
                <option value="8px">8px (md)</option>
                <option value="12px">12px (lg)</option>
                <option value="16px">16px (xl)</option>
                <option value="9999px">9999px (Pill)</option>
              </select>
            </div>
          )}

          {/* Alignment config */}
          {(node.type === "row" || node.type === "stack") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground/60 font-semibold">Alignment</label>
              <select
                className="bg-foreground/80 border border-border/30 rounded text-xs px-1.5 py-1 text-background outline-none focus:border-primary"
                value={node.style?.alignItems || ""}
                onChange={(e) => onUpdateStyle(node.id, { alignItems: e.target.value || undefined })}
              >
                <option value="">Default</option>
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="flex-start">Start</option>
                <option value="flex-end">End</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
