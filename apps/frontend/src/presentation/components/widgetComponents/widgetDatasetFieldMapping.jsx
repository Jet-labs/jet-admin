import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useState, useMemo, useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { VariablePathPicker } from "./variablePathPicker";
import { VariableExplorer, extractWorkflowSchema } from "./variableExplorer";
import { FiInfo, FiAlertCircle } from "react-icons/fi";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@jet-admin/ui";
/**
 * Enhanced Widget Dataset Field Mapping with Variable Explorer
 * Uses workflow schema (no execution required) to show available variable paths
 */
export const WidgetDatasetFieldMapping = ({
  open,
  onClose,
  datasetIndex,
  widgetForm,
  initialValues,
  selectedWorkflow,
  datasetFields,
}) => {
  WidgetDatasetFieldMapping.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    datasetIndex: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired,
    selectedWorkflow: PropTypes.object,
    datasetFields: PropTypes.array.isRequired,
  };

  const [activeField, setActiveField] = useState(null);

  // Extract workflow schema (no execution needed)
  const workflowSchema = useMemo(() => {
    return extractWorkflowSchema(selectedWorkflow);
  }, [selectedWorkflow]);

  // Check if workflow has any variables defined
  const hasWorkflowVariables = useMemo(() => {
    return (
      workflowSchema.inputs.length > 0 ||
      workflowSchema.nodeOutputs.length > 0 ||
      workflowSchema.workflowOutputs.length > 0
    );
  }, [workflowSchema]);

  // Form for field mappings
  const datasetFieldMappingForm = useFormik({
    initialValues: {
      datasetFields: {
        text: "",
        xAxis: "",
        yAxis: "",
        label: "",
        value: "",
        radius: "",
        data: "",
        url: "",
      },
      ...initialValues,
    },
    validationSchema:
      formValidations.datasetFieldMappingFormValidationSchema(datasetFields),
    enableReinitialize: true,
    onSubmit: (values) => {
      // Save to parent form - use workflowConfig for workflow mode
      widgetForm.setFieldValue(
        `workflowConfig.datasetFields`,
        values.datasetFields
      );
      onClose();
    },
  });

  // Field definitions for better UX
  const fieldDefinitions = useMemo(() => ({
    text: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_TEXT_LABEL || "Text",
      placeholder: "e.g., {{ctx.queryResult.rows[0].text}}",
      description: "Text content to display"
    },
    xAxis: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_X_AXIS_LABEL || "X axis",
      placeholder: "e.g., {{ctx.queryResult.rows[*].date}}",
      description: "Values for the X axis (horizontal)"
    },
    yAxis: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL || "Y axis",
      placeholder: "e.g., {{ctx.queryResult.rows[*].value}}",
      description: "Values for the Y axis (vertical)"
    },
    label: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL || "Label",
      placeholder: "e.g., {{ctx.queryResult.rows[*].name}}",
      description: "Labels for data points"
    },
    value: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL || "Value",
      placeholder: "e.g., {{ctx.queryResult.rows[*].amount}}",
      description: "Numeric values"
    },
    radius: {
      label: CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_RADIUS_LABEL || "Radius",
      placeholder: "e.g., {{ctx.queryResult.rows[*].size}}",
      description: "Size values for bubble/scatter charts"
    },
    data: {
      label: "Data Array",
      placeholder: "e.g., {{ctx.queryResult.rows}}",
      description: "Array of data items"
    },
    url: {
      label: "URL",
      placeholder: "e.g., {{ctx.generatedUrl}}",
      description: "URL to display or link to"
    },
  }), []);

  // Handle field value change
  const handleFieldChange = useCallback((field, value) => {
    datasetFieldMappingForm.setFieldValue(`datasetFields.${field}`, value);
  }, [datasetFieldMappingForm]);

  // Handle field focus to show relevant suggestions
  const handleFieldFocus = useCallback((field) => {
    setActiveField(field);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-medium">
            {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_TITLE || "Dataset field options"}
          </DialogTitle>
        </DialogHeader>

        <div>
        {/* Info banner */}
        <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 mb-4">
          <FiInfo className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-500">
              Map widget fields to workflow variables using mustache format.
              Use <code className="bg-slate-200 px-1 rounded text-slate-600">{"{{ctx.variableName}}"}</code> for simple values
              or <code className="bg-slate-200 px-1 rounded text-slate-600">{"{{ctx.data.rows[*].field}}"}</code> for arrays.
            </span>
          </div>
        </div>

        {!selectedWorkflow ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Please select a workflow first
          </div>
        ) : (
          <div className="space-y-4">
            {/* Field mappings */}
            {datasetFields?.map((field) => (
              <div key={field}>
                <label className="block text-xs font-normal text-slate-500 mb-1">
                  {fieldDefinitions[field]?.label || field}
                </label>
                <VariablePathPicker
                  value={datasetFieldMappingForm.values.datasetFields?.[field]}
                  onChange={(value) => handleFieldChange(field, value)}
                  workflow={selectedWorkflow}
                  placeholder={fieldDefinitions[field]?.placeholder || `Select variable for ${field}`}
                  showTransforms={true}
                  onFocus={() => handleFieldFocus(field)}
                />
                {fieldDefinitions[field]?.description && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {fieldDefinitions[field].description}
                  </p>
                )}
              </div>
            ))}

              {/* If no specific fields defined, show common ones */}
              {(!datasetFields || datasetFields.length === 0) && (
                <>
                  <div>
                    <label className="block text-xs font-normal text-slate-500 mb-1">Data</label>
                    <VariablePathPicker
                      value={datasetFieldMappingForm.values.datasetFields?.data}
                      onChange={(value) => handleFieldChange('data', value)}
                      workflow={selectedWorkflow}
                      placeholder="e.g., queryResult.rows"
                      onFocus={() => handleFieldFocus('data')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-500 mb-1">Text</label>
                    <VariablePathPicker
                      value={datasetFieldMappingForm.values.datasetFields?.text}
                      onChange={(value) => handleFieldChange('text', value)}
                      workflow={selectedWorkflow}
                      placeholder="e.g., textValue"
                      onFocus={() => handleFieldFocus('text')}
                    />
                  </div>
                </>
              )}

              {/* No variables warning */}
              {!hasWorkflowVariables && (
                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                  <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No variables found in workflow</p>
                    <p className="text-amber-500 mt-0.5">
                      Add nodes with output variables (e.g., Data Query, JavaScript) to make variables available.
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_CANCEL || "Discard"}
          </Button>

          <Button
            type="button"
            onClick={datasetFieldMappingForm.handleSubmit}
            
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_CONFIRM || "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
