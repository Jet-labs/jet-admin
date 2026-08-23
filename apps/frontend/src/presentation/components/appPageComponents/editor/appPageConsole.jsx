import React, { useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { useAppPageStateTree } from "../../../../logic/appPageRuntime";
import { CodeEditor, Label, Checkbox } from "@jet-admin/ui";
import { StringUtils } from "../../../../utils/string";

export const AppPageConsole = () => {
  const contextTree = useAppPageStateTree();
  const [isTruncated, setIsTruncated] = useState(true);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="p-2 border-b border-border bg-muted/20 flex-shrink-0 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-foreground block">
            Page Data Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={isTruncated}
              onCheckedChange={(checked) => setIsTruncated(checked === true)}
              aria-label="Truncate large data"
            />
            Truncate Large Data
          </Label>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={100} className="flex flex-col bg-background">
          <div className="flex-1 overflow-hidden">
            {!contextTree ? (
               <div className="text-muted-foreground italic p-2 text-[11px]">Console not connected to runtime.</div>
            ) : Object.keys(contextTree.queries || {}).length === 0 && Object.keys(contextTree.workflows || {}).length === 0 && Object.keys(contextTree.listeners || {}).length === 0 ? (
               <div className="text-muted-foreground italic p-2 text-[11px]">No data sources configured yet.</div>
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
                className="h-full border-0 rounded-none bg-background"
              />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
