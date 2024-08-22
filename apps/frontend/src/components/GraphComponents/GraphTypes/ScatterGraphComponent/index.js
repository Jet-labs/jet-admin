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
import React, { useMemo } from "react";
import { Scatter } from "react-chartjs-2";

import { faker } from "@faker-js/faker";
import { LOCAL_CONSTANTS } from "../../../../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export class ScatterGraphDataset {
  constructor({ label, data, borderColor, backgroundColor }) {
    this.label = label;
    this.data = data;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
  }
}

export class ScatterGraphData {
  constructor({ labels, datasets }) {
    this.labels = labels;
    this.datasets = datasets;
  }
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = new ScatterGraphData({
  labels,
  datasets: [
    new ScatterGraphDataset({
      label: "Dataset 1",
      data: labels.map(() => ({
        x: faker.datatype.number({ min: -1000, max: 1000 }),
        y: faker.datatype.number({ min: -1000, max: 1000 }),
      })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    }),
    new ScatterGraphDataset({
      label: "Dataset 2",
      data: labels.map(() => ({
        x: faker.datatype.number({ min: -1000, max: 1000 }),
        y: faker.datatype.number({ min: -1000, max: 1000 }),
      })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    }),
  ],
});

export const ScatterGraphComponent = ({
  legendPosition,
  titleDisplayEnabled,
  pmGraphTitle,
  data,
}) => {
  const theme = useTheme();
  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: legendPosition || LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
        },
        title: {
          display: !!titleDisplayEnabled,
          text: pmGraphTitle || LOCAL_CONSTANTS.STRINGS.UNTITLED_CHART_TITLE,
        },
      },
    };
  }, [legendPosition, titleDisplayEnabled, pmGraphTitle]);

  return <Scatter redraw={true} options={options} data={data || demoData} />;
};
