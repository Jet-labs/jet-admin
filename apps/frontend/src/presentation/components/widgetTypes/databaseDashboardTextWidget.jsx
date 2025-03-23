import { useTheme } from "@mui/material";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseWidgetByIDAPI,
  getDatabaseWidgetDataByIDAPI,
  getDatabaseWidgetDataUsingWidgetAPI,
} from "../../../data/apis/databaseWidget";
import { DATABASE_WIDGETS_CONFIG_MAP } from "../databaseWidgetComponents/widgetConfig";

export const DatabaseDashboardTextWidget = ({
  tenantID,
  databaseWidgetID,
  width,
  height,
}) => {
  const theme = useTheme();

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
    refetch: refetchDatabaseWidgetData,
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
      className="rounded !p-4 bg-white"
      style={{
        // height: 400,
        width: width,
        height: height,
      }}
    >
      {databaseWidget &&
        DATABASE_WIDGETS_CONFIG_MAP[
          databaseWidget.databaseWidgetType
        ]?.component({
          databaseWidgetName: databaseWidget.databaseWidgetName,
          databaseWidgetConfig: databaseWidget.databaseWidgetConfig,
          data: databaseWidgetData?.data,
          refetchInterval: databaseWidget.databaseWidgetConfig.refetchInterval,
        })}
    </div>
  );
};
