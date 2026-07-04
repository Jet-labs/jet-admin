import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_TYPES, getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { CONSTANTS } from "../../../constants";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";
import { DatasourceIcon } from "../datasourceComponents/datasourceIcon";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
  Section,
  SearchSelect,
} from "@jet-admin/ui";
import { useInfiniteDatasources } from "../../../logic/hooks/useDatasources";
import { getDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { RealtimeListenerGuidanceBox } from "./realtimeListenerGuidanceBox";

// Get only datasource types that support listeners
const getListenerCapableDatasources = () => {
  return Object.values(DATASOURCE_TYPES).filter(
    (ds) => ds.supportsListener === true
  );
};

export const ListenerEditor = ({ listenerEditorForm, tenantID }) => {
  ListenerEditor.propTypes = {
    listenerEditorForm: PropTypes.object.isRequired,
    tenantID: PropTypes.string.isRequired,
  };

  const [datasourceSearch, setDatasourceSearch] = useState("");
  const debouncedDatasourceSearch = useDebounce(datasourceSearch, 300);

  const {
    datasources,
    isLoadingDatasources,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadDatasourcesError,
  } = useInfiniteDatasources(tenantID, debouncedDatasourceSearch);

  const selectedDatasourceID = listenerEditorForm.values.datasourceID;
  const { data: selectedDatasourceDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), "detail", selectedDatasourceID],
    queryFn: () => getDatasourceByIDAPI({ tenantID, datasourceID: selectedDatasourceID }),
    enabled: Boolean(tenantID) && Boolean(selectedDatasourceID),
    refetchOnWindowFocus: false,
  });

  // Track JsonForms init to prevent spurious onChange during mount
  const isJsonFormsInitialized = useRef(false);

  const handleListenerConfigChange = useCallback(
    ({ data }) => {
      if (!isJsonFormsInitialized.current) {
        isJsonFormsInitialized.current = true;
        return;
      }
      if (
        JSON.stringify(data) !==
        JSON.stringify(listenerEditorForm.values.listenerConfig)
      ) {
        listenerEditorForm.setFieldValue("listenerConfig", data);
      }
    },
    [listenerEditorForm]
  );

  // Reset init flag when datasource changes
  const previousDatasourceID = useRef(
    listenerEditorForm.values.datasourceID
  );
  if (
    previousDatasourceID.current !==
    listenerEditorForm.values.datasourceID
  ) {
    previousDatasourceID.current = listenerEditorForm.values.datasourceID;
    isJsonFormsInitialized.current = false;
  }

  // Get the selected datasource's type config
  const selectedDatasource = useMemo(() => {
    return selectedDatasourceDetail || datasources?.find(
      (ds) => ds.datasourceID === listenerEditorForm.values.datasourceID
    );
  }, [selectedDatasourceDetail, datasources, listenerEditorForm.values.datasourceID]);

  // Fallback to listenerType if datasource not found or still loading
  const effectiveDatasourceType =
    selectedDatasource?.datasourceType ||
    listenerEditorForm.values.listenerType;

  const datasourceTypeConfig = effectiveDatasourceType
    ? getDatasourceTypeByValue(effectiveDatasourceType)
    : null;

  // Filter datasources to only those whose type supports listeners
  const listenerCapableTypes = useMemo(() => getListenerCapableDatasources().map(
    (ds) => ds.value
  ), []);

  const filteredDatasources = useMemo(() => {
    return datasources?.filter((ds) =>
      listenerCapableTypes.includes(ds.datasourceType) ||
      ds.datasourceID === listenerEditorForm.values.datasourceID
    ) || [];
  }, [datasources, listenerCapableTypes, listenerEditorForm.values.datasourceID]);

  return (
    <div className="space-y-4">
      {/* Identity section */}
      <Section title="Identity">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-1.5">
            <Label htmlFor="listenerTitle">
              {CONSTANTS.STRINGS.LISTENER_EDITOR_FORM_TITLE_FIELD_LABEL}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              name="listenerTitle"
              id="listenerTitle"
              placeholder={
                CONSTANTS.STRINGS.LISTENER_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
              }
              required={true}
              onChange={listenerEditorForm.handleChange}
              onBlur={listenerEditorForm.handleBlur}
              value={listenerEditorForm.values.listenerTitle}
            />
            {listenerEditorForm.errors.listenerTitle && (
              <p className="text-xs text-red-500">
                {listenerEditorForm.errors.listenerTitle}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listenerStatus">Status</Label>
            <Select
              value={listenerEditorForm.values.status}
              onValueChange={(val) =>
                listenerEditorForm.setFieldValue("status", val)
              }
            >
              <SelectTrigger id="listenerStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    Inactive
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="listenerDescription">Description</Label>
          <Textarea
            name="listenerDescription"
            id="listenerDescription"
            placeholder="Optional description of what this listener does"
            onChange={listenerEditorForm.handleChange}
            onBlur={listenerEditorForm.handleBlur}
            value={listenerEditorForm.values.listenerDescription || ""}
            rows={2}
          />
        </div>
      </Section>

      {/* Datasource selection */}
      <Section
        title={CONSTANTS.STRINGS.LISTENER_EDITOR_FORM_DATASOURCE_FIELD_LABEL}
        description="Select a datasource that supports real-time subscriptions"
      >
        <div className="space-y-1.5">
          <SearchSelect
            value={listenerEditorForm.values.datasourceID || ""}
            onChange={(val) => {
              listenerEditorForm.setFieldValue("datasourceID", val);
              // Auto-set the listener type from the datasource type
              const ds = datasources?.find((d) => d.datasourceID === val);
              if (ds) {
                listenerEditorForm.setFieldValue("listenerType", ds.datasourceType);
                // Reset config to defaults from schema
                const typeConfig = getDatasourceTypeByValue(ds.datasourceType);
                if (typeConfig?.listenerConfigForm?.data) {
                  listenerEditorForm.setFieldValue(
                    "listenerConfig",
                    typeConfig.listenerConfigForm.data
                  );
                }
              }
            }}
            options={filteredDatasources.map((ds) => ({
              value: ds.datasourceID,
              label: ds.datasourceTitle,
            }))}
            onSearchChange={setDatasourceSearch}
            onLoadMore={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoadingDatasources}
            placeholder="Select a data source"
          />
        </div>

        {/* Show selected datasource badge */}
        {datasourceTypeConfig && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-muted rounded-sm border border-border">
            <DatasourceIcon
              icon={datasourceTypeConfig.icon}
              iconColor={datasourceTypeConfig.iconColor}
              size={20}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {selectedDatasource?.datasourceTitle}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {datasourceTypeConfig.name} listener
              </span>
            </div>
          </div>
        )}
      </Section>

      {/* Listener configuration (JSON Forms from listenerConfig schema) */}
      {datasourceTypeConfig?.listenerConfigForm && (
        <Section
          title={CONSTANTS.STRINGS.LISTENER_EDITOR_FORM_CONFIG_FIELD_LABEL}
          description={`Configure ${datasourceTypeConfig.name} listener settings`}
        >
          <JsonForms
            schema={datasourceTypeConfig.listenerConfigForm.schema}
            uischema={datasourceTypeConfig.listenerConfigForm.uischema}
            data={listenerEditorForm.values.listenerConfig}
            renderers={[...materialRenderers, ...customJSONFormRenderers]}
            cells={materialCells}
            onChange={handleListenerConfigChange}
          />
        </Section>
      )}

      {/* Real-time Listener Guidance & Test Snippets Box */}
      {effectiveDatasourceType && (
        <RealtimeListenerGuidanceBox
          tenantID={tenantID}
          listenerID={listenerEditorForm.values.listenerID}
          datasourceType={effectiveDatasourceType}
          listenerConfig={listenerEditorForm.values.listenerConfig}
          datasourceOptions={selectedDatasource?.datasourceOptions}
          typeConfig={datasourceTypeConfig}
        />
      )}
    </div>
  );
};
