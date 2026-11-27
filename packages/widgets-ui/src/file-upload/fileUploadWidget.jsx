import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, FileText, Image as ImageIcon, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { Button, Label, WidgetBusy, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const toMeta = (file, id) => ({
  id,
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified,
  status: "pending",
  progress: 0,
  error: "",
  url: "",
});

const makeId = (file, index) => {
  const random = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`;
  return `${file.name}-${file.size}-${file.lastModified}-${random}`;
};

const normalizeUploadHeaders = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(String(raw));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const readPath = (source, path) => {
  if (!source || !path) return undefined;
  return String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .reduce((cursor, key) => (cursor === null || cursor === undefined ? undefined : cursor[key]), source);
};

const computeValue = (meta, multiple) => {
  if (!meta.length) return multiple ? [] : "";
  if (multiple) {
    const names = meta.map((item) => item.url || item.name);
    return meta.every((item) => item.url) ? meta.map((item) => item.url) : names;
  }
  return meta[0]?.url || meta[0]?.name || "";
};

export const FileUploadWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "Upload file";
  const accept = widgetConfig?.accept || "";
  const multiple = normalizeFieldBoolean(widgetConfig?.multiple, false);
  const maxSizeMB = Number(widgetConfig?.maxSizeMB || 0);
  const maxFiles = Number(widgetConfig?.maxFiles || 0);
  const buttonLabel = widgetConfig?.buttonLabel || "Choose file";
  const help = widgetConfig?.help || "";
  const showDropzone = normalizeFieldBoolean(widgetConfig?.showDropzone, false);
  const previewImages = widgetConfig?.previewImages !== false;
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const readOnly = normalizeFieldBoolean(widgetConfig?.readOnly, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const size = widgetConfig?.size || "default";
  const density = widgetConfig?.properties?.density || "comfortable";
  const uploadUrl = widgetConfig?.uploadUrl || "";
  const autoUpload = widgetConfig?.autoUpload !== false;
  const reactId = useId();
  const id = `file-upload-${reactId.replace(/:/g, "")}`;
  const helpId = help ? `${id}-help` : undefined;
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const previewUrlsRef = useRef({});
  const inputRef = useRef(null);
  const filesRef = useRef([]);
  const rawFilesRef = useRef(new Map());
  const xhrRef = useRef(new Map());

  const files = widgetState?.files || [];
  filesRef.current = files;
  const uploading = files.some((file) => file.status === "uploading");

  const liveRef = useRef(null);
  liveRef.current = {
    uploadUrl,
    autoUpload,
    uploadFieldName: widgetConfig?.uploadFieldName || "file",
    uploadMethod: (widgetConfig?.uploadMethod || "POST").toUpperCase(),
    uploadHeaders: normalizeUploadHeaders(widgetConfig?.uploadHeaders),
    uploadWithCredentials: normalizeFieldBoolean(widgetConfig?.uploadWithCredentials, false),
    responseUrlKey: widgetConfig?.responseUrlKey || "url",
    setWidgetState,
    fireWidgetEvent,
  };

  useEffect(
    () => () => {
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = {};
      xhrRef.current.forEach((xhr) => {
        try {
          xhr.abort();
        } catch {
          /* ignore */
        }
      });
      xhrRef.current.clear();
    },
    []
  );

  const replacePreviews = (nextUrls) => {
    Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = nextUrls;
    setPreviewUrls(nextUrls);
  };

  const mergePreviews = (nextUrls) => {
    previewUrlsRef.current = { ...previewUrlsRef.current, ...nextUrls };
    setPreviewUrls(previewUrlsRef.current);
  };

  const commitMeta = (updater) => {
    if (!setWidgetState) return;
    setWidgetState((prev) => {
      const next = updater(prev.files || []);
      return {
        ...prev,
        files: next,
        fileNames: next.map((item) => item.name),
        fileUrls: next.map((item) => item.url).filter(Boolean),
        value: computeValue(next, multiple),
      };
    });
  };

  const emitChange = (meta) => {
    if (!fireWidgetEvent) return;
    fireWidgetEvent("onChange", {
      files: meta,
      fileNames: meta.map((item) => item.name),
      fileUrls: meta.map((item) => item.url).filter(Boolean),
      value: computeValue(meta, multiple),
    });
  };

  const updateFile = (fileId, patch) => {
    commitMeta((current) => current.map((item) => (item.id === fileId ? { ...item, ...patch } : item)));
  };

  const uploadOne = (meta, file) => {
    if (!file || !meta) return;
    const rt = liveRef.current;
    if (!rt.uploadUrl) {
      updateFile(meta.id, { status: "ready", progress: 100, error: "" });
      return;
    }
    const xhr = new XMLHttpRequest();
    xhrRef.current.set(meta.id, xhr);
    updateFile(meta.id, { status: "uploading", progress: 0, error: "" });
    rt.fireWidgetEvent?.("onUploadStart", { file: meta });

    xhr.open(rt.uploadMethod, rt.uploadUrl, true);
    if (rt.uploadWithCredentials) xhr.withCredentials = true;
    for (const [header, value] of Object.entries(rt.uploadHeaders || {})) {
      try {
        xhr.setRequestHeader(header, String(value));
      } catch {
        /* invalid header name */
      }
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      updateFile(meta.id, { progress });
      rt.fireWidgetEvent?.("onUploadProgress", { file: meta, progress, loaded: event.loaded, total: event.total });
    };

    xhr.onload = () => {
      xhrRef.current.delete(meta.id);
      if (xhr.status >= 200 && xhr.status < 300) {
        let payload = null;
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          payload = xhr.responseText || null;
        }
        const resolved = readPath(payload, rt.responseUrlKey) || (payload && typeof payload === "object" ? payload.url : null) || (typeof payload === "string" ? payload : "");
        const url = resolved ? String(resolved) : "";
        updateFile(meta.id, { status: "complete", progress: 100, error: "", url, response: payload });
        rt.fireWidgetEvent?.("onUploadComplete", { file: meta, url, response: payload });
        const next = filesRef.current.map((item) => (item.id === meta.id ? { ...item, status: "complete", progress: 100, url } : item));
        emitChange(next);
      } else {
        const message = `Upload failed (${xhr.status}).`;
        updateFile(meta.id, { status: "error", error: message });
        rt.fireWidgetEvent?.("onUploadError", { file: meta, status: xhr.status, response: xhr.responseText });
      }
    };

    xhr.onerror = () => {
      xhrRef.current.delete(meta.id);
      updateFile(meta.id, { status: "error", error: "Network error while uploading." });
      rt.fireWidgetEvent?.("onUploadError", { file: meta, status: 0 });
    };

    xhr.onabort = () => {
      xhrRef.current.delete(meta.id);
      updateFile(meta.id, { status: "ready", progress: 0, error: "" });
      rt.fireWidgetEvent?.("onUploadCancel", { file: meta });
    };

    const form = new FormData();
    form.append(rt.uploadFieldName, file, file.name);
    xhr.send(form);
  };

  const cancelOne = (fileId) => {
    const xhr = xhrRef.current.get(fileId);
    if (xhr) {
      try {
        xhr.abort();
      } catch {
        /* ignore */
      }
    }
    xhrRef.current.delete(fileId);
  };

  const retryOne = (meta) => {
    const raw = rawFilesRef.current.get(meta.id);
    if (!raw) {
      setError(`“${meta.name}” is no longer available to retry. Choose it again.`);
      return;
    }
    setError("");
    uploadOne(meta, raw);
  };

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      clear: () => {
        if (inputRef.current) inputRef.current.value = "";
        xhrRef.current.forEach((xhr) => {
          try {
            xhr.abort();
          } catch {
            /* ignore */
          }
        });
        xhrRef.current.clear();
        rawFilesRef.current.clear();
        replacePreviews({});
        commitMeta(() => []);
        setError("");
        fireWidgetEvent?.("onClear", { files: [], fileNames: [], fileUrls: [], value: multiple ? [] : "" });
      },
      retry: (index) => {
        const meta = filesRef.current[Number(index)];
        if (meta) retryOne(meta);
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const validate = (list) => {
    let arr = Array.from(list || []);
    if (!multiple) arr = arr.slice(0, 1);
    const existingCount = multiple ? filesRef.current.length : 0;
    if (maxFiles > 0 && existingCount + arr.length > maxFiles) {
      return { error: `Choose at most ${maxFiles} file${maxFiles === 1 ? "" : "s"}.` };
    }
    if (maxSizeMB > 0) {
      const over = arr.find((file) => file.size > maxSizeMB * 1024 * 1024);
      if (over) return { error: `"${over.name}" exceeds the ${maxSizeMB} MB limit.` };
    }
    const blocked = arr.find((file) => {
      if (!accept) return false;
      return !accept.split(",").some((rule) => {
        const token = rule.trim().toLowerCase();
        if (!token) return false;
        if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token);
        if (token.endsWith("/*")) return file.type.toLowerCase().startsWith(token.slice(0, -1));
        return file.type.toLowerCase() === token;
      });
    });
    if (blocked) return { error: `"${blocked.name}" is not an accepted file type.` };
    return { files: arr };
  };

  const handleFiles = (list) => {
    setError("");
    const result = validate(list);
    if (result.error) {
      setError(result.error);
      return;
    }
    const rawFiles = result.files;
    const newMeta = rawFiles.map((file, index) => toMeta(file, makeId(file, index)));
    const nextMeta = multiple ? [...filesRef.current, ...newMeta].slice(0, maxFiles > 0 ? maxFiles : undefined) : newMeta;
    const acceptedIds = new Set(nextMeta.map((item) => item.id));
    const acceptedRaw = rawFiles.filter((file, index) => acceptedIds.has(newMeta[index].id));

    if (!multiple) {
      xhrRef.current.forEach((xhr) => {
        try {
          xhr.abort();
        } catch {
          /* ignore */
        }
      });
      xhrRef.current.clear();
      rawFilesRef.current.clear();
      replacePreviews({});
    }

    acceptedRaw.forEach((file, index) => {
      const meta = newMeta[index];
      rawFilesRef.current.set(meta.id, file);
    });

    const nextUrls = {};
    if (previewImages) {
      for (const file of acceptedRaw) {
        if (file.type?.startsWith("image/")) nextUrls[file.name] = URL.createObjectURL(file);
      }
    }
    if (previewImages) mergePreviews(nextUrls);

    const prepared = nextMeta.map((item) => ({ ...item, status: uploadUrl ? "pending" : "ready" }));
    commitMeta(() => prepared);
    emitChange(prepared);

    if (uploadUrl && liveRef.current.autoUpload) {
      acceptedRaw.forEach((file, index) => {
        const meta = newMeta[index];
        uploadOne({ ...meta, status: "pending" }, file);
      });
    }
  };

  const removeAt = (index) => {
    const removed = files[index];
    if (!removed) return;
    if (removed.id) cancelOne(removed.id);
    if (removed.id) rawFilesRef.current.delete(removed.id);
    const next = files.filter((_, fileIndex) => fileIndex !== index);
    if (inputRef.current) inputRef.current.value = "";
    if (removed?.name && previewUrlsRef.current[removed.name]) {
      URL.revokeObjectURL(previewUrlsRef.current[removed.name]);
      const nextUrls = { ...previewUrlsRef.current };
      delete nextUrls[removed.name];
      previewUrlsRef.current = nextUrls;
      setPreviewUrls(nextUrls);
    }
    commitMeta(() => next);
    emitChange(next);
  };

  const openPicker = () => {
    if (disabled || readOnly) return;
    inputRef.current?.click?.();
  };

  const sizeClass = size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-10 text-sm" : "h-8 text-xs";
  const statusLabel = (file) => {
    if (file.status === "uploading") return `Uploading ${file.progress || 0}%`;
    if (file.status === "complete") return "Uploaded";
    if (file.status === "error") return "Upload failed";
    if (file.status === "ready") return uploadUrl ? "Ready" : "Selected";
    return "Queued";
  };

  return (
    <WidgetSurface
      density={density}
      className="relative flex h-full w-full flex-col gap-2"
      aria-busy={isLoading || uploading || undefined}
    >
      {(isLoading || uploading) && <WidgetBusy label={uploading ? "Uploading…" : "Updating…"} />}
      {label && (
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || readOnly}
        aria-describedby={helpId}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {showDropzone ? (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !readOnly) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (!disabled && !readOnly) handleFiles(event.dataTransfer.files);
          }}
          disabled={disabled || readOnly}
          aria-describedby={helpId}
          className={cn(
            "flex min-h-[88px] w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
            dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-border/80 hover:bg-muted/30"
          )}
        >
          <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-medium text-foreground">{buttonLabel}</span>
          <span className="text-[10px] text-muted-foreground">Drag files here or click to browse</span>
        </button>
      ) : (
        <Button type="button" variant="outline" size={size} className={cn("w-full", sizeClass)} onClick={openPicker} disabled={disabled || readOnly || isLoading} aria-describedby={helpId}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {isLoading ? "Uploading…" : buttonLabel}
        </Button>
      )}

      {accept && <span className="font-mono text-[10px] text-muted-foreground">Accepts: {accept}</span>}
      {help && <p id={helpId} className="text-[11px] leading-snug text-muted-foreground">{help}</p>}
      {error && <p role="alert" className="text-[11px] text-destructive">{error}</p>}
      {!uploadUrl && files.length > 0 && (
        <p className="text-[10px] text-muted-foreground">No upload endpoint configured — keeping file metadata only.</p>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-1" aria-live="polite">
          {files.map((file, index) => {
            const preview = previewUrls[file.name];
            return (
              <div key={file.id || `${file.name}-${index}`} className="flex flex-col gap-1 rounded-control border border-border bg-muted/30 px-2 py-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {preview ? (
                    <img src={preview} alt={file.name} className="h-7 w-7 shrink-0 rounded-control object-cover" />
                  ) : file.type?.startsWith("image/") ? (
                    <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {file.url ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2" onClick={(event) => event.stopPropagation()}>
                        {file.name}
                      </a>
                    ) : (
                      file.name
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {file.status === "complete" ? <Check className="inline h-3 w-3 text-success" aria-hidden="true" /> : null}
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  {file.status === "uploading" && (
                    <button
                      type="button"
                      aria-label={`Cancel upload of ${file.name}`}
                      title="Cancel upload"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => cancelOne(file.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {file.status === "pending" && rawFilesRef.current.get(file.id) && (
                    <button
                      type="button"
                      aria-label={`Upload ${file.name}`}
                      title="Upload file"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => retryOne(file)}
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {file.status === "error" && (
                    <button
                      type="button"
                      aria-label={`Retry upload of ${file.name}`}
                      title="Retry upload"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => retryOne(file)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {!disabled && !readOnly && (
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      title="Remove file"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => removeAt(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-9 text-[10px]">
                  <span className={cn("shrink-0", file.status === "error" ? "text-destructive" : file.status === "complete" ? "text-success" : "text-muted-foreground")}>
                    {file.status === "uploading" && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" aria-hidden="true" />}
                    {statusLabel(file)}
                  </span>
                  {file.status === "uploading" && (
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={file.progress || 0}>
                      <span className="block h-full rounded-full bg-primary transition-[width] duration-150 motion-reduce:transition-none" style={{ width: `${file.progress || 0}%` }} />
                    </span>
                  )}
                  {file.error && <span className="truncate text-destructive">{file.error}</span>}
                </div>
              </div>
            );
          })}
          {!disabled && !readOnly && (
            <button type="button" onClick={() => methodsRef.current.clear()} className="self-start text-[10px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Clear all
            </button>
          )}
        </div>
      )}
    </WidgetSurface>
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
