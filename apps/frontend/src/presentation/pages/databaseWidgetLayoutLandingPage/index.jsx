import React from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useDatabaseWidgetsState } from "../../../logic/contexts/databaseWidgetsContext";
import { DATABASE_WIDGETS_CONFIG_MAP } from "../../components/databaseWidgetComponents/widgetConfig";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";


const DatabaseWidgetLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const { isLoadingDatabaseWidgets, databaseWidgets } = useDatabaseWidgetsState();

  const widgetTypes = Object.entries(DATABASE_WIDGETS_CONFIG_MAP).map(([key, config]) => ({
    title: `${config.label} Widgets`,
    icon: React.cloneElement(config.icon, { className: "text-[#646cff] text-2xl" }),
    description: config.description,
    count: databaseWidgets?.filter(widget => widget.databaseWidgetType === key)?.length || 0,
    action: () => navigate(`${CONSTANTS.ROUTES.ADD_DATABASE_WIDGET.path(tenantID)}?type=${key}`),
  }));

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center w-full p-3 border-b border-slate-200">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl">
          {CONSTANTS.STRINGS.DATABASE_WIDGETS_STATS_TITLE}
        </h1>
        <button
          onClick={() =>
            navigate(CONSTANTS.ROUTES.ADD_DATABASE_WIDGET.path(tenantID))
          }
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <FaPlus className="mr-2" />
          {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
        </button>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseWidgets}
        error={null}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-2">
          {widgetTypes.map((widgetType, index) => (
            <div
              key={index}
              className="bg-white rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff]"
              onClick={widgetType.action}
            >
              <div className="flex justify-between items-center mb-4">
                {widgetType.icon}
                <span className="text-2xl font-bold text-slate-700">
                  {widgetType.count}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-2">
                {widgetType.title}
              </h3>
              <p className="text-sm text-gray-600">{widgetType.description}</p>
            </div>
          ))}
        </div>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

export default DatabaseWidgetLayoutLandingPage;

