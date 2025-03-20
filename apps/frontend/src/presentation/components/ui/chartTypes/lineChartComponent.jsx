// LineChartComponent.js
import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../../constants";

export const LineChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value}
      {...props}
    />
  );
};
