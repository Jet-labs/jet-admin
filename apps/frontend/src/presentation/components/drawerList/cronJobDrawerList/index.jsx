import React, { useState } from "react";
import { CalendarClock, Plus, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";
import { EntityFolderTree } from "../../folderComponents/entityFolderTree";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";

export const CronJobDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { items: cronJobs, isLoading: isLoadingCronJobs } = useEntityItems({
    tenantID,
    entityType: "cronJob",
    search: debouncedSearchQuery,
  });

  const _navigateToAddNotification = () => {
    navigate(CONSTANTS.ROUTES.ADD_CRON_JOB.path(tenantID));
  };

  const _renderItemRow = (cronJob) => {
    const isActive = routeParam?.cronJobID == cronJob.cronJobID;
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.path(tenantID, cronJob.cronJobID)}
        key={cronJob.cronJobID} className="block focus:outline-none"
      >
        <div
          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${isActive
            ? "bg-primary/5 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex-shrink-0">
            <CalendarClock className="h-4 w-4" />
          </div>

          <span
            className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"}`}
          >
            {cronJob.cronJobTitle}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
          onClick={_navigateToAddNotification}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          {CONSTANTS.STRINGS.ADD_CRON_JOB_BUTTON_TEXT}
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search cron jobs..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {debouncedSearchQuery ? (
        cronJobs && cronJobs.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2">
            {cronJobs.map(_renderItemRow)}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
            <NoEntityUI message="No matching cron jobs found" />
          </div>
        )
      ) : (
        <EntityFolderTree
          tenantID={tenantID}
          entityType="cronJob"
          items={cronJobs}
          isLoadingItems={isLoadingCronJobs}
          renderItemRow={_renderItemRow}
        />
      )}
    </div>
  );
};
