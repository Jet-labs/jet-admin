import React from "react";
import { FaChartBar, FaTable } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { PiChartPolar } from "react-icons/pi";
import { BiRadar } from "react-icons/bi";
import { MdOutlineTextFields } from "react-icons/md";
import { TextWidgetComponent } from "./text";
import { BarChartComponent } from "./bar";
import { LineChartComponent } from "./line";
import { PieChartComponent } from "./pie";
import { PolarAreaChartComponent } from "./polarArea";
import { RadarChartComponent } from "./radar";
import { ScatterChartComponent } from "./scatter";
import { BubbleChartComponent } from "./bubble";

import { getDemoData, registerWidgets } from "./widget.config";
import { TableWidgetComponent } from "./table";
import {WIDGET_TYPES,WIDGET_INITIAL_CONFIG} from "@jet-admin/widget-types";

// Register widgets
registerWidgets();

// All widget dataset fields
export const ALL_WIDGET_DATASET_FIELDS = {
    text: ["text"],
    bar: ["xAxis", "yAxis"],
    line: ["xAxis", "yAxis"],
    pie: ["label", "value"],
    polarArea: ["label", "value"],
    radar: ["label", "value"],
    scatter: ["xAxis", "yAxis"],
    bubble: ["xAxis", "yAxis", "radius"],
    table: [],  
};

// Widget map
export const WIDGETS_MAP = {
  text: {
    label: "Text",
    value: WIDGET_TYPES.TEXT_WIDGET.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.text,
    component: ({ data, ...props }) => (
      <TextWidgetComponent
        data={data || getDemoData(WIDGET_TYPES.TEXT_WIDGET.value)}
        {...props}
      />
    ),
    icon: ({ className }) => (
      <MdOutlineTextFields className={`!text-lg ${className}`} />
    ),
    sampleConfig: WIDGET_INITIAL_CONFIG.text,
  },
  bar: {
    label: "Bar",
    value: WIDGET_TYPES.BAR_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.bar,
    description: "Compare categorical data with rectangular bars",
    component: ({ data, ...props }) => (
      <BarChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.BAR_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => <FaChartBar className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.bar,
  },
  line: {
    label: "Line",
    value: WIDGET_TYPES.LINE_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.line,
    description: "Display trends over time/intervals",
    component: ({ data, ...props }) => (
      <LineChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.LINE_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => (
      <FaChartLine className={`!text-lg ${className}`} />
    ),
    sampleConfig: WIDGET_INITIAL_CONFIG.line,
  },
  pie: {
    label: "Pie",
    value: WIDGET_TYPES.PIE_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.pie,
    description: "Show proportional relationships",
    component: ({ data, ...props }) => (
      <PieChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.PIE_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => <FaChartPie className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.pie,
  },
  polarArea: {
    label: "PolarArea",
    value: WIDGET_TYPES.POLAR_AREA.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.polarArea,
    description: "Display data in a circular gauge format",
    component: ({ data, ...props }) => (
      <PolarAreaChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.POLAR_AREA.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => (
      <PiChartPolar className={`!text-lg ${className}`} />
    ),
    sampleConfig: WIDGET_INITIAL_CONFIG.polarArea,
  },
  radar: {
    label: "Radar",
    value: WIDGET_TYPES.RADAR_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.radar,
    description: "Compare multiple variables in a radial display",
    component: ({ data, ...props }) => (
      <RadarChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.RADAR_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => <BiRadar className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.radar,
  },
  scatter: {
    label: "Scatter",
    value: WIDGET_TYPES.SCATTER_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.scatter,
    description: "Plot individual data points on a graph",
    component: ({ data, ...props }) => (
      <ScatterChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.SCATTER_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => (
      <FaChartLine className={`!text-lg ${className}`} />
    ),
    sampleConfig: WIDGET_INITIAL_CONFIG.scatter,
  },
  bubble: {
    label: "Bubble",
    value: WIDGET_TYPES.BUBBLE_CHART.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.bubble,
    description: "Display three dimensions of data with size-varying points",
    component: ({ data, ...props }) => (
      <BubbleChartComponent
        data={
          data && data.datasets
            ? data
            : getDemoData(WIDGET_TYPES.BUBBLE_CHART.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => (
      <FaChartLine className={`!text-lg ${className}`} />
    ),
    sampleConfig: WIDGET_INITIAL_CONFIG.bubble,
  },
  table: {
    label: "Table",
    value: WIDGET_TYPES.TABLE_WIDGET.value,
    datasetFields: ALL_WIDGET_DATASET_FIELDS.table,
    description: "Display data in a tabular format",
    component: ({ data, ...props }) => (
      <TableWidgetComponent
        data={
          data && data.length > 0
            ? data
            : getDemoData(WIDGET_TYPES.TABLE_WIDGET.value)
        }
        {...props}
      />
    ),
    icon: ({ className }) => <FaTable className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.table,
  },
};
