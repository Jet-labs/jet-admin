import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { MODES } from "@jet-admin/expression-engine";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useDatasourceOptions } from "../../../logic/hooks/useDatasourceOptions";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Section,
} from "@jet-admin/ui";



// Map a declared arg type to a representative sample value so the engine can
// infer member completions (e.g. string methods, array helpers).
const sampleForArgType = (type) => {
  switch ((type || "").toLowerCase()) {
    case "number":
    case "integer":
    case "float":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
};

// Build the safe-path context tree exposed to query templates. `args` is
// valid roots on the backend (see queryEngine allowedRoots).
const buildQueryArgsStateTree = (queryArgs = []) => {
  const args = {};
  const seen = new Set();

  (queryArgs || [])
    .filter((arg) => typeof arg?.key === "string" && arg.key.trim())
    .forEach((arg) => {
      const key = arg.key.trim();
      if (seen.has(key)) return;
      seen.add(key);
      args[key] = sampleForArgType(arg.type);
    });

  return { args };
};

// Inject context for {{ }} intellisense into every Control's options:
//   queryArgs     → declared args (Monaco code-editor fallback context)
//   stateTree     → { args } live tree for suggestions
//   templateMode  → expression-engine mode (queries resolve via safe-path)
const injectQueryArgsIntoUiSchema = (uiSchema, injection) => {
  if (!uiSchema || typeof uiSchema !== "object") {
    return uiSchema;
  }

  if (Array.isArray(uiSchema)) {
    return uiSchema.map((childUiSchema) =>
      injectQueryArgsIntoUiSchema(childUiSchema, injection)
    );
  }

  const nextUiSchema = {
    ...uiSchema,
    ...(uiSchema.type === "Control"
      ? {
        options: {
          ...(uiSchema.options || {}),
          queryArgs: injection.queryArgs,
          stateTree: injection.stateTree,
          templateMode: injection.templateMode,
        },
      }
      : {}),
  };

  if (Array.isArray(uiSchema.elements)) {
    nextUiSchema.elements = uiSchema.elements.map((childUiSchema) =>
      injectQueryArgsIntoUiSchema(childUiSchema, injection)
    );
  }

  if (uiSchema.detail) {
    nextUiSchema.detail = injectQueryArgsIntoUiSchema(uiSchema.detail, injection);
  }

  if (uiSchema.options?.detail) {
    nextUiSchema.options = {
      ...(nextUiSchema.options || {}),
      detail: injectQueryArgsIntoUiSchema(uiSchema.options.detail, injection),
    };
  }

  return nextUiSchema;
};


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
  const { datasources, isLoadingDatasources } = useDatasourceOptions(tenantID);

  // Get the current datasource type config
  const currentDatasourceType = getDatasourceTypeByValue(dataQueryEditorForm.values.datasourceType);
  const queryConfigUiSchema = useMemo(() => {
    const queryArgs = dataQueryEditorForm.values.dataQueryOptions?.args || [];
    return injectQueryArgsIntoUiSchema(
      currentDatasourceType?.queryConfigForm?.uischema,
      {
        queryArgs,
        stateTree: buildQueryArgsStateTree(queryArgs),
        templateMode: MODES.SAFE_PATH,
      }
    );
  }, [
    currentDatasourceType?.queryConfigForm?.uischema,
    dataQueryEditorForm.values.dataQueryOptions?.args,
  ]);

  // This handler specifically updates the 'datasourceOptions' part of Formik's state
  const _handleDatasourceOptionsChange = useCallback(
    ({ data }) => {
      console.log("data", data);
      dataQueryEditorForm.setFieldValue("dataQueryOptions", data);
    },
    [dataQueryEditorForm]
  );

  const _handleDatasourceTypeChange = useCallback(
    (val) => {
      dataQueryEditorForm.setFieldValue("datasourceID", val);
      const selectedDatasource = datasources.find(
        (datasource) => String(datasource.value) === String(val)
      );
      if (selectedDatasource) {
        dataQueryEditorForm.setFieldValue(
          "datasourceType",
          selectedDatasource.type
        );
      }
    },
    [dataQueryEditorForm, datasources]
  );

  return (
    <div className="w-full">
      <Section title="Query Configuration">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dataQueryTitle">
              {CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_LABEL} <span className="text-destructive">*</span>
            </Label>
            <Input
              name="dataQueryTitle"
              id="dataQueryTitle"
              placeholder={
                CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={dataQueryEditorForm.handleChange}
              onBlur={dataQueryEditorForm.handleBlur}
              value={dataQueryEditorForm.values.dataQueryTitle}
            />
            {dataQueryEditorForm.touched.dataQueryTitle && dataQueryEditorForm.errors.dataQueryTitle && (
              <p className="text-xs text-red-500">
                {dataQueryEditorForm.errors.dataQueryTitle}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="datasourceID">
              {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL} <span className="text-destructive">*</span>
            </Label>
            {isLoadingDatasources ? (
              <div className="h-10 flex items-center px-3 border border-input bg-background rounded-md text-sm text-muted-foreground italic">
                Loading data sources...
              </div>
            ) : (
              <Select
                value={String(dataQueryEditorForm.values.datasourceID || "")}
                onValueChange={_handleDatasourceTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select datasource" />
                </SelectTrigger>
                <SelectContent>
                  {datasources?.map((datasource) => (
                    <SelectItem key={datasource.value} value={String(datasource.value)}>
                      {datasource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {dataQueryEditorForm.touched.datasourceID && dataQueryEditorForm.errors.datasourceID && (
              <p className="text-xs text-red-500">
                {dataQueryEditorForm.errors.datasourceID}
              </p>
            )}
          </div>

          {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType] &&
            currentDatasourceType?.queryConfigForm && (
              <div className="border-t border-border pt-4 mt-2">
                <JsonForms
                  key={uniqueKey}
                  schema={currentDatasourceType.queryConfigForm.schema}
                  uischema={queryConfigUiSchema}
                  data={dataQueryEditorForm.values.dataQueryOptions}
                  renderers={[...materialRenderers, ...customJSONFormRenderers]}
                  cells={materialCells}
                  validationMode="ValidateAndShow"
                  onChange={_handleDatasourceOptionsChange}
                />
              </div>
          )}
        </div>
      </Section>
    </div>
  );
};
