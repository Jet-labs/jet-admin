import React from "react";
import { Trash, Maximize2, Minimize2, Box, EyeOff, Layout } from "lucide-react";

export default function LayoutNodeToolbar({
  node,
  onUpdateSizing,
  onUpdateSpan,
  onWrap,
  onUnwrap,
  onDelete,
}) {
  return (
    <div className="layout-node-toolbar">
      <span className="font-semibold px-1 text-gray-400 select-none uppercase text-[9px]">
        {node.type}
      </span>

      {/* Sizing Toggles */}
      {(node.type === "widget" || node.type === "container" || node.type === "stack") && (
        <div className="flex items-center border-r border-gray-700 pr-1 mr-1 gap-0.5">
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
        <div className="flex items-center border-r border-gray-700 pr-1 mr-1 gap-1">
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

      {/* Nesting wrappers */}
      <div className="flex items-center border-r border-gray-700 pr-1 mr-1 gap-1">
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
    </div>
  );
}
