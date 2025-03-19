import { faker } from "@faker-js/faker";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import { CONSTANTS } from "../../../../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      stepped: true,
      borderDash: [5, 15],
      borderWidth: 2,
    },
    {
      label: "Dataset 2",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
      fill: true,
    },
  ],
};

export const LineChartComponent = ({
  legendPosition,
  titleDisplayEnabled,
  databaseChartName,
  data,
  legendDisplayEnabled,
  indexAxis,
  xStacked,
  yStacked,
  onChartInit,
}) => {
  const chartRef = useRef();

  const options = useMemo(() => {
    return {
      responsive: true,
      indexAxis: indexAxis || "x",
      elements: {
        bar: {
          borderWidth: 2,
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: xStacked,
        },
        y: {
          stacked: yStacked,
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
    legendPosition,
    titleDisplayEnabled,
    databaseChartName,
    legendDisplayEnabled,
    xStacked,
    yStacked,
    indexAxis,
  ]);
  useEffect(() => {
    if (chartRef && chartRef.current) {
      onChartInit?.(chartRef);
    }
  }, [chartRef]);
  return (
    <Line
      ref={chartRef}
      redraw={true}
      options={options}
      data={data || demoData}
    />
  );
};
