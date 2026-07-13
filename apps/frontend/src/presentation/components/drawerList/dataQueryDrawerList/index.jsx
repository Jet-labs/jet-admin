import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useInfiniteDataQueries } from "../../../../logic/hooks/useDataQueries";
import { NoEntityUI } from "../../ui/noEntityUI";
import { DatasourceIcon } from "../../datasourceComponents/datasourceIcon";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";

export const DataQueryDrawerList = () => {
  const { tenantID } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    dataQueries,
    isLoadingDataQueries,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteDataQueries(tenantID, debouncedSearchQuery);

  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreQuery = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATA_QUERY.path(tenantID));
  };

  const _handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 30) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="bg-background h-full overflow-hidden w-full flex flex-col gap-2">
      <div className="p-2 pb-0">
        <Button
          onClick={_navigateToAddMoreQuery}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="size-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_QUERY_BUTTON_TEXT}
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search queries..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoadingDataQueries ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
        </div>
      ) : dataQueries && dataQueries.length > 0 ? (
        <div 
          onScroll={_handleScroll}
            className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2"
        >
          {dataQueries.map((dataQuery) => {
            const key = `dataQuery_${dataQuery.dataQueryID}`;
            const isActive = routeParam?.dataQueryID == dataQuery.dataQueryID;
            const datasourceConfig = getDatasourceTypeByValue(dataQuery.datasourceType);

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.path(
                  tenantID,
                  dataQuery.dataQueryID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="size-4 flex-shrink-0">
                    <DatasourceIcon
                      icon={datasourceConfig?.icon}
                      iconColor={isActive ? "currentColor" : datasourceConfig?.iconColor}
                      size={16}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {dataQuery.dataQueryTitle}
                  </span>
                </div>
              </Link>
            );
          })}
          {isFetchingNextPage && (
            <div className="flex justify-center p-2 text-xs text-muted-foreground animate-pulse">
              Loading more...
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <NoEntityUI
            message={
              searchQuery
                ? "No matching queries found"
                : CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY
            }
          />
        </div>
      )}
    </div>
  );
};
