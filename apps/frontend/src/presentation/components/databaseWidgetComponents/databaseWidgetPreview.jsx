import { CircularProgress } from "@mui/material";
import { useCallback, useRef } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { DATABASE_WIDGETS_CONFIG_MAP } from "./widgetConfig";
// import { DatabaseWidgetDownloadForm } from "./databaseWidgetImageDownloadForm";
import { CONSTANTS } from "../../../constants";
export const DatabaseWidgetPreview = ({
  databaseWidgetName,
  databaseWidgetType,
  data,
  refetchInterval,
  isFetchingData,
  isRefreshingData,
  refreshData,
  databaseWidgetConfig,
}) => {
  const widgetRef = useRef();
  const _handleOnWidgetInit = useCallback(
    (ref) => {
      if (widgetRef) {
        widgetRef.current = ref.current;
      }
    },
    [widgetRef]
  );
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-row justify-end items-center bg-slate-100 border-b border-b-slate-200 p-2 gap-2">
        {/* {widgetRef && (
          <DatabaseWidgetDownloadForm
            databaseWidgetName={databaseWidgetName}
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
          <CircularProgress className=" !text-[#646cff]" />
        </div>
      ) : (
        <div className="h-full w-full p-3">
          {DATABASE_WIDGETS_CONFIG_MAP[databaseWidgetType] ? (
            DATABASE_WIDGETS_CONFIG_MAP[databaseWidgetType].component({
              databaseWidgetName,
              databaseWidgetType,
              data,
              onWidgetInit: _handleOnWidgetInit,
              refetchInterval,
              refreshData,
              databaseWidgetConfig,
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
