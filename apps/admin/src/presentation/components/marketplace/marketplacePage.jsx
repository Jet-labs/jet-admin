import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "@/constants";
import { listMarketplaceItemsAPI } from "@/data/apis/platform";
import { Button, Input, PageHeader } from "@jet-admin/ui";
import { MarketplaceTable } from "./marketplaceTable";

const PAGE_SIZE = 25;

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "datasource", label: "Datasources" },
  { value: "widget", label: "Widgets" },
  { value: "workflow", label: "Workflows" },
  { value: "appTemplate", label: "App templates" },
];

/**
 * Curate the generalized marketplace store: browse all integration items,
 * filter by type/category, verify, and remove.
 */
export const MarketplacePage = () => {
  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.MARKETPLACE, itemType, search, page],
    queryFn: () =>
      listMarketplaceItemsAPI({
        search: search || undefined,
        itemType: itemType || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, data?.totalPages || 1);

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Marketplace store"
        parentTitle="Platform Admin"
        subTitle={isLoading ? undefined : `${totalCount} integration item${totalCount === 1 ? "" : "s"}`}
      >
        <Input
          type="text"
          size="sm"
          placeholder="Search items..."
          className="w-56"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2 p-2">
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.value || "all"}
            type="button"
            size="sm"
            variant={itemType === filter.value ? "default" : "outline"}
            onClick={() => {
              setItemType(filter.value);
              setPage(1);
            }}
          >
            {filter.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
        {totalPages > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <MarketplaceTable data={data} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default MarketplacePage;
