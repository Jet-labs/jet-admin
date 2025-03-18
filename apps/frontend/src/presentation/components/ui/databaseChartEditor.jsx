import { useCallback, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useDatabaseChartsState } from "../../../logic/contexts/databaseChartsContext";
import { DatabaseChartDatasetField } from "./databaseChartDatasetField";
import { DATABASE_CHARTS_CONFIG_MAP } from "./chartTypes";
import { DatabaseQueryTestingPanel } from "./databaseQueryTestingPanel";

export const DatabaseChartEditor = ({ databaseChartEditorForm }) => {
  const {
    databaseQueries,
    isLoadingDatabaseQueries,
    isFetchingDatabaseQueries,
  } = useDatabaseChartsState();

  const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(false);

  const _handleAddDataset = useCallback(() => {
    databaseChartEditorForm.setFieldValue("databaseQueries", [
      ...databaseChartEditorForm.values["databaseQueries"],
      {
        title: "",
        databaseQueryID: "",
        parameters: {
          type: CONSTANTS.DATABASE_CHART_TYPES.BAR_CHART.value,
          color: "#D84545",
        },
        argsMap: {},
        datasetFields: {
          xAxis: "",
          yAxis: "",
        },
      },
    ]);
  }, [databaseChartEditorForm]);

  const _handleOnDatabaseQueryListDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(databaseChartEditorForm.values.databaseQueries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    databaseChartEditorForm.setFieldValue("databaseQueries", items);
  };

  const _checkIfFieldInConfig = useCallback(
    (field) => {
      return (
        DATABASE_CHARTS_CONFIG_MAP[
          databaseChartEditorForm.values.databaseChartType
        ].chartFields.required.includes(field) ||
        DATABASE_CHARTS_CONFIG_MAP[
          databaseChartEditorForm.values.databaseChartType
        ].chartFields.optional.includes(field)
      );
    },
    [databaseChartEditorForm, databaseChartEditorForm.values]
  );

  return (
    <>
      <DatabaseQueryTestingPanel
        selectedQueryForTesting={selectedQueryForTesting}
        setSelectedQueryForTesting={setSelectedQueryForTesting}
      />
      <div>
        <label
          for="databaseChartName"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="databaseChartName"
          id="databaseChartName"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.CHART_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={databaseChartEditorForm.handleChange}
          onBlur={databaseChartEditorForm.handleBlur}
          value={databaseChartEditorForm.values.databaseChartName}
        />
      </div>

      <div>
        <label
          for="databaseChartType"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_TYPE_FIELD_LABEL}
        </label>
        <select
          name="databaseChartType"
          value={databaseChartEditorForm.values.databaseChartType}
          onChange={databaseChartEditorForm.handleChange}
          onBlur={databaseChartEditorForm.handleBlur}
          className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
        >
          {Object.keys(CONSTANTS.DATABASE_CHART_TYPES).map((chartType) => (
            <option
              key={CONSTANTS.DATABASE_CHART_TYPES[chartType].value}
              value={CONSTANTS.DATABASE_CHART_TYPES[chartType].value}
            >
              {CONSTANTS.DATABASE_CHART_TYPES[chartType].name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex flex-row justify-start gap-2 my-1 ml-0.5 items-center cursor-pointer w-full">
        {/* Checkbox Input */}
        <input
          type="checkbox"
          name="databaseChartConfig.titleDisplayEnabled"
          checked={
            databaseChartEditorForm.values.databaseChartConfig
              .titleDisplayEnabled
          }
          onChange={databaseChartEditorForm.handleChange}
          onBlur={databaseChartEditorForm.handleBlur}
          className="form-checkbox h-4 w-4 text-[#646cff] rounded-md border-gray-300 focus:ring-[#646cff]"
        />

        {/* Label Text */}
        <span className="block text-xs font-medium text-slate-500">
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_TITLE_ENABLED_FIELD_LABEL}
        </span>
      </label>
      <label className="flex flex-row justify-start gap-2 my-1 ml-0.5 items-center cursor-pointer w-full">
        {/* Checkbox Input */}
        <input
          type="checkbox"
          name="databaseChartConfig.legendDisplayEnabled"
          checked={
            databaseChartEditorForm.values.databaseChartConfig
              .legendDisplayEnabled
          }
          onChange={databaseChartEditorForm.handleChange}
          onBlur={databaseChartEditorForm.handleBlur}
          className="form-checkbox h-4 w-4 text-[#646cff] rounded-md border-gray-300 focus:ring-[#646cff]"
        />

        {/* Label Text */}
        <span className="block text-xs font-medium text-slate-500">
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_LEGEND_ENABLED_FIELD_LABEL}
        </span>
      </label>

      {databaseChartEditorForm.values.databaseChartConfig
        .legendDisplayEnabled && (
        <div>
          <label
            for="databaseChartConfig.legendPosition"
            class="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.CHART_EDITOR_FORM_LEGEND_POSITION_FIELD_LABEL}
          </label>
          <select
            name="databaseChartConfig.legendPosition"
            value={
              databaseChartEditorForm.values.databaseChartConfig.legendPosition
            }
            onChange={databaseChartEditorForm.handleChange}
            onBlur={databaseChartEditorForm.handleBlur}
            className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          >
            {Object.keys(CONSTANTS.DATABASE_CHART_LEGEND_POSITION).map(
              (position) => (
                <option
                  key={CONSTANTS.DATABASE_CHART_LEGEND_POSITION[position]}
                  value={CONSTANTS.DATABASE_CHART_LEGEND_POSITION[position]}
                >
                  {position}
                </option>
              )
            )}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {_checkIfFieldInConfig("xStacked") && (
          <label className="flex flex-row justify-start gap-2 my-2 ml-0.5 items-center cursor-pointer w-full">
            {/* Checkbox Input */}
            <input
              type="checkbox"
              name="databaseChartConfig.xStacked"
              checked={
                databaseChartEditorForm.values.databaseChartConfig.xStacked
              }
              onChange={databaseChartEditorForm.handleChange}
              onBlur={databaseChartEditorForm.handleBlur}
              className="form-checkbox h-4 w-4 text-[#646cff] rounded-md border-gray-300 focus:ring-[#646cff]"
            />

            {/* Label Text */}
            <span className="block text-xs font-medium text-slate-500">
              {CONSTANTS.STRINGS.CHART_EDITOR_FORM_X_STACKED_FIELD_LABEL}
            </span>
          </label>
        )}
        {_checkIfFieldInConfig("yStacked") && (
          <label className="flex flex-row justify-start gap-2 my-2 ml-0.5 items-center cursor-pointer w-full">
            {/* Checkbox Input */}
            <input
              type="checkbox"
              name="databaseChartConfig.yStacked"
              checked={
                databaseChartEditorForm.values.databaseChartConfig.yStacked
              }
              onChange={databaseChartEditorForm.handleChange}
              onBlur={databaseChartEditorForm.handleBlur}
              className="form-checkbox h-4 w-4 text-[#646cff] rounded-md border-gray-300 focus:ring-[#646cff]"
            />

            {/* Label Text */}
            <span className="block text-xs font-medium text-slate-500">
              {CONSTANTS.STRINGS.CHART_EDITOR_FORM_Y_STACKED_FIELD_LABEL}
            </span>
          </label>
        )}
        {_checkIfFieldInConfig("indexAxis") && (
          <div>
            <label
              for="databaseChartConfig.indexAxis"
              class="block mb-1 text-xs font-medium text-slate-500"
            >
              {CONSTANTS.STRINGS.CHART_EDITOR_FORM_INDEX_AXIS_LABEL}
            </label>
            <select
              name="databaseChartConfig.indexAxis"
              value={
                databaseChartEditorForm.values.databaseChartConfig.indexAxis
              }
              onChange={databaseChartEditorForm.handleChange}
              onBlur={databaseChartEditorForm.handleBlur}
              className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            >
              {["x", "y"].map((indexAxis) => (
                <option key={indexAxis} value={indexAxis}>
                  {indexAxis}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label
          for="databaseChartConfig.refetchInterval"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_REFRESH_INTERVAL_LABEL}
        </label>
        <input
          type="number"
          name="databaseChartConfig.refetchInterval"
          id="databaseChartConfig.refetchInterval"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.CHART_EDITOR_FORM_REFRESH_INTERVAL_LABEL
          }
          required={true}
          onChange={databaseChartEditorForm.handleChange}
          onBlur={databaseChartEditorForm.handleBlur}
          value={
            databaseChartEditorForm.values.databaseChartConfig.refetchInterval
          }
        />
      </div>
      <div className="flex flex-row justify-between w-full items-center">
        <label className="block text-xs font-medium text-slate-500 -mb-1">
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_LABEL}
        </label>
        <button
          onClick={_handleAddDataset}
          type="button"
          className="flex flex-row items-center justify-center rounded bg-transparent px-3 py-1 text-xs text-[#646cff] hover:bg-transparent border-0 hover:border-0 focus:border-0 focus:outline-none focus:border-none outline-none"
        >
          <FaPlus className="!w-3 !h-3 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.CHART_EDITOR_FORM_ADD_DATASET_BUTTON}
        </button>
      </div>

      <DragDropContext onDragEnd={_handleOnDatabaseQueryListDragEnd}>
        <Droppable type="group" droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 h-full overflow-y-auto"
            >
              {databaseChartEditorForm.values.databaseQueries?.map(
                (query, index) => (
                  <DatabaseChartDatasetField
                    key={query.tempId} // Unique key from tempId
                    index={index}
                    chartForm={databaseChartEditorForm}
                    databaseQueries={databaseQueries}
                    datasetFields={
                      DATABASE_CHARTS_CONFIG_MAP[
                        databaseChartEditorForm.values?.databaseQueries?.[index]
                          ?.parameters?.type ||
                          databaseChartEditorForm.values.databaseChartType
                      ].datasetFields
                    }
                    selectedQueryForTesting={selectedQueryForTesting}
                    setSelectedQueryForTesting={setSelectedQueryForTesting}
                  />
                )
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};
