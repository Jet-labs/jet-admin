import React, { useCallback, useMemo, useState } from "react";
import { GrDrag } from "react-icons/gr";
import { CONSTANTS } from "../../../constants";
import { BiSitemap } from "react-icons/bi";
import { IoIosColorFilter } from "react-icons/io";
import { WidgetDatasetArguments } from "./widgetDatasetArguments";
import { WidgetDatasetFieldMapping } from "./widgetDatasetFieldMapping";
import PropTypes from "prop-types";
import { WidgetDatasetAdvancedOptions } from "./widgetDatasetAdvancedOptions";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
/**
 * @param {object} param0
 * @param {number} param0.index
 * @param {import("formik").FormikProps} param0.widgetForm
 * @param {function} param0.setSelectedWorkflowForTesting
 * @param {Array<object>} param0.workflows
 * @param {Array<string>} param0.datasetFields
 * @returns {JSX.Element}
 */
export const WidgetDatasetField = ({
  index,
  widgetForm,
  setSelectedWorkflowForTesting,
  workflows,
  datasetFields,
}) => {
  WidgetDatasetField.propTypes = {
    index: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    setSelectedWorkflowForTesting: PropTypes.func.isRequired,
    dataQueries: PropTypes.array.isRequired,
    workflows: PropTypes.array,
    datasetFields: PropTypes.array.isRequired,
  };

  // eslint-disable-next-line no-unused-vars
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);
  const [showArgumentsOptions, setShowArgumentsOptions] = useState(false);


  const selectedWorkflow = useMemo(() => {
    const workflowID = widgetForm.values.workflowID;
    return workflows?.find((w) => w.workflowID == workflowID) || null;
  }, [workflows, widgetForm.values]);

  const _handleTestWorkflow = useCallback(() => {
    setSelectedWorkflowForTesting(selectedWorkflow);
  }, [selectedWorkflow, setSelectedWorkflowForTesting]);


  const hasWorkflowIdError = widgetForm.touched?.workflowID && widgetForm.errors?.workflowID
  const hasTitleError = widgetForm.touched.workflowConfig?.title && widgetForm.errors.workflowConfig?.title
  // Render content that appears in both modes
  const renderContent = (provided, snapshot) => (
    <div
      className={`grid grid-cols-1 gap-2 w-full ${snapshot?.isDragging ? "bg-[#ffe7a4]" : "bg-slate-100"
        } rounded p-2`}
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
    >
      {/* Dataset Title */}
      <div>
        <Input
          type="text"
          name={'workflowConfig.title'}
          id={'workflowConfig.title'}
          className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border ${hasTitleError ? "border-red-300" : "border-slate-300"
            } text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
          required={true}
          onChange={widgetForm.handleChange}
          onBlur={widgetForm.handleBlur}
          value={widgetForm.values.workflowConfig?.title || ""}
          placeholder={
            CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_TITLE_LABEL
          }
        />
        {hasTitleError && (
          <p className="mt-1 text-xs text-red-500">
            {widgetForm.errors.workflowConfig?.title}
          </p>
        )}
      </div>

      {/* Workflow Selection */}
      <div className="flex flex-row gap-2 w-full">

        <Select value={widgetForm.values.workflowID || ""} onValueChange={(val) => {
          widgetForm.setFieldValue('workflowID', val);
          // Reset workflow params when changing workflow
          widgetForm.setFieldValue('workflowConfig.inputArgs', {});
          widgetForm.setFieldValue('workflowConfig.datasetFields', {});
        }}>
          <SelectTrigger className={`text-xs ${hasWorkflowIdError ? "border-red-300" : ""}`}>
            <SelectValue placeholder="Select workflow" />
          </SelectTrigger>
          <SelectContent>
            {workflows?.map((workflow) => (
              <SelectItem
                key={`workflow_item_${workflow.workflowID}`}
                value={String(workflow.workflowID)}
              >
                {workflow.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>
      {hasWorkflowIdError && (
        <p className="text-xs text-red-500">
          {widgetForm.errors?.workflowID
          }
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">


        <Button
          type="button"
          variant="outline"
          onClick={() => setShowArgumentsOptions(true)}
          disabled={!selectedWorkflow?.workflowOptions?.args?.length}
          className="h-auto py-2 flex-col gap-1 bg-slate-100 text-slate-700 hover:bg-primary/10 hover:border-primary hover:text-primary text-xs font-normal"
        >
          <BiSitemap className="text-2xl" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_ARGUMENTS_LABEL}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFieldMappingOptions(true)}
          disabled={!selectedWorkflow}
          className="h-auto py-2 flex-col gap-1 bg-slate-100 text-slate-700 hover:bg-primary/10 hover:border-primary hover:text-primary text-xs font-normal"
        >
          <BiSitemap className="text-2xl" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_MAPPINGS_LABEL}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAdvancedOptions(true)}
          className="h-auto py-2 flex-col gap-1 bg-slate-100 text-slate-700 hover:bg-primary/10 hover:border-primary hover:text-primary text-xs font-normal"
        >
          <IoIosColorFilter className="text-2xl" />
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_UI_CONFIG_LABEL}
        </Button>
      </div>

      <WidgetDatasetAdvancedOptions
        open={showAdvancedOptions}
        onClose={() => setShowAdvancedOptions(false)}
        datasetIndex={index}
        widgetForm={widgetForm}
        initialValues={widgetForm.values.workflowConfig?.parameters}
        parentWidgetType={widgetForm.values.widgetType}
      />
      <WidgetDatasetFieldMapping
        open={showFieldMappingOptions}
        onClose={() => setShowFieldMappingOptions(false)}
        datasetIndex={index}
        widgetForm={widgetForm}
        initialValues={{
          datasetFields:
            widgetForm.values.workflowConfig?.datasetFields,
        }}
        selectedWorkflow={selectedWorkflow}
        datasetFields={datasetFields}
      />


      <WidgetDatasetArguments
        open={showArgumentsOptions}
        onClose={() => setShowArgumentsOptions(false)}
        datasetIndex={index}
        widgetForm={widgetForm}
        initialValues={{
          inputArgs:
            widgetForm.values.workflowConfig?.inputArgs,
        }}
        selectedWorkflow={selectedWorkflow}
      />


      <div className="flex flex-row justify-between items-center gap-2">
        <div
          {...(provided?.dragHandleProps || {})}
          className="cursor-move text-gray-500 hover:text-gray-700"
        >
          <GrDrag className="h-4 w-4 text-slate-500" />
        </div>
        <div className="flex flex-row justify-end items-center gap-2">

          {selectedWorkflow && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={_handleTestWorkflow}
              className="h-7 px-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            >
              Test Workflow
            </Button>
          )}

        </div>
      </div>
    </div>
  );

  return renderContent(null, null);
};
