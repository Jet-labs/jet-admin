import { FaChartBar, FaChartPie } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { CONSTANTS } from "../../../constants";
import { useDatabaseDashboardsState } from "../../../logic/contexts/databaseDashboardsContext";
import { NoEntityUI } from "./noEntityUI";
import { AiOutlineRadarChart } from "react-icons/ai";
import { TbChartScatter } from "react-icons/tb";
import { PiChartPolar } from "react-icons/pi";

export const DatabaseDashboardWidgetList = ({}) => {
  const { databaseCharts, databaseQueries } = useDatabaseDashboardsState();
  const _handleDragStart = (e) => {
    e.dataTransfer.setData("widget", `${e.currentTarget.id}-${Date.now()}`);
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

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full gap-2 overflow-y-auto">
      <span className="text-[#646cff] font-semibold text-sm">
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_CHARTS_TITLE}
      </span>
      <div className="flex flex-col justify-start items-stretch w-full gap-2  ">
        {databaseCharts?.length > 0 ? (
          databaseCharts.map((databaseChart) => {
            const key = `chart_${databaseChart.databaseChartID}`;
            return (
              <div
                draggable
                key={key}
                id={key}
                onDragStart={_handleDragStart}
                className="bg-slate-200 flex flex-row justify-start p-2 rounded items-center cursor-grab"
              >
                <div>{_renderChartIcon(databaseChart.databaseChartType)}</div>

                <span className="text-xs text-slate-700 font-medium">
                  {databaseChart.databaseChartName}
                </span>
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
      <div className="flex flex-col justify-start items-stretch w-full gap-2 ">
        {databaseQueries?.length > 0 ? (
          databaseQueries.map((databaseQuery) => {
            const key = `query_${databaseQuery.databaseQueryID}`;
            return (
              <div
                draggable
                key={key}
                id={key}
                onDragStart={_handleDragStart}
                className="bg-slate-200 flex flex-row justify-start p-2 rounded items-center cursor-grab"
              >
                <div>{_renderChartIcon(databaseQuery.databaseQueryType)}</div>

                <span className="text-xs text-slate-700 font-medium">
                  {databaseQuery.databaseQueryTitle}
                </span>
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
