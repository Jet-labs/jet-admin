import React, { useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";
import { BundleImportDialog } from "../../bundleComponents/bundleImportDialog";
import { EntityFolderTree } from "../../folderComponents/entityFolderTree";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";

export const AppPageDrawerList = () => {
  const { tenantID } = useParams();
  const routeParam = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { items: appPages, isLoading: isLoadingAppPages } = useEntityItems({
    tenantID,
    entityType: "appPage",
    search: debouncedSearchQuery,
  });

  const _navigateToAddAppPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_APP_PAGE.path(tenantID));
  };

  const _renderItemRow = (appPage) => {
    const isActive = routeParam?.appPageID == appPage.appPageID;
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.path(tenantID, appPage.appPageID)}
        key={appPage.appPageID} className="block focus:outline-none"
      >
        <div
          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
            isActive
              ? "bg-primary/5 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <span
            className={`truncate text-sm ${
              isActive ? "font-semibold" : "font-medium"
            }`}
          >
            {appPage.appPageTitle}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0 flex items-center gap-2">
        <Button
          onClick={_navigateToAddAppPage}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          {CONSTANTS.STRINGS.ADD_APP_PAGE_BUTTON_TEXT}
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
            placeholder="Search pages..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {debouncedSearchQuery ? (
        appPages && appPages.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2">
            {appPages.map(_renderItemRow)}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
            <NoEntityUI message="No matching pages found" />
          </div>
        )
      ) : (
        <EntityFolderTree
          tenantID={tenantID}
          entityType="appPage"
          items={appPages}
          isLoadingItems={isLoadingAppPages}
          renderItemRow={_renderItemRow}
        />
      )}
    </div>
  );
};
