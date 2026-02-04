import React, { useCallback, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { useWidgetsState } from "../../../logic/contexts/widgetsContext";

import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { WorkflowTestingPanel } from "../workflowComponents/workflowTestingPanel";
import { WidgetDatasetField } from "./widgetDatasetField";
import { CollapseComponent } from "../ui/collapseComponent";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
// import { WidgetCustomCSSForm } from "./widgetCustomCSSForm";

export const WidgetEditor = ({ widgetEditorForm }) => {
  WidgetEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
  };
  const {
    workflows,
    isLoadingWorkflows,
  } = useWidgetsState();

  console.log({ workflows })

  const [selectedWorkflowForTesting, setSelectedWorkflowForTesting] = useState(null);

  return (
    <>
      <WorkflowTestingPanel
        selectedWorkflowForTesting={selectedWorkflowForTesting}
        setSelectedWorkflowForTesting={setSelectedWorkflowForTesting}
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
      <div className="flex flex-col justify-start items-stretch gap-2 rounded">
        <label className="block text-xs font-medium text-slate-500">
          Workflow Data Source
        </label>

        <WidgetDatasetField
          // key={widgetEditorForm.values.workflowSource.tempId}
          index={0}
          widgetForm={widgetEditorForm}
          workflows={workflows}
          datasetFields={
            WIDGETS_MAP[widgetEditorForm.values.widgetType]?.datasetFields || []
          }
          setSelectedWorkflowForTesting={setSelectedWorkflowForTesting}
        />
      </div>

    </>
  );
};
