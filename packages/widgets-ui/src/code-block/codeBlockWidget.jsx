import React, { useState } from "react";
import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";
import { CodeEditor, Skeleton, WidgetSurface } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const CodeBlockWidget = ({ widgetConfig }) => {
  const code = widgetConfig?.code ?? "";
  const language = widgetConfig?.language || "sql";
  const showCopy = widgetConfig?.showCopy !== false;
  const showLineNumbers = widgetConfig?.showLineNumbers !== false;
  const wrap = normalizeFieldBoolean(widgetConfig?.wrap, false);
  const filename = widgetConfig?.filename || "";
  const maxHeight = Number(widgetConfig?.maxHeight || 0);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-1.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </WidgetSurface>
    );
  }

  const headerExtra = showCopy ? (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-6 items-center gap-1 rounded-control px-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      aria-label="Copy code"
      title="Copy code"
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  ) : null;

  return (
    <WidgetSurface density={density} className="flex h-full w-full flex-col overflow-hidden p-0">
      <CodeEditor
        key={`code-block-${wrap ? "wrap" : "nowrap"}-${showLineNumbers ? "lines" : "plain"}`}
        value={String(code)}
        language={language}
        readOnly
        height={maxHeight > 0 ? maxHeight : "100%"}
        title={filename || language.toUpperCase()}
        showHeader
        showFormatButton={false}
        showExpandButton={false}
        showLineNumbers={showLineNumbers}
        lineWrapping={wrap}
        headerExtra={headerExtra}
        className="h-full border-0"
      />
    </WidgetSurface>
  );
};

CodeBlockWidget.propTypes = { widgetConfig: PropTypes.object };
export default CodeBlockWidget;
