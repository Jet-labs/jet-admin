import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../../constants";

export const ScatterChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value}
      {...props}
    />
  );
};
