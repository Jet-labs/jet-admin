import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@jet-admin/ui";
import { Copy, Check } from "lucide-react";

export const CodeBlockWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const code = widgetConfig?.code ?? "";
  const language = widgetConfig?.language || "sql";
  const showCopy = widgetConfig?.showCopy !== false;
  const maxHeight = Number(widgetConfig?.maxHeight || 0);
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col rounded border border-border bg-background relative" onClick={() => fireWidgetEvent?.("onClick", {})}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/30 shrink-0">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{language}</span>
        {showCopy && (
          <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] gap-1" onClick={handleCopy}>
            {copied ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
          </Button>
        )}
      </div>
      <pre className="flex-1 overflow-auto p-2 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words" style={maxHeight > 0 ? { maxHeight, overflow: "auto" } : undefined}>
        <code>{String(code) || "// No code configured"}</code>
      </pre>
    </div>
  );
};

CodeBlockWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default CodeBlockWidget;
