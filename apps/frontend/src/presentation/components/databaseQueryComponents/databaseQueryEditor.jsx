import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useDatabaseQueriesState } from "../../../logic/contexts/databaseQueriesContext";

export const DatabaseQueryEditor = ({ databaseQueryEditorForm }) => {
  DatabaseQueryEditor.propTypes = {
    databaseQueryEditorForm: PropTypes.object.isRequired,
  };
  const {datasources} = useDatabaseQueriesState();
  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const _handleDatasourceOptionsChange = ({ data }) => {
    // Update only the 'datasourceOptions' field in Formik's state
    databaseQueryEditorForm.setFieldValue("databaseQueryString", data);
    // You could also attempt to map JSON Forms errors to Formik's errors for 'datasourceOptions'
    // but often Yup handles it sufficiently for overall form validity.
  };

  const _handleDatasourceTypeChange = (event) => {
    databaseQueryEditorForm.setFieldValue("datasourceID", event.target.value);
    const selectedDatasource = datasources.find(
      (datasource) => datasource.value === event.target.value
    );
    databaseQueryEditorForm.setFieldValue("datasourceType", selectedDatasource.type);
  };
  
  console.log({
    t: DATASOURCE_UI_COMPONENTS[databaseQueryEditorForm.values.datasourceType],
  });
  return (
    <>
      {/* JSON Forms for datasourceOptions */}
      <div className="w-full">
        <label
          htmlFor="datasourceID"
          className={`block mb-1 text-xs font-medium text-slate-500 ${
            databaseQueryEditorForm.errors.datasourceID
              ? "text-red-500"
              : "text-slate-500"
          }}`}
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL}
          {databaseQueryEditorForm.errors.datasourceID ? (
            <span className="text-red-500 text-xs">
              {databaseQueryEditorForm.errors.datasourceID}
            </span>
          ) : null}
        </label>

        <select
          name="datasourceID"
          id="datasourceID"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
          onChange={_handleDatasourceTypeChange}
          onBlur={databaseQueryEditorForm.handleBlur}
          value={databaseQueryEditorForm.values.datasourceID}
        >
          {datasources?.map((datasource) => (
            <option key={datasource.value} value={datasource.value}>
              {datasource.label}
            </option>
          ))}
        </select>
      </div>
      {DATASOURCE_UI_COMPONENTS[
        databaseQueryEditorForm.values.datasourceType
      ] && (
        <>
          <h2 className="text-base font-bold mt-6 !-mb-3 text-slate-700">
            {
              CONSTANTS.STRINGS
                .DATASOURCE_EDITOR_FORM_CONNECTION_DETAILS_FIELD_LABEL
            }
          </h2>
          {DATASOURCE_UI_COMPONENTS[
            databaseQueryEditorForm.values.datasourceType
          ] &&
            DATASOURCE_UI_COMPONENTS[
              databaseQueryEditorForm.values.datasourceType
            ].queryConfigForm && (
              <JsonForms
                schema={
                  DATASOURCE_UI_COMPONENTS[
                    databaseQueryEditorForm.values.datasourceType
                  ].queryConfigForm.schema
                }
                uischema={
                  DATASOURCE_UI_COMPONENTS[
                    databaseQueryEditorForm.values.datasourceType
                  ].queryConfigForm.uischema
                }
                // Pass only the 'datasourceOptions' part of Formik's values to JsonForms
                data={databaseQueryEditorForm.values.datasourceOptions}
                renderers={[...materialRenderers, ...customJSONFormRenderers]}
                cells={materialCells}
                // This onChange updates only the 'datasourceOptions' in Formik
                onChange={_handleDatasourceOptionsChange}
              />
            )}
        </>
      )}
    </>
  );
};
