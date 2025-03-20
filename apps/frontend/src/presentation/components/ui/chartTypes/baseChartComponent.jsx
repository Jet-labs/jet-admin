// BaseChartComponent.js
import React, { useMemo, useRef, useEffect } from "react";
import {ChartWrapper} from "./chartWrapper";
import { CONSTANTS } from "../../../../constants";
import { getDemoData } from "./chartConfig";

export const BaseChartComponent = ({
  type,
  legendPosition,
  titleDisplayEnabled = true,
  databaseChartName,
  data,
  legendDisplayEnabled = true,
  indexAxis = "x",
  xStacked = false,
  yStacked = false,
  onChartInit,
}) => {
  const chartRef = useRef(null);

  const options = useMemo(() => {
    return {
      responsive: true,
      indexAxis,
      scales: {
        x: { stacked: xStacked },
        y: { stacked: yStacked },
      },
      plugins: {
        legend: legendDisplayEnabled
          ? {
              position:
                legendPosition || CONSTANTS.DATABASE_CHART_LEGEND_POSITION.TOP,
            }
          : false,
        title: {
          display: Boolean(titleDisplayEnabled),
          text: databaseChartName || "",
        },
      },
    };
  }, [
    legendPosition,
    titleDisplayEnabled,
    databaseChartName,
    legendDisplayEnabled,
    indexAxis,
    xStacked,
    yStacked,
  ]);

  useEffect(() => {
    if (chartRef.current) {
        console.log(chartRef.current)
      onChartInit?.(chartRef);
    }
  }, [onChartInit]);

  return (
    <ChartWrapper
      ref={chartRef}
      type={type}
      data={data || getDemoData(type)}
      options={options}
    />
  );
};

