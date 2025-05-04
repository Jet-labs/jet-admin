import { WIDGETS_MAP } from "@jet-admin/widgets";
import PropTypes from "prop-types";
import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { GoGrabber } from "react-icons/go";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useDatabaseDashboardsState } from "../../../logic/contexts/databaseDashboardsContext";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseDashboardWidgetList = ({ tenantID }) => {
  DatabaseDashboardWidgetList.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const {
    isLoadingDatabaseWidgets,
    loadDatabaseWidgetsError,
    databaseWidgets,
  } = useDatabaseDashboardsState();

  const _handleDragStart = (e, id) => {
    // Set the data transfer with the widget ID
    e.dataTransfer.setData("widget", `${id}-${Date.now()}`);

    // Create a custom drag image using the parent element
    const parentElement = document.getElementById(id);
    if (parentElement) {
      // Create a clone of the element to use as drag image
      const clone = parentElement.cloneNode(true);

      // Apply styles to make it look solid
      clone.style.opacity = "1";
      clone.style.transform = "translateX(-9999px)";
      clone.style.position = "absolute";
      clone.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      clone.style.background = "#e2e8f0"; // Slightly darker than original

      // Add to DOM temporarily
      document.body.appendChild(clone);

      // Use the clone as drag image
      e.dataTransfer.setDragImage(clone, 0, 0);

      // Remove the clone after drag starts
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  const _renderWidgetIcon = (databaseWidgetType) => {
    return WIDGETS_MAP[databaseWidgetType].icon({
      className: "!text-slate-700 !text-xl !mr-3",
    });
  };

  const _renderWidgetLinkIcon = (databaseWidgetID) => {
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_DATABASE_WIDGET_BY_ID.path(
          tenantID,
          databaseWidgetID
        )}
        target="_blank"
      >
        <FiExternalLink className="text-[#646cff] !text-sm ml-2" />
      </Link>
    );
  };

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full gap-2 overflow-y-auto p-2">
      <span className="text-[#646cff] font-semibold text-sm">
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_WIDGETS_TITLE}
      </span>
      <div className="flex flex-col justify-start items-stretch w-full gap-2">
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingDatabaseWidgets}
          error={loadDatabaseWidgetsError}
        >
          {databaseWidgets?.length > 0 ? (
            databaseWidgets.map((databaseWidget) => {
              const key = `widget_${databaseWidget.databaseWidgetID}`;
              return (
                <div
                  key={key}
                  id={key}
                  className="bg-slate-200 flex flex-row justify-between p-2 rounded items-center"
                >
                  <div className="flex flex-row justify-start items-center">
                    <div
                      draggable
                      onDragStart={(e) => _handleDragStart(e, key)}
                      className="cursor-grab"
                    >
                      <GoGrabber className="text-slate-700 mr-2 !text-xl" />
                    </div>
                    <div>
                      {_renderWidgetIcon(databaseWidget.databaseWidgetType)}
                    </div>
                    <span className="text-xs text-slate-700 font-medium">
                      {databaseWidget.databaseWidgetName}
                    </span>
                  </div>
                  {_renderWidgetLinkIcon(databaseWidget.databaseWidgetID)}
                </div>
              );
            })
          ) : (
            <NoEntityUI
              message={CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY}
            />
          )}
        </ReactQueryLoadingErrorWrapper>
      </div>
    </div>
  );
};
