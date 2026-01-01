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

export const DatasourceEditor = ({ datasourceEditorForm }) => {
  DatasourceEditor.propTypes = {
    datasourceEditorForm: PropTypes.object.isRequired,
  };
  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const handleDatasourceOptionsChange = useCallback(({ data }) => {
    // Update only the 'datasourceOptions' field in Formik's state
    console.log('data', data);
    datasourceEditorForm.setFieldValue("datasourceOptions", data);
    // You could also attempt to map JSON Forms errors to Formik's errors for 'datasourceOptions'
    // but often Yup handles it sufficiently for overall form validity.
  }, [datasourceEditorForm]);

  const currentDatasourceType = getDatasourceTypeByValue(datasourceEditorForm.values.datasourceType);

  return (
    <>
      <div>
        <label
          htmlFor="datasourceTitle"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TITLE_FIELD_LABEL}
        </label>
        {datasourceEditorForm.errors.datasourceTitle && (
          <span className="text-red-500 text-xs">
            {datasourceEditorForm.errors.datasourceTitle}
          </span>
        )}
        <input
          type="text"
          name="datasourceTitle"
          id="datasourceTitle"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
          placeholder={
            CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={datasourceEditorForm.handleChange}
          onBlur={datasourceEditorForm.handleBlur}
          value={datasourceEditorForm.values.datasourceTitle}
        />
      </div>
      <div>
        <label
          htmlFor="datasourceType"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL}
        </label>
        {datasourceEditorForm.errors.datasourceType && (
          <span className="text-red-500 text-xs">
            {datasourceEditorForm.errors.datasourceType}
          </span>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(DATASOURCE_TYPES).map((type) => (
            <button
              type="button"
              key={DATASOURCE_TYPES[type].value}
              onClick={() => datasourceEditorForm.setFieldValue("datasourceType", DATASOURCE_TYPES[type].value)}
              className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all ${datasourceEditorForm.values.datasourceType === DATASOURCE_TYPES[type].value
                  ? "bg-slate-100 border-slate-400 ring-1 ring-slate-400"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <DatasourceIcon
                icon={DATASOURCE_TYPES[type].icon}
                iconColor={DATASOURCE_TYPES[type].iconColor}
                size={18}
              />
              <span className="text-slate-700 truncate">{DATASOURCE_TYPES[type].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* JSON Forms for datasourceOptions */}
      {DATASOURCE_UI_COMPONENTS[datasourceEditorForm.values.datasourceType] && currentDatasourceType?.formConfig && (
        <>
          <h2 className="text-base font-bold mt-6 !-mb-3 text-slate-700">
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
        </>
      )}
    </>
  );
};