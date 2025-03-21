import { CircularProgress } from "@mui/material";
import { useRef } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { DATABASE_CHARTS_CONFIG_MAP } from "./chartTypes";
import { DatabaseChartDownloadForm } from "./databaseChartImageDownloadForm";
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
  isFetchingData,
  isRefreshingData,
  refreshData,
  databaseChartConfig,
}) => {
  const chartRef = useRef();
  const _handleOnChartInit = (ref) => {
    chartRef.current = ref.current;
  };
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-row justify-end items-center bg-slate-100 border-b border-b-slate-200 p-2 gap-2">
        {chartRef && (
          <DatabaseChartDownloadForm
            databaseChartName={databaseChartName}
            chartRef={chartRef}
          />
        )}
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
      {isFetchingData ? (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="h-full w-full p-3">
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
            onChartInit: _handleOnChartInit,
            refetchInterval,
            refreshData,
            databaseChartConfig,
          })}
        </div>
      )}
    </div>
  );
};
