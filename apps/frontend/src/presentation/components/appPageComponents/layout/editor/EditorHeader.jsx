/**
 * EditorHeader.jsx
 *
 * Top control bar with undo/redo and Design/Preview mode toggle.
 * Extracted from CraftLayoutEditorCanvas for clarity.
 * Spacing standardized to p-2/gap-2 per UI guidelines.
 */
import React from "react";
import { useEditor } from "@craftjs/core";
import { Play, Settings, Undo2, Redo2 } from "lucide-react";

export default function EditorHeader({ previewMode, setPreviewMode }) {
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
        {!previewMode && (
          <div className="flex items-center gap-2 border-r border-border/40 pr-2">
            <button
              type="button"
              disabled={!canUndo}
              onClick={() => actions.history?.undo?.()}
              className="h-7 px-2 text-[11px] font-medium rounded border border-border/50 bg-background text-muted-foreground cursor-pointer transition-all whitespace-nowrap inline-flex items-center gap-2 hover:not-disabled:bg-muted hover:not-disabled:text-foreground hover:not-disabled:border-border disabled:opacity-35 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={() => actions.history?.redo?.()}
              className="h-7 px-2 text-[11px] font-medium rounded border border-border/50 bg-background text-muted-foreground cursor-pointer transition-all whitespace-nowrap inline-flex items-center gap-2 hover:not-disabled:bg-muted hover:not-disabled:text-foreground hover:not-disabled:border-border disabled:opacity-35 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3 w-3" /> Redo
            </button>
          </div>
        )}

        <div className="flex bg-muted/60 p-0.5 rounded border border-border/40 gap-2">
          <button
            type="button"
            className={`flex items-center gap-2 text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer transition-all ${
              !previewMode
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(false);
              actions.setOptions((options) => { options.enabled = true; });
            }}
          >
            <Settings className="h-3 w-3" /> Design
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer transition-all ${
              previewMode
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(true);
              actions.setOptions((options) => { options.enabled = false; });
              actions.selectNode([]);
            }}
          >
            <Play className="h-3 w-3" /> Preview
          </button>
        </div>
      </div>
    </div>
  );
}
