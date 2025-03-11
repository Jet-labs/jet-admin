import { BarChartComponent } from "./barChartComponent";
import { DoughnutChartComponent } from "./doughnutChartComponent";
import { LineChartComponent } from "./lineChartComponent";
import { PieChartComponent } from "./pieChartComponent";
import { PolarAreaChartComponent } from "./polarAreaChartComponent";
import { RadarChartComponent } from "./radarChartComponent";
import { FaChartBar } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { BiSolidDoughnutChart } from "react-icons/bi";
import { PiChartPolar } from "react-icons/pi";
import { BiRadar } from "react-icons/bi";
import { ScatterChartComponent } from "./scatterChartComponent";
import { CONSTANTS } from "../../../../constants";
import { BubbleChartComponent } from "./bubbleChartComponent";
export const ALL_DATABASE_FIELDS = {};
export const DATABASE_CHARTS_CONFIG_MAP = {
  BAR: {
    label: "Bar",
    value: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: ["xStacked", "yStacked", "indexAxis"],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
      xStacked = true,
      yStacked = true,
      indexAxis = "y",
    }) => (
      <BarChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
        xStacked={xStacked}
        yStacked={yStacked}
        indexAxis={indexAxis}
      />
    ),
    icon: <FaChartBar className="!text-lg" />,
  },
  LINE: {
    label: "Line",
    value: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <LineChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
  PIE: {
    label: "Pie",
    value: CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value,
    datasetFields: ["label", "value"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <PieChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartPie className="!text-lg" />,
  },
  DONUT: {
    label: "Donut",
    value: CONSTANTS.DATABASE_CHART_TYPES.DONUT_CHART.value,
    datasetFields: ["label", "value"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <DoughnutChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <BiSolidDoughnutChart className="!text-lg" />,
  },
  RADIAL: {
    label: "Radial",
    value: CONSTANTS.DATABASE_CHART_TYPES.RADIAL_CHART.value,
    datasetFields: ["label", "value"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <PolarAreaChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <PiChartPolar className="!text-lg" />,
  },
  RADAR: {
    label: "Radar",
    value: CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value,
    datasetFields: ["label", "value"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <RadarChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <BiRadar className="!text-lg" />,
  },
  SCATTER: {
    label: "Scatter",
    value: CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <ScatterChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
  BUBBLE: {
    label: "Bubble",
    value: CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value,
    datasetFields: ["xAxis", "yAxis", "radius"],
    chartFields: {
      required: [
        "data",
        "legendPosition",
        "titleDisplayEnabled",
        "refetchInterval",
      ],
      optional: [],
    },
    component: ({
      databaseChartName,
      legendDisplayEnabled = true,
      legendPosition,
      titleDisplayEnabled = true,
      data,
      refetchInterval,
    }) => (
      <BubbleChartComponent
        legendPosition={legendPosition}
        legendDisplayEnabled={legendDisplayEnabled}
        titleDisplayEnabled={titleDisplayEnabled}
        databaseChartName={databaseChartName}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
};
