// BarChartComponent.js
import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../constants";

export const BarChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value}
      {...props}
    />
  );
};
