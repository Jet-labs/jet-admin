import React, { useCallback, useMemo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { GrDrag } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import { CONSTANTS } from "../../../constants";
// eslint-disable-next-line no-unused-vars
import { DataQuery } from "../../../data/models/dataQuery";
import { BiSitemap } from "react-icons/bi";
import { IoIosColorFilter } from "react-icons/io";
import { WidgetDatasetArguments } from "./widgetDatasetArguments";
import { WidgetDatasetFieldMapping } from "./widgetDatasetFieldMapping";
import PropTypes from "prop-types";
import { WidgetDatasetAdvancedOptions } from "./widgetDatasetAdvancedOptions";

/**
 * @param {object} param0
 * @param {number} param0.index
 * @param {import("formik").FormikProps} param0.widgetForm
 * @param {function} param0.setSelectedQueryForTesting
 * @param {Array<DataQuery>} param0.dataQueries
 * @param {Array<string>} param0.datasetFields
 * @returns {JSX.Element}
 */
export const WidgetDatasetField = ({
  index,
  widgetForm,
  setSelectedQueryForTesting,
  dataQueries,
  datasetFields,
}) => {
  console.log({ datasetFields });
  WidgetDatasetField.propTypes = {
    index: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    setSelectedQueryForTesting: PropTypes.func.isRequired,
    dataQueries: PropTypes.array.isRequired,
    datasetFields: PropTypes.array.isRequired,
  };

  // eslint-disable-next-line no-unused-vars
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);
  const [showArgumentsOptions, setShowArgumentsOptions] = useState(false);
  const _handleDeleteDataset = () => {
    let updatedQueryArrayFieldValue = [...widgetForm.values.dataQueries];
    updatedQueryArrayFieldValue.splice(index, 1);
    widgetForm.setFieldValue("dataQueries", updatedQueryArrayFieldValue);
  };

  const selectedQuery = useMemo(() => {
    return dataQueries
      ? dataQueries.find(
          (q) =>
            parseInt(q.dataQueryID) ===
            parseInt(widgetForm.values.dataQueries[index]?.dataQueryID || 0)
        )
      : null;
  }, [dataQueries, widgetForm.values.dataQueries, index]);

  console.log({ selectedQuery });

  const _handleTestQuery = useCallback(() => {
    setSelectedQueryForTesting(selectedQuery);
  }, [selectedQuery, setSelectedQueryForTesting]);

  // Check for errors
  const hasQueryIdError =
    widgetForm.touched.dataQueries?.[index]?.dataQueryID &&
    widgetForm.errors.dataQueries?.[index]?.dataQueryID;

  const hasTitleError =
    widgetForm.touched.dataQueries?.[index]?.title &&
    widgetForm.errors.dataQueries?.[index]?.title;

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
              name={`dataQueries[${index}].title`}
              id={`dataQueries[${index}].title`}
              className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${
                hasTitleError ? "border-red-300" : "border-slate-300"
              } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
              required={true}
              onChange={widgetForm.handleChange}
              onBlur={widgetForm.handleBlur}
              value={widgetForm.values.dataQueries[index].title || ""}
              placeholder={
                CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_TITLE_LABEL
              }
            />
            {hasTitleError && (
              <p className="mt-1 text-xs text-red-500">
                {widgetForm.errors.dataQueries?.[index]?.title}
              </p>
            )}
          </div>
          {/* Query Selection */}
          <div>
            <select
              name={`dataQueries[${index}].dataQueryID`}
              id={`dataQueries[${index}].dataQueryID`}
              value={widgetForm.values.dataQueries[index].dataQueryID || ""}
              onChange={(e) => {
                widgetForm.handleChange(e);
                // Reset dataQueryArgValues when changing query
                widgetForm.setFieldValue(
                  `dataQueries[${index}].dataQueryArgValues`,
                  {}
                );
              }}
              onBlur={widgetForm.handleBlur}
              className={`placeholder:text-slate-400 text-xs bg-slate-50 border ${
                hasQueryIdError ? "border-red-300" : "border-slate-300"
              } text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full py-1 px-1.5`}
            >
              <option value="" disabled selected>
                Select query dataset
              </option>
              {dataQueries?.map((dataQuery) => (
                <option
                  key={`database_query_item_${dataQuery.dataQueryID}`}
                  value={dataQuery.dataQueryID}
                >
                  {dataQuery.dataQueryTitle}
                </option>
              ))}
            </select>
            {hasQueryIdError && (
              <p className="mt-1 text-xs text-red-500">
                {widgetForm.errors.dataQueries?.[index]?.dataQueryID}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setShowArgumentsOptions(true)}
              disabled={!selectedQuery?.dataQueryOptions?.dataQueryArgs?.length}
              className=" disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-300 disabled:hover:bg-transparent focus:outline-none text-xs font-normal hover:text-[#646cff] text-slate-700 flex flex-col gap-1 justify-start items-center bg-slate-100 hover:bg-[#646cff]/10   py-1 px-2 rounded border hover:border-[#646cff] border-slate-300 transition-colors w-full"
            >
              <BiSitemap className=" text-2xl" />

              {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_ARGUMENTS_LABEL}
            </button>
            <button
              type="button"
              onClick={() => setShowFieldMappingOptions(true)}
              disabled={!selectedQuery}
              className=" disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-300 disabled:hover:bg-transparent focus:outline-none text-xs font-normal hover:text-[#646cff] text-slate-700 flex flex-col gap-1 justify-start items-center bg-slate-100 hover:bg-[#646cff]/10   py-1 px-2 rounded border hover:border-[#646cff] border-slate-300 transition-colors w-full"
            >
              <BiSitemap className=" text-2xl" />

              {
                CONSTANTS.STRINGS
                  .WIDGET_EDITOR_FORM_DATASET_FIELD_MAPPINGS_LABEL
              }
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(true)}
              className="focus:outline-none text-xs font-normal hover:text-[#646cff] text-slate-700 flex flex-col gap-1 justify-start items-center bg-slate-100 hover:bg-[#646cff]/10   py-1 px-2 rounded border hover:border-[#646cff] border-slate-300 transition-colors w-full"
            >
              <IoIosColorFilter className=" text-2xl" />
              {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_UI_CONFIG_LABEL}
            </button>
          </div>

          <WidgetDatasetAdvancedOptions
            open={showAdvancedOptions}
            onClose={() => setShowAdvancedOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={widgetForm.values.dataQueries[index]?.parameters}
            parentWidgetType={widgetForm.values.widgetType}
          />
          <WidgetDatasetFieldMapping
            open={showFieldMappingOptions}
            onClose={() => setShowFieldMappingOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={{
              datasetFields:
                widgetForm.values.dataQueries[index]?.datasetFields,
              dataQueryArgValues:
                widgetForm.values.dataQueries[index]?.dataQueryArgValues,
            }}
            selectedQuery={selectedQuery}
            datasetFields={datasetFields}
          />
          <WidgetDatasetArguments
            open={showArgumentsOptions}
            onClose={() => setShowArgumentsOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={{
              dataQueryArgValues:
                widgetForm.values.dataQueries[index]?.dataQueryArgValues,
            }}
            selectedQuery={selectedQuery}
          />

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
