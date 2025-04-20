import { useCallback, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useDatabaseChartsState } from "../../../logic/contexts/databaseChartsContext";
import { DATABASE_CHARTS_CONFIG_MAP } from "../chartTypes";
import { DatabaseQueryTestingPanel } from "../databaseQueryComponents/databaseQueryTestingPanel";
import { CollapseComponent } from "../ui/collapseComponent";
import { DatabaseChartAdvancedOptions } from "./databaseChartAdvancedOptions";
import { DatabaseChartDatasetField } from "./databaseChartDatasetField";
import { DatabaseChartAIStylePrompt } from "./databaseChartAIStylePrompt";

export const DatabaseChartEditor = ({ databaseChartEditorForm, tenantID }) => {
  const {
    databaseQueries,
    isLoadingDatabaseQueries,
    isFetchingDatabaseQueries,
  } = useDatabaseChartsState();

  const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
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
        datbbaseQueryArgValues: {},
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

  const _handleOnChartStyleAccepted = ({ databaseChartData }) => {
    const databaseQueries = databaseChartEditorForm.values.databaseQueries;
    databaseChartEditorForm.setFieldValue(
      "databaseChartConfig",
      databaseChartData?.databaseChartConfig
    );
    console.log({ databaseQueries, databaseChartData });
    const aiStyledDatabaseQueries = databaseQueries?.map((query, index) => ({
      ...query,
      parameters: databaseChartData?.databaseQueries[index]?.parameters,
    }));

    databaseChartEditorForm.setFieldValue(
      "databaseQueries",
      aiStyledDatabaseQueries
    );
  };

  return (
    <>
      <DatabaseQueryTestingPanel
        selectedQueryForTesting={selectedQueryForTesting}
        setSelectedQueryForTesting={setSelectedQueryForTesting}
      />

      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
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
      </div>
      <DatabaseChartAIStylePrompt
        tenantID={tenantID}
        onAccepted={_handleOnChartStyleAccepted}
        key={JSON.stringify(databaseChartEditorForm.values)}
        databaseChartData={{
          ...databaseChartEditorForm.values,
          databaseQueries: databaseChartEditorForm.values.databaseQueries?.map(
            (q) => ({
              ...q,
              databaseQuery: {
                databaseQueryTitle: q?.databaseQuery?.databaseQueryTitle,
                databaseQueryData: q?.databaseQuery?.databaseQueryData,
              },
              datasetFields: q?.datasetFields,
              databaseQueryArgValues: q?.databaseQueryArgValues,
              parameters: q?.parameters,
            })
          ),
        }}
      />

      {databaseChartEditorForm && databaseChartEditorForm.values && (
        <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
          <CollapseComponent
            showButtonText={CONSTANTS.STRINGS.CHART_EDITOR_FORM_ADVANCED_BUTTON}
            hideButtonText={"Hide"}
            containerClass={"p-0"}
            content={() => (
              <DatabaseChartAdvancedOptions
                chartForm={databaseChartEditorForm}
                initialValues={
                  databaseChartEditorForm.values.databaseChartConfig
                }
                parentChartType={
                  databaseChartEditorForm.values.databaseChartType
                }
              />
            )}
          />
        </div>
      )}
      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
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
                (query, index) => {
                  return DATABASE_CHARTS_CONFIG_MAP[
                    databaseChartEditorForm.values?.databaseQueries?.[index]
                      ?.parameters?.type ||
                      databaseChartEditorForm.values.databaseChartType
                  ] ? (
                    <DatabaseChartDatasetField
                      key={query.tempId} // Unique key from tempId
                      index={index}
                      chartForm={databaseChartEditorForm}
                      databaseQueries={databaseQueries}
                      datasetFields={
                        DATABASE_CHARTS_CONFIG_MAP[
                          databaseChartEditorForm.values?.databaseQueries?.[
                            index
                          ]?.parameters?.type ||
                            databaseChartEditorForm.values.databaseChartType
                        ].datasetFields
                      }
                      selectedQueryForTesting={selectedQueryForTesting}
                      setSelectedQueryForTesting={setSelectedQueryForTesting}
                    />
                  ) : null;
                }
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};
