// PieChartComponent.js
import React from "react";
import { BaseChartComponent } from "./baseChartComponent";
import { CONSTANTS } from "../../../../constants";

export const RadarChartComponent = (props) => {
  return (
    <BaseChartComponent
      type={CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value}
      {...props}
    />
  );
};
