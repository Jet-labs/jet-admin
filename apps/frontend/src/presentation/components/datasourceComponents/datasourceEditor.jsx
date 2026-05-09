import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES, getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { DatasourceIcon } from "./datasourceIcon";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

function Section({ title, description, children }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export const DatasourceEditor = ({ datasourceEditorForm }) => {
  DatasourceEditor.propTypes = {
    datasourceEditorForm: PropTypes.object.isRequired,
  };

  // Track whether JsonForms has completed its initial render cycle.
  // JsonForms fires onChange during mount while it resolves conditional
  // visibility rules (e.g. connectionOption toggling group visibility).
  // We skip those spurious updates so the server-fetched datasourceOptions
  // are never overwritten before the user touches anything.
  const isJsonFormsInitialized = useRef(false);

  const handleDatasourceOptionsChange = useCallback(({ data }) => {
    if (!isJsonFormsInitialized.current) {
      // First onChange is always the internal init pass — mark as done
      // and bail out without touching Formik state.
      isJsonFormsInitialized.current = true;
      return;
    }

    // Deep-equality guard: only update Formik if the data actually changed.
    // This is a cheap safety net for any further re-renders that fire onChange
    // with identical data (e.g. parent re-renders propagating down).
    if (
      JSON.stringify(data) !==
      JSON.stringify(datasourceEditorForm.values.datasourceOptions)
    ) {
      datasourceEditorForm.setFieldValue("datasourceOptions", data);
    }
  }, [datasourceEditorForm]);

  // Reset the init flag whenever the datasource type changes so JsonForms
  // re-initialises cleanly for the new schema without polluting Formik state.
  const previousDatasourceType = useRef(datasourceEditorForm.values.datasourceType);
  if (previousDatasourceType.current !== datasourceEditorForm.values.datasourceType) {
    previousDatasourceType.current = datasourceEditorForm.values.datasourceType;
    isJsonFormsInitialized.current = false;
  }

  const currentDatasourceType = getDatasourceTypeByValue(datasourceEditorForm.values.datasourceType);

  return (
    <div className="space-y-4">
      <Section title="Identity">
        <div className="space-y-1.5">
          <Label htmlFor="datasourceTitle">
            {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TITLE_FIELD_LABEL} <span className="text-destructive">*</span>
          </Label>
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
            <p className="text-xs text-red-500">
              {datasourceEditorForm.errors.datasourceTitle}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="datasourceType">
            {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL} <span className="text-destructive">*</span>
          </Label>
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
            <p className="text-xs text-red-500">
              {datasourceEditorForm.errors.datasourceType}
            </p>
          )}
        </div>
        {/* Show selected datasource with icon */}
        {currentDatasourceType && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-muted rounded-sm border border-border">
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
      </Section>

      {/* JSON Forms for datasourceOptions */}
      {DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType] && currentDatasourceType?.formConfig && (
        <Section title={CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_CONNECTION_DETAILS_FIELD_LABEL}>
          <JsonForms
            schema={currentDatasourceType.formConfig.schema}
            uischema={currentDatasourceType.formConfig.uischema}
            data={datasourceEditorForm.values.datasourceOptions}
            renderers={[...materialRenderers, ...customJSONFormRenderers]}
            cells={materialCells}
            onChange={handleDatasourceOptionsChange}
          />
        </Section>
      )}
    </div>
  );
};