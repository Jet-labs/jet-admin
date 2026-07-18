import React from "react";
import { useEditor } from "@craftjs/core";
import { Play, Settings, Undo2, Redo2 } from "lucide-react";
import { Button } from "@jet-admin/ui";

export default function EditorHeader({ previewMode, setPreviewMode }) {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: state.options.enabled && query.history.canUndo(),
    canRedo: state.options.enabled && query.history.canRedo(),
  }));

  return (
    <div className="flex items-center justify-between p-2 border-b border-border gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">Page Builder</span>
        <span className="text-xs text-muted-foreground/60 pl-2 border-l border-border/50">
          {previewMode ? "Preview Mode active" : "Drag elements to organize layout"}
        </span>
      </div>

      <div className="flex items-center gap-2">


        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={!previewMode ? "secondary" : "ghost"}
            className={`flex items-center gap-2 text-xs font-medium px-2 py-0.5 h-auto rounded cursor-pointer transition-all ${
              !previewMode
              ? "bg-card text-primary shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(false);
              actions.setOptions((options) => { options.enabled = true; });
            }}
          >
            <Settings className="h-2.5 w-2.5" /> Design
          </Button>
          <Button
            type="button"
            size="sm"
            variant={previewMode ? "secondary" : "ghost"}
            className={`flex items-center gap-2 text-xs font-medium px-2 py-0.5 h-auto rounded cursor-pointer transition-all ${
              previewMode
              ? "bg-card text-primary shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPreviewMode(true);
              actions.setOptions((options) => { options.enabled = false; });
              actions.selectNode([]);
            }}
          >
            <Play className="h-2.5 w-2.5" /> Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
