import { FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";
import { useDatasourcesState } from "../../../../logic/contexts/datasourceContext";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { DatasourceIcon } from "../../datasourceComponents/datasourceIcon";

export const DatasourceDrawerList = () => {
  const {
    isLoadingDatasources,
    datasources,
    isFetchingDatasources,
  } = useDatasourcesState();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreDatasource = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATASOURCE.path(tenantID));
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddMoreDatasource}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_DATASOURCE_BUTTON_TEXT}
      </button>
      {isLoadingDatasources || isFetchingDatasources ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : datasources && datasources.length > 0 ? (
          <div className="h-full w-full overflow-y-auto pb-10">
          {datasources.map((datasource) => {
            const key = `datasource_${datasource.datasourceID}`;
            const isActive =
              routeParam?.datasourceID == datasource.datasourceID;
            const datasourceTypeConfig = getDatasourceTypeByValue(datasource.datasourceType);

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.path(
                  tenantID,
                  datasource.datasourceID
                )}
                key={key}
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="!w-[16px] flex-shrink-0">
                    <DatasourceIcon
                      icon={datasourceTypeConfig?.icon}
                      iconColor={isActive ? "#646cff" : datasourceTypeConfig?.iconColor}
                      size={16}
                    />
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(datasource.datasourceTitle, 15)} */}
                    {`${datasource.datasourceTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.DATASOURCE_DRAWER_LIST_NO_DATASOURCE}
          />
        </div>
      )}

      {/* Datasource List */}
    </div>
  );
};
