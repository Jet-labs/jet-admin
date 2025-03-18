import { useTheme } from "@mui/material";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useMemo } from "react";
import { Bar, Chart } from "react-chartjs-2";

import { faker } from "@faker-js/faker";
import { CONSTANTS } from "../../../../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export class BarGraphDataset {
  /**
   *
   * @param {object} param0
   * @param {String} param0.label
   * @param {Array<Number>} param0.data
   * @param {String} param0.borderColor
   * @param {String} param0.backgroundColor
   */
  constructor({ label, data, borderColor, backgroundColor }) {
    this.label = label;
    this.data = data;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
  }
}
export class BarGraphData {
  /**
   *
   * @param {object} param0
   * @param {Array<String>} param0.labels
   * @param {Array<BarGraphDataset>} param0.datasets
   */
  constructor({ labels, datasets }) {
    this.labels = labels;
    this.datasets = datasets;
  }
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      backgroundColor: "rgb(255, 99, 132)",
      // stack: "Stack 0",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      backgroundColor: "rgb(75, 192, 192)",
      // stack: "Stack 0",
    },
    {
      label: "Dataset 3",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      backgroundColor: "rgb(53, 162, 235)",
      // stack: "Stack 1",
    },
  ],
};

export const BarChartComponent = ({
  legendPosition,
  titleDisplayEnabled,
  databaseChartName,
  data,
  legendDisplayEnabled,
  indexAxis,
  xStacked,
  yStacked,
}) => {
  const options = useMemo(() => {
    return {
      responsive: true,
      indexAxis: indexAxis || "y",
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

  console.log({data})
  return <Bar options={options} data={data ? data : demoData} />;
};
