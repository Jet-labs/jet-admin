// chartConfig.ts
import { faker } from "@faker-js/faker";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import {
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler,
} from "chart.js";
import { CONSTANTS } from "../../../constants";

export const registerCharts = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
};

export const getDemoData = (type) => {
  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];
  const commonDatasetProps = {
    label: "Dataset 1",
    data: Array.from({ length: 7 }, () =>
      faker.number.int({ min: -1000, max: 1000 })
    ),
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.5)",
  };

  switch (type) {
    case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
      return {
        labels,
        datasets: [
          commonDatasetProps,
          {
            ...commonDatasetProps,
            label: "Dataset 2",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      };
    case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
      return {
        labels,
        datasets: [
          { ...commonDatasetProps, fill: false },
          {
            ...commonDatasetProps,
            label: "Dataset 2",
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      };
    case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
    case CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value:
    case CONSTANTS.DATABASE_CHART_TYPES.RADIAL_CHART.value:
      return {
        labels,
        datasets: [commonDatasetProps],
      };
    case CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
      return {
        labels,
        datasets: [
          {
            label: "Dataset 1",
            data: labels.map(() => ({
              x: faker.number.int({ min: -1000, max: 1000 }),
              y: faker.number.int({ min: -1000, max: 1000 }),
              r: faker.number.int({ min: 5, max: 20 }),
            })),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };
    case CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value:
      return {
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
        ],
      };
    default:
      return { labels, datasets: [] };
  }
};
