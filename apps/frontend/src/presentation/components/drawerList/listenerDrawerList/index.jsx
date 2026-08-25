import React, { useState } from "react";
import { Cloud, Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";
import { BundleImportDialog } from "../../bundleComponents/bundleImportDialog";
import { EntityFolderTree } from "../../folderComponents/entityFolderTree";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";

const STATUS_COLORS = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-500",
  error: "bg-red-500",
};

export const ListenerDrawerList = () => {
  const { tenantID } = useParams();
  const routeParam = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { items: listeners, isLoading: isLoadingListeners } = useEntityItems({
    tenantID,
    entityType: "listener",
    search: debouncedSearchQuery,
  });

  const _navigateToAddListener = () => {
    navigate(CONSTANTS.ROUTES.ADD_LISTENER.path(tenantID));
  };

  const _renderItemRow = (listener) => {
    const isActive = routeParam?.listenerID === listener.listenerID;
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.path(tenantID, listener.listenerID)}
        key={listener.listenerID} className="block focus:outline-none"
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
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0 flex items-center gap-2">
        <Button
          onClick={_navigateToAddListener}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="size-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_LISTENER_BUTTON_TEXT}
        </Button>
        <BundleImportDialog tenantID={tenantID} />
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

      {debouncedSearchQuery ? (
        listeners && listeners.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2">
            {listeners.map(_renderItemRow)}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
            <NoEntityUI message="No matching listeners found" />
          </div>
        )
      ) : (
        <EntityFolderTree
          tenantID={tenantID}
          entityType="listener"
          items={listeners}
          isLoadingItems={isLoadingListeners}
          renderItemRow={_renderItemRow}
        />
      )}
    </div>
  );
};
