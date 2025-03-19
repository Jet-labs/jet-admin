import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import React, { useEffect, useMemo, useRef } from "react";
import { Radar } from "react-chartjs-2";

import { faker } from "@faker-js/faker";
import { CONSTANTS } from "../../../../constants";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

export const RadarChartComponent = ({
  legendPosition,
  titleDisplayEnabled,
  databaseChartName,
  data,
  legendDisplayEnabled,
  onChartInit,
}) => {
  const chartRef = useRef();
  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      responsive: true,
      elements: {
        bar: {
          borderWidth: 2,
        },
      },
      plugins: {
        legend: Boolean(legendDisplayEnabled)
          ? {
              position: legendPosition
                ? legendPosition
                : CONSTANTS.DATABASE_CHART_LEGEND_POSITION.TOP,
            }
          : false,
        title: {
          display: Boolean(titleDisplayEnabled),
          text: databaseChartName ? databaseChartName : "",
        },
      },
    };
  }, [
    legendDisplayEnabled,
    legendPosition,
    titleDisplayEnabled,
    databaseChartName,
  ]);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      onChartInit?.(chartRef);
    }
  }, [chartRef]);
  return (
    <Radar
      ref={chartRef}
      options={options}
      height={"300 px"}
      data={data ? data : demoData}
    />
  );
};
