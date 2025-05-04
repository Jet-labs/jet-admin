import React, { useCallback, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useDatabaseWidgetsState } from "../../../logic/contexts/databaseWidgetsContext";

import { DatabaseQueryTestingPanel } from "../databaseQueryComponents/databaseQueryTestingPanel";
import { DatabaseWidgetDatasetField } from "./databaseWidgetDatasetField";
import { CollapseComponent } from "../ui/collapseComponent";
import { DatabaseWidgetAdvancedOptions } from "./databaseWidgetAdvancedOptions";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { WIDGETS_MAP } from "@jet-admin/widgets";
import { WIDGET_TYPES } from "@jet-admin/widget-types";

export const DatabaseWidgetEditor = ({ databaseWidgetEditorForm }) => {
  DatabaseWidgetEditor.propTypes = {
    databaseWidgetEditorForm: PropTypes.object.isRequired,
  };
  const {
    databaseQueries,
    isLoadingDatabaseQueries,
    isFetchingDatabaseQueries,
    loadDatabaseQueriesError,
  } = useDatabaseWidgetsState();

  const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(false);
  const _handleAddDataset = useCallback(() => {
    databaseWidgetEditorForm.setFieldValue("databaseQueries", [
      ...databaseWidgetEditorForm.values["databaseQueries"],
      {
        tempId: new Date().getTime(),
        title: "",
        databaseQueryID: "",
        parameters: {
          type: CONSTANTS.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value,
          color: "#D84545",
        },
        databaseQueryArgValues: {},
        datasetFields: {
          xAxis: "",
          yAxis: "",
        },
      },
    ]);
  }, [databaseWidgetEditorForm]);

  const _handleOnDatabaseQueryListDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(databaseWidgetEditorForm.values.databaseQueries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    databaseWidgetEditorForm.setFieldValue("databaseQueries", items);
  };

  console.log({ queries: databaseWidgetEditorForm?.values?.databaseQueries });

  return (
    <>
      <DatabaseQueryTestingPanel
        selectedQueryForTesting={selectedQueryForTesting}
        setSelectedQueryForTesting={setSelectedQueryForTesting}
      />

      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
        <div>
          <label
            htmlFor="databaseWidgetName"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_LABEL}
          </label>
          <input
            type="text"
            name="databaseWidgetName"
            id="databaseWidgetName"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            placeholder={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
            }
            required={true}
            onChange={databaseWidgetEditorForm.handleChange}
            onBlur={databaseWidgetEditorForm.handleBlur}
            value={databaseWidgetEditorForm.values.databaseWidgetName}
          />
        </div>

        <div>
          <label
            htmlFor="databaseWidgetType"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_TYPE_FIELD_LABEL}
          </label>
          <select
            name="databaseWidgetType"
            value={databaseWidgetEditorForm.values.databaseWidgetType}
            onChange={databaseWidgetEditorForm.handleChange}
            onBlur={databaseWidgetEditorForm.handleBlur}
            className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          >
            {Object.keys(WIDGET_TYPES).map((widgetType) => (
              <option
                key={WIDGET_TYPES[widgetType].value}
                value={WIDGET_TYPES[widgetType].value}
              >
                {WIDGET_TYPES[widgetType].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {databaseWidgetEditorForm && databaseWidgetEditorForm.values && (
        <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
          <CollapseComponent
            showButtonText={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_ADVANCED_BUTTON
            }
            hideButtonText={"Hide"}
            containerClass={"p-0"}
            content={() => (
              <DatabaseWidgetAdvancedOptions
                widgetForm={databaseWidgetEditorForm}
                initialValues={
                  databaseWidgetEditorForm.values.databaseWidgetConfig
                }
                parentWidgetType={
                  databaseWidgetEditorForm.values.databaseWidgetType
                }
              />
            )}
          />
        </div>
      )}
      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
        <div>
          <label
            htmlFor="databaseWidgetConfig.refetchInterval"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL}
          </label>
          <input
            type="number"
            name="databaseWidgetConfig.refetchInterval"
            id="databaseWidgetConfig.refetchInterval"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            placeholder={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL
            }
            required={true}
            onChange={databaseWidgetEditorForm.handleChange}
            onBlur={databaseWidgetEditorForm.handleBlur}
            value={
              databaseWidgetEditorForm.values.databaseWidgetConfig
                .refetchInterval
            }
          />
        </div>
      </div>

      <div className="flex flex-row justify-between w-full items-center">
        <label className="block text-xs font-medium text-slate-500 -mb-1">
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL}
        </label>
        <button
          onClick={_handleAddDataset}
          disabled={isLoadingDatabaseQueries}
          type="button"
          className="flex flex-row items-center justify-center rounded bg-transparent px-3 py-1 text-xs text-[#646cff] hover:bg-transparent border-0 hover:border-0 focus:border-0 focus:outline-none focus:border-none outline-none"
        >
          <FaPlus className="!w-3 !h-3 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_ADD_DATASET_BUTTON}
        </button>
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseQueries}
        isFetching={isFetchingDatabaseQueries}
        error={loadDatabaseQueriesError}
      >
        <DragDropContext onDragEnd={_handleOnDatabaseQueryListDragEnd}>
          <Droppable type="group" droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 h-full overflow-y-auto"
              >
                {databaseWidgetEditorForm.values.databaseQueries?.map(
                  (query, index) => {
                    return WIDGETS_MAP[
                      databaseWidgetEditorForm.values.databaseWidgetType
                    ] ? (
                      <DatabaseWidgetDatasetField
                        key={query.tempId} // Unique key from tempId
                        index={index}
                        widgetForm={databaseWidgetEditorForm}
                        databaseQueries={databaseQueries}
                        datasetFields={
                          WIDGETS_MAP[
                            databaseWidgetEditorForm.values.databaseWidgetType
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
      </ReactQueryLoadingErrorWrapper>
    </>
  );
};
