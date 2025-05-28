import React from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  getWidgetDataByIDAPI,
} from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseDashboardWidget = ({
  tenantID,
  widgetID,
  width,
  height,
}) => {
  DatabaseDashboardWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
    refetch: refetchWidget,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () => getWidgetByIDAPI({ tenantID, widgetID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingWidgetData,
    data: widgetData,
    error: loadWidgetDataError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID, "data"],
    queryFn: () => getWidgetDataByIDAPI({ tenantID, widgetID }),
    refetchOnWindowFocus: false,
  });

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: width,
        height: height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget || isLoadingWidgetData}
        isFetching={isLoadingWidget || isLoadingWidgetData}
        error={loadWidgetError || loadWidgetDataError}
        refetch={refetchWidget}
      >
        {widget &&
          WIDGETS_MAP[widget.widgetType]?.component({
            widgetName: widget.widgetName,
            widgetConfig: widget.widgetConfig,
            data: widgetData?.data,
            refetchInterval: widget.widgetConfig.refetchInterval,
          })}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
