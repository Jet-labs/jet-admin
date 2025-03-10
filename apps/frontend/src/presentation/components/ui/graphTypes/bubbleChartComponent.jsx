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
import { Bubble } from "react-chartjs-2";

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

export class BubbleGraphDataset {
  constructor({ label, data, borderColor, backgroundColor }) {
    this.label = label;
    this.data = data;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
  }
}

export class BubbleGraphData {
  constructor({ labels, datasets }) {
    this.labels = labels;
    this.datasets = datasets;
  }
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const demoData = new BubbleGraphData({
  labels,
  datasets: [
    new BubbleGraphDataset({
      label: "Dataset 1",
      data: labels.map(() => ({
        x: faker.number.int({ min: -1000, max: 1000 }),
        y: faker.number.int({ min: -1000, max: 1000 }),
        r: faker.number.int({ min: 5, max: 20 }),
      })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    }),
    new BubbleGraphDataset({
      label: "Dataset 2",
      data: labels.map(() => ({
        x: faker.number.int({ min: -1000, max: 1000 }),
        y: faker.number.int({ min: -1000, max: 1000 }),
        r: faker.number.int({ min: 5, max: 20 }),
      })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    }),
  ],
});

export const BubbleChartComponent = ({
  legendPosition,
  titleDisplayEnabled,
  databaseChartName,
  data,
}) => {
  const theme = useTheme();
  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position:
            legendPosition || CONSTANTS.DATABASE_CHART_LEGEND_POSITION.TOP,
        },
        title: {
          display: !!titleDisplayEnabled,
          text:
            databaseChartName ||
            CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
        },
      },
    };
  }, [legendPosition, titleDisplayEnabled, databaseChartName]);

  return <Bubble redraw={true} options={options} data={data || demoData} />;
};
