import React from "react";

import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseChartByIDAPI,
  getDatabaseChartDataByIDAPI,
} from "../../../data/apis/databaseChart";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseDashboardChartWidget = ({
  tenantID,
  databaseChartID,
  width,
  height,
}) => {
  DatabaseDashboardChartWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseChartID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

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

  const { isLoading: isLoadingDatabaseChartData, data: databaseChartData } =
    useQuery({
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
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseChart || isLoadingDatabaseChartData}
        error={loadDatabaseChartError}
        refetch={refetchDatabaseChart}
      >
        {databaseChart &&
          DATABASE_CHARTS_CONFIG_MAP[
            databaseChart.databaseChartType
          ]?.component({
            databaseChartName: databaseChart.databaseChartName,
            databaseChartConfig: databaseChart.databaseChartConfig,
            data: databaseChartData?.data,
            refetchInterval: databaseChart.databaseChartConfig.refetchInterval,
          })}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
