import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";
import { formValidations } from "../../../utils/formValidation";

export const DatabaseChartDatasetAdvancedOptions = ({
  open,
  onClose,
  datasetIndex,
  chartForm,
  initialValues,
  parentChartType,
}) => {
  const datasetAdvancedOptionsForm = useFormik({
    initialValues: {
      // Core dataset properties
      type: parentChartType,
      xAxisID: "x",
      yAxisID: "y",
      hidden: false,
      order: 0,
      clip: true,

      // Element configuration
      backgroundColor: "#ffffff",
      borderColor: "#000000",
      borderWidth: 2,
      borderDash: [],
      borderDashOffset: 0,
      borderRadius: 0,
      hoverBackgroundColor: "#ffffff",
      hoverBorderColor: "#000000",
      hoverBorderWidth: 2,

      // Type-specific configurations
      ...(() => {
        switch (parentChartType) {
          case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
            return {
              tension: 0.4,
              stepped: false,
              pointRadius: 3,
              pointStyle: "circle",
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#000000",
              pointBorderWidth: 1,
              pointHitRadius: 1,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: "#ffffff",
              pointHoverBorderColor: "#000000",
              pointHoverBorderWidth: 1,
              fill: false,
              pointRotation: 0,
              showLine: true,
              spanGaps: false,
              borderCapStyle: "butt",
              borderJoinStyle: "miter",
            };
          case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
            return {
              base: null,
              barPercentage: 0.8,
              barThickness: 20,
              maxBarThickness: 50,
              borderSkipped: true,
              categoryPercentage: 0.8,
              borderRadius: 0,
              grouped: true,
              hoverBorderRadius: 0,
              indexAxis: "x",
              stack: "bar",
              minBarLength: 0,
            };
          case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
            return {
              rotation: 0,
              circumference: 360,
              cutout: 50,
              offset: 0,
              spacing: 0,
              hoverOffset: 4,
              weight: 1,
              borderAlign: "center",
              borderWidth: 2,
              hoverBorderWidth: 2,
              hoverBorderColor: "#000000",
            };
          case CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
            return {
              hitRadius: 1,
              hoverRadius: 4,
              radius: 3,
              pointStyle: "circle",
              rotation: 0,
              borderWidth: 2,
            };
          default:
            return {};
        }
      })(),
      ...initialValues,
    },
    validationSchema:
      formValidations.datasetAdvancedOptionsFormValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      chartForm.setFieldValue(
        `databaseQueries[${datasetIndex}].parameters`,
        values
      );
      onClose();
    },
  });

  const _handleFillChange = (e) => {
    const value = e.target.value;
    let fillValue;
    if (value === "true") {
      fillValue = true;
    } else if (value === "false") {
      fillValue = false;
    } else {
      fillValue = value;
    }
    datasetAdvancedOptionsForm.setFieldValue("fill", fillValue);
  };
  const _renderTypeSpecificFields = (type = parentChartType) => {
    switch (type) {
      case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
        return (
          <>
            {/* Line-specific controls */}
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_LINE_TENSION_LABEL}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={datasetAdvancedOptionsForm.values.tension}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="tension"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_LINE_STEPPED_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.stepped}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="stepped"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="middle">Middle</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_POINT_RADIUS_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_POINT_STYLE_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.pointStyle}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointStyle"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                {[
                  "circle",
                  "cross",
                  "crossRot",
                  "dash",
                  "line",
                  "rect",
                  "rectRounded",
                  "rectRot",
                  "star",
                  "triangle",
                ].map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_BACKGROUND_COLOR_LABEL
                }
              </label>
              <input
                type="color"
                value={datasetAdvancedOptionsForm.values.pointBackgroundColor}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointBackgroundColor"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_BORDER_COLOR_LABEL
                }
              </label>
              <input
                type="color"
                value={datasetAdvancedOptionsForm.values.pointBorderColor}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointBorderColor"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_BORDER_WIDTH_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointBorderWidth}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointBorderWidth"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_HIT_RADIUS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointHitRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointHitRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_HOVER_RADIUS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointHoverRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointHoverRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_HOVER_BACKGROUND_COLOR_LABEL
                }
              </label>
              <input
                type="color"
                value={
                  datasetAdvancedOptionsForm.values.pointHoverBackgroundColor
                }
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointHoverBackgroundColor"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_HOVER_BORDER_COLOR_LABEL
                }
              </label>
              <input
                type="color"
                value={datasetAdvancedOptionsForm.values.pointHoverBorderColor}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointHoverBorderColor"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_HOVER_BORDER_WIDTH_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointHoverBorderWidth}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointHoverBorderWidth"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_FILL_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.fill}
                onChange={_handleFillChange}
                name="fill"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value={"false"}>False</option>
                <option value={"true"}>True</option>
                <option value="origin">Origin</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="shape">Shape</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_POINT_ROTATION_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.pointRotation}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointRotation"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_SHOW_LINE_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.showLine}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="showLine"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_SPAN_GAPS_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.spanGaps}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="spanGaps"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BORDER_CAP_STYLE_LABEL
                }
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.borderCapStyle}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderCapStyle"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value="butt">Butt</option>
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BORDER_JOIN_STYLE_LABEL
                }
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.borderJoinStyle}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderJoinStyle"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value="miter">Miter</option>
                <option value="round">Round</option>
                <option value="bevel">Bevel</option>
              </select>
            </div>
          </>
        );
      case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
        return (
          <>
            {/* Bar-specific controls */}
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BASE_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.base}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="base"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BAR_PERCENTAGE_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.barPercentage}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="barPercentage"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_MAX_BAR_THICKNESS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.maxBarThickness}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="maxBarThickness"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_CATEGORY_PERCENTAGE_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.categoryPercentage}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="categoryPercentage"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BAR_THICKNESS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.barThickness}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="barThickness"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BORDER_RADIUS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.borderRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_BORDER_SKIPPED_LABEL
                }
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.borderSkipped}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderSkipped"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                {[
                  true,
                  false,
                  "start",
                  "end",
                  "middle",
                  "bottom",
                  "left",
                  "top",
                  "right",
                ].map((v) => (
                  <option key={v} value={v}>
                    {String(v)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_GROUPED_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.grouped}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="grouped"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                {[true, false].map((v) => (
                  <option key={v} value={v}>
                    {String(v)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_HOVER_BORDER_RADIUS_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.hoverBorderRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hoverBorderRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_INDEX_AXIS_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.indexAxis}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="indexAxis"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value="x">X</option>
                <option value="y">Y</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_STACK_LABEL}
              </label>
              <input
                type="text"
                value={datasetAdvancedOptionsForm.values.stack}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="stack"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_MIN_BAR_LENGTH_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.minBarLength}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="minBarLength"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
          </>
        );
      case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
        return (
          <>
            {/* Pie/Doughnut-specific controls */}
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_ROTATION_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.rotation}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="rotation"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_CIRCUMFERENCE_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.circumference}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="circumference"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_CUTOUT_LABEL}
              </label>
              <input
                type="text"
                value={datasetAdvancedOptionsForm.values.cutout}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="cutout"
                placeholder="e.g., 50 or '50%'"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_OFFSET_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.offset}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="offset"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_SPACING_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.spacing}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="spacing"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_HOVER_OFFSET_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.hoverOffset}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hoverOffset"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_WEIGHT_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.weight}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="weight"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_ALIGN_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.borderAlign}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderAlign"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                <option value="center">Center</option>
                <option value="inner">Inner</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_WIDTH_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.borderWidth}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderWidth"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_HOVER_BORDER_WIDTH_LABEL
                }
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.hoverBorderWidth}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hoverBorderWidth"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {
                  CONSTANTS.STRINGS
                    .CHART_DATASET_ADV_DATASET_HOVER_BORDER_COLOR_LABEL
                }
              </label>
              <input
                type="color"
                value={datasetAdvancedOptionsForm.values.hoverBorderColor}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hoverBorderColor"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
          </>
        );
      case CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
        return (
          <>
            {/* Bubble-specific controls */}
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_HIT_RADIUS_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.hitRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hitRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_HOVER_RADIUS_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.hoverRadius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="hoverRadius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_RADIUS_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.radius}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="radius"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_POINT_STYLE_LABEL}
              </label>
              <select
                value={datasetAdvancedOptionsForm.values.pointStyle}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="pointStyle"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              >
                {[
                  "circle",
                  "cross",
                  "crossRot",
                  "dash",
                  "line",
                  "rect",
                  "rectRounded",
                  "rectRot",
                  "star",
                  "triangle",
                ].map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_ROTATION_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.rotation}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="rotation"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_WIDTH_LABEL}
              </label>
              <input
                type="number"
                value={datasetAdvancedOptionsForm.values.borderWidth}
                onChange={datasetAdvancedOptionsForm.handleChange}
                name="borderWidth"
                className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.CHART_DATASET_ADV_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Common fields */}
          <div className="col-span-2">
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_TYPE_LABEL}
            </label>
            <select
              value={datasetAdvancedOptionsForm.values.type}
              onChange={(e) =>
                datasetAdvancedOptionsForm.setFieldValue("type", e.target.value)
              }
              className={`placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full py-1 px-1.5`}
            >
              {Object.values(DATABASE_CHARTS_CONFIG_MAP).map((config) => (
                <option key={config.value} value={config.value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color pickers */}
          <div className="col-span-1">
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {
                CONSTANTS.STRINGS
                  .CHART_DATASET_ADV_DATASET_BACKGROUND_COLOR_LABEL
              }
            </label>
            <input
              type="color"
              value={datasetAdvancedOptionsForm.values.backgroundColor}
              onChange={datasetAdvancedOptionsForm.handleChange}
              name="backgroundColor"
              className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
            />
          </div>
          <div className="col-span-1">
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_COLOR_LABEL}
            </label>
            <input
              type="color"
              value={datasetAdvancedOptionsForm.values.borderColor}
              onChange={datasetAdvancedOptionsForm.handleChange}
              name="borderColor"
              className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
            />
          </div>

          {/* Border settings */}
          <div className="col-span-1">
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_WIDTH_LABEL}
            </label>
            <input
              type="number"
              value={datasetAdvancedOptionsForm.values.borderWidth}
              onChange={datasetAdvancedOptionsForm.handleChange}
              name="borderWidth"
              className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
            />
          </div>
          <div className="col-span-1">
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {CONSTANTS.STRINGS.CHART_DATASET_ADV_DATASET_BORDER_DASH_LABEL}
            </label>
            <input
              type="text"
              value={datasetAdvancedOptionsForm.values.borderDash.join(",")}
              onChange={(e) =>
                datasetAdvancedOptionsForm.setFieldValue(
                  "borderDash",
                  e.target.value.split(",").map(Number)
                )
              }
              placeholder="e.g., 5,5"
              className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
            />
          </div>

          {/* Type-specific fields */}
          {_renderTypeSpecificFields(datasetAdvancedOptionsForm.values.type)}
        </div>
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={onClose}
          type="button"
          className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
        >
          {CONSTANTS.STRINGS.CHART_DATASET_ADV_CANCEL}
        </button>

        <button
          type="button"
          onClick={datasetAdvancedOptionsForm.handleSubmit}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
        >
          {CONSTANTS.STRINGS.CHART_DATASET_ADV_CONFIRM}
        </button>
      </DialogActions>
    </Dialog>
  );
};
