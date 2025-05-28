import { FaPlus } from "react-icons/fa";
import { SiGooglebigquery } from "react-icons/si";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDataQueriesState } from "../../../../logic/contexts/dataQueriesContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";

export const DataQueryDrawerList = () => {
  const { isLoadingDataQueries, dataQueries, isFetchingDataQueries } =
    useDataQueriesState();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreQuery = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATA_QUERY.path(tenantID));
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddMoreQuery}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_QUERY_BUTTON_TEXT}
      </button>
      {isLoadingDataQueries || isFetchingDataQueries ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : dataQueries && dataQueries.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {dataQueries.map((dataQuery) => {
            const key = `dataQuery_${dataQuery.dataQueryID}`;
            const isActive = routeParam?.dataQueryID == dataQuery.dataQueryID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.path(
                  tenantID,
                  dataQuery.dataQueryID
                )}
                key={key}
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="!w-[16px]">
                    <SiGooglebigquery
                      className={`w-[16px] h-[16px] ${
                        isActive ? "text-primary" : "text-slate-600"
                      }`}
                    />
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(dataQuery.dataQueryTitle, 15)} */}
                    {`${dataQuery.dataQueryTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI message={CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY} />
        </div>
      )}

      {/* Query List */}
    </div>
  );
};
