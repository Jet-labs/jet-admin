import React, { useState } from "react";
import { Cloud, Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useInfiniteListeners } from "../../../../logic/hooks/useListeners";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";

const STATUS_COLORS = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-500",
  error: "bg-red-500",
};

export const ListenerDrawerList = () => {
  const { tenantID } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    listeners,
    isLoadingListeners,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteListeners(tenantID, debouncedSearchQuery);

  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddListener = () => {
    navigate(CONSTANTS.ROUTES.ADD_LISTENER.path(tenantID));
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
          onClick={_navigateToAddListener}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="size-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_LISTENER_BUTTON_TEXT}
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search listeners..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoadingListeners ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
        </div>
      ) : listeners && listeners.length > 0 ? (
        <div 
          onScroll={_handleScroll}
            className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2"
        >
          {listeners.map((listener) => {
            const key = `listener_${listener.listenerID}`;
            const isActive = routeParam?.listenerID === listener.listenerID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.path(
                  tenantID,
                  listener.listenerID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <Cloud
                      className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-brand-dark ${STATUS_COLORS[listener.status] || STATUS_COLORS.inactive}`}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {listener.listenerTitle}
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
                ? "No matching listeners found"
                : CONSTANTS.STRINGS.LISTENER_DRAWER_LIST_NO_LISTENER_FOUND
            }
          />
        </div>
      )}
    </div>
  );
};
