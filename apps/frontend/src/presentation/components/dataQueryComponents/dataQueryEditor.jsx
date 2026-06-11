import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS, QueryEditorContext } from "@jet-admin/datasources-ui";
import { proxyDatasourceActionAPI } from "../../../data/apis/datasource";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { MODES } from "@jet-admin/expression-engine";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useDatasourceOptions } from "../../../logic/hooks/useDatasourceOptions";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
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



// Map a declared input type to a representative sample value so the engine can
// infer member completions (e.g. string methods, array helpers).
const sampleForInputType = (type) => {
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

// Build the safe-path context tree exposed to query templates. `inputs` is
// valid roots on the backend (see queryEngine allowedRoots).
const buildQueryInputsStateTree = (queryInputs = []) => {
  const inputs = {};
  const seen = new Set();

  (queryInputs || [])
    .filter((inputDef) => typeof inputDef?.key === "string" && inputDef.key.trim())
    .forEach((inputDef) => {
      const key = inputDef.key.trim();
      if (seen.has(key)) return;
      seen.add(key);
      inputs[key] = sampleForInputType(inputDef.type);
    });

  return { inputs };
};

// Inject context for {{ }} intellisense into every Control's options:
//   queryInputs   → declared inputs (Monaco code-editor fallback context)
//   stateTree     → { inputs } live tree for suggestions
//   templateMode  → expression-engine mode (queries resolve via safe-path)
const injectQueryInputsIntoUiSchema = (uiSchema, injection) => {
  if (!uiSchema || typeof uiSchema !== "object") {
    return uiSchema;
  }

  if (Array.isArray(uiSchema)) {
    return uiSchema.map((childUiSchema) =>
      injectQueryInputsIntoUiSchema(childUiSchema, injection)
    );
  }

  const nextUiSchema = {
    ...uiSchema,
    ...(uiSchema.type === "Control"
      ? {
        options: {
          ...(uiSchema.options || {}),
          queryInputs: injection.queryInputs,
          stateTree: injection.stateTree,
          templateMode: injection.templateMode,
        },
      }
      : {}),
  };

  if (Array.isArray(uiSchema.elements)) {
    nextUiSchema.elements = uiSchema.elements.map((childUiSchema) =>
      injectQueryInputsIntoUiSchema(childUiSchema, injection)
    );
  }

  if (uiSchema.detail) {
    nextUiSchema.detail = injectQueryInputsIntoUiSchema(uiSchema.detail, injection);
  }

  if (uiSchema.options?.detail) {
    nextUiSchema.options = {
      ...(nextUiSchema.options || {}),
      detail: injectQueryInputsIntoUiSchema(uiSchema.options.detail, injection),
    };
  }

  return nextUiSchema;
};

/**
 * Builds a strict QueryEditorForm interface from the raw Formik form.
 * Dedicated query editors can only access the methods exposed here — they cannot
 * touch dataQueryTitle, datasourceID, or other unrelated fields.
 */
function buildQueryEditorForm(formikForm) {
  return {
    // Read-only accessors
    get dataQueryOptions() {
      return formikForm.values.dataQueryOptions;
    },
    get dataQueryTitle() {
      return formikForm.values.dataQueryTitle;
    },
    get datasourceType() {
      return formikForm.values.datasourceType;
    },
    get datasourceID() {
      return formikForm.values.datasourceID;
    },

    // Controlled mutation methods
    setQueryOptions: (options) => {
      formikForm.setFieldValue("dataQueryOptions", options);
    },
    patchQueryOptions: (patch) => {
      formikForm.setFieldValue("dataQueryOptions", {
        ...formikForm.values.dataQueryOptions,
        ...patch,
      });
    },
  };
}

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
  const { datasources, isLoadingDatasources, loadDatasourcesError } = useDatasourceOptions(tenantID);

  // Get the current datasource type config
  const currentDatasourceType = getDatasourceTypeByValue(dataQueryEditorForm.values.datasourceType);
  const queryConfigUiSchema = useMemo(() => {
    const queryInputs = dataQueryEditorForm.values.dataQueryOptions?.inputDefinitions || [];
    return injectQueryInputsIntoUiSchema(
      currentDatasourceType?.queryConfigForm?.uischema,
      {
        queryInputs,
        stateTree: buildQueryInputsStateTree(queryInputs),
        templateMode: MODES.SAFE_PATH,
      }
    );
  }, [
    currentDatasourceType?.queryConfigForm?.uischema,
    dataQueryEditorForm.values.dataQueryOptions?.inputDefinitions,
  ]);

  // This handler specifically updates the 'dataQueryOptions' part of Formik's state
  const _handleDatasourceOptionsChange = useCallback(
    ({ data }) => {
      dataQueryEditorForm.setFieldValue("dataQueryOptions", data);
    },
    [dataQueryEditorForm]
  );

  const _handleDatasourceTypeChange = useCallback(
    (val) => {
      if (!val) return; // Prevent phantom empty events from clearing the ID
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

  // Build the strict query editor form interface for dedicated editors
  const strictQueryEditorForm = useMemo(
    () => buildQueryEditorForm(dataQueryEditorForm),
    [dataQueryEditorForm]
  );

  // Build the QueryEditorContext value with all platform capabilities
  const queryEditorContextValue = useMemo(
    () => ({
      tenantID,
      datasourceID: dataQueryEditorForm.values.datasourceID,
      datasourceType: dataQueryEditorForm.values.datasourceType,
      apiProxy: {
        post: async (action, params) => {
          return await proxyDatasourceActionAPI({
            tenantID,
            datasourceID: dataQueryEditorForm.values.datasourceID,
            action,
            params,
          });
        },
      },
    }),
    [tenantID, dataQueryEditorForm.values.datasourceID, dataQueryEditorForm.values.datasourceType]
  );

  // Check if this datasource type has a dedicated query editor AND it's actually registered
  const hasDedicatedQueryEditor =
    currentDatasourceType?.hasDedicatedQueryEditor &&
    DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType]?.dedicatedQueryEditor;

  return (
    <ReactQueryLoadingErrorWrapper isLoading={isLoadingDatasources} error={loadDatasourcesError}>
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
                  value={dataQueryEditorForm.values.datasourceID ? String(dataQueryEditorForm.values.datasourceID) : undefined}
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

          {/* Render dedicated query editor OR JsonForms fallback */}
          {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType] && (
            hasDedicatedQueryEditor ? (
              <div className="border-t border-border pt-4 mt-2">
                <QueryEditorContext.Provider value={queryEditorContextValue}>
                  {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType]
                    .dedicatedQueryEditor({ queryEditorForm: strictQueryEditorForm })}
                </QueryEditorContext.Provider>
              </div>
            ) : currentDatasourceType?.queryConfigForm ? (
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
            ) : null
          )}
        </div>
      </Section>
    </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
