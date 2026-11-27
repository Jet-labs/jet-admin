import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS, QueryEditorContext } from "@jet-admin/datasources-ui";
import { proxyDatasourceActionAPI, getDatasourceByIDAPI } from "../../../data/apis/datasource";
import { getAssetVersionsAPI } from "../../../data/apis/assetVersion";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { MODES } from "@jet-admin/expression-engine";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { useInfiniteDatasourceOptions } from "../../../logic/hooks/useDatasourceOptions";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Input,
  Label,
  SearchSelect,
  Section,
  CodeEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
      // Preserve transformer script which is managed outside the dedicated editors
      const transformerScript = formikForm.values.dataQueryOptions?.transformerScript;
      formikForm.setFieldValue("dataQueryOptions", {
        ...options,
        ...(transformerScript !== undefined ? { transformerScript } : {}),
      });
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
  dataQueryTestResult,
}) => {
  DataQueryEditor.propTypes = {
    dataQueryEditorForm: PropTypes.object.isRequired,
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataQueryID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataQueryTestResult: PropTypes.object,
  };
  const uniqueKey = dataQueryID
    ? `dataQueryEditor_${tenantID}_${dataQueryID}`
    : `dataQueryEditor_${tenantID}`;

  const [datasourceSearch, setDatasourceSearch] = useState("");
  const debouncedDatasourceSearch = useDebounce(datasourceSearch, 300);

  const {
    datasources,
    isLoadingDatasources,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadDatasourcesError,
  } = useInfiniteDatasourceOptions(tenantID, debouncedDatasourceSearch);

  const selectedDatasourceID = dataQueryEditorForm.values.datasourceID;
  const selectedDatasourceVersionMode =
    dataQueryEditorForm.values.dataQueryOptions?.datasourceVersionMode ||
    (dataQueryEditorForm.values.dataQueryOptions?.datasourceVersionID
      ? "specific"
      : "latest-at-capture");
  const { data: datasourceVersionsData, isLoading: isLoadingDatasourceVersions } = useQuery({
    queryKey: ["asset-versions", tenantID, "datasource", selectedDatasourceID],
    queryFn: () =>
      getAssetVersionsAPI({
        tenantID,
        assetType: "datasource",
        assetID: selectedDatasourceID,
        page: 1,
        pageSize: 100,
      }),
    enabled: Boolean(tenantID) && Boolean(selectedDatasourceID),
    refetchOnWindowFocus: false,
  });
  const datasourceVersions = datasourceVersionsData?.versions || [];
  const { data: selectedDatasourceDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), "detail", selectedDatasourceID],
    queryFn: () => getDatasourceByIDAPI({ tenantID, datasourceID: selectedDatasourceID }),
    enabled: Boolean(tenantID) && Boolean(selectedDatasourceID) && isNaN(Number(selectedDatasourceID)) === false,
    refetchOnWindowFocus: false,
  });

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
      const previous = dataQueryEditorForm.values.dataQueryOptions || {};
      dataQueryEditorForm.setFieldValue("dataQueryOptions", {
        ...data,
        datasourceVersionMode: previous.datasourceVersionMode,
        datasourceVersionID: previous.datasourceVersionID,
      });
    },
    [dataQueryEditorForm]
  );

  const _handleDatasourceTypeChange = useCallback(
    (val) => {
      if (!val) return; // Prevent phantom empty events from clearing the ID
      dataQueryEditorForm.setFieldValue("datasourceID", val);
      dataQueryEditorForm.setFieldValue("dataQueryOptions", {
        ...(dataQueryEditorForm.values.dataQueryOptions || {}),
        datasourceVersionMode: "latest-at-capture",
        datasourceVersionID: "",
      });
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
    <div className="w-full space-y-4">
      <Section title="Query Configuration">
          <div className="space-y-2">
          <div className="space-y-1">
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
              <p className="text-xs text-destructive">
                {dataQueryEditorForm.errors.dataQueryTitle}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="datasourceID">
              {CONSTANTS.STRINGS.DATASOURCE_EDITOR_FORM_TYPE_FIELD_LABEL} <span className="text-destructive">*</span>
            </Label>
            {isLoadingDatasources ? (
              <div className="h-10 flex items-center px-3 border border-input bg-background rounded text-sm text-muted-foreground italic">
                Loading data sources...
              </div>
            ) : (
              <SearchSelect
                value={dataQueryEditorForm.values.datasourceID ? String(dataQueryEditorForm.values.datasourceID) : ""}
                onChange={_handleDatasourceTypeChange}
                options={datasources?.map((datasource) => ({
                  value: String(datasource.value),
                  label: datasource.label,
                })) || []}
                onSearchChange={setDatasourceSearch}
                onLoadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoadingDatasources}
                placeholder="Select datasource"
              />
            )}
            {dataQueryEditorForm.touched.datasourceID && dataQueryEditorForm.errors.datasourceID && (
              <p className="text-xs text-destructive">
                {dataQueryEditorForm.errors.datasourceID}
              </p>
            )}
          </div>

          <div className="space-y-1 rounded border border-border/60 bg-background/30 p-2">
            <Label className="text-xs text-muted-foreground">Datasource version at capture</Label>
            <Select
              value={selectedDatasourceVersionMode}
              onValueChange={(value) =>
                dataQueryEditorForm.setFieldValue("dataQueryOptions", {
                  ...(dataQueryEditorForm.values.dataQueryOptions || {}),
                  datasourceVersionMode: value,
                  datasourceVersionID:
                    value === "latest-at-capture"
                      ? ""
                      : dataQueryEditorForm.values.dataQueryOptions?.datasourceVersionID || "",
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest-at-capture">Latest at capture</SelectItem>
                <SelectItem value="specific">Specific version</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Resolved when a query version is created. Environment bindings still select the runtime connection.
            </p>
            {(selectedDatasourceVersionMode === "specific" ||
              dataQueryEditorForm.values.dataQueryOptions?.datasourceVersionID) && (
              <Select
                value={dataQueryEditorForm.values.dataQueryOptions?.datasourceVersionID || ""}
                onValueChange={(value) =>
                  dataQueryEditorForm.setFieldValue("dataQueryOptions", {
                    ...(dataQueryEditorForm.values.dataQueryOptions || {}),
                    datasourceVersionMode: "specific",
                    datasourceVersionID: value,
                  })
                }
                disabled={isLoadingDatasourceVersions}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose a datasource version…" />
                </SelectTrigger>
                <SelectContent>
                  {datasourceVersions.map((version) => (
                    <SelectItem key={version.assetVersionID} value={version.assetVersionID}>
                      v{version.versionNumber}
                      {version.createdAt
                        ? ` · ${new Date(version.createdAt).toLocaleString()}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!isLoadingDatasourceVersions &&
              datasourceVersions.length === 0 &&
              selectedDatasourceVersionMode === "specific" && (
                <p className="text-[10px] text-destructive">
                  No versions exist for this datasource yet.
                </p>
              )}
          </div>

          {/* Global Query Options — kept above datasource-specific fields so
              the control stays visible in the scrollable configurator. */}
          <div className="space-y-1">
            <Label htmlFor="timeoutSeconds">Timeout (seconds)</Label>
            <Input
              name="timeoutSeconds"
              id="timeoutSeconds"
              type="number"
              placeholder="60"
              onChange={(e) => {
                const val = e.target.value === "" ? undefined : Number(e.target.value);
                dataQueryEditorForm.setFieldValue("dataQueryOptions", {
                  ...dataQueryEditorForm.values.dataQueryOptions,
                  timeoutSeconds: val,
                });
              }}
              value={dataQueryEditorForm.values.dataQueryOptions?.timeoutSeconds ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Maximum time the query may run before it is aborted. Defaults to 60 seconds.
            </p>
          </div>

          {/* Render dedicated query editor OR JsonForms fallback */}
          {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType] && (
            hasDedicatedQueryEditor ? (

                <QueryEditorContext.Provider value={queryEditorContextValue}>
                  {DATASOURCE_UI_COMPONENTS[dataQueryEditorForm.values.datasourceType]
                    .dedicatedQueryEditor({ queryEditorForm: strictQueryEditorForm })}
                </QueryEditorContext.Provider>

            ) : currentDatasourceType?.queryConfigForm ? (

                <JsonForms
                  key={uniqueKey}
                  schema={currentDatasourceType.queryConfigForm.schema}
                  uischema={queryConfigUiSchema}
                  data={dataQueryEditorForm.values.dataQueryOptions}
                  renderers={[...materialRenderers, ...customJSONFormRenderers]}
                  cells={materialCells}
                  validationMode={
                    Number(dataQueryEditorForm.submitCount || 0) > 0
                      ? "ValidateAndShow"
                      : "ValidateAndHide"
                  }
                  onChange={_handleDatasourceOptionsChange}
                />

            ) : null
          )}

        </div>
      </Section>
    </div>
  );
};
