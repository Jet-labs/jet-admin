import React, { useCallback, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useWidgetsState } from "../../../logic/contexts/widgetsContext";

import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { WidgetDatasetField } from "./widgetDatasetField";
import { CollapseComponent } from "../ui/collapseComponent";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { WIDGETS_MAP } from "@jet-admin/widgets";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
// import { WidgetCustomCSSForm } from "./widgetCustomCSSForm";

export const WidgetEditor = ({ widgetEditorForm }) => {
  WidgetEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
  };
  const {
    dataQueries,
    isLoadingDataQueries,
    isFetchingDataQueries,
    loadDataQueriesError,
  } = useWidgetsState();

  const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(false);
  const _handleAddDataset = useCallback(() => {
    widgetEditorForm.setFieldValue("dataQueries", [
      ...widgetEditorForm.values["dataQueries"],
      {
        tempId: new Date().getTime(),
        title: "",
        dataQueryID: "",
        parameters: {
          type: CONSTANTS.WIDGET_TYPES.TEXT_WIDGET.value,
          color: "#D84545",
        },
        dataQueryArgValues: {},
        datasetFields: {
          xAxis: "",
          yAxis: "",
        },
      },
    ]);
  }, [widgetEditorForm]);

  const _handleOnDataQueryListDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgetEditorForm.values.dataQueries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    widgetEditorForm.setFieldValue("dataQueries", items);
  };

  return (
    <>
      <DataQueryTestingPanel
        selectedQueryForTesting={selectedQueryForTesting}
        setSelectedQueryForTesting={setSelectedQueryForTesting}
      />

      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
        <div>
          <label
            htmlFor="widgetTitle"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_LABEL}
          </label>
          <input
            type="text"
            name="widgetTitle"
            id="widgetTitle"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            placeholder={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
            }
            required={true}
            onChange={widgetEditorForm.handleChange}
            onBlur={widgetEditorForm.handleBlur}
            value={widgetEditorForm.values.widgetTitle}
          />
        </div>

        <div>
          <label
            htmlFor="widgetType"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_TYPE_FIELD_LABEL}
          </label>
          <select
            name="widgetType"
            value={widgetEditorForm.values.widgetType}
            onChange={widgetEditorForm.handleChange}
            onBlur={widgetEditorForm.handleBlur}
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

      {widgetEditorForm && widgetEditorForm.values && (
        <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
          <CollapseComponent
            showButtonText={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_ADVANCED_BUTTON
            }
            hideButtonText={"Hide"}
            containerClass={"p-0"}
            content={() => (
              <WidgetAdvancedOptions
                widgetForm={widgetEditorForm}
                initialValues={widgetEditorForm.values.widgetConfig}
                parentWidgetType={widgetEditorForm.values.widgetType}
              />
            )}
          />
        </div>
      )}
      {/* <WidgetCustomCSSForm
        tenantID={tenantID}
        widgetID={widgetID}
        widgetForm={widgetEditorForm}
      /> */}
      <div className="flex flex-col justify-start items-stretch gap-2 p-2 rounded bg-slate-100">
        <div>
          <label
            htmlFor="widgetConfig.refetchInterval"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL}
          </label>
          <input
            type="number"
            name="widgetConfig.refetchInterval"
            id="widgetConfig.refetchInterval"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            placeholder={
              CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL
            }
            required={true}
            onChange={widgetEditorForm.handleChange}
            onBlur={widgetEditorForm.handleBlur}
            value={widgetEditorForm.values.widgetConfig.refetchInterval}
          />
        </div>
      </div>

      <div className="flex flex-row justify-between w-full items-center">
        <label className="block text-xs font-medium text-slate-500 -mb-1">
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL}
        </label>
        <button
          onClick={_handleAddDataset}
          disabled={isLoadingDataQueries}
          type="button"
          className="flex flex-row items-center justify-center rounded bg-transparent px-3 py-1 text-xs text-[#646cff] hover:bg-transparent border-0 hover:border-0 focus:border-0 focus:outline-none focus:border-none outline-none"
        >
          <FaPlus className="!w-3 !h-3 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_ADD_DATASET_BUTTON}
        </button>
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDataQueries}
        isFetching={isFetchingDataQueries}
        error={loadDataQueriesError}
      >
        <DragDropContext onDragEnd={_handleOnDataQueryListDragEnd}>
          <Droppable type="group" droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 h-full overflow-y-auto"
              >
                {widgetEditorForm.values.dataQueries?.map((query, index) => {
                  return WIDGETS_MAP[widgetEditorForm.values.widgetType] ? (
                    <WidgetDatasetField
                      key={query.tempId} // Unique key from tempId
                      index={index}
                      widgetForm={widgetEditorForm}
                      dataQueries={dataQueries}
                      datasetFields={
                        WIDGETS_MAP[widgetEditorForm.values.widgetType]
                          .datasetFields
                      }
                      selectedQueryForTesting={selectedQueryForTesting}
                      setSelectedQueryForTesting={setSelectedQueryForTesting}
                    />
                  ) : null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ReactQueryLoadingErrorWrapper>
    </>
  );
};
