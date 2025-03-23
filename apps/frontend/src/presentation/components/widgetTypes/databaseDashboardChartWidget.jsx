import { useTheme } from "@mui/material";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseChartByIDAPI,
  getDatabaseChartDataByIDAPI,
  getDatabaseChartDataUsingChartAPI,
} from "../../../data/apis/databaseChart";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";

export const DatabaseDashboardChartWidget = ({
  tenantID,
  databaseChartID,
  width,
  height,
}) => {
  const theme = useTheme();

  const {
    isLoading: isLoadingDatabaseChart,
    data: databaseChart,
    error: loadDatabaseChartError,
    refetch: refetchDatabaseChart,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
      databaseChartID,
    ],
    queryFn: () => getDatabaseChartByIDAPI({ tenantID, databaseChartID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseChartData,
    data: databaseChartData,
    error: loadDatabaseChartDataError,
    refetch: refetchDatabaseChartData,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID),
      databaseChartID,
      "data",
    ],
    queryFn: () => getDatabaseChartDataByIDAPI({ tenantID, databaseChartID }),
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
      {databaseChart &&
        DATABASE_CHARTS_CONFIG_MAP[databaseChart.databaseChartType]?.component({
          databaseChartName: databaseChart.databaseChartName,
          databaseChartConfig: databaseChart.databaseChartConfig,
          data: databaseChartData?.data,
          refetchInterval: databaseChart.databaseChartConfig.refetchInterval,
        })}
    </div>
  );
};
