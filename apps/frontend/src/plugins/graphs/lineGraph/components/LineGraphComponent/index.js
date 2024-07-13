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

import { da, faker } from "@faker-js/faker";
import { LOCAL_CONSTANTS } from "../../../../../constants";

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
export class LineGraphData {
  /**
   *
   * @param {object} param0
   * @param {Array<String>} param0.labels
   * @param {Array<LineGraphDataset>} param0.datasets
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
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

export const LineGraphComponent = ({
  legendPosition,
  titleDisplayEnabled,
  graphTitle,
  data,
}) => {
  const theme = useTheme();
  const options = useMemo(() => {
    return {
      responsive: true,
      elements: {
        bar: {
          borderWidth: 2,
        },
      },
      plugins: {
        legend: {
          position: legendPosition
            ? legendPosition
            : LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
        },
        title: {
          display: Boolean(titleDisplayEnabled),
          text: graphTitle
            ? graphTitle
            : LOCAL_CONSTANTS.STRINGS.UNTITLED_CHART_TITLE,
        },
      },
    };
  }, [legendPosition, titleDisplayEnabled, graphTitle]);

  return <Line options={options} data={data ? data : demoData} />;
};
