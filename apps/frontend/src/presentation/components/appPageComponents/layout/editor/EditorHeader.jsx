import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useEditor } from "@craftjs/core";
import {
  Command,
  Play,
  Settings,
  Undo2,
  Redo2,
  Keyboard,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@jet-admin/ui";
import { runEditorCommand } from "./editorCommands";
import CanvasAccessibilityAudit from "./CanvasAccessibilityAudit.jsx";
import SaveSnippetButton from "./SaveSnippetButton.jsx";
import SaveCompositeButton from "./SaveCompositeButton.jsx";

const SHORTCUTS = [
  ["Space + drag", "Pan the canvas"],
  ["Middle mouse drag", "Pan the canvas"],
  ["Ctrl/Cmd + wheel", "Zoom at the pointer"],
  ["Ctrl/Cmd + 0", "Fit page to screen"],
  ["Ctrl/Cmd + 1", "Reset zoom to 100%"],
  ["Drag empty canvas", "Marquee select"],
  ["Shift + marquee", "Add to selection"],
  ["[ / ]", "Decrease / increase grid span"],
  ["Alt + Left / Right", "Reorder selected node"],
  ["Delete / Backspace", "Delete selected nodes"],
  ["Escape", "Clear selection / cancel drag"],
  ["Ctrl/Cmd + Z", "Undo"],
  ["Ctrl/Cmd + Y", "Redo"],
  ["Ctrl/Cmd + C / V", "Copy / paste"],
  ["Ctrl/Cmd + D", "Duplicate"],
  ["Right-click node", "Open node actions"],
];

export default function EditorHeader({
  previewMode,
  setPreviewMode,
  tenantID = null,
}) {
  const { actions, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: state.options.enabled && query.history.canUndo(),
    canRedo: state.options.enabled && query.history.canRedo(),
  }));
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = navigator.platform.toLowerCase().includes("mac")
        ? event.metaKey
        : event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandQuery("");
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const canvasCommand = (command) =>
    window.dispatchEvent(
      new CustomEvent("craft-canvas-command", { detail: { command } })
    );

  const commands = [
    { label: "Undo", hint: "Ctrl+Z", disabled: !canUndo, run: () => actions.history.undo() },
    { label: "Redo", hint: "Ctrl+Y", disabled: !canRedo, run: () => actions.history.redo() },
    { label: "Duplicate selection", hint: "Ctrl+D", run: () => runEditorCommand("duplicate") },
    { label: "Copy selection", hint: "Ctrl+C", run: () => runEditorCommand("copy") },
    { label: "Paste", hint: "Ctrl+V", run: () => runEditorCommand("paste") },
    { label: "Deselect", run: () => actions.selectNode([]) },
    { label: "Select page", run: () => actions.selectNode("ROOT") },
    { label: "Fit page", run: () => canvasCommand("fit") },
    { label: "Fit selection", run: () => canvasCommand("fit-selection") },
    { label: "Desktop canvas (1120)", run: () => canvasCommand("device-desktop") },
    { label: "Tablet canvas (768)", run: () => canvasCommand("device-tablet") },
    { label: "Mobile canvas (390)", run: () => canvasCommand("device-mobile") },
    { label: "Toggle rulers", run: () => canvasCommand("toggle-rulers") },
    { label: "Zoom in", run: () => canvasCommand("zoom-in") },
    { label: "Zoom out", run: () => canvasCommand("zoom-out") },
    { label: "Reset zoom", run: () => canvasCommand("reset") },
    {
      label: "Keyboard shortcuts",
      hint: "?",
      run: () => {
        setCommandOpen(false);
        setShortcutsOpen(true);
      },
    },
    {
      label: "Design mode",
      run: () => {
        setPreviewMode(false);
        actions.setOptions((options) => {
          options.enabled = true;
        });
      },
    },
    {
      label: "Preview mode",
      run: () => {
        setPreviewMode(true);
        actions.setOptions((options) => {
          options.enabled = false;
        });
        actions.selectNode([]);
      },
    },
  ];

  const filteredCommands = commandQuery.trim()
    ? commands.filter((command) =>
        command.label.toLowerCase().includes(commandQuery.trim().toLowerCase())
      )
    : commands;

  return (
    <>
      <div className="flex items-center justify-end p-1.5 border-b border-border gap-2 shrink-0">
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setCommandQuery("");
              setCommandOpen(true);
            }}
            aria-label="Command palette"
            title="Command palette (Ctrl/Cmd+K)"
          >
            <Command className="h-3.5 w-3.5" />
          </Button>
          <SaveSnippetButton tenantID={tenantID} />
          <SaveCompositeButton tenantID={tenantID} />
          <CanvasAccessibilityAudit />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          <div className="ml-1 flex gap-2">
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
                actions.setOptions((options) => {
                  options.enabled = true;
                });
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
                actions.setOptions((options) => {
                  options.enabled = false;
                });
                actions.selectNode([]);
              }}
            >
              <Play className="h-2.5 w-2.5" /> Preview
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-h-[80vh] w-full max-w-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Canvas shortcuts</DialogTitle>
            <DialogDescription>
              Everything you need to build without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid max-h-[60vh] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {SHORTCUTS.map(([keys, description]) => (
              <div
                key={keys}
                className="flex items-start justify-between gap-3 rounded border border-border/40 bg-background/60 px-2 py-1.5"
              >
                <span className="text-[11px] text-muted-foreground">{description}</span>
                <kbd className="shrink-0 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                  {keys}
                </kbd>
              </div>
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {commandOpen && (
        <div
          className="fixed inset-0 z-[210] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCommandOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Command className="h-4 w-4 text-primary" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setCommandOpen(false);
                  if (event.key === "Enter") {
                    const command = filteredCommands.find((item) => !item.disabled);
                    if (command) {
                      command.run();
                      setCommandOpen(false);
                    }
                  }
                }}
                placeholder="Search actions…"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                Esc
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-1">
              {filteredCommands.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  No matching actions.
                </p>
              ) : (
                filteredCommands.map((command) => (
                  <button
                    key={command.label}
                    type="button"
                    disabled={command.disabled}
                    onClick={() => {
                      command.run();
                      setCommandOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex-1">{command.label}</span>
                    {command.hint && (
                      <kbd className="font-mono text-[9px] text-muted-foreground/60">
                        {command.hint}
                      </kbd>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

EditorHeader.propTypes = {
  previewMode: PropTypes.bool,
  setPreviewMode: PropTypes.func,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
