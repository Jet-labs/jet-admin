import {
    materialCells,
    materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React from "react";
import PropTypes from "prop-types";
import {DATASOURCE_COMPONENTS} from "@jet-admin/datasources";
import {DATASOURCE_TYPES} from "@jet-admin/datasource-types";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";


export const DatasourceEditor = ({datasourceEditorForm}) =>{
    DatasourceEditor.propTypes = {
        datasourceEditorForm: PropTypes.object.isRequired,
    };
    // This handler specifically updates the 'datasourceOptions' part of Formik's state
      const handleDatasourceOptionsChange = ({ data }) => {
        // Update only the 'datasourceOptions' field in Formik's state
        datasourceEditorForm.setFieldValue("datasourceOptions", data);
        // You could also attempt to map JSON Forms errors to Formik's errors for 'datasourceOptions'
        // but often Yup handles it sufficiently for overall form validity.
      };
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
            htmlFor="datasourceDescription"
            className="block mb-1 text-xs font-medium text-slate-500"
          >
            {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_DESCRIPTION_FIELD_LABEL}
          </label>
          {datasourceEditorForm.errors.datasourceDescription && (
            <span className="text-red-500 text-xs">
              {datasourceEditorForm.errors.datasourceDescription}
            </span>
          )}
          <input
            type="text"
            name="datasourceDescription"
            id="datasourceDescription"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
            placeholder={
              CONSTANTS.STRINGS
                .DATASOURCE_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
            }
            onChange={datasourceEditorForm.handleChange}
            onBlur={datasourceEditorForm.handleBlur}
            value={datasourceEditorForm.values.datasourceDescription}
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
          <select
            name="datasourceType"
            id="datasourceType"
            className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
            onChange={datasourceEditorForm.handleChange}
            onBlur={datasourceEditorForm.handleBlur}
            value={datasourceEditorForm.values.datasourceType}
          >
            {Object.keys(DATASOURCE_TYPES).map((type) => (
              <option
                key={DATASOURCE_TYPES[type].value}
                value={DATASOURCE_TYPES[type].value}
              >
                {DATASOURCE_TYPES[type].name}
              </option>
            ))}
          </select>
        </div>

        {/* JSON Forms for datasourceOptions */}
        {DATASOURCE_COMPONENTS[datasourceEditorForm.values.datasourceType] && (
          <>
            <h2 className="text-lg font-bold mt-6 mb-2 text-slate-700">
              Connection Details
            </h2>
            <JsonForms
              schema={
                DATASOURCE_COMPONENTS[
                  datasourceEditorForm.values.datasourceType
                ].formConfig.schema
              }
              uischema={
                DATASOURCE_COMPONENTS[
                  datasourceEditorForm.values.datasourceType
                ].formConfig.uischema
              }
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
}