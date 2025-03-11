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
}) => {
  const theme = useTheme();

  const options = useMemo(
    () => ({
      // Core configuration
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2,
      devicePixelRatio: window.devicePixelRatio || 1,
      locale: "en-US",

      // Layout configuration
      layout: {
        padding: {
          top: 20,
          right: 30,
          bottom: 10,
          left: 20,
        },
      },

      // Element configurations
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
          fill: false,
          stepped: false,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          hitRadius: 10,
          pointStyle: "circle",
          rotation: 0,
        },
      },

      // Plugin configurations
      plugins: {
        legend: {
          display: true,
          position:
            legendPosition || CONSTANTS.DATABASE_CHART_LEGEND_POSITION.TOP,
          align: "center",
          labels: {
            color: theme.palette.text.primary,
            font: {
              family: "Arial",
              size: 14,
              weight: "normal",
            },
            padding: 10,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        title: {
          display: Boolean(titleDisplayEnabled),
          text: databaseChartName || "Chart Title",
          font: {
            size: 18,
            weight: "bold",
          },
          color: theme.palette.text.secondary,
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: theme.palette.background.paper,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 12,
          },
          footerFont: {
            size: 12,
            weight: "bold",
          },
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.formattedValue}`,
          },
        },
        filler: {
          propagate: true,
        },
      },

      // Scale configurations
      scales: {
        x: {
          type: "category",
          display: true,
          offset: true,
          title: {
            display: true,
            text: "X Axis",
            color: theme.palette.text.primary,
            font: {
              size: 14,
            },
          },
          ticks: {
            color: theme.palette.text.secondary,
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
            callback: (value) => value,
          },
          grid: {
            display: true,
            color: theme.palette.divider,
            lineWidth: 1,
            drawBorder: true,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Y Axis",
            color: theme.palette.text.primary,
            font: {
              size: 14,
            },
          },
          ticks: {
            color: theme.palette.text.secondary,
            beginAtZero: true,
            stepSize: 500,
            callback: (value) => value.toLocaleString(),
          },
          grid: {
            display: true,
            color: theme.palette.divider,
            lineWidth: 1,
            drawBorder: true,
          },
          suggestedMin: -1000,
          suggestedMax: 1000,
        },
      },

      // Interaction configurations
      interaction: {
        mode: "nearest",
        intersect: true,
        axis: "x",
      },
      hover: {
        mode: "index",
        intersect: true,
      },

      // Animation configurations
      animation: {
        duration: 1000,
        easing: "easeInOutQuad",
        delay: 0,
        loop: false,
      },

      // Event handlers
      onHover: (event, elements) => {},
      onClick: (event, elements) => {},
      onResize: (chart, size) => {},
      onInit: (chart) => {},
    }),
    [legendPosition, titleDisplayEnabled, databaseChartName, theme]
  );

  return <Line redraw={true} options={options} data={data || demoData} />;
};
