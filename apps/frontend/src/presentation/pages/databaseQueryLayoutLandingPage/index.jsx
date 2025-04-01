import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FaPlus, FaChartBar, FaClock, FaStar } from "react-icons/fa";
import { MdWidgets } from "react-icons/md";
import { CONSTANTS } from "../../../constants";
import { useDatabaseQueriesState } from "../../../logic/contexts/databaseQueriesContext";

const DatabaseQueryLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const { isLoadingDatabaseQueries, databaseQueries } = useDatabaseQueriesState();

  const categorizedQueries = useMemo(() => {
    if (!databaseQueries) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return [
      {
        title: "Chart Queries",
        icon: <FaChartBar className="text-[#646cff] text-2xl" />,
        description: "Queries used in database charts",
        count: databaseQueries.filter(
          (query) => query.linkedDatabaseChartCount > 0
        ).length,
        action: () =>
          navigate(
            `${CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(
              tenantID
            )}?filter=charts`
          ),
      },
      {
        title: "Widget Queries",
        icon: <MdWidgets className="text-[#646cff] text-2xl" />,
        description: "Queries used in dashboard widgets",
        count: databaseQueries.filter(
          (query) => query.linkedDatabaseWidgetCount > 0
        ).length,
        action: () =>
          navigate(
            `${CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(
              tenantID
            )}?filter=widgets`
          ),
      },
      {
        title: "Recent Queries",
        icon: <FaClock className="text-[#646cff] text-2xl" />,
        description: "Queries created in the last 7 days",
        count: databaseQueries.filter(
          (query) => new Date(query.createdAt) > oneWeekAgo
        ).length,
        action: () =>
          navigate(
            `${CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)}?sort=recent`
          ),
      },
      {
        title: "Auto-Run Queries",
        icon: <FaStar className="text-[#646cff] text-2xl" />,
        description: "Queries that run automatically on load",
        count: databaseQueries.filter((query) => query.runOnLoad).length,
        action: () =>
          navigate(
            `${CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)}?filter=autorun`
          ),
      },
    ];
  }, [databaseQueries, navigate, tenantID]);

  if (isLoadingDatabaseQueries) {
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
          {CONSTANTS.STRINGS.DATABASE_QUERIES_STATS_TITLE}
        </h1>
        <button
          onClick={() => navigate(CONSTANTS.ROUTES.ADD_DATABASE_QUERY.path(tenantID))}
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <FaPlus className="mr-2" />
          {CONSTANTS.STRINGS.ADD_QUERY_BUTTON_TEXT}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-3">
        {categorizedQueries?.map((category, index) => (
          <div
            key={index}
            className="bg-white rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff]"
            onClick={category.action}
          >
            <div className="flex justify-between items-center mb-4">
              {category.icon}
              <span className="text-2xl font-bold text-slate-700">
                {category.count}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-2">
              {category.title}
            </h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseQueryLayoutLandingPage;

