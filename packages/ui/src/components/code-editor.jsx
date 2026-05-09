import * as React from "react";
import Editor from "@monaco-editor/react";
import GithubTheme from "./github-light.json";
import { cn } from "../lib/utils";
import { Maximize2, Minimize2, Braces, AlertTriangle, CheckCircle2, Code } from "lucide-react";

const CodeEditor = React.forwardRef(({
  value,
  defaultValue,
  onChange,
  language = "json",
  height = 300,
  disabled = false,
  readOnly = false,
  theme = "vs-dark",
  className,
  title,
  titleIcon,
  showHeader = true,
  showFormatButton = true,
  showExpandButton = true,
  showLineNumbers = true,
  headerExtra,
  headerLeft,
  status, // "valid" | "error" | null
  statusMessage,
  footerHint,
  onMount,
  beforeMount,
  editorOptions = {},
  ...props
}, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const internalEditorRef = React.useRef(null);
  const monacoRef = React.useRef(null);

  const isReadOnly = disabled || readOnly;

  const handleEditorWillMount = (monaco) => {
    // Register GitHub Light theme
    monaco.editor.defineTheme("github-light", GithubTheme);
    
    if (beforeMount) {
      beforeMount(monaco);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    internalEditorRef.current = editor;
    monacoRef.current = monaco;
    
    // Pass refs to parent if a ref was provided
    if (typeof ref === "function") {
      ref({ editor, monaco });
    } else if (ref) {
      ref.current = { editor, monaco };
    }

    if (onMount) {
      onMount(editor, monaco);
    }
  };

  const handleFormat = () => {
    if (internalEditorRef.current) {
      internalEditorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  // Toggle fullscreen mode
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isExpanded]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded border text-sm shadow-sm transition-colors",
        status === "error" ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border hover:border-border/80",
        isExpanded
          ? "fixed inset-4 z-50 rounded shadow-2xl ring-1 ring-border/50 bg-brand-dark"
          : "relative bg-brand-dark",
        className
      )}
      {...props}
    >
      {/* Header Bar */}
      {showHeader && (
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {(title || titleIcon) && (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                {titleIcon ? titleIcon : <Code className="h-3.5 w-3.5 text-primary" />}
                {title && <span className="text-xs">{title}</span>}
              </div>
            )}
            
            {/* Status Pills */}
            {status && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                status === "valid" ? "bg-green-950/40 text-green-400 border border-green-800" :
                status === "error" ? "bg-red-950/40 text-red-400 border border-red-800" : ""
              )}>
                {status === "valid" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {status === "valid" ? "Valid" : "Invalid"}
              </span>
            )}

            {/* Custom Left Injection */}
            {headerLeft}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5">
            {headerExtra}
            
            {showFormatButton && !isReadOnly && (
              <button
                type="button"
                onClick={handleFormat}
                className="inline-flex h-6 items-center gap-1.5 rounded border border-transparent px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title="Format Code (Shift+Alt+F)"
              >
                <Braces className="h-3 w-3" />
                Format
              </button>
            )}

            {showExpandButton && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title={isExpanded ? "Exit fullscreen (Esc)" : "Fullscreen"}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Main Area */}
      <div className="relative flex-1">
        <Editor
          height={isExpanded ? "calc(100vh - 80px)" : height}
          language={language}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          theme={"vs-dark"}
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: isExpanded },
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            lineNumbers: showLineNumbers ? "on" : "off",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingStrategy: "advanced",
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            quickSuggestions: { other: true, comments: false, strings: true },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            snippetSuggestions: "inline",
            padding: { top: 8, bottom: 8 },
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
            bracketPairColorization: { enabled: true },
            lineNumbersMinChars: 3,
            glyphMargin: false,
            overviewRulerLanes: 0,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            ...editorOptions,
          }}
        />

        {/* Footer Hint Overlay */}
        {footerHint && (
          <div className="absolute bottom-2 right-4 z-10 pointer-events-none rounded border border-brand-border bg-brand-dark/95 px-2 py-1 text-[10px] text-brand-text-muted shadow-sm backdrop-blur-sm">
            {footerHint}
          </div>
        )}
      </div>

      {/* Error Strip */}
      {status === "error" && statusMessage && (
        <div className="flex items-start gap-2 border-t border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="font-medium whitespace-pre-wrap leading-relaxed">{statusMessage}</span>
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
