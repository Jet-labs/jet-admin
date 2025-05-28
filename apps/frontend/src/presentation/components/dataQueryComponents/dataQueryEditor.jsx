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
import { useDataQueriesState } from "../../../logic/contexts/dataQueriesContext";

export const DataQueryEditor = ({ dataQueryEditorForm }) => {
  DataQueryEditor.propTypes = {
    dataQueryEditorForm: PropTypes.object.isRequired,
  };
  const { datasources } = useDataQueriesState();
  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const _handleDatasourceOptionsChange = ({ data }) => {
    // Update only the 'datasourceOptions' field in Formik's state
    console.log("dataQueryOptions", {
      data,
    });
    dataQueryEditorForm.setFieldValue("dataQueryOptions", data);
    // You could also attempt to map JSON Forms errors to Formik's errors for 'datasourceOptions'
    // but often Yup handles it sufficiently for overall form validity.
  };

  const _handleDatasourceTypeChange = (event) => {
    dataQueryEditorForm.setFieldValue("datasourceID", event.target.value);
    const selectedDatasource = datasources.find(
      (datasource) => datasource.value === event.target.value
    );
    dataQueryEditorForm.setFieldValue(
      "datasourceType",
      selectedDatasource.type
    );
  };

  return (
    <>
      {/* JSON Forms for datasourceOptions */}
      <div className="w-full">
        <label
          htmlFor="datasourceID"
          className={`block mb-1 text-xs font-medium text-slate-500 ${
            dataQueryEditorForm.errors.datasourceID
              ? "text-red-500"
              : "text-slate-500"
          }}`}
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL}
          {dataQueryEditorForm.errors.datasourceID ? (
            <span className="text-red-500 text-xs">
              {dataQueryEditorForm.errors.datasourceID}
            </span>
          ) : null}
        </label>

        <select
          name="datasourceID"
          id="datasourceID"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
          onChange={_handleDatasourceTypeChange}
          onBlur={dataQueryEditorForm.handleBlur}
          value={dataQueryEditorForm.values.datasourceID}
        >
          <option value="" disabled selected>
            Select datasource
          </option>
          {datasources?.map((datasource) => (
            <option key={datasource.value} value={datasource.value}>
              {datasource.label}
            </option>
          ))}
        </select>
      </div>

      <>
        {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType] &&
          DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType]
            .queryConfigForm && (
            <JsonForms
              schema={
                DATASOURCE_UI_COMPONENTS[
                  dataQueryEditorForm.values.datasourceType
                ].queryConfigForm.schema
              }
              uischema={
                DATASOURCE_UI_COMPONENTS[
                  dataQueryEditorForm.values.datasourceType
                ].queryConfigForm.uischema
              }
              data={dataQueryEditorForm.values.dataQueryOptions}
              renderers={[...materialRenderers, ...customJSONFormRenderers]}
              cells={materialCells}
              // This onChange updates only the 'datasourceOptions' in Formik
              validationMode="ValidateAndShow"
              onChange={_handleDatasourceOptionsChange}
            />
          )}
      </>
    </>
  );
};
