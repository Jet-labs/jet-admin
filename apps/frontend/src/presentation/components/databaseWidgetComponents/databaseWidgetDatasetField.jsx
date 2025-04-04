import { useCallback, useMemo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { IoClose } from "react-icons/io5";
import { CONSTANTS } from "../../../constants";
import { DatabaseQuery } from "../../../data/models/databaseQuery";
import { GrDrag } from "react-icons/gr";

// import { DatabaseWidgetDatasetAdvancedOptions } from "./databaseWidgetDatasetAdvancedOptions";
import { IoIosColorFilter } from "react-icons/io";
import { BiSitemap } from "react-icons/bi";
import { DatabaseWidgetDatasetFieldMapping } from "./databaseWidgetDatasetFieldMapping";
import { DatabaseWidgetDatasetArguments } from "./databaseWidgetDatasetArguments";
/**
 * @param {object} param0
 * @param {number} param0.index
 * @param {import("formik").FormikProps} param0.widgetForm
 * @param {function} param0.setSelectedQueryForTesting
 * @param {Array<DatabaseQuery>} param0.databaseQueries
 * @param {Array<string>} param0.datasetFields
 * @returns {JSX.Element}
 */
export const DatabaseWidgetDatasetField = ({
  index,
  widgetForm,
  setSelectedQueryForTesting,
  databaseQueries,
  datasetFields,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);
  const [showArgumentsOptions, setShowArgumentsOptions] = useState(false);
  const _handleDeleteDataset = () => {
    let updatedQueryArrayFieldValue = [...widgetForm.values.databaseQueries];
    updatedQueryArrayFieldValue.splice(index, 1);
    widgetForm.setFieldValue("databaseQueries", updatedQueryArrayFieldValue);
  };

  const selectedQuery = useMemo(() => {
    return databaseQueries
      ? databaseQueries.find(
          (q) =>
            parseInt(q.databaseQueryID) ===
            parseInt(
              widgetForm.values.databaseQueries[index]?.databaseQueryID || 0
            )
        )
      : null;
  }, [databaseQueries, widgetForm.values.databaseQueries, index]);

  const _handleTestQuery = useCallback(() => {
    setSelectedQueryForTesting(selectedQuery);
  }, [selectedQuery, setSelectedQueryForTesting]);

  // Check for errors
  const hasQueryIdError =
    widgetForm.touched.databaseQueries?.[index]?.databaseQueryID &&
    widgetForm.errors.databaseQueries?.[index]?.databaseQueryID;

  const hasTitleError =
    widgetForm.touched.databaseQueries?.[index]?.title &&
    widgetForm.errors.databaseQueries?.[index]?.title;

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
              onChange={widgetForm.handleChange}
              onBlur={widgetForm.handleBlur}
              value={widgetForm.values.databaseQueries[index].title || ""}
              placeholder={
                CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_TITLE_LABEL
              }
            />
            {hasTitleError && (
              <p className="mt-1 text-xs text-red-500">
                {widgetForm.errors.databaseQueries?.[index]?.title}
              </p>
            )}
          </div>
          {/* Query Selection */}
          <div>
            <select
              name={`databaseQueries[${index}].databaseQueryID`}
              id={`databaseQueries[${index}].databaseQueryID`}
              value={
                widgetForm.values.databaseQueries[index].databaseQueryID || ""
              }
              onChange={(e) => {
                widgetForm.handleChange(e);
                // Reset databaseQueryArgValues when changing query
                widgetForm.setFieldValue(
                  `databaseQueries[${index}].databaseQueryArgValues`,
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
                {widgetForm.errors.databaseQueries?.[index]?.databaseQueryID}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setShowArgumentsOptions(true)}
              disabled={
                !selectedQuery?.databaseQueryData?.databaseQueryArgs?.length
              }
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

          {/* <DatabaseWidgetDatasetAdvancedOptions
            open={showAdvancedOptions}
            onClose={() => setShowAdvancedOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={widgetForm.values.databaseQueries[index]?.parameters}
            parentWidgetType={widgetForm.values.databaseWidgetType}
          /> */}
          <DatabaseWidgetDatasetFieldMapping
            open={showFieldMappingOptions}
            onClose={() => setShowFieldMappingOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={{
              datasetFields:
                widgetForm.values.databaseQueries[index]?.datasetFields,
              databaseQueryArgValues:
                widgetForm.values.databaseQueries[index]
                  ?.databaseQueryArgValues,
            }}
            selectedQuery={selectedQuery}
            datasetFields={datasetFields}
          />
          <DatabaseWidgetDatasetArguments
            open={showArgumentsOptions}
            onClose={() => setShowArgumentsOptions(false)}
            datasetIndex={index}
            widgetForm={widgetForm}
            initialValues={{
              databaseQueryArgValues:
                widgetForm.values.databaseQueries[index]
                  ?.databaseQueryArgValues,
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
