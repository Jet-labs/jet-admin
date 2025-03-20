import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../../constants";

export const BubbleChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value}
      {...props}
    />
  );
};
