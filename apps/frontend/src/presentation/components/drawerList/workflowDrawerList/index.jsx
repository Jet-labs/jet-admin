import React from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useWorkflowState } from "../../../../logic/contexts/workflowContext";
import { NoEntityUI } from "../../ui/noEntityUI";

export const WorkflowDrawerList = () => {
  const { isLoadingWorkflows, workflows, isFetchingWorkflows } =
    useWorkflowState();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreWorkflow = () => {
    navigate(CONSTANTS.ROUTES.ADD_WORKFLOW.path(tenantID));
  };

  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddMoreWorkflow}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_WORKFLOW_BUTTON_TEXT}
      </button>
      {isLoadingWorkflows || isFetchingWorkflows ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : (
        workflows && workflows.length > 0 ? <div className="h-full w-full overflow-y-auto pb-10">
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
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                    }`}
                >
                  <div className="!w-[16px]">
                    <FaPlus
                      className={`w-[16px] h-[16px] ${isActive ? "text-primary" : "text-slate-600"
                        }`}
                    />
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${isActive ? "font-bold" : ""
                      } `}
                  >
                    {/* {StringUtils.truncateName(workflow.title, 15)} */}
                    {`${workflow.title}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div> : <NoEntityUI />
      )}
    </div>
  );
};
