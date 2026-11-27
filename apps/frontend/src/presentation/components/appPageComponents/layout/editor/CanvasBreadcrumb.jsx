import React from "react";
import { useEditor } from "@craftjs/core";
import { ChevronRight, Layers } from "lucide-react";

const labelForNode = (node) => {
  if (!node) return "Element";
  if (node.data.displayName === "CanvasWidgetSlot") {
    const key = node.data.props?.widgetKey || "widget";
    return `Widget: ${key.replace(/^widget_/, "").split("_")[0]}`;
  }
  return node.data.displayName?.replace(/^Canvas/, "") || node.data.type?.name || "Element";
};

/**
 * Screen-space breadcrumb for the current selection. Lets users jump to an
 * ancestor without hunting through the Layers tab.
 */
export default function CanvasBreadcrumb() {
  const { query, actions } = useEditor();
  const { selectedKey, enabled } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || [])
      .sort()
      .join("|"),
    enabled: state.options.enabled,
  }));

  if (!enabled || !selectedKey) return null;
  const ids = selectedKey.split("|").filter(Boolean);
  if (ids.length > 1) {
    return (
      <div
        className="canvas-breadcrumb"
        role="navigation"
        aria-label="Selection breadcrumb"
        data-canvas-ui
      >
        <Layers className="h-3 w-3" />
        <span>{ids.length} elements selected</span>
      </div>
    );
  }

  const path = [];
  let current = ids[0];
  while (current && current !== "ROOT") {
    try {
      const node = query.node(current).get();
      path.unshift({ id: current, label: labelForNode(node) });
      current = node?.data?.parent;
    } catch {
      break;
    }
  }
  path.unshift({ id: "ROOT", label: "Page" });

  return (
    <div
      className="canvas-breadcrumb"
      role="navigation"
      aria-label="Selection breadcrumb"
      data-canvas-ui
    >
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="h-2.5 w-2.5 opacity-40" />}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              actions.selectNode(item.id);
            }}
            className="max-w-[160px] truncate rounded px-1 py-0.5 hover:bg-muted"
            title={`Select ${item.label}`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
