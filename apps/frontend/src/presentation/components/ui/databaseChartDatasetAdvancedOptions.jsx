import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import { SketchPicker } from "react-color";
import { DATABASE_CHARTS_CONFIG_MAP } from "./graphTypes";
import { CONSTANTS } from "../../../constants";

export const DatabaseChartDatasetAdvancedOptions = ({
  open,
  onClose,
  datasetIndex,
  chartForm,
  initialValues,
  parentChartType,
}) => {
  const chartConfig = DATABASE_CHARTS_CONFIG_MAP[parentChartType];

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
            };
          case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
            return {
              barThickness: 20,
              maxBarThickness: 50,
              barPercentage: 0.8,
              categoryPercentage: 0.8,
              borderRadius: 0,
            };
          case CONSTANTS.DATABASE_CHART_TYPES.PIE_CHART.value:
          case CONSTANTS.DATABASE_CHART_TYPES.DOUGHNUT_CHART.value:
            return {
              rotation: 0,
              circumference: 360,
              cutout: 50,
              offset: 0,
              spacing: 0,
              hoverOffset: 4,
              weight: 1,
            };
          case CONSTANTS.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
            return {
              hitRadius: 1,
              hoverRadius: 4,
              radius: 3,
            };
          default:
            return {};
        }
      })(),
      ...initialValues,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      chartForm.setFieldValue(
        `databaseQueries[${datasetIndex}].parameters`,
        values
      );
      onClose();
    },
  });

  const _renderTypeSpecificFields = (type = parentChartType) => {
    switch (type) {
      case CONSTANTS.DATABASE_CHART_TYPES.LINE_CHART.value:
        return (
          <>
            {/* Line-specific controls */}
            <div className="col-span-2">
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
            <div className="col-span-2">
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
          </>
        );
      case CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value:
        return (
          <>
            {/* Bar-specific controls */}
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
          </>
        );
      // Add cases for other chart types
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.CHART_DATASET_ADV_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4">
        <div className="grid grid-cols-2 gap-4">
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
