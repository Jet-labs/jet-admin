import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useDatabaseChartsState } from "../../../logic/contexts/databaseChartsContext";
import { DATABASE_CHARTS_CONFIG_MAP } from "../../components/chartTypes";

const DatabaseChartLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const { isLoadingDatabaseCharts, databaseCharts } = useDatabaseChartsState();

  const chartTypes = Object.entries(DATABASE_CHARTS_CONFIG_MAP).map(([key, config]) => ({
    title: `${config.label} Charts`,
    icon: React.cloneElement(config.icon, { className: "text-[#646cff] text-2xl" }),
    description: config.description,
    count: databaseCharts?.filter(chart => chart.databaseChartType === key)?.length || 0,
    action: () => navigate(`${CONSTANTS.ROUTES.ADD_DATABASE_CHART.path(tenantID)}?type=${key}`),
  }));

  if (isLoadingDatabaseCharts) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center w-full p-3 border-b border-slate-200">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl">
          {CONSTANTS.STRINGS.DATABASE_CHARTS_STATS_TITLE}
        </h1>
        <button
          onClick={() =>
            navigate(CONSTANTS.ROUTES.ADD_DATABASE_CHART.path(tenantID))
          }
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <FaPlus className="mr-2" />
          {CONSTANTS.STRINGS.ADD_CHART_BUTTON_TEXT }
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-3">
        {chartTypes.map((chartType, index) => (
          <div
            key={index}
            className="bg-white rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff]"
            onClick={chartType.action}
          >
            <div className="flex justify-between items-center mb-4">
              {chartType.icon}
              <span className="text-2xl font-bold text-slate-700">
                {chartType.count}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-2">
              {chartType.title}
            </h3>
            <p className="text-sm text-gray-600">{chartType.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseChartLayoutLandingPage;

