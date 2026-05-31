import React from "react";
import PropTypes from "prop-types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { useAppPageStateTree } from "../../../logic/appPageRuntime";
import { CodeEditor } from "@jet-admin/ui";

const safeStringify = (obj, indent = 2) => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      // Clean up widgetMethods to only show registered method names
      if (key === "widgetMethods" && value && typeof value === "object") {
        const simplified = {};
        for (const widgetID of Object.keys(value)) {
          const methods = value[widgetID];
          if (methods && typeof methods === "object") {
            simplified[widgetID] = Object.keys(methods).filter(
              (k) => typeof methods[k] === "function"
            );
          }
        }
        return simplified;
      }

      // Drop React fiber nodes or special symbols
      if (key && (key.startsWith("__react") || key.startsWith("$$typeof"))) {
        return undefined;
      }

      if (value && typeof value === "object") {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);

        // Safely tag HTMLElement values
        if (
          value instanceof HTMLElement ||
          (value.constructor && (value.constructor.name === "HTMLDivElement" || value.constructor.name === "FiberNode"))
        ) {
          return "[HTMLElement]";
        }
      }

      if (typeof value === "function") {
        return "[Function]";
      }

      return value;
    },
    indent
  );
};

export const AppPageConsole = () => {
  const contextTree = useAppPageStateTree();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Page Data Console
        </span>
        <span className="text-[10px] text-muted-foreground">
          Live representation of your page-level data structures.
        </span>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Raw State Tree View */}
        <ResizablePanel defaultSize={100} className="flex flex-col bg-zinc-950">
          <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider flex-shrink-0">
             previewStateTree Context
          </div>
          <div className="flex-1 overflow-hidden">
            {!contextTree ? (
               <div className="text-zinc-600 italic p-4 text-[11px]">Console not connected to runtime.</div>
            ) : Object.keys(contextTree.queries || {}).length === 0 && Object.keys(contextTree.workflows || {}).length === 0 ? (
               <div className="text-zinc-600 italic p-4 text-[11px]">No data sources configured yet.</div>
            ) : (
              <CodeEditor
                language="json"
                value={safeStringify(contextTree)}
                readOnly={true}
                height="100%"
                showHeader={false}
                className="h-full border-0 rounded-none bg-zinc-950"
              />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
