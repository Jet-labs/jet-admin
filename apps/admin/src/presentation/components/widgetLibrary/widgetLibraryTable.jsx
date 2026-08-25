import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { CONSTANTS } from "@/constants";
import {
  publishBundleToLibraryAPI,
  unpublishWidgetFromLibraryAPI,
} from "@/data/apis/platform";
import { displayError } from "@/utils/notification";

import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  Textarea,
} from "@jet-admin/ui";

const INVALID_JSON_MESSAGE = "The file does not contain valid JSON.";

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
  const widgetItems = bundle.items.filter((it) => it && it.type === "widget");
  if (widgetItems.length !== 1) {
    throw new Error("A marketplace publish must contain exactly one widget item.");
  }
  return bundle;
};

const PublishBundleDialog = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");

  const publishMutation = useMutation({
    mutationFn: () => publishBundleToLibraryAPI({ bundle: _parseBundle(rawInput) }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGET_LIBRARY],
      });
      setIsOpen(false);
      setRawInput("");
    },
    onError: (error) => displayError(error?.message || error),
  });

  const _readFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRawInput(await file.text());
    event.target.value = "";
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-fit"
        disabled={publishMutation.isPending}
      >
        <Upload className="mr-2 h-4 w-4" />
        Publish bundle
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Publish a widget bundle
            </DialogTitle>
            <DialogDescription>
              Paste or upload an exported widget bundle JSON. It must contain
              exactly one widget item; dependencies travel inside the bundle.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='{ "bundleVersion": 1, "items": [...] }'
              rows={12}
              className="font-mono text-xs"
              disabled={publishMutation.isPending}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-fit"
              onClick={() => fileInputRef.current?.click()}
              disabled={publishMutation.isPending}
            >
              Upload .json file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={_readFile}
            />
            {publishMutation.isError && (
              <p className="mt-2 text-xs text-destructive">
                {publishMutation.error?.message || "Publish failed."}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={publishMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                publishMutation.mutate();
              }}
              disabled={publishMutation.isPending || !rawInput.trim()}
            >
              {publishMutation.isPending ? <Spinner size={16} /> : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const WidgetLibraryTable = ({ entries, isLoading }) => {
  const queryClient = useQueryClient();

  const unpublishMutation = useMutation({
    mutationFn: ({ libraryEntryID }) =>
      unpublishWidgetFromLibraryAPI({ libraryEntryID }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGET_LIBRARY],
      });
    },
    onError: (error) => displayError(error?.message || error),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <PublishBundleDialog />
      </div>

      {isLoading ? (
        <div role="status" className="animate-pulse space-y-2 p-2">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Widget</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Source tenant</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Published</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {(entries || []).map((entry) => (
                <tr key={entry.libraryEntryID} className="border-b border-border/50 last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{entry.widgetTitle}</span>
                      {entry.widgetDescription && (
                        <span className="text-xs text-muted-foreground">
                          {entry.widgetDescription}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{entry.widgetType}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {entry.sourceTenantID ? `${entry.sourceTenantID.slice(0, 8)}...` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      square
                      title="Unpublish"
                      aria-label={`Unpublish ${entry.widgetTitle}`}
                      disabled={unpublishMutation.isPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        unpublishMutation.mutate({ libraryEntryID: entry.libraryEntryID });
                      }}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(!entries || entries.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Nothing published yet — upload a widget bundle to fill the marketplace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
