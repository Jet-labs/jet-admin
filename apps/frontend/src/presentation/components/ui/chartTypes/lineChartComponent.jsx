import { useTheme } from "@mui/material";
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
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
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

export class LineGraphDataset {
  constructor({
    label,
    data,
    borderColor,
    backgroundColor,
    fill = false,
    tension = 0.4,
    pointRadius = 3,
    pointHoverRadius = 5,
    borderDash = [],
    borderWidth = 2,
    stepped = false,
  }) {
    this.label = label;
    this.data = data;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
    this.fill = fill;
    this.tension = tension;
    this.pointRadius = pointRadius;
    this.pointHoverRadius = pointHoverRadius;
    this.borderDash = borderDash;
    this.borderWidth = borderWidth;
    this.stepped = stepped;
  }
}

export class LineGraphData {
  constructor({ labels, datasets }) {
    this.labels = labels;
    this.datasets = datasets;
  }
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = {
  labels,
  datasets: [
    new LineGraphDataset({
      label: "Dataset 1",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      stepped: true,
      borderDash: [5, 15],
      borderWidth: 2,
    }),
    new LineGraphDataset({
      label: "Dataset 2",
      data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
      fill: true,
    }),
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
}) => {
  const theme = useTheme();

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
console.log({data})
  return <Line redraw={true} options={options} data={data || demoData} />;
};
