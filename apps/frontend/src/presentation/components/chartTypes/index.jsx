import React from "react";
import { BarChartComponent } from "./barChartComponent";
import { LineChartComponent } from "./lineChartComponent";
import { PieChartComponent } from "./pieChartComponent";
import { PolarAreaChartComponent } from "./polarAreaChartComponent";
import { RadarChartComponent } from "./radarChartComponent";
import { FaChartBar } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { PiChartPolar } from "react-icons/pi";
import { BiRadar } from "react-icons/bi";
import { ScatterChartComponent } from "./scatterChartComponent";
import { CONSTANTS } from "../../../constants";
import { BubbleChartComponent } from "./bubbleChartComponent";
import { registerCharts } from "./chartConfig";
export const ALL_DATABASE_FIELDS = {};
registerCharts();
export const DATABASE_CHARTS_CONFIG_MAP = {
  bar: {
    label: "Bar",
    value: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    description: "Compare categorical data with rectangular bars",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <BarChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <FaChartBar className="!text-lg" />,
  },
  line: {
    label: "Line",
    value: CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    description: "Display trends over time/intervals",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <LineChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
  pie: {
    label: "Pie",
    value: CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value,
    datasetFields: ["label", "value"],
    description: "Show proportional relationships",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <PieChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <FaChartPie className="!text-lg" />,
  },
  polarArea: {
    label: "PolarArea",
    value: CONSTANTS.DATABASE_CHART_TYPES.POLAR_AREA.value,
    datasetFields: ["label", "value"],
    description: "Display data in a circular gauge format",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <PolarAreaChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <PiChartPolar className="!text-lg" />,
  },
  radar: {
    label: "Radar",
    value: CONSTANTS.DATABASE_CHART_TYPES.RADAR_CHART.value,
    datasetFields: ["label", "value"],
    description: "Compare multiple variables in a radial display",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <RadarChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <BiRadar className="!text-lg" />,
  },
  scatter: {
    label: "Scatter",
    value: CONSTANTS.DATABASE_CHART_TYPES.SCATTER_CHART.value,
    datasetFields: ["xAxis", "yAxis"],
    description: "Plot individual data points on a graph",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <ScatterChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
  bubble: {
    label: "Bubble",
    value: CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value,
    datasetFields: ["xAxis", "yAxis", "radius"],
    description: "Display three dimensions of data with size-varying points",
    component: ({
      data,
      refetchInterval,
      onChartInit,
      databaseChartConfig,
    }) => (
      <BubbleChartComponent
        data={data}
        refetchInterval={refetchInterval}
        onChartInit={onChartInit}
        databaseChartConfig={databaseChartConfig}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
};
