import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ChevronLeft, ChevronRight, Search, Store } from "lucide-react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getAllLibraryWidgetsAPI,
  installWidgetAPI,
  previewWidgetInstallAPI,
} from "../../../data/apis/widgetLibrary";
import { displayError, displaySuccess } from "../../../utils/notification";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
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
  Input,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";

const MARKETPLACE_PAGE_SIZE = 12;

export const MarketplaceGrid = ({ tenantID }) => {
  MarketplaceGrid.propTypes = {
    tenantID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    data: libraryData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
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
        pageSize: MARKETPLACE_PAGE_SIZE,
      }),
    enabled: Boolean(tenantID),
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const entries = libraryData?.entries || [];
  const totalCount = libraryData?.totalCount ?? 0;
  const totalPages = Math.max(1, libraryData?.totalPages || 1);

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
    mutationFn: () =>
      installWidgetAPI({ tenantID, libraryEntryID: preview.libraryEntryID }),
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
      setPreview(null);
    },
    onError: (error) => displayError(error),
  });

  const isBusy = previewMutation.isPending || installMutation.isPending;

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoading}
      error={error}
      refetch={refetch}
    >
      <div className="flex h-full w-full flex-col justify-start items-stretch overflow-hidden bg-background">
        <PageHeader
          title={CONSTANTS.STRINGS.VIEW_MARKETPLACE_TITLE}
          subTitle={
            totalCount === 0
              ? "Nothing published yet"
              : `${totalCount} published widget${totalCount === 1 ? "" : "s"}`
          }
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
            <Input
              type="text"
              size="sm"
              placeholder="Search marketplace..."
              className="pl-8 w-56 border-border/50 focus:border-primary/30"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </PageHeader>

        <div className="flex-1 overflow-y-auto p-3">
          {entries.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {entries.map((entry) => (
                <div
                  key={entry.libraryEntryID}
                  className="flex flex-col gap-2 rounded border border-border/50 bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted/50">
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {entry.widgetTitle}
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {entry.widgetDescription || entry.widgetType}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {entry.widgetType}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() =>
                      previewMutation.mutate({
                        libraryEntryID: entry.libraryEntryID,
                      })
                    }
                    disabled={isBusy || isFetching}
                  >
                    {previewMutation.isPending ? (
                      <Spinner size={14} />
                    ) : (
                      "Preview & Install"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : debouncedSearch ? (
            <NoEntityUI message={`No widgets match "${debouncedSearch}".`} />
          ) : (
            <NoEntityUI message="No published widgets yet — publish one from a widget's editor page." />
          )}

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1 || isBusy || isFetching}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} · {totalCount} widget
                {totalCount === 1 ? "" : "s"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage >= totalPages || isBusy || isFetching}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Dialog
          open={preview !== null}
          onOpenChange={(open) => {
            if (!open) setPreview(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Install plan
              </DialogTitle>
              <DialogDescription>
                Installing clones the widget and its dependencies with fresh
                IDs; datasources must be reconnected.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              {preview && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Preview
                    </p>
                    <Badge
                      variant={preview.valid ? "secondary" : "destructive"}
                    >
                      {preview.summary.createCount} item
                      {preview.summary.createCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-border/50 p-2">
                    {preview.items.map((item) => (
                      <div
                        key={`${item.type}:${item.id}`}
                        className="rounded bg-muted/40 px-2 py-1.5"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        {(item.warnings.length > 0 ||
                          item.missingDependencies.length > 0) && (
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
                                • Missing {dep.type}: will be absent after
                                install
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
                disabled={!preview?.valid || installMutation.isPending}
              >
                {installMutation.isPending ? (
                  <Spinner size={16} />
                ) : (
                  "Confirm install"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
