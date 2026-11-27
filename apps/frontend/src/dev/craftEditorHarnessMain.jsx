import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { CraftLayoutEditorCanvas } from "../presentation/components/appPageComponents/layout/index.js";
import { beginCanvasDrag } from "../presentation/components/appPageComponents/layout/editor/canvasDragStore.js";
import "../index.css";

const LAYOUT = {
  id: "editor-harness-root",
  type: "column",
  children: [
    {
      id: "editor-harness-row-1",
      type: "row",
      sizing: "auto",
      children: [
        { id: "editor-harness-widget-1", type: "widget", widgetKey: "harness-widget-1", span: 6, sizing: "fill" },
        { id: "editor-harness-widget-2", type: "widget", widgetKey: "harness-widget-2", span: 6, sizing: "fill" },
      ],
    },
    {
      id: "editor-harness-row-2",
      type: "row",
      sizing: "auto",
      children: [
        { id: "editor-harness-widget-3", type: "widget", widgetKey: "harness-widget-3", span: 4, sizing: "fill" },
        { id: "editor-harness-widget-4", type: "widget", widgetKey: "harness-widget-4", span: 8, sizing: "fill" },
      ],
    },
  ],
};

const renderWidget = (widgetKey) => (
  <div className="flex h-full min-h-[120px] w-full flex-col justify-between rounded-card border border-border bg-card p-3">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Harness widget</p>
      <p className="mt-1 text-sm font-medium text-foreground">{widgetKey}</p>
    </div>
    <p className="text-[11px] text-muted-foreground">
      Pointer-drag a widget from the left palette, then zoom, pan and resize this canvas.
    </p>
  </div>
);

const Harness = () => {
  const [, setLayout] = useState(LAYOUT);
  const onChangeLayout = useCallback((next) => {
    window.__harnessLayout = next;
    setLayout(next);
  }, []);
  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div>
          <h1 className="text-sm font-medium text-foreground">Canvas editor harness</h1>
          <p className="text-[11px] text-muted-foreground">
            Wheel pan · Ctrl/Cmd+wheel zoom · Space+drag pan · drag empty space to lasso · drag the palette grips
          </p>
        </div>
        <span className="rounded-control border border-border bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground">
          no auth / no backend
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-r border-border p-2">
          <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Widgets
          </p>
          {["harness-stat", "harness-table", "harness-chart", "harness-form"].map((key) => (
            <div
              key={key}
              className="mb-1.5 flex cursor-grab items-center gap-2 rounded border border-border bg-card p-2 text-xs text-foreground shadow-sm active:cursor-grabbing"
              style={{ touchAction: "none" }}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                beginCanvasDrag({ payload: { kind: "widget", widgetKey: key }, label: key, event });
              }}
            >
              <span className="text-muted-foreground">⠿</span>
              <span className="font-medium">{key}</span>
            </div>
          ))}
        </aside>
        <div className="min-h-0">
          <CraftLayoutEditorCanvas
            layout={LAYOUT}
            onChangeLayout={onChangeLayout}
            renderWidget={renderWidget}
            widgets={[]}
            setWidgets={() => {}}
            onEditWidget={() => {}}
            editorLiveStateTree={{ state: {} }}
          />
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("editor-root")).render(<Harness />);
