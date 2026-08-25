import React, { useState } from "react";
import { Plus, Search, Workflow } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";
import { BundleImportDialog } from "../../bundleComponents/bundleImportDialog";
import { EntityFolderTree } from "../../folderComponents/entityFolderTree";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";

export const WorkflowDrawerList = () => {
  const { tenantID } = useParams();
  const routeParam = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { items: workflows, isLoading: isLoadingWorkflows } = useEntityItems({
    tenantID,
    entityType: "workflow",
    search: debouncedSearchQuery,
  });

  const _navigateToAddMoreWorkflow = () => {
    navigate(CONSTANTS.ROUTES.ADD_WORKFLOW.path(tenantID));
  };

  const _renderItemRow = (workflow) => {
    const isActive = routeParam?.workflowID == workflow.workflowID;
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.path(tenantID, workflow.workflowID)}
        key={workflow.workflowID} className="block focus:outline-none"
      >
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive
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
  };

  return (
    <div className="bg-background h-full overflow-hidden w-full flex flex-col gap-2">
      <div className="p-2 pb-0 flex items-center gap-2">
        <Button
          onClick={_navigateToAddMoreWorkflow}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus className="size-4 mr-2" />
          {CONSTANTS.STRINGS.ADD_WORKFLOW_BUTTON_TEXT}
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
            placeholder="Search workflows..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {debouncedSearchQuery ? (
        workflows && workflows.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2">
            {workflows.map(_renderItemRow)}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <NoEntityUI message="No matching workflows found" />
          </div>
        )
      ) : (
        <EntityFolderTree
          tenantID={tenantID}
          entityType="workflow"
          items={workflows}
          isLoadingItems={isLoadingWorkflows}
          renderItemRow={_renderItemRow}
        />
      )}
    </div>
  );
};
