import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import PropTypes from "prop-types";
import React, { useRef, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { executeImportBundleAPI, previewImportBundleAPI } from "../../../data/apis/bundle";
import { displayError, displaySuccess } from "../../../utils/notification";


import { Badge, Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Spinner, Textarea } from "@jet-admin/ui";

const TYPE_LABELS = {
  appPage: "App page",
  widget: "Widget",
  workflow: "Workflow",
  dataQuery: "Query",
  datasource: "Datasource",
  listener: "Listener",
};

const INVALID_JSON_MESSAGE = "The file does not contain valid JSON.";

const _readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsText(file);
  });

const _parseBundle = (raw) => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(INVALID_JSON_MESSAGE);
  }
  const bundle = parsed?.bundle && typeof parsed.bundle === "object" ? parsed.bundle : parsed;
  if (!bundle || !Array.isArray(bundle.items) || bundle.items.length === 0) {
    throw new Error("Not a valid jet-admin bundle (missing items).");
  }
  return bundle;
};

/**
 * Shared import flow: paste/upload a bundle JSON -> dry-run preview with
 * warnings -> confirm -> execute. Self-contained trigger + dialog.
 */
export const BundleImportDialog = ({ tenantID }) => {
  BundleImportDialog.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [bundle, setBundle] = useState(null);

  const _resetAndClose = () => {
    setIsOpen(false);
    setRawInput("");
    setPreview(null);
    setBundle(null);
  };

  const _invalidateEntityQueries = () => {
    [
      CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
    ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const previewMutation = useMutation({
    mutationFn: ({ parsedBundle }) =>
      previewImportBundleAPI({ tenantID, bundle: parsedBundle }),
    retry: false,
    onSuccess: ({ valid, summary, items }, { parsedBundle }) => {
      setPreview({ valid, summary, items });
      setBundle(parsedBundle);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const executeMutation = useMutation({
    mutationFn: () => executeImportBundleAPI({ tenantID, bundle }),
    retry: false,
    onSuccess: ({ results }) => {
      displaySuccess(`Imported ${results.length} item${results.length === 1 ? "" : "s"} successfully.`);
      _invalidateEntityQueries();
      _resetAndClose();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handlePreview = async (event) => {
    event.stopPropagation();
    let parsedBundle;
    try {
      parsedBundle = _parseBundle(rawInput);
    } catch (error) {
      displayError(error.message);
      return;
    }
    previewMutation.mutate({ parsedBundle });
  };

  const _handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await _readFileAsText(file);
      setRawInput(text);
      setPreview(null);
    } catch (error) {
      displayError(error.message);
    } finally {
      event.target.value = "";
    }
  };

  const isBusy = previewMutation.isPending || executeMutation.isPending;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setIsOpen(true)}
        aria-label="Import bundle"
        title="Import bundle"
        disabled={isBusy}
      >
        <Upload className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(next) => (next ? setIsOpen(true) : _resetAndClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Import bundle
            </DialogTitle>
            <DialogDescription>
              Paste an exported bundle or upload the JSON file. Dependencies are created
              automatically; datasources must be reconnected after import.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {!preview ? (
              <div className="flex flex-col gap-2">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Bundle JSON
                </p>
                <Textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder='{ "bundleVersion": 1, "items": [...] }'
                  rows={10}
                  className="font-mono text-xs"
                  disabled={isBusy}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                >
                  Upload .json file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={_handleFileChange}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Import plan
                  </p>
                  <Badge variant={preview.valid ? "secondary" : "destructive"}>
                    {preview.valid
                      ? `${preview.summary.createCount} item${preview.summary.createCount === 1 ? "" : "s"} to create`
                      : "Invalid bundle"}
                  </Badge>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-border/50 p-2">
                  {preview.items.map((item) => (
                    <div key={`${item.type}:${item.id}`} className="rounded bg-muted/40 px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{TYPE_LABELS[item.type] || item.type}</Badge>
                        <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                      </div>
                      {(item.warnings.length > 0 || item.missingDependencies.length > 0) && (
                        <ul className="mt-1 space-y-0.5 pl-2">
                          {item.warnings.map((warning, index) => (
                            <li
                              key={`w_${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              • {warning}
                            </li>
                          ))}
                          {item.missingDependencies.map((dep) => (
                            <li
                              key={`d_${dep.type}_${dep.id}`}
                              className="text-xs text-destructive"
                            >
                              • Missing {TYPE_LABELS[dep.type] || dep.type}: will be absent after import
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            {preview ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreview(null)}
                  disabled={executeMutation.isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    executeMutation.mutate();
                  }}
                  disabled={!preview.valid || executeMutation.isPending}
                >
                  {executeMutation.isPending ? (
                    <Spinner size={16} />
                  ) : (
                    "Confirm import"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={_resetAndClose}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={_handlePreview}
                  disabled={isBusy || !rawInput.trim()}
                >
                  {previewMutation.isPending ? <Spinner size={16} /> : "Preview"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
