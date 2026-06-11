import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { uploadDatasourceFileAPI } from "../../../data/apis/datasource";
import { DATASOURCE_UI_COMPONENTS, DatasourceEditorContext } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES, getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { FileUploadContext, OAuthContext } from "@jet-admin/json-forms-renderers";
import { DatasourceIcon } from "./datasourceIcon";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Section } from "@jet-admin/ui";
import { useOAuthPopup } from "../../../logic/hooks/useOAuthPopup";

/**
 * Builds a strict DatasourceEditorForm interface from the raw Formik form.
 * Dedicated editors can only access the methods exposed here — they cannot
 * touch datasourceTitle, datasourceType, or other unrelated fields.
 */
function buildDatasourceEditorForm(formikForm) {
  return {
    // Read-only accessors
    get datasourceOptions() {
      return formikForm.values.datasourceOptions;
    },
    get datasourceTitle() {
      return formikForm.values.datasourceTitle;
    },
    get datasourceType() {
      return formikForm.values.datasourceType;
    },

    // Controlled mutation methods
    setDatasourceOptions: (options) => {
      formikForm.setFieldValue("datasourceOptions", options);
    },
    patchDatasourceOptions: (patch) => {
      formikForm.setFieldValue("datasourceOptions", {
        ...formikForm.values.datasourceOptions,
        ...patch,
      });
    },
  };
}

export const DatasourceEditor = ({ datasourceEditorForm }) => {
  DatasourceEditor.propTypes = {
    datasourceEditorForm: PropTypes.object.isRequired,
  };

  const { tenantID } = useParams();

  // Initialize the OAuth popup hook to be provided to JSON Forms Custom Renderers
  const { startOAuth, loading: isOAuthLoading } = useOAuthPopup({
    provider: "google",
    tenantID,
  });

  // Track whether JsonForms has completed its initial render cycle.
  const isJsonFormsInitialized = useRef(false);

  const handleDatasourceOptionsChange = useCallback(({ data }) => {
    if (!isJsonFormsInitialized.current) {
      isJsonFormsInitialized.current = true;
      return;
    }

    if (
      JSON.stringify(data) !==
      JSON.stringify(datasourceEditorForm.values.datasourceOptions)
    ) {
      datasourceEditorForm.setFieldValue("datasourceOptions", data);
    }
  }, [datasourceEditorForm]);

  const handleUploadFile = useCallback(async (file) => {
    return await uploadDatasourceFileAPI({ tenantID, file });
  }, [tenantID]);

  const currentDatasourceType = getDatasourceTypeByValue(datasourceEditorForm.values.datasourceType);

  // Build the strict editor form interface for dedicated editors
  const strictEditorForm = useMemo(
    () => buildDatasourceEditorForm(datasourceEditorForm),
    [datasourceEditorForm]
  );

  // Build the DatasourceEditorContext value with all platform capabilities
  const datasourceEditorContextValue = useMemo(
    () => ({
      tenantID,
      oauth: {
        startOAuth,
        loading: isOAuthLoading,
      },
      fileUpload: {
        uploadFile: handleUploadFile,
      },
    }),
    [tenantID, startOAuth, isOAuthLoading, handleUploadFile]
  );

  // Check if this datasource type has a dedicated editor AND it's actually registered
  const hasDedicatedEditor =
    currentDatasourceType?.hasDedicatedDatasourceEditor &&
    DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType]?.dedicatedDatasourceEditor;

  return (
    <div className="w-full">
      <Section title="Datasource Configuration">
        <div className="space-y-4">
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
            {datasourceEditorForm.touched.datasourceTitle && datasourceEditorForm.errors.datasourceTitle && (
              <p className="text-xs text-red-500">
                {datasourceEditorForm.errors.datasourceTitle}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="datasourceType">
              {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={datasourceEditorForm.values.datasourceType}
              onValueChange={(val) => {
                datasourceEditorForm.setFieldValue("datasourceType", val);
                const config = getDatasourceTypeByValue(val);
                if (config?.formConfig?.data) {
                  datasourceEditorForm.setFieldValue("datasourceOptions", config.formConfig.data);
                } else {
                  datasourceEditorForm.setFieldValue("datasourceOptions", {});
                }
                isJsonFormsInitialized.current = false;
              }}
            >
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
            {datasourceEditorForm.touched.datasourceType && datasourceEditorForm.errors.datasourceType && (
              <p className="text-xs text-red-500">
                {datasourceEditorForm.errors.datasourceType}
              </p>
            )}
          </div>

          {currentDatasourceType && (
            <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-sm border border-border">
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

          {/* Render dedicated datasource editor OR JsonForms fallback */}
          {DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType] && (
            hasDedicatedEditor ? (
              <div className="border-t border-border pt-4 mt-2">
                <DatasourceEditorContext.Provider value={datasourceEditorContextValue}>
                  {DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType]
                    .dedicatedDatasourceEditor({ datasourceEditorForm: strictEditorForm })}
                </DatasourceEditorContext.Provider>
              </div>
            ) : currentDatasourceType?.formConfig ? (
              <div className="border-t border-border pt-4 mt-2">
                <OAuthContext.Provider value={{ startOAuth, loading: isOAuthLoading }}>
                  <FileUploadContext.Provider value={{ uploadFile: handleUploadFile }}>
                    <JsonForms
                      schema={currentDatasourceType.formConfig.schema}
                      uischema={currentDatasourceType.formConfig.uischema}
                      data={datasourceEditorForm.values.datasourceOptions}
                      renderers={[...materialRenderers, ...customJSONFormRenderers]}
                      cells={materialCells}
                      onChange={handleDatasourceOptionsChange}
                    />
                  </FileUploadContext.Provider>
                </OAuthContext.Provider>
              </div>
            ) : null
          )}
        </div>
      </Section>
    </div>
  );
};