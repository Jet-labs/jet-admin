import { FaChartBar, FaChartLine, FaChartPie, FaPlus } from "react-icons/fa";
import { TbBrandGoogleBigQuery, TbChartScatter } from "react-icons/tb";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import {
  useDatabaseChartsActions,
  useDatabaseChartsState,
} from "../../../../logic/contexts/databaseChartsContext";
import { AiOutlineRadarChart } from "react-icons/ai";
import { PiChartPolar } from "react-icons/pi";
export const DatabaseChartDrawerList = ({}) => {
  const { isLoadingDatabaseCharts, databaseCharts, isFetchingDatabaseCharts } =
    useDatabaseChartsState();
  const { refetchDatabaseCharts } = useDatabaseChartsActions();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreChart = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATABASE_CHART.path(tenantID));
  };
  const _renderChartIcon = (databaseChartType, isActive) => {
    switch (databaseChartType) {
      case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
        return (
          <FaChartBar
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
        return (
          <FaChartLine
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
        return (
          <FaChartPie
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      case CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value:
        return (
          <TbChartScatter
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      case CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value:
        return (
          <AiOutlineRadarChart
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      case CONSTANTS.DATABASE_CHART_TYPES.RADIAL_CHART.value:
        return (
          <PiChartPolar
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
      default:
        return (
          <FaChartBar
            className={`${
              isActive ? "text-[#646cff] " : "text-slate-600"
            } mr-3 !text-base`}
          />
        );
    }
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      {/* Add Chart Button */}
      {true && (
        <button
          onClick={_navigateToAddMoreChart}
          className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
        >
          <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.ADD_CHART_BUTTON_TEXT}
        </button>
      )}
      {isLoadingDatabaseCharts || isFetchingDatabaseCharts ? (
        <div role="status" class=" animate-pulse w-full">
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseCharts && databaseCharts.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {databaseCharts.map((databaseChart) => {
            const key = `databaseChart_${databaseChart.databaseChartID}`;
            const isActive =
              routeParam?.databaseChartID == databaseChart.databaseChartID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATABASE_CHART_BY_ID.path(
                  tenantID,
                  databaseChart.databaseChartID
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
                    {_renderChartIcon(
                      databaseChart.databaseChartType,
                      isActive
                    )}
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(databaseChart.databaseChartName, 15)} */}
                    {`${databaseChart.databaseChartName}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI message={CONSTANTS.STRINGS.CHART_DRAWER_LIST_NO_CHART} />
        </div>
      )}

      {/* Chart List */}
    </div>
  );
};
