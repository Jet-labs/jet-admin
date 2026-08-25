import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LibraryBig, Search } from "lucide-react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getAllLibraryWidgetsAPI,
  installWidgetAPI,
  previewWidgetInstallAPI,
} from "../../../data/apis/widgetLibrary";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useDebounce } from "@uidotdev/usehooks";

import { Badge, Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Spinner } from "@jet-admin/ui";

const LIBRARY_PAGE_SIZE = 5;

/**
 * Shared widget library browser. Trigger sits in the widgets drawer header.
 * The registry is listed via the server-side paginated + searchable API;
 * install runs a dry-run preview first, then clones the bundle into the
 * tenant with fresh IDs (missing dependencies are shown as warnings).
 */
export const WidgetLibraryBrowserDialog = ({ tenantID }) => {
  WidgetLibraryBrowserDialog.propTypes = {
    tenantID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState(null); // { libraryEntryID, ...preview }
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const libraryQuery = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.WIDGET_LIBRARY,
      tenantID,
      debouncedSearch,
      currentPage,
    ],
    queryFn: () =>
      getAllLibraryWidgetsAPI({
        tenantID,
        search: debouncedSearch || undefined,
        page: currentPage,
        pageSize: LIBRARY_PAGE_SIZE,
      }),
    enabled: isOpen && Boolean(tenantID),
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const entries = libraryQuery.data?.entries || [];
  const totalPages = Math.max(1, libraryQuery.data?.totalPages || 1);

  const previewMutation = useMutation({
    mutationFn: ({ libraryEntryID }) =>
      previewWidgetInstallAPI({ tenantID, libraryEntryID }),
    retry: false,
    onSuccess: ({ valid, summary, items }, { libraryEntryID }) => {
      setPreview({ libraryEntryID, valid, summary, items });
    },
    onError: (error) => displayError(error),
  });

  const installMutation = useMutation({
    mutationFn: () => installWidgetAPI({ tenantID, libraryEntryID: preview.libraryEntryID }),
    retry: false,
    onSuccess: ({ results }) => {
      displaySuccess(
        `Installed ${results.length} item${results.length === 1 ? "" : "s"} into this tenant.`
      );
      [
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
        CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
        CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
        CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
        CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setIsOpen(false);
      setPreview(null);
    },
    onError: (error) => displayError(error),
  });

  const _resetAndClose = () => {
    setIsOpen(false);
    setPreview(null);
    setSearchInput("");
    setCurrentPage(1);
  };

  const isBusy = previewMutation.isPending || installMutation.isPending;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setIsOpen(true)}
        aria-label="Widget library"
        title="Widget library"
      >
        <LibraryBig className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(next) => (next ? setIsOpen(true) : _resetAndClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Widget library
            </DialogTitle>
            <DialogDescription>
              Published widgets available to every tenant. Installing clones the widget
              and its dependencies with fresh IDs; datasources must be reconnected.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {!preview ? (
              <>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
                  <Input
                    type="text"
                    size="sm"
                    placeholder="Search widgets..."
                    className="pl-8 w-full border-border/50 focus:border-primary/30"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={isBusy}
                  />
                </div>
                {libraryQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <Spinner size={20} />
                  </div>
                ) : entries.length > 0 ? (
                  <>
                    <div
                      className={`max-h-72 space-y-2 overflow-y-auto ${
                        libraryQuery.isFetching ? "opacity-60" : ""
                      }`}
                    >
                      {entries.map((entry) => (
                        <div
                          key={entry.libraryEntryID}
                          className="flex items-center gap-2 rounded border border-border/50 px-2 py-1.5"
                        >
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {entry.widgetTitle}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {entry.widgetDescription || entry.widgetType}
                            </span>
                          </div>
                          <Badge variant="outline">{entry.widgetType}</Badge>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => previewMutation.mutate({ libraryEntryID: entry.libraryEntryID })}
                            disabled={isBusy || libraryQuery.isFetching}
                          >
                            Install
                          </Button>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                          disabled={currentPage <= 1 || isBusy || libraryQuery.isFetching}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Page {currentPage} of {totalPages} ·{" "}
                          {libraryQuery.data?.totalCount ?? 0} widget
                          {libraryQuery.data?.totalCount === 1 ? "" : "s"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                          disabled={currentPage >= totalPages || isBusy || libraryQuery.isFetching}
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : debouncedSearch ? (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No widgets match &quot;{debouncedSearch}&quot;.
                  </p>
                ) : (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No published widgets yet — publish one from a widget&apos;s editor page.
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Install plan
                  </p>
                  <Badge variant={preview.valid ? "secondary" : "destructive"}>
                    {preview.summary.createCount} item{preview.summary.createCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-border/50 p-2">
                  {preview.items.map((item) => (
                    <div key={`${item.type}:${item.id}`} className="rounded bg-muted/40 px-2 py-1.5">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      {(item.warnings.length > 0 || item.missingDependencies.length > 0) && (
                        <ul className="mt-1 space-y-0.5 pl-2">
                          {item.warnings.map((warning, index) => (
                            <li key={`w_${index}`} className="text-xs text-muted-foreground">
                              • {warning}
                            </li>
                          ))}
                          {item.missingDependencies.map((dep) => (
                            <li key={`d_${dep.type}_${dep.id}`} className="text-xs text-destructive">
                              • Missing {dep.type}: will be absent after install
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
                  disabled={installMutation.isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    installMutation.mutate();
                  }}
                  disabled={!preview.valid || installMutation.isPending}
                >
                  {installMutation.isPending ? <Spinner size={16} /> : "Confirm install"}
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={_resetAndClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
