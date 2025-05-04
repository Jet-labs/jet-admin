import React from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseWidgetByIDAPI,
  getDatabaseWidgetDataByIDAPI,
} from "../../../data/apis/databaseWidget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseDashboardWidget = ({
  tenantID,
  databaseWidgetID,
  width,
  height,
}) => {
  DatabaseDashboardWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseWidgetID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  const {
    isLoading: isLoadingDatabaseWidget,
    data: databaseWidget,
    error: loadDatabaseWidgetError,
    refetch: refetchDatabaseWidget,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
      databaseWidgetID,
    ],
    queryFn: () => getDatabaseWidgetByIDAPI({ tenantID, databaseWidgetID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseWidgetData,
    data: databaseWidgetData,
    error: loadDatabaseWidgetDataError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
      databaseWidgetID,
      "data",
    ],
    queryFn: () => getDatabaseWidgetDataByIDAPI({ tenantID, databaseWidgetID }),
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
        isLoading={isLoadingDatabaseWidget || isLoadingDatabaseWidgetData}
        isFetching={isLoadingDatabaseWidget || isLoadingDatabaseWidgetData}
        error={loadDatabaseWidgetError || loadDatabaseWidgetDataError}
        refetch={refetchDatabaseWidget}
      >
        {databaseWidget &&
          WIDGETS_MAP[databaseWidget.databaseWidgetType]?.component({
            databaseWidgetName: databaseWidget.databaseWidgetName,
            databaseWidgetConfig: databaseWidget.databaseWidgetConfig,
            data: databaseWidgetData?.data,
            refetchInterval:
              databaseWidget.databaseWidgetConfig.refetchInterval,
          })}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
