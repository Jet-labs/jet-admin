import { CircularProgress } from "@mui/material";
import React, { useCallback, useRef } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { WIDGETS_MAP } from "@jet-admin/widgets";

export const WidgetPreview = ({
  tenantID,
  widgetID,
  widgetName,
  widgetType,
  data,
  refetchInterval,
  isFetchingData,
  isRefreshingData,
  refreshData,
  widgetConfig,
}) => {
  WidgetPreview.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
    widgetName: PropTypes.string.isRequired,
    widgetType: PropTypes.string.isRequired,
    data: PropTypes.object,
    refetchInterval: PropTypes.number,
    isFetchingData: PropTypes.bool.isRequired,
    isRefreshingData: PropTypes.bool.isRequired,
    refreshData: PropTypes.func.isRequired,
    widgetConfig: PropTypes.object,
  };
  const uniqueKey = `widgetPreview_${tenantID}_${widgetID}`;
  const widgetRef = useRef();
  const _handleOnWidgetInit = useCallback(
    (ref) => {
      if (widgetRef) {
        widgetRef.current = ref.current;
      }
    },
    [widgetRef]
  );
  console.log({
    widgetConfig,
    data,
  });
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-row justify-end items-center bg-slate-100 border-b border-b-slate-200 p-2 gap-2">
        {/* {widgetRef && (
          <WidgetDownloadForm
            widgetName={widgetName}
            widgetRef={widgetRef}
          />
        )} */}
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
      {isFetchingData || isRefreshingData ? (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <CircularProgress size={16} className=" !text-[#646cff]" />
        </div>
      ) : (
        <div
          className="h-full w-full overflow-scroll"
          key={uniqueKey}
          id={uniqueKey}
        >
          {WIDGETS_MAP[widgetType] ? (
            WIDGETS_MAP[widgetType].component({
              widgetName,
              widgetType,
              data,
              onWidgetInit: _handleOnWidgetInit,
              refetchInterval,
              refreshData,
              widgetConfig,
            })
          ) : (
            <div className="h-full w-full p-3 flex justify-center items-center">
              <span className="text-red-500 text-xs">
                {CONSTANTS.STRINGS.WIDGET_TYPE_INVALID_ERROR}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
