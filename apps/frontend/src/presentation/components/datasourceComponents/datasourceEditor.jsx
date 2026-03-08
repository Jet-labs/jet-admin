import {
    materialCells,
    materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES, getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useCallback } from "react";
import { DatasourceIcon } from "./datasourceIcon";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";


export const DatasourceEditor = ({ datasourceEditorForm }) => {
  DatasourceEditor.propTypes = {
    datasourceEditorForm: PropTypes.object.isRequired,
  };
  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const handleDatasourceOptionsChange = useCallback(({ data }) => {
    // Update only the 'datasourceOptions' field in Formik's state
    datasourceEditorForm.setFieldValue("datasourceOptions", data);
    // You could also attempt to map JSON Forms errors to Formik's errors for 'datasourceOptions'
    // but often Yup handles it sufficiently for overall form validity.
  }, [datasourceEditorForm]);

  const currentDatasourceType = getDatasourceTypeByValue(datasourceEditorForm.values.datasourceType);

  return (
    <>
      <div className="space-y-1">
        <label
          htmlFor="datasourceTitle"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TITLE_FIELD_LABEL}
        </label>
        <Input
          type="text"
          name="datasourceTitle"
          id="datasourceTitle"
          placeholder={
            CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={datasourceEditorForm.handleChange}
          onBlur={datasourceEditorForm.handleBlur}
          value={datasourceEditorForm.values.datasourceTitle}
        />
        {datasourceEditorForm.errors.datasourceTitle && (
          <span className="text-destructive text-xs">
            {datasourceEditorForm.errors.datasourceTitle}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <label
          htmlFor="datasourceType"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL}
        </label>
        <Select value={datasourceEditorForm.values.datasourceType} onValueChange={(val) => datasourceEditorForm.setFieldValue('datasourceType', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(DATASOURCE_TYPES).map((type) => (
              <SelectItem
                key={DATASOURCE_TYPES[type].value}
                value={DATASOURCE_TYPES[type].value}
              >
                {DATASOURCE_TYPES[type].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {datasourceEditorForm.errors.datasourceType && (
          <span className="text-destructive text-xs">
            {datasourceEditorForm.errors.datasourceType}
          </span>
        )}
        {/* Show selected datasource with icon */}
        {currentDatasourceType && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-muted rounded border border-border">
            <DatasourceIcon
              icon={currentDatasourceType.icon}
              iconColor={currentDatasourceType.iconColor}
              size={20}
            />
            <span className="text-sm font-medium text-foreground">
              {currentDatasourceType.name}
            </span>
          </div>
        )}
      </div>

      {/* JSON Forms for datasourceOptions */}
      {DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType] && currentDatasourceType?.formConfig && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
            {
              CONSTANTS.STRINGS
                .DATASOURCE_EDITOR_FORM_CONNECTION_DETAILS_FIELD_LABEL
            }
          </h2>
          <JsonForms
            schema={currentDatasourceType.formConfig.schema}
            uischema={currentDatasourceType.formConfig.uischema}
            // Pass only the 'datasourceOptions' part of Formik's values to JsonForms
            data={datasourceEditorForm.values.datasourceOptions}
            renderers={[...materialRenderers, ...customJSONFormRenderers]}
            cells={materialCells}
            // This onChange updates only the 'datasourceOptions' in Formik
            onChange={handleDatasourceOptionsChange}
          />
        </div>
      )}
    </>
  );
};