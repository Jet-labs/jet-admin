import { WIDGETS_MAP } from "@jet-admin/widgets";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDatabaseWidgetsState } from "../../../../logic/contexts/databaseWidgetsContext";
import { NoEntityUI } from "../../ui/noEntityUI";

export const DatabaseWidgetDrawerList = () => {
  const {
    isLoadingDatabaseWidgets,
    databaseWidgets,
    isFetchingDatabaseWidgets,
  } = useDatabaseWidgetsState();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreWidget = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATABASE_WIDGET.path(tenantID));
  };
  const _renderWidgetIcon = (databaseWidgetType, isActive) => {
    return WIDGETS_MAP[databaseWidgetType].icon({
      className: `!text-xl ${
        isActive ? "!text-[#646cff] " : "!text-slate-700 "
      }`,
    });
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddMoreWidget}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
      </button>
      {isLoadingDatabaseWidgets || isFetchingDatabaseWidgets ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseWidgets && databaseWidgets.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {databaseWidgets.map((databaseWidget) => {
            const key = `databaseWidget_${databaseWidget.databaseWidgetID}`;
            const isActive =
              routeParam?.databaseWidgetID == databaseWidget.databaseWidgetID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATABASE_WIDGET_BY_ID.path(
                  tenantID,
                  databaseWidget.databaseWidgetID
                )}
                key={key}
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  {_renderWidgetIcon(
                    databaseWidget.databaseWidgetType,
                    isActive
                  )}

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(databaseWidget.databaseWidgetName, 15)} */}
                    {`${databaseWidget.databaseWidgetName}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET}
          />
        </div>
      )}

      {/* Widget List */}
    </div>
  );
};
