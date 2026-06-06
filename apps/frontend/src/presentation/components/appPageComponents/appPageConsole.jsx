import React, { useState } from "react";
import PropTypes from "prop-types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { useAppPageStateTree } from "../../../logic/appPageRuntime";
import { CodeEditor } from "@jet-admin/ui";
import { StringUtils } from "../../../utils/string";

export const AppPageConsole = () => {
  const contextTree = useAppPageStateTree();
  const [isTruncated, setIsTruncated] = useState(true);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-foreground block">
            Page Data Console
          </span>

        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isTruncated}
              onChange={(e) => setIsTruncated(e.target.checked)}
              className="w-3 h-3 accent-primary"
            />
            <span className="text-[10px] text-muted-foreground font-medium">Truncate Large Data</span>
          </label>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Raw State Tree View */}
        <ResizablePanel defaultSize={100} className="flex flex-col bg-zinc-950">

          <div className="flex-1 overflow-hidden">
            {!contextTree ? (
               <div className="text-zinc-600 italic p-4 text-[11px]">Console not connected to runtime.</div>
            ) : Object.keys(contextTree.queries || {}).length === 0 && Object.keys(contextTree.workflows || {}).length === 0 && Object.keys(contextTree.listeners || {}).length === 0 ? (
               <div className="text-zinc-600 italic p-4 text-[11px]">No data sources configured yet.</div>
            ) : (
              <CodeEditor
                language="json"
                    value={StringUtils.safeJsonStringify(
                      contextTree,
                      isTruncated ? 50 : Infinity,
                      isTruncated ? 1000 : Infinity,
                      isTruncated ? 5000 : Infinity
                    )}
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
