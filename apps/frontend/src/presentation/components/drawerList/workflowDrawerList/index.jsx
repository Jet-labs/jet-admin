import React from "react";
import { Plus, Workflow } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useWorkflows } from "../../../../logic/hooks/useWorkflows";
import { NoEntityUI } from "../../ui/noEntityUI";

import { Button } from "@jet-admin/ui";

export const WorkflowDrawerList = () => {
  const { tenantID } = useParams();
  const { isLoadingWorkflows, workflows, isFetchingWorkflows } = useWorkflows(tenantID);
  const routeParam = useParams();

  const navigate = useNavigate();

  const _navigateToAddMoreWorkflow = () => {
    navigate(CONSTANTS.ROUTES.ADD_WORKFLOW.path(tenantID));
  };

  return (
    <div className="bg-background h-full overflow-hidden p-3 w-full flex flex-col gap-3">
      <Button
        onClick={_navigateToAddMoreWorkflow}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="size-4 mr-2" />
        {CONSTANTS.STRINGS.ADD_WORKFLOW_BUTTON_TEXT}
      </Button>

      {isLoadingWorkflows || isFetchingWorkflows ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
        </div>
      ) : workflows && workflows.length > 0 ? (
        <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
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
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {workflow.title}
                  </span>
                </div>
              </Link>
            );
          })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <NoEntityUI message={CONSTANTS.STRINGS.WORKFLOW_DRAWER_LIST_NO_WORKFLOW} />
          </div>
      )}
    </div>
  );
};
