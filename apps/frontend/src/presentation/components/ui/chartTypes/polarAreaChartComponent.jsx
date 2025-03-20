import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../../constants";

export const PolarAreaChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.RADIAL_CHART.value}
      {...props}
    />
  );
};
