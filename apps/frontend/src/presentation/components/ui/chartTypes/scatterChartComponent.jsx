import { useTheme } from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useMemo, useRef, useEffect } from "react";
import { Scatter } from "react-chartjs-2";

import { faker } from "@faker-js/faker";
import { CONSTANTS } from "../../../../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => ({
        x: faker.number.int({ min: -1000, max: 1000 }),
        y: faker.number.int({ min: -1000, max: 1000 }),
      })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => ({
        x: faker.number.int({ min: -1000, max: 1000 }),
        y: faker.number.int({ min: -1000, max: 1000 }),
      })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

export const ScatterChartComponent = ({
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
    <Scatter
      ref={chartRef}
      redraw={true}
      options={options}
      data={data || demoData}
    />
  );
};
