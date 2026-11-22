import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { BadgeCheck, ChevronLeft, ChevronRight, Search, Store } from "lucide-react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  installMarketplaceItemAPI,
  listMarketplaceItemsAPI,
  previewMarketplaceInstallAPI,
} from "../../../data/apis/marketplace";
import { displayError, displaySuccess } from "../../../utils/notification";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { TemplateGallery } from "./templateGallery";
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

const ITEM_TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "datasource", label: "Datasources" },
  { value: "widget", label: "Widgets" },
  { value: "workflow", label: "Workflows" },
  { value: "appTemplate", label: "App pages" },
  { value: "appBundle", label: "App bundles" },
];

const TYPE_LABELS = {
  datasource: "Datasource",
  dataQuery: "Query",
  widget: "Widget",
  workflow: "Workflow",
  appPage: "App page",
  listener: "Listener",
  appTemplate: "App page",
};

export const MarketplaceGrid = ({ tenantID }) => {
  MarketplaceGrid.propTypes = {
    tenantID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [itemType, setItemType] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const debouncedSearch = useDebounce(searchInput, 300);
  const isBundleView = itemType === "appBundle";

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, itemType, category]);

  const {
    data: marketplaceData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.MARKETPLACE(tenantID),
      itemType,
      category,
      debouncedSearch,
      currentPage,
    ],
    queryFn: () =>
      listMarketplaceItemsAPI({
        tenantID,
        search: debouncedSearch || undefined,
        itemType: itemType || undefined,
        category: category || undefined,
        page: currentPage,
        pageSize: MARKETPLACE_PAGE_SIZE,
      }),
    enabled: Boolean(tenantID) && !isBundleView,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const entries = marketplaceData?.entries || [];
  const totalCount = marketplaceData?.totalCount ?? 0;
  const totalPages = Math.max(1, marketplaceData?.totalPages || 1);

  const previewMutation = useMutation({
    mutationFn: ({ itemID }) => previewMarketplaceInstallAPI({ tenantID, itemID }),
    retry: false,
    onSuccess: (result, { itemID, title }) => {
      setPreview({ itemID, title, ...result });
      setSelectedKeys(
        (result.selection || []).filter((asset) => asset.selected).map((asset) => asset.key)
      );
    },
    onError: (error) => displayError(error),
  });

  const installMutation = useMutation({
    mutationFn: ({ selectedItemKeys }) =>
      installMarketplaceItemAPI({ tenantID, itemID: preview.itemID, selectedItemKeys }),
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
        CONSTANTS.REACT_QUERY_KEYS.MARKETPLACE(tenantID),
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setPreview(null);
      setSelectedKeys([]);
    },
    onError: (error) => displayError(error),
  });

  const isBusy = previewMutation.isPending || installMutation.isPending;
  const assets = preview?.selection || [];
  const assetsByKey = new Map(assets.map((asset) => [asset.key, asset]));
  const selectedSet = new Set(selectedKeys);
  const planByKey = new Map(
    (preview?.items || []).map((item) => [`${item.type}:${item.id}`, item])
  );
  const missingByKey = new Map(
    assets
      .filter((asset) => selectedSet.has(asset.key))
      .map((asset) => [
        asset.key,
        asset.dependsOn.filter((dependencyKey) => !selectedSet.has(dependencyKey)),
      ])
  );
  const hasMissingAssets = [...missingByKey.values()].some((keys) => keys.length > 0);

  const toggleAsset = (key, checked) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      const visit = (assetKey, add) => {
        if (add) next.add(assetKey);
        else next.delete(assetKey);
        const asset = assetsByKey.get(assetKey);
        const related = add ? asset?.dependsOn : asset?.requiredBy;
        (related || []).forEach((relatedKey) => visit(relatedKey, add));
      };
      visit(key, checked);
      return [...next];
    });
  };

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
            isBundleView
              ? "Install-ready bundles with schema, seed data, pages and workflows"
              : totalCount === 0
                ? "No items found"
                : `${totalCount} integration item${totalCount === 1 ? "" : "s"}`
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

        <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
          {ITEM_TYPE_FILTERS.map((filter) => (
            <Button
              key={filter.value || "all"}
              type="button"
              size="sm"
              variant={itemType === filter.value ? "default" : "outline"}
              onClick={() => setItemType(filter.value)}
              disabled={isBusy || isFetching}
            >
              {filter.label}
            </Button>
          ))}
          <select
            aria-label="Filter by category"
            className="ml-auto h-8 rounded border border-border/50 bg-background px-2 text-xs text-foreground"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isBusy || isFetching}
          >
            <option value="">All categories</option>
            {[
              "Databases",
              "Data & Analytics",
              "Messaging",
              "Payments & Commerce",
              "DevOps & Infrastructure",
              "Monitoring",
              "Storage & Files",
              "Identity & Security",
              "Productivity & Content",
              "Customer Support",
              "Finance & Accounting",
              "Inventory & Operations",
              "Sales & CRM",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {isBundleView ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <TemplateGallery tenantID={tenantID} search={debouncedSearch} category={category} />
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto p-3">
          {entries.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {entries.map((entry) => (
                <div
                  key={entry.itemID}
                  className="flex flex-col gap-2 rounded border border-border/50 bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted/50">
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                          {entry.title}
                          {entry.isVerified && (
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                          )}
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {entry.description || entry.slug}
                        </span>
                        {entry.category && (
                          <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            {entry.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {TYPE_LABELS[entry.itemType] || entry.itemType}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() =>
                      previewMutation.mutate({ itemID: entry.itemID, title: entry.title })
                    }
                    disabled={isBusy || isFetching}
                  >
                    {previewMutation.isPending && preview?.itemID === entry.itemID ? (
                      <Spinner size={14} />
                    ) : (
                      "Preview & Install"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : debouncedSearch || itemType || category ? (
            <NoEntityUI message="No marketplace items match these filters." />
          ) : (
            <NoEntityUI message="No marketplace items yet — seed the store with `npm run seed-marketplace`." />
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
                Page {currentPage} of {totalPages} · {totalCount} item
                {totalCount === 1 ? "" : "s"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages || isBusy || isFetching}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        )}

        <Dialog
          open={preview !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPreview(null);
              setSelectedKeys([]);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Install plan{preview?.title ? `: ${preview.title}` : ""}
              </DialogTitle>
              <DialogDescription>
                Installing clones the item and its dependencies with fresh IDs;
                datasources must be reconnected.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              {preview && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Related assets
                    </p>
                    <Badge variant={preview.valid ? "secondary" : "destructive"}>
                      {selectedKeys.length} of {assets.length} selected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This item includes connected widgets, queries, workflows and
                    datasources. Clear any asset you do not want; dependent assets
                    are cleared with it.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedKeys(assets.map((asset) => asset.key))}
                    >
                      Select all
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedKeys([])}
                    >
                      Clear all
                    </Button>
                  </div>
                  {hasMissingAssets && (
                    <p className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      A selected asset still depends on an asset you cleared. The
                      install will create missing references until you reconnect or
                      replace them.
                    </p>
                  )}
                  <div className="max-h-80 space-y-1.5 overflow-y-auto rounded border border-border/50 p-2">
                    {assets.map((asset) => {
                      const planItem = planByKey.get(asset.key);
                      const missing = missingByKey.get(asset.key) || [];
                      const checked = selectedSet.has(asset.key);
                      return (
                        <label
                          key={asset.key}
                          className={`flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 ${
                            checked ? "bg-muted/40" : "opacity-60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-3.5 w-3.5"
                            checked={checked}
                            onChange={(event) => toggleAsset(asset.key, event.target.checked)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">
                                {asset.title}
                              </span>
                              <Badge variant="outline">
                                {TYPE_LABELS[asset.type] || asset.type}
                              </Badge>
                              {asset.requiredBy.length === 0 && (
                                <Badge variant="secondary">Primary</Badge>
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {asset.dependsOn.length > 0
                                ? `Requires ${asset.dependsOn.length} related asset${
                                    asset.dependsOn.length === 1 ? "" : "s"
                                  }`
                                : "No dependencies"}
                              {asset.requiredBy.length > 0
                                ? ` · Used by ${asset.requiredBy.length}`
                                : ""}
                            </span>
                            {missing.length > 0 && (
                              <span className="mt-1 block text-[11px] text-destructive">
                                Missing {missing.length} selected dependenc
                                {missing.length === 1 ? "y" : "ies"}. Include them or
                                expect broken references.
                              </span>
                            )}
                            {planItem?.warnings?.length > 0 && (
                              <ul className="mt-1 space-y-0.5 pl-2">
                                {planItem.warnings.map((warning, index) => (
                                  <li
                                    key={`w_${index}`}
                                    className="text-[11px] text-muted-foreground"
                                  >
                                    • {warning}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setSelectedKeys([]);
                }}
                disabled={installMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  installMutation.mutate({ selectedItemKeys: selectedKeys });
                }}
                disabled={
                  !preview?.valid || installMutation.isPending || selectedKeys.length === 0
                }
              >
                {installMutation.isPending ? (
                  <Spinner size={14} />
                ) : (
                  `Install ${selectedKeys.length} asset${selectedKeys.length === 1 ? "" : "s"}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
