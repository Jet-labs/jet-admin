import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@craftjs/core";
import { Accessibility, AlertTriangle, CheckCircle2, RefreshCw, X } from "lucide-react";

const EXCLUDED_SELECTOR =
  "[data-canvas-ui], .craft-zoom-hud, .craft-ruler, .canvas-minimap, .canvas-breadcrumb, [data-canvas-context-menu]";

const hasAccessibleName = (element) => {
  if (element.getAttribute("aria-label")?.trim()) return true;
  if (element.getAttribute("title")?.trim()) return true;
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const label = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .join(" ")
      .trim();
    if (label) return true;
  }
  if (element.id) {
    const explicit = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (explicit?.textContent?.trim()) return true;
  }
  const closestLabel = element.closest("label");
  if (closestLabel?.textContent?.trim()) return true;
  if (element.getAttribute("placeholder")?.trim()) return true;
  if (element.tagName === "IMG" && element.getAttribute("alt")?.trim()) return true;
  if (element.textContent?.trim()) return true;
  return false;
};

const describeElement = (element) => {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const text = (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48);
  return `${tag}${id}${text ? ` “${text}”` : ""}`;
};

export default function CanvasAccessibilityAudit() {
  const { query, actions } = useEditor();
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState([]);

  const findCraftNodeId = useCallback(
    (element, scope) => {
      let current = element;
      while (current && current !== scope.parentElement) {
        if (current.id) {
          try {
            if (query.node(current.id).get()) return current.id;
          } catch {
            /* not a craft node id */
          }
        }
        current = current.parentElement;
      }
      return null;
    },
    [query]
  );

  const runAudit = useCallback(() => {
    const canvas = document.getElementById("craft-canvas-root");
    const scope = canvas?.querySelector(".craft-canvas-page") || canvas;
    if (!scope) {
      setIssues([]);
      return;
    }

    const collected = [];
    const push = (severity, message, element) => {
      collected.push({
        id: `${severity}:${message}:${collected.length}`,
        severity,
        message,
        description: element ? describeElement(element) : "",
        nodeId: element ? findCraftNodeId(element, scope) : null,
      });
    };

    const included = (element) => !element.closest(EXCLUDED_SELECTOR);

    // Duplicate IDs (Craft node ids are unique; widget markup may not be).
    const idCounts = new Map();
    scope.querySelectorAll("[id]").forEach((element) => {
      if (!included(element)) return;
      idCounts.set(element.id, (idCounts.get(element.id) || 0) + 1);
    });
    idCounts.forEach((count, id) => {
      if (count > 1 && !id.startsWith("craft-")) {
        push("error", `Duplicate id "${id}" (${count} elements)`, null);
      }
    });

    // Images need alternative text.
    scope.querySelectorAll("img").forEach((image) => {
      if (!included(image)) return;
      if (!image.hasAttribute("alt")) {
        push("error", "Image is missing alt text", image);
      }
    });

    // Interactive controls need an accessible name.
    scope
      .querySelectorAll(
        "button, a[href], [role='button'], [role='link'], input:not([type='hidden']), select, textarea"
      )
      .forEach((element) => {
        if (!included(element)) return;
        if (!hasAccessibleName(element)) {
          push("error", `Control has no accessible name: ${element.tagName.toLowerCase()}`, element);
        }
      });

    // Iframes need a title.
    scope.querySelectorAll("iframe").forEach((frame) => {
      if (!included(frame)) return;
      if (!frame.getAttribute("title")?.trim()) {
        push("warning", "Iframe is missing a title", frame);
      }
    });

    // Heading order.
    const headings = Array.from(scope.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter(
      (heading) => included(heading)
    );
    let previousLevel = 0;
    let h1Count = 0;
    headings.forEach((heading) => {
      const level = Number(heading.tagName.slice(1));
      if (level === 1) h1Count += 1;
      if (previousLevel && level > previousLevel + 1) {
        push(
          "warning",
          `Heading order jumps from h${previousLevel} to h${level}`,
          heading
        );
      }
      previousLevel = level;
    });
    if (h1Count > 1) {
      push("warning", `Page has ${h1Count} h1 headings`, headings.find((h) => h.tagName === "H1"));
    }

    // Buttons with only an icon and no label already covered; add a hint for
    // empty links that would navigate nowhere.
    scope.querySelectorAll("a[href]").forEach((link) => {
      if (!included(link)) return;
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.trim() === "") {
        push("warning", "Link has an empty destination", link);
      }
    });

    setIssues(collected);
  }, [findCraftNodeId]);

  const hydrateAndRun = () => {
    // Design-mode shells keep widget bodies unmounted; force them open so the
    // audit sees real widget markup instead of only layout scaffolding.
    window.dispatchEvent(new CustomEvent("craft-hydrate-widgets"));
    window.setTimeout(runAudit, 300);
  };

  const openAudit = () => {
    setIssues([]);
    setOpen(true);
    hydrateAndRun();
  };

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return (
    <>
      <button
        type="button"
        onClick={openAudit}
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Accessibility audit"
        title="Accessibility audit"
      >
        <Accessibility className="h-3.5 w-3.5" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[230] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Accessibility audit"
              className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-card border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Accessibility className="h-4 w-4 text-primary" />
                    Accessibility audit
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Structural checks against the current canvas DOM. Click an issue to
                    select its layout node.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={hydrateAndRun}
                    className="flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                    title="Run the audit again"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Close accessibility audit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-2 text-[10px]">
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errorCount} {errorCount === 1 ? "error" : "errors"}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount} {warningCount === 1 ? "warning" : "warnings"}
                </span>
                <span className="ml-auto text-muted-foreground">
                  {issues.length ? "Review before publishing" : "Canvas looks clean"}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {issues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-xs font-medium text-foreground">
                      No accessibility issues found
                    </p>
                    <p className="max-w-[280px] text-[10px] text-muted-foreground">
                      This checks duplicate ids, missing alt text, unnamed controls,
                      iframe titles, heading order and empty links.
                    </p>
                  </div>
                ) : (
                  issues.map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => {
                        if (!issue.nodeId) return;
                        actions.selectNode(issue.nodeId);
                        setOpen(false);
                        window.dispatchEvent(
                          new CustomEvent("craft-canvas-command", {
                            detail: { command: "fit-selection" },
                          })
                        );
                      }}
                      className={`mb-1 flex w-full items-start gap-2 rounded border border-border/50 bg-background p-2 text-left transition-colors hover:border-primary/40 ${
                        issue.nodeId ? "" : "cursor-default opacity-80"
                      }`}
                    >
                      <span
                        className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                          issue.severity === "error" ? "bg-destructive" : "bg-amber-400"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-medium text-foreground">
                          {issue.message}
                        </span>
                        {issue.description && (
                          <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground/70">
                            {issue.description}
                          </span>
                        )}
                      </span>
                      {issue.nodeId ? (
                        <span className="shrink-0 rounded border border-border px-1 py-0.5 text-[8px] text-muted-foreground">
                          select
                        </span>
                      ) : (
                        <span className="shrink-0 rounded border border-border px-1 py-0.5 text-[8px] text-muted-foreground/50">
                          page
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
