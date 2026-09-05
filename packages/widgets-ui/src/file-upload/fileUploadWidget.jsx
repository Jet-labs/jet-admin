import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Label, Button } from "@jet-admin/ui";
import { Upload, X, FileText } from "lucide-react";

const toMeta = (f) => ({ name: f.name, size: f.size, type: f.type, lastModified: f.lastModified });

export const FileUploadWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "Upload file";
  const accept = widgetConfig?.accept || "";
  const multiple = !!widgetConfig?.multiple;
  const maxSizeMB = Number(widgetConfig?.maxSizeMB || 0);
  const buttonLabel = widgetConfig?.buttonLabel || "Choose file";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const files = widgetState?.files || [];
  const fileNames = widgetState?.fileNames || [];

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      clear: () => {
        if (inputRef.current) inputRef.current.value = "";
        if (setWidgetState) setWidgetState((p) => ({ ...p, files: [], fileNames: [], value: multiple ? [] : "" }));
        setError("");
        if (fireWidgetEvent) fireWidgetEvent("onClear", { files: [] });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const handleFiles = (list) => {
    setError("");
    let arr = Array.from(list || []);
    if (!multiple) arr = arr.slice(0, 1);
    if (maxSizeMB > 0) {
      const over = arr.find((f) => f.size > maxSizeMB * 1024 * 1024);
      if (over) {
        setError(`"${over.name}" exceeds ${maxSizeMB} MB limit.`);
        return;
      }
    }
    const meta = arr.map(toMeta);
    if (setWidgetState) setWidgetState((p) => ({ ...p, files: meta, fileNames: meta.map((m) => m.name), value: multiple ? meta.map((m) => m.name) : (meta[0]?.name || "") }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { files: meta, fileNames: meta.map((m) => m.name) });
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <Button type="button" variant="outline" size="sm" className="h-8 text-xs w-full" onClick={() => inputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />{buttonLabel}
      </Button>
      {accept && <span className="text-[11px] text-muted-foreground font-mono truncate">Accepts: {accept}</span>}
      {error && <span className="text-xs text-rose-500">{error}</span>}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded border border-border bg-muted/30 px-2 py-1.5 text-xs">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate flex-1 text-foreground">{f.name}</span>
              <span className="text-muted-foreground shrink-0 tabular-nums">{(f.size / 1024).toFixed(1)} KB</span>
              <button type="button" aria-label="Remove file" className="text-muted-foreground hover:text-foreground" onClick={() => {
                const next = files.filter((_, x) => x !== i);
                if (inputRef.current) inputRef.current.value = "";
                if (setWidgetState) setWidgetState((p) => ({ ...p, files: next, fileNames: next.map((m) => m.name), value: multiple ? next.map((m) => m.name) : "" }));
                if (fireWidgetEvent) fireWidgetEvent("onChange", { files: next });
              }}><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button type="button" onClick={() => methodsRef.current.clear()} className="text-[11px] text-muted-foreground hover:text-foreground self-start">Clear all</button>
        </div>
      )}
    </div>
  );
};

FileUploadWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default FileUploadWidget;
