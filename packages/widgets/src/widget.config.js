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
import {WIDGET_TYPES} from "@jet-admin/widget-types";

export const registerWidgets = () => {
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
    case WIDGET_TYPES.BAR_CHART.value:
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
    case WIDGET_TYPES.LINE_CHART.value:
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
    case WIDGET_TYPES.PIE_CHART.value:
    case WIDGET_TYPES.RADAR_CHART.value:
    case WIDGET_TYPES.POLAR_AREA.value:
      return {
        labels,
        datasets: [commonDatasetProps],
      };
    case WIDGET_TYPES.BUBBLE_CHART.value:
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
    case WIDGET_TYPES.SCATTER_CHART.value:
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
    case WIDGET_TYPES.TEXT_WIDGET.value:
      return { text: "This is a text widget" };
    case WIDGET_TYPES.TABLE_WIDGET.value:
      return [
        [
          { column1: "value1", column2: "value2" },
          { column1: "value1", column2: "value2" },
        ],
      ];
    default:
      return { labels, datasets: [] };
  }
};
