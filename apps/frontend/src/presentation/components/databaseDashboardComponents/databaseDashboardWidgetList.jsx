import { FaChartBar, FaChartPie } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { CONSTANTS } from "../../../constants";
import { useDatabaseDashboardsState } from "../../../logic/contexts/databaseDashboardsContext";
import { NoEntityUI } from "../ui/noEntityUI";
import { AiOutlineRadarChart } from "react-icons/ai";
import { TbChartScatter } from "react-icons/tb";
import { PiChartPolar } from "react-icons/pi";
import { MdOutlineTextFields } from "react-icons/md";
import { SiGooglebigquery } from "react-icons/si";
import { GoGrabber } from "react-icons/go";
import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

export const DatabaseDashboardWidgetList = ({ tenantID }) => {
  const { databaseCharts, databaseQueries, databaseWidgets } =
    useDatabaseDashboardsState();
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
  const _renderChartIcon = (databaseChartType) => {
    switch (databaseChartType) {
      case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
        return <FaChartBar className="text-slate-700 mr-3 !text-xl" />;
      case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
        return <FaChartLine className="text-slate-700 mr-3 !text-xl" />;
      case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
        return <FaChartPie className="text-slate-700 mr-3 !text-xl" />;
      case CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value:
        return <TbChartScatter className="text-slate-700 mr-3 !text-xl" />;
      case CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value:
        return <AiOutlineRadarChart className="text-slate-700 mr-3 !text-xl" />;
      case CONSTANTS.DATABASE_CHART_TYPES.RADIAL_CHART.value:
        return <PiChartPolar className="text-slate-700 mr-3 !text-xl" />;
      default:
        return <FaChartBar className="text-slate-700 mr-3 !text-xl" />;
    }
  };
  const _renderWidgetIcon = (databaseWidgetType) => {
    switch (databaseWidgetType) {
      case CONSTANTS.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value:
        return <MdOutlineTextFields className="text-slate-700 mr-3 !text-xl" />;
      default:
        return <MdOutlineTextFields className="text-slate-700 mr-3 !text-xl" />;
    }
  };

  const _renderChartLinkIcon = (databaseChartID) => {
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_DATABASE_CHART_BY_ID.path(
          tenantID,
          databaseChartID
        )}
        target="_blank"
      >
        <FiExternalLink className="text-[#646cff] !text-sm ml-2" />
      </Link>
    );
  };

  const _renderQueryLinkIcon = (databaseQueryID) => {
    return (
      <Link
        to={CONSTANTS.ROUTES.UPDATE_DATABASE_QUERY_BY_ID.path(
          tenantID,
          databaseQueryID
        )}
        target="_blank"
      >
        <FiExternalLink className="text-[#646cff] !text-sm ml-2" />
      </Link>
    );
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
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_CHARTS_TITLE}
      </span>
      <div className="flex flex-col justify-start items-stretch w-full gap-2">
        {databaseCharts?.length > 0 ? (
          databaseCharts.map((databaseChart) => {
            const key = `chart_${databaseChart.databaseChartID}`;
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
                  <div>{_renderChartIcon(databaseChart.databaseChartType)}</div>
                  <span className="text-xs text-slate-700 font-medium">
                    {databaseChart.databaseChartName}
                  </span>
                </div>

                {_renderChartLinkIcon(databaseChart.databaseChartID)}
              </div>
            );
          })
        ) : (
          <NoEntityUI message={CONSTANTS.STRINGS.CHART_DRAWER_LIST_NO_CHART} />
        )}
      </div>
      <span className="text-[#646cff] font-semibold text-sm">
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_QUERIES_TITLE}
      </span>
      <div className="flex flex-col justify-start items-stretch w-full gap-2">
        {databaseQueries?.length > 0 ? (
          databaseQueries.map((databaseQuery) => {
            const key = `query_${databaseQuery.databaseQueryID}`;
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
                    <SiGooglebigquery className="text-slate-700 mr-3 !text-xl" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium">
                    {databaseQuery.databaseQueryTitle}
                  </span>
                </div>
                {_renderQueryLinkIcon(databaseQuery.databaseQueryID)}
              </div>
            );
          })
        ) : (
          <NoEntityUI message={CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY} />
        )}
      </div>
      <span className="text-[#646cff] font-semibold text-sm">
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_WIDGETS_TITLE}
      </span>
      <div className="flex flex-col justify-start items-stretch w-full gap-2">
        {databaseWidgets?.length > 0 ? (
          databaseWidgets.map((databaseWidget) => {
            const key = `text_${databaseWidget.databaseWidgetID}`;
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
          <NoEntityUI message={CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY} />
        )}
      </div>
    </div>
  );
};
