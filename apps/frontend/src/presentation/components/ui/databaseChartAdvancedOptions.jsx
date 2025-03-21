import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect } from "react";
import { CONSTANTS } from "../../../constants";

const chartOptions = [
  // --- Global Options ---
  {
    name: "Responsive",
    key: "databaseChartConfig.responsive",
    type: "boolean",
    description: "Enable chart responsiveness.",
    defaultValue: true,
    category: "Layout",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Maintain Aspect Ratio",
    key: "databaseChartConfig.maintainAspectRatio",
    type: "boolean",
    description: "Maintain the aspect ratio of the chart.",
    defaultValue: true,
    category: "Layout",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Background Color",
    key: "databaseChartConfig.plugins.customCanvasBackgroundColor.backgroundColor",
    type: "color",
    description: "Background color of the chart area.",
    defaultValue: "rgba(255, 255, 255, 0)",
    category: "Appearance",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Text Color",
    key: "databaseChartConfig.color",
    type: "color",
    description: "Default color for text within the chart.",
    defaultValue: "#666",
    category: "Appearance",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },

  // --- Title Options ---
  {
    name: "Display Title",
    key: "databaseChartConfig.plugins.title.display",
    type: "boolean",
    description: "Display the chart title.",
    defaultValue: false,
    category: "Title",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Title Text",
    key: "databaseChartConfig.plugins.title.text",
    type: "text",
    description: "Text of the chart title.",
    defaultValue: "Chart Title",
    category: "Title",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Title Position",
    key: "databaseChartConfig.plugins.title.position",
    type: "select",
    description: "Position of the chart title.",
    defaultValue: "top",
    options: ["top", "left", "bottom", "right", "center"],
    category: "Title",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Title Font Size",
    key: "databaseChartConfig.plugins.title.font.size",
    type: "number",
    description: "Font size of the chart title.",
    defaultValue: 16,
    category: "Title",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Title Font Color",
    key: "databaseChartConfig.plugins.title.font.color",
    type: "color",
    description: "Font color of the chart title.",
    defaultValue: "#333",
    category: "Title",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },

  // --- Legend Options ---
  {
    name: "Display Legend",
    key: "databaseChartConfig.plugins.legend.display",
    type: "boolean",
    description: "Display the chart legend.",
    defaultValue: true,
    category: "Legend",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Legend Position",
    key: "databaseChartConfig.plugins.legend.position",
    type: "select",
    description: "Position of the chart legend.",
    defaultValue: "top",
    options: ["top", "left", "bottom", "right", "center"],
    category: "Legend",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Legend Font Size",
    key: "databaseChartConfig.plugins.legend.labels.fontSize",
    type: "number",
    description: "Font size of the legend labels.",
    defaultValue: 12,
    category: "Legend",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },
  {
    name: "Legend Font Color",
    key: "databaseChartConfig.plugins.legend.labels.fontColor",
    type: "color",
    description: "Font color of the legend labels.",
    defaultValue: "#666",
    category: "Legend",
    relevantCharts: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "scatter",
    ],
  },

  // --- Line Chart Options ---
  {
    name: "Show Line",
    key: "databaseChartConfig.showLine",
    type: "boolean",
    description: "Show or hide the line in line charts.",
    defaultValue: true,
    category: "Line",
    relevantCharts: ["line"],
  },
  {
    name: "Line Tension",
    key: "databaseChartConfig.tension",
    type: "slider",
    description: "Line tension (0 = straight, 1 = curved).",
    defaultValue: 0.4,
    min: 0,
    max: 1,
    step: 0.01,
    category: "Line",
    relevantCharts: ["line"],
  },
  {
    name: "Fill",
    key: "databaseChartConfig.fill",
    type: "boolean",
    description: "Fill the area under the line.",
    defaultValue: false,
    category: "Line",
    relevantCharts: ["line"],
  },

  // --- Point Options (Line and Scatter) ---
  {
    name: "Point Radius",
    key: "databaseChartConfig.pointRadius",
    type: "number",
    description: "Radius of the points.",
    defaultValue: 3,
    category: "Point",
    relevantCharts: ["line", "scatter"],
  },
  {
    name: "Point Style",
    key: "databaseChartConfig.pointStyle",
    type: "select",
    description: "Style of the points.",
    defaultValue: "circle",
    options: [
      "circle",
      "triangle",
      "rect",
      "rectRounded",
      "rectRot",
      "cross",
      "crossRot",
      "star",
      "line",
      "dash",
    ],
    category: "Point",
    relevantCharts: ["line", "scatter"],
  },

  // --- Pie & Doughnut Options ---
  {
    name: "Rotation",
    key: "databaseChartConfig.rotation",
    type: "number",
    description: "Starting angle to draw arcs for a pie chart.",
    defaultValue: -90,
    category: "Pie/Doughnut",
    relevantCharts: ["pie", "doughnut"],
  },
  {
    name: "Circumference",
    key: "databaseChartConfig.circumference",
    type: "number",
    description: "Sweep to allow arcs to cover.",
    defaultValue: 360,
    category: "Pie/Doughnut",
    relevantCharts: ["pie", "doughnut"],
  },
  {
    name: "Pie Spacing",
    key: "databaseChartConfig.spacing",
    type: "number",
    description: "Space between data sets.",
    defaultValue: 0,
    category: "Pie/Doughnut",
    relevantCharts: ["pie", "doughnut"],
  },
  {
    name: "Cutout",
    key: "databaseChartConfig.cutout",
    type: "slider",
    description: "The portion of the chart that is cut out of the middle.",
    defaultValue: 0,
    min: 0,
    max: 100,
    step: 1,
    category: "Pie/Doughnut",
    relevantCharts: ["doughnut"],
  },

  // --- Radar Chart Options ---
  {
    name: "Angle Line Color",
    key: "databaseChartConfig.angleLines.color",
    type: "color",
    description: "Color of the angle lines.",
    defaultValue: "rgba(0, 0, 0, 0.1)",
    category: "Radar",
    relevantCharts: ["radar"],
  },
  {
    name: "Angle Line Width",
    key: "databaseChartConfig.angleLines.lineWidth",
    type: "number",
    description: "Width of the angle lines.",
    defaultValue: 1,
    category: "Radar",
    relevantCharts: ["radar"],
  },

  // --- Polar Area Chart Options ---
  {
    name: "Start Angle",
    key: "databaseChartConfig.startAngle",
    type: "number",
    description: "Starting angle to draw arcs for a polar area chart.",
    defaultValue: 0,
    category: "Polar Area",
    relevantCharts: ["polarArea"],
  },
  {
    name: "Spacing",
    key: "databaseChartConfig.spacing",
    type: "number",
    description: "Space between data sets.",
    defaultValue: 0,
    category: "Polar Area",
    relevantCharts: ["polarArea"],
  },
  // --- Scatter Chart Options ---
  {
    name: "Show X Axis",
    key: "databaseChartConfig.scales.x.display",
    type: "boolean",
    description: "Show or hide the X axis.",
    defaultValue: true,
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
  {
    name: "X Axis Label",
    key: "databaseChartConfig.scales.x.title.display",
    type: "boolean",
    description: "Show or hide the X axis label.",
    defaultValue: false,
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
  {
    name: "X Axis Label Text",
    key: "databaseChartConfig.scales.x.title.text",
    type: "text",
    description: "Text for the X axis label.",
    defaultValue: "X Axis",
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
  {
    name: "Show Y Axis",
    key: "databaseChartConfig.scales.y.display",
    type: "boolean",
    description: "Show or hide the Y axis.",
    defaultValue: true,
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
  {
    name: "Y Axis Label",
    key: "databaseChartConfig.scales.y.title.display",
    type: "boolean",
    description: "Show or hide the Y axis label.",
    defaultValue: false,
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
  {
    name: "Y Axis Label Text",
    key: "databaseChartConfig.scales.y.title.text",
    type: "text",
    description: "Text for the Y axis label.",
    defaultValue: "Y Axis",
    category: "Scatter",
    relevantCharts: ["scatter"],
  },
];
export const DatabaseChartAdvancedOptions = ({
  open,
  onClose,
  chartForm,
  parentChartType,
  initialValues: initialOpts = {},
}) => {
  const form = useFormik({
    initialValues: {
      responsive: true,
      maintainAspectRatio: true,
      backgroundColor: "rgba(255, 255, 255, 0)",
      color: "#666",
      plugins: {
        title: {
          display: false,
          text: "Chart Title",
          position: "top",
          font: { size: 16, color: "#333" },
        },
        legend: {
          display: true,
          position: "top",
          labels: { font: { size: 12, color: "#666" } },
        },
      },
      scales: {
        x: { display: true, title: { display: false, text: "X Axis" } },
        y: { display: true, title: { display: false, text: "Y Axis" } },
      },
      ...initialOpts,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      chartForm.setFieldValue("databaseChartConfig", values);
      onClose();
    },
  });

  const renderOption = (option) => {
    const { key, type, description, options: selectOptions, ...rest } = option;

    if (!option.relevantCharts.includes(parentChartType)) return null;

    const formValue = key
      .split(".")
      .reduce((acc, part) => acc?.[part], chartForm.values.databaseChartConfig);

    const commonProps = {
      key,
      className:
        "w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded",
      value: formValue,
      onChange: (e) => {
        const value =
          type === "number"
            ? +e.target.value
            : type === "boolean"
            ? e.target.value === "true"
            : e.target.value;

        chartForm.setFieldValue(key, value);
      },
    };

    switch (type) {
      case "boolean":
        return (
          <select {...commonProps}>
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        );

      case "color":
        return <input type="color" {...commonProps} />;

      case "select":
        return (
          <select {...commonProps}>
            {selectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        );

      case "slider":
        return (
          <input
            type="range"
            min={rest.min}
            max={rest.max}
            step={rest.step}
            {...commonProps}
          />
        );

      default:
        return <input type={type} {...commonProps} />;
    }
  };

  return (
    
      <div className="grid grid-cols-2 gap-4 p-0 mt-2">
        {chartOptions.map((option) => (
          <div key={option.key} className="col-span-1">
            <label className="block mb-2 text-xs font-medium text-slate-600">
              {option.name}
              <span className="text-slate-400 text-[10px] block">
                {option.description}
              </span>
            </label>
            {renderOption(option)}
          </div>
        ))}
        
      </div>
  );
};
