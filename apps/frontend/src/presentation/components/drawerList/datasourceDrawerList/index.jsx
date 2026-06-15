import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useInfiniteDatasources } from "../../../../logic/hooks/useDatasources";
import { NoEntityUI } from "../../ui/noEntityUI";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { DatasourceIcon } from "../../datasourceComponents/datasourceIcon";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";

export const DatasourceDrawerList = () => {
  const { tenantID } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    datasources,
    isLoadingDatasources,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteDatasources(tenantID, debouncedSearchQuery);

  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreDatasource = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATASOURCE.path(tenantID));
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
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
          onClick={_navigateToAddMoreDatasource}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_DATASOURCE_BUTTON_TEXT}
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search datasources..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoadingDatasources ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
        </div>
      ) : datasources && datasources.length > 0 ? (
        <div 
          onScroll={_handleScroll}
          className="flex-1 w-full overflow-y-auto p-2 pb-10 space-y-1"
        >
          {datasources.map((datasource) => {
            const key = `datasource_${datasource.datasourceID}`;
            const isActive = routeParam?.datasourceID == datasource.datasourceID;
            const datasourceTypeConfig = getDatasourceTypeByValue(datasource.datasourceType);

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.path(
                  tenantID,
                  datasource.datasourceID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <DatasourceIcon
                      icon={datasourceTypeConfig?.icon}
                      iconColor={isActive ? "currentColor" : datasourceTypeConfig?.iconColor}
                      size={16}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {datasource.datasourceTitle}
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
        <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={
              searchQuery
                ? "No matching datasources found"
                : CONSTANTS.STRINGS.DATASOURCE_DRAWER_LIST_NO_DATASOURCE
            }
          />
        </div>
      )}
    </div>
  );
};
