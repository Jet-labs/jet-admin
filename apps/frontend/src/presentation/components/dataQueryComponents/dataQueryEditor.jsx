import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useDataQueriesState } from "../../../logic/contexts/dataQueriesContext";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";


export const DataQueryEditor = ({
  dataQueryEditorForm,
  tenantID,
  dataQueryID,
}) => {
  DataQueryEditor.propTypes = {
    dataQueryEditorForm: PropTypes.object.isRequired,
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataQueryID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };
  const uniqueKey = dataQueryID
    ? `dataQueryEditor_${tenantID}_${dataQueryID}`
    : `dataQueryEditor_${tenantID}`;
  const { datasources } = useDataQueriesState();

  // Get the current datasource type config
  const currentDatasourceType = getDatasourceTypeByValue(dataQueryEditorForm.values.datasourceType);

  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const _handleDatasourceOptionsChange = useCallback(
    ({ data }) => {
      dataQueryEditorForm.setFieldValue("dataQueryOptions", data);
    },
    [dataQueryEditorForm]
  );

  const _handleDatasourceTypeChange = useCallback(
    (val) => {
      dataQueryEditorForm.setFieldValue("datasourceID", val);
      const selectedDatasource = datasources.find(
        (datasource) => datasource.value === val
      );
      dataQueryEditorForm.setFieldValue(
        "datasourceType",
        selectedDatasource.type
      );
    },
    [dataQueryEditorForm, datasources]
  );

  return (
    <>
      {/* JSON Forms for datasourceOptions */}
      <div className="space-y-1">
        <Label
          htmlFor="datasourceID"
          className="text-sm font-medium leading-none"
        >
          {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL}
        </Label>

        <Select value={dataQueryEditorForm.values.datasourceID} onValueChange={_handleDatasourceTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select datasource" />
          </SelectTrigger>
          <SelectContent>
            {datasources?.map((datasource) => (
              <SelectItem key={datasource.value} value={datasource.value}>
                {datasource.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dataQueryEditorForm.errors.datasourceID && (
          <span className="text-destructive text-xs">
            {dataQueryEditorForm.errors.datasourceID}
          </span>
        )}
      </div>

      <>
        {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType] &&
          currentDatasourceType?.queryConfigForm && (
          <div className="mt-4 border-t border-border pt-4">
            <JsonForms
              key={uniqueKey}
              schema={currentDatasourceType.queryConfigForm.schema}
              uischema={currentDatasourceType.queryConfigForm.uischema}
              data={dataQueryEditorForm.values.dataQueryOptions}
              renderers={[...materialRenderers, ...customJSONFormRenderers]}
              cells={materialCells}
              // This onChange updates only the 'datasourceOptions' in Formik
              validationMode="ValidateAndShow"
              onChange={_handleDatasourceOptionsChange}
            />
          </div>
          )}
      </>
    </>
  );
};
