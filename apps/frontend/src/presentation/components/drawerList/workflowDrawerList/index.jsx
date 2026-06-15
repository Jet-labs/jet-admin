import React, { useState } from "react";
import { Plus, Workflow, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useInfiniteWorkflows } from "../../../../logic/hooks/useWorkflows";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";

export const WorkflowDrawerList = () => {
  const { tenantID } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    workflows,
    isLoadingWorkflows,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteWorkflows(tenantID, debouncedSearchQuery);

  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreWorkflow = () => {
    navigate(CONSTANTS.ROUTES.ADD_WORKFLOW.path(tenantID));
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
          onClick={_navigateToAddMoreWorkflow}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="size-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_WORKFLOW_BUTTON_TEXT}
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search workflows..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoadingWorkflows ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
        </div>
      ) : workflows && workflows.length > 0 ? (
        <div 
          onScroll={_handleScroll}
          className="flex-1 w-full overflow-y-auto p-2 pb-10 space-y-1"
        >
          {workflows.map((workflow) => {
            const key = `workflow_${workflow.workflowID}`;
            const isActive = routeParam?.workflowID == workflow.workflowID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.path(
                  tenantID,
                  workflow.workflowID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="size-4 flex-shrink-0">
                    <Workflow
                      className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {workflow.title}
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
                ? "No matching workflows found"
                : CONSTANTS.STRINGS.WORKFLOW_DRAWER_LIST_NO_WORKFLOW
            }
          />
        </div>
      )}
    </div>
  );
};
