import { CircularProgress } from "@mui/material";
import { DATABASE_CHARTS_CONFIG_MAP } from "./graphTypes";
import { FiRefreshCcw } from "react-icons/fi";
export const DatabaseChartPreview = ({
  databaseChartName,
  databaseChartType,
  legendPosition,
  legendDisplayEnabled,
  titleDisplayEnabled,
  data,
  refetchInterval,
  xStacked,
  yStacked,
  indexAxis,
  isRefreshingData,
  refreshData,
}) => {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-row justify-end items-center bg-slate-100 border-b border-b-slate-200 p-2">
        <button
          type="button"
          className="p-1 bg-[#646cff]/20 m-0 flex flex-row justify-center items-center rounded text-xs text-[#646cff] hover:border-[#646cff] hover:border outline-none focus:outline-none"
          onClick={refreshData}
        >
          {isRefreshingData ? (
            <CircularProgress size={16} className=" !text-[#646cff]" />
          ) : (
            <FiRefreshCcw className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="w-full flex-1 p-3">
        {DATABASE_CHARTS_CONFIG_MAP[databaseChartType].component({
          databaseChartName,
          legendDisplayEnabled,
          titleDisplayEnabled,
          legendPosition,
          databaseChartType,
          data,
          xStacked,
          yStacked,
          indexAxis,
        })}
      </div>
    </div>
  );
};
