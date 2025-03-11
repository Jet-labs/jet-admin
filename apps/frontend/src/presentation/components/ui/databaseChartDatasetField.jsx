import { useCallback, useMemo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { IoClose } from "react-icons/io5";
import { CONSTANTS } from "../../../constants";
import { DatabaseQuery } from "../../../data/models/databaseQuery";
import { GrDrag } from "react-icons/gr";
import ReactJson from "react-json-view";
import { CollapseComponent } from "./collapseComponent";
import { Box } from "@mui/material";
import { DatabaseChartDatasetAdvancedOptions } from "./databaseChartDatasetAdvancedOptions";
import { IoIosColorFilter } from "react-icons/io";
import { BiSitemap } from "react-icons/bi";
import { DatabaseChartDatasetFieldMapping } from "./databaseChartDatasetFieldMapping";
/**
 * @param {object} param0
 * @param {number} param0.index
 * @param {import("formik").FormikProps} param0.chartForm
 * @param {function} param0.setSelectedQueryForTesting
 * @param {Array<DatabaseQuery>} param0.databaseQueries
 * @param {Array<string>} param0.datasetFields
 * @returns {JSX.Element}
 */
export const DatabaseChartDatasetField = ({
  index,
  chartForm,
  setSelectedQueryForTesting,
  databaseQueries,
  datasetFields,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);
  const _handleDeleteDataset = () => {
    let updatedQueryArrayFieldValue = [...chartForm.values.databaseQueries];
    updatedQueryArrayFieldValue.splice(index, 1);
    chartForm.setFieldValue("databaseQueries", updatedQueryArrayFieldValue);
  };

  const _handleUpdateDatasetQueryArgs = useCallback(
    (arg, value) => {
      chartForm.setFieldValue(`databaseQueries[${index}].argsMap`, {
        ...chartForm.values.databaseQueries[index].argsMap,
        [arg]: value,
      });
    },
    [index, chartForm]
  );

  const selectedQuery = useMemo(() => {
    return databaseQueries
      ? databaseQueries.find(
          (q) =>
            parseInt(q.databaseQueryID) ===
            parseInt(
              chartForm.values.databaseQueries[index]?.databaseQueryID || 0
            )
        )
      : null;
  }, [databaseQueries, chartForm.values.databaseQueries, index]);

  const _handleTestQuery = useCallback(() => {
    console.log("query testins", selectedQuery);
    setSelectedQueryForTesting(selectedQuery);
  }, [selectedQuery, setSelectedQueryForTesting]);

  // Check for errors
  const hasQueryIdError =
    chartForm.touched.databaseQueries?.[index]?.databaseQueryID &&
    chartForm.errors.databaseQueries?.[index]?.databaseQueryID;

  const hasTitleError =
    chartForm.touched.databaseQueries?.[index]?.title &&
    chartForm.errors.databaseQueries?.[index]?.title;

  console.log(selectedQuery);
  return (
    <Draggable
      draggableId={`query-${index}`}
      key={`query-${index}`}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          className={`grid grid-cols-1 gap-3 w-full ${
            snapshot.isDragging ? "bg-[#ffe7a4]" : "bg-slate-100"
          } rounded p-2`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* Dataset Title */}
          <div>
            <input
              type="text"
              name={`databaseQueries[${index}].title`}
              id={`databaseQueries[${index}].title`}
              className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                hasTitleError ? "border-red-300" : "border-slate-300"
              } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
              required={true}
              onChange={chartForm.handleChange}
              onBlur={chartForm.handleBlur}
              value={chartForm.values.databaseQueries[index].title || ""}
              placeholder={
                CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_TITLE_LABEL
              }
            />
            {hasTitleError && (
              <p className="mt-1 text-xs text-red-500">
                {chartForm.errors.databaseQueries?.[index]?.title}
              </p>
            )}
          </div>
          {/* Query Selection */}
          <div>
            <select
              name={`databaseQueries[${index}].databaseQueryID`}
              id={`databaseQueries[${index}].databaseQueryID`}
              value={
                chartForm.values.databaseQueries[index].databaseQueryID || ""
              }
              onChange={(e) => {
                chartForm.handleChange(e);
                // Reset argsMap when changing query
                chartForm.setFieldValue(
                  `databaseQueries[${index}].argsMap`,
                  {}
                );
              }}
              onBlur={chartForm.handleBlur}
              className={`placeholder:text-slate-400 text-xs bg-slate-50 border ${
                hasQueryIdError ? "border-red-300" : "border-slate-300"
              } text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full py-1 px-1.5`}
            >
              <option value="" disabled selected>
                Select query dataset
              </option>
              {databaseQueries?.map((databaseQuery) => (
                <option
                  key={`database_query_item_${databaseQuery.databaseQueryID}`}
                  value={databaseQuery.databaseQueryID}
                >
                  {databaseQuery.databaseQueryTitle}
                </option>
              ))}
            </select>
            {hasQueryIdError && (
              <p className="mt-1 text-xs text-red-500">
                {chartForm.errors.databaseQueries?.[index]?.databaseQueryID}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setShowFieldMappingOptions(true)}
              disabled={!selectedQuery}
              className=" disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-300 disabled:hover:bg-transparent focus:outline-none text-xs font-normal hover:text-[#646cff] text-slate-700 flex flex-col gap-1 justify-start items-center bg-slate-100 hover:bg-[#646cff]/10   py-1 px-2 rounded border hover:border-[#646cff] border-slate-300 transition-colors w-fit"
            >
              <BiSitemap className=" text-2xl" />

              {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_MAPPINGS_LABEL}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(true)}
              className="focus:outline-none text-xs font-normal hover:text-[#646cff] text-slate-700 flex flex-col gap-1 justify-start items-center bg-slate-100 hover:bg-[#646cff]/10   py-1 px-2 rounded border hover:border-[#646cff] border-slate-300 transition-colors w-fit"
            >
              <IoIosColorFilter className=" text-2xl" />
              {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_UI_CONFIG_LABEL}
            </button>
          </div>

          <DatabaseChartDatasetAdvancedOptions
            open={showAdvancedOptions}
            onClose={() => setShowAdvancedOptions(false)}
            datasetIndex={index}
            chartForm={chartForm}
            initialValues={chartForm.values.databaseQueries[index]?.parameters}
            parentChartType={chartForm.values.databaseChartType}
          />
          <DatabaseChartDatasetFieldMapping
            open={showFieldMappingOptions}
            onClose={() => setShowFieldMappingOptions(false)}
            datasetIndex={index}
            chartForm={chartForm}
            initialValues={{
              datasetFields:
                chartForm.values.databaseQueries[index]?.datasetFields,
              argsMap: chartForm.values.databaseQueries[index]?.argsMap,
            }}
            selectedQuery={selectedQuery}
            datasetFields={datasetFields}
          />

          {selectedQuery && selectedQuery.databaseQueryResultSchema && (
            <CollapseComponent
              showButtonText={"Query result metadata"}
              hideButtonText={"Hide"}
              containerClass={"mt-2"}
              content={() => (
                <Box
                  sx={{ bgcolor: "background.secondary" }}
                  className="!max-h-32 !overflow-y-auto"
                >
                  <ReactJson
                    src={selectedQuery.databaseQueryResultSchema}
                    theme={"ashes"}
                  />
                </Box>
              )}
            />
          )}
          {/* Query Arguments */}
          {selectedQuery?.databaseQuery?.args?.length > 0 && (
            <div>
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_ARGUMENTS_LABEL}
              </label>
              <div className="space-y-2">
                {selectedQuery.databaseQuery.args.map((arg, argIndex) => {
                  const argName = arg.replace(/[{}]/g, "");
                  return (
                    <div key={`arg-${index}-${argIndex}`}>
                      <input
                        type="text"
                        id={`arg-${index}-${argName}`}
                        className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
                        placeholder={`Value for ${argName}`}
                        value={
                          chartForm.values.databaseQueries[index].argsMap?.[
                            argName
                          ] || ""
                        }
                        onChange={(e) =>
                          _handleUpdateDatasetQueryArgs(argName, e.target.value)
                        }
                        onBlur={chartForm.handleBlur}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {datasetFields?.includes("xAxis") && (
              <div>
                <label
                  htmlFor={`databaseQueries[${index}].datasetFields.xAxis`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_X_AXIS_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`databaseQueries[${index}].datasetFields.xAxis`}
                  id={`databaseQueries[${index}].datasetFields.xAxis`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                    hasTitleError ? "border-red-300" : "border-slate-300"
                  } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={chartForm.handleChange}
                  onBlur={chartForm.handleBlur}
                  value={
                    chartForm.values.databaseQueries[index].datasetFields?.xAxis
                  }
                />
              </div>
            )}
            {datasetFields?.includes("yAxis") && (
              <div>
                <label
                  htmlFor={`databaseQueries[${index}].datasetFields.yAxis`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`databaseQueries[${index}].datasetFields.yAxis`}
                  id={`databaseQueries[${index}].datasetFields.yAxis`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                    hasTitleError ? "border-red-300" : "border-slate-300"
                  } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={chartForm.handleChange}
                  onBlur={chartForm.handleBlur}
                  value={
                    chartForm.values.databaseQueries[index].datasetFields?.yAxis
                  }
                />
              </div>
            )}
            {datasetFields?.includes("label") && (
              <div>
                <label
                  htmlFor={`databaseQueries[${index}].datasetFields.label`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`databaseQueries[${index}].datasetFields.label`}
                  id={`databaseQueries[${index}].datasetFields.label`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                    hasTitleError ? "border-red-300" : "border-slate-300"
                  } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={chartForm.handleChange}
                  onBlur={chartForm.handleBlur}
                  value={
                    chartForm.values.databaseQueries[index].datasetFields?.label
                  }
                />
              </div>
            )}
            {datasetFields?.includes("value") && (
              <div>
                <label
                  htmlFor={`databaseQueries[${index}].datasetFields.value`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`databaseQueries[${index}].datasetFields.value`}
                  id={`databaseQueries[${index}].datasetFields.value`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                    hasTitleError ? "border-red-300" : "border-slate-300"
                  } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={chartForm.handleChange}
                  onBlur={chartForm.handleBlur}
                  value={
                    chartForm.values.databaseQueries[index].datasetFields?.value
                  }
                />
              </div>
            )}
          </div>
          <div className="flex flex-row justify-between items-center gap-2">
            <div
              {...provided.dragHandleProps}
              className="cursor-move text-gray-500 hover:text-gray-700"
            >
              <GrDrag className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex flex-row justify-end items-center gap-2">
              {selectedQuery && (
                <button
                  type="button"
                  onClick={_handleTestQuery}
                  className="focus:outline-none  text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2 rounded border border-slate-300 transition-colors w-fit"
                >
                  Test Query
                </button>
              )}
              <button
                type="button"
                onClick={_handleDeleteDataset}
                className=" focus:outline-none  text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-1 rounded border border-slate-300 transition-colors w-fit"
              >
                <IoClose className="text-base text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
