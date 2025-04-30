import { CircularProgress } from "@mui/material";
import React, { useCallback, useRef } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";
import { DatabaseChartDownloadForm } from "./databaseChartImageDownloadForm";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";

export const DatabaseChartPreview = ({
  databaseChartName,
  databaseChartType,
  data,
  refetchInterval,
  isFetchingData,
  isRefreshingData,
  refreshData,
  databaseChartConfig,
  allowActionBar = true,
  containerClass,
}) => {
  console.log({ databaseChartName, databaseChartType, data });
  DatabaseChartPreview.propTypes = {
    databaseChartName: PropTypes.string.isRequired,
    databaseChartType: PropTypes.string.isRequired,
    data: PropTypes.object,
    refetchInterval: PropTypes.number,
    isFetchingData: PropTypes.bool.isRequired,
    isRefreshingData: PropTypes.bool.isRequired,
    refreshData: PropTypes.func.isRequired,
    databaseChartConfig: PropTypes.object,
    allowActionBar: PropTypes.bool,
    containerClass: PropTypes.string,
  };
  const chartRef = useRef();
  const _handleOnChartInit = useCallback(
    (ref) => {
      if (chartRef) {
        chartRef.current = ref.current;
      }
    },
    [chartRef]
  );
  return (
    <div className={`h-full w-full flex flex-col ${containerClass}`}>
      {allowActionBar && (
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
      )}
      {isFetchingData || isRefreshingData ? (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <CircularProgress className=" !text-[#646cff]" />
        </div>
      ) : (
        <div className="h-full w-full">
          {DATABASE_CHARTS_CONFIG_MAP[databaseChartType] ? (
            DATABASE_CHARTS_CONFIG_MAP[databaseChartType].component({
              databaseChartName,
              databaseChartType,
              data,
              onChartInit: _handleOnChartInit,
              refetchInterval,
              refreshData,
              databaseChartConfig,
            })
          ) : (
            <div className="h-full w-full p-3 flex justify-center items-center">
              <span className="text-red-500 text-xs">
                {CONSTANTS.STRINGS.CHART_TYPE_INVALID_ERROR}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
