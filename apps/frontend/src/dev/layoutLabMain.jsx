/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CraftLayoutEditorCanvas,
  LayoutRenderer,
} from "../presentation/components/appPageComponents/layout/index.js";
import {
  evaluateVisibilityCondition,
  resolveValue,
} from "../logic/evaluationEngine";
import { LAB_LAYOUT, LAB_STATE_TREE } from "./layoutLabLayout.js";
import "../index.css";

const ITEM_POOL = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];

const prefixIds = (node, prefix) => {
  if (Array.isArray(node)) return node.map((child) => prefixIds(child, prefix));
  if (!node || typeof node !== "object") return node;
  return {
    ...node,
    id: node.id ? `${prefix}${node.id}` : node.id,
    ...(node.children
      ? {
          children: Array.isArray(node.children)
            ? node.children.map((child) => prefixIds(child, prefix))
            : prefixIds(node.children, prefix),
        }
      : {}),
  };
};

function LabWidgetCard({ widgetKey, sizing, item, index }) {
  const [count, setCount] = useState(0);
  return (
    <div
      className="lab-widget-card flex h-full min-h-[64px] w-full flex-col justify-between border border-border bg-card p-2 text-foreground"
      style={{ borderRadius: "var(--layout-widget-radius, 0.5rem)" }}
      data-lab-widget={widgetKey}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Widget
          </p>
          <p className="truncate text-xs font-semibold">{widgetKey}</p>
        </div>
        <span className="shrink-0 rounded border border-border bg-muted/40 px-1 py-0.5 font-mono text-[8px] text-muted-foreground">
          {sizing || "fill"}
        </span>
      </div>
      <div className="mt-1 flex items-end justify-between gap-2 text-[9px] text-muted-foreground">
        <span className="truncate">
          {item
            ? `${item.name} · ${item.value} · #${index}`
            : "static / design content"}
        </span>
        <button
          type="button"
          data-lab-counter
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setCount((value) => value + 1);
          }}
          className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:text-foreground"
          title="Local state counter — test preserve-space / keepMounted behavior"
        >
          count {count}
        </button>
      </div>
    </div>
  );
}

const readStyle = (element) => {
  if (!element) return null;
  const style = getComputedStyle(element);
  return {
    padding: style.padding,
    gap: style.gap,
    borderRadius: style.borderRadius,
    borderWidth: style.borderWidth,
    background: style.backgroundColor,
  };
};

const numeric = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const matches = (actual, expected) => {
  if (!actual) return false;
  return expected.every((key) => {
    const got = numeric(actual[key]);
    return got !== null && Math.abs(got) < 0.01;
  });
};

function StyleAudit({ layout, editorRef, viewerRef }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let frame = null;
    const collect = () => {
      const editor = editorRef.current;
      const viewer = viewerRef.current;
      if (!editor || !viewer) {
        frame = setTimeout(collect, 500);
        return;
      }

      const editorPage = editor.querySelector(".craft-canvas-page > div");
      const viewerPage = viewer.querySelector(`[id="mirror-${layout.id}"]`) ||
        viewer.querySelector(":scope > div");
      const targets = [
        {
          label: "Page root",
          editor: editorPage,
          viewer: viewerPage,
          check: ["padding", "gap", "borderRadius"],
        },
        {
          label: "Grid row (zero)",
          editor: editor.querySelector("#lab-row-zero"),
          viewer: viewer.querySelector('[id="mirror-lab-row-zero"]'),
          check: ["padding", "gap", "borderRadius"],
        },
        {
          label: "Container (zero)",
          editor: editor.querySelector("#lab-container-zero"),
          viewer: viewer.querySelector('[id="mirror-lab-container-zero"]'),
          check: ["padding", "gap", "borderRadius"],
        },
        {
          label: "Container inner gap",
          editor: editor.querySelector("#lab-container-inner"),
          viewer: viewer.querySelector('[id="mirror-lab-container-inner"]'),
          check: ["padding", "gap"],
        },
        {
          label: "Flex stack (zero)",
          editor: editor.querySelector("#lab-stack-h"),
          viewer: viewer.querySelector('[id="mirror-lab-stack-h"]'),
          check: ["padding", "gap", "borderRadius"],
        },
        {
          label: "Z-stack (zero)",
          editor: editor.querySelector("#lab-zstack"),
          viewer: viewer.querySelector('[id="mirror-lab-zstack"]'),
          check: ["padding", "borderRadius"],
        },
        {
          label: "Widget slot (zero)",
          editor: editor.querySelector("#lab-widget-zero-1"),
          viewer: viewer.querySelector('[id="mirror-lab-widget-zero-1"]'),
          check: ["padding", "borderRadius"],
        },
        {
          label: "Widget card radius",
          editor: editor.querySelector("#lab-widget-zero-1 .lab-widget-card"),
          viewer: viewer.querySelector(
            '[id="mirror-lab-widget-zero-1"] .lab-widget-card'
          ),
          check: ["borderRadius"],
        },
      ];

      const next = targets.map((target) => {
        const editorStyle = readStyle(target.editor);
        const viewerStyle = readStyle(target.viewer);
        return {
          label: target.label,
          editor: editorStyle,
          viewer: viewerStyle,
          editorOk: matches(editorStyle, target.check),
          viewerOk: matches(viewerStyle, target.check),
        };
      });
      setRows((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
      frame = setTimeout(collect, 500);
    };

    collect();
    return () => {
      if (frame) clearTimeout(frame);
    };
  }, [layout.id, editorRef, viewerRef]);

  return (
    <div className="mt-4 rounded-card border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-foreground">Computed style audit</h2>
          <p className="text-[10px] text-muted-foreground">
            Verifies that explicit zero padding/gap/radius reaches both the editor and viewer DOM.
          </p>
        </div>
        <span className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
          live
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-[10px]">
          <thead>
            <tr className="border-b border-border text-[9px] uppercase tracking-wider text-muted-foreground">
              <th className="py-1 pr-2 font-medium">Node</th>
              <th className="py-1 pr-2 font-medium">Editor padding / gap / radius</th>
              <th className="py-1 pr-2 font-medium">Editor</th>
              <th className="py-1 pr-2 font-medium">Viewer padding / gap / radius</th>
              <th className="py-1 font-medium">Viewer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40">
                <td className="py-1 pr-2 font-medium text-foreground">{row.label}</td>
                <td className="py-1 pr-2 font-mono text-muted-foreground">
                  {row.editor
                    ? `${row.editor.padding} / ${row.editor.gap} / ${row.editor.borderRadius}`
                    : "—"}
                </td>
                <td className="py-1 pr-2">
                  <span
                    className={`rounded px-1 py-0.5 font-mono text-[8px] font-bold uppercase ${
                      row.editorOk
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {row.editorOk ? "ok" : "check"}
                  </span>
                </td>
                <td className="py-1 pr-2 font-mono text-muted-foreground">
                  {row.viewer
                    ? `${row.viewer.padding} / ${row.viewer.gap} / ${row.viewer.borderRadius}`
                    : "—"}
                </td>
                <td className="py-1">
                  <span
                    className={`rounded px-1 py-0.5 font-mono text-[8px] font-bold uppercase ${
                      row.viewerOk
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {row.viewerOk ? "ok" : "check"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Lab = () => {
  const [layout, setLayout] = useState(LAB_LAYOUT);
  const [editorKey, setEditorKey] = useState(0);
  const [showConditional, setShowConditional] = useState(true);
  const [showPromo, setShowPromo] = useState(true);
  const [itemCount, setItemCount] = useState(3);
  const [viewerWidth, setViewerWidth] = useState(1120);
  const editorRef = useRef(null);
  const viewerRef = useRef(null);

  const stateTree = useMemo(
    () => ({
      ...LAB_STATE_TREE,
      variables: {
        ...LAB_STATE_TREE.variables,
        showConditional,
        showPromo,
      },
      queries: {
        ...LAB_STATE_TREE.queries,
        demoItems: {
          ...LAB_STATE_TREE.queries.demoItems,
          data: ITEM_POOL.slice(0, itemCount).map((name, index) => ({
            name,
            value: (index + 1) * 11,
          })),
        },
      },
    }),
    [showConditional, showPromo, itemCount]
  );

  const editorLiveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  const renderWidget = useCallback((widgetKey, sizing, scopedStateTree) => {
    const item = scopedStateTree?.variables?.item;
    const index = scopedStateTree?.variables?.index;
    return (
      <LabWidgetCard
        widgetKey={widgetKey}
        sizing={sizing}
        item={item}
        index={index}
      />
    );
  }, []);

  const viewerLayout = useMemo(
    () => prefixIds(layout, "mirror-"),
    [layout]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold">Layout Lab — core layout primitives</h1>
            <p className="text-[11px] text-muted-foreground">
              Grid row, card container, flex stack, z-stack, conditions, repeat, free sizing,
              zero spacing and custom styling. The mirror below uses the real viewer
              <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">LayoutRenderer</code>
              path.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorKey((key) => key + 1)}
              className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Reset editor layout
            </button>
            <button
              type="button"
              onClick={() => setLayout(LAB_LAYOUT)}
              className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Reset mirror
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showConditional}
              onChange={(event) => setShowConditional(event.target.checked)}
              className="rounded border-border"
            />
            Show conditional widget
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPromo}
              onChange={(event) => setShowPromo(event.target.checked)}
              className="rounded border-border"
            />
            Show promo / preserve-space pair
          </label>
          <label className="flex items-center gap-2">
            Repeated rows
            <select
              value={itemCount}
              onChange={(event) => setItemCount(Number(event.target.value))}
              className="rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground"
            >
              {[0, 1, 3, 5].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Viewer width</span>
            {[1120, 900, 420].map((width) => (
              <button
                key={width}
                type="button"
                onClick={() => setViewerWidth(width)}
                className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                  viewerWidth === width
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4">
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold">Design editor</h2>
            <span className="text-[10px] text-muted-foreground">
              Select nodes to inspect layout props; use Design / Preview inside the editor header.
            </span>
          </div>
          <div
            ref={editorRef}
            className="h-[760px] overflow-hidden rounded-card border border-border bg-background"
          >
            <CraftLayoutEditorCanvas
              key={editorKey}
              layout={LAB_LAYOUT}
              onChangeLayout={(next) => setLayout(next)}
              renderWidget={renderWidget}
              widgets={[]}
              setWidgets={() => {}}
              onEditWidget={() => {}}
              editorLiveStateTree={editorLiveStateTree}
            />
          </div>
        </section>

        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold">Viewer mirror</h2>
            <span className="text-[10px] text-muted-foreground">
              LayoutRenderer · conditions · repeat · z-layer opacity · custom styles
            </span>
          </div>
          <div className="overflow-x-auto rounded-card border border-border bg-muted/20 p-4">
            <div
              ref={viewerRef}
              style={{ width: viewerWidth }}
              className="bg-background"
            >
              <LayoutRenderer
                node={viewerLayout}
                renderWidget={renderWidget}
                mode="view"
                stateTree={stateTree}
                resolveValue={resolveValue}
                evaluateVisibility={evaluateVisibilityCondition}
              />
            </div>
          </div>
        </section>

        <StyleAudit layout={layout} editorRef={editorRef} viewerRef={viewerRef} />
      </main>
    </div>
  );
};

createRoot(document.getElementById("layout-lab-root")).render(<Lab />);
