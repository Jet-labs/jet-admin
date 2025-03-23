// PieChartComponent.js
import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../constants";

export const PieChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value}
      {...props}
    />
  );
};
