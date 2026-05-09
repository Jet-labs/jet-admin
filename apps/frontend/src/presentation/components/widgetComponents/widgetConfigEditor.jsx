import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useWorkflows } from "../../../logic/hooks/useWorkflows";
import { useDataQueries } from "../../../logic/hooks/useDataQueries";
import { testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { executeWorkflowAPI } from "../../../data/apis/workflow";

import PropTypes from "prop-types";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { WIDGET_PROCESSORS_MAP } from "@jet-admin/widgets-logic";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import { DataSourcesEditor } from "./dataSourcesEditor";

import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@jet-admin/ui";

import { WidgetPropertiesEditor } from "./widgetPropertiesEditor";
import { WidgetEventsEditor } from "./widgetEventsEditor";

/**
 * Execute all bound data sources and return normalized results.
 * Supports both data queries and workflows.
 * @param {Array} dataSources - Array of { type, queryID/workflowID, alias, inputArgValues }
 * @param {string} tenantID
 * @returns {Promise<object>} { alias: resultData }
 */
const executeDataSources = async (dataSources, tenantID) => {
  if (!dataSources?.length) return null;
  const results = {};

  for (const source of dataSources) {
    if (!source.alias) continue;

    if (source.type === "query" && source.queryID) {
      try {
        const result = await testDataQueryByIDAPI({
          tenantID,
          dataQueryID: source.queryID,
          inputArgs: source.inputArgValues || {},
        });
        results[source.alias] = result;
      } catch (err) {
        results[source.alias] = { error: err.message || String(err) };
      }
    }

    if (source.type === "workflow" && source.workflowID) {
      try {
        const result = await executeWorkflowAPI({
          tenantID,
          workflowID: source.workflowID,
          inputArgs: source.inputArgValues || {},
        });
        // executeWorkflowAPI returns { success, context, ... }
        // Store the full context so users can traverse it via dataMapping paths
        results[source.alias] = result.context || result;
      } catch (err) {
        results[source.alias] = { error: err.message || String(err) };
      }
    }
  }

  return Object.keys(results).length > 0 ? results : null;
};

export const WidgetConfigEditor = ({
  widgetEditorForm,
  dataSourceResults,
  onDataSourceResults,
}) => {
  WidgetConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    dataSourceResults: PropTypes.object,
    onDataSourceResults: PropTypes.func,
  };

  const { tenantID } = useParams();
  const { workflows } = useWorkflows(tenantID);
  const { dataQueries } = useDataQueries(tenantID);

  const widgetType = widgetEditorForm.values.widgetType;
  const ConfigEditorComponent = WIDGETS_MAP[widgetType]?.configEditor;

  // Get the data manifest from the builder
  const builder = WIDGET_PROCESSORS_MAP?.[widgetType];
  const dataManifest = builder?.constructor?.dataManifest;

  // Data execution state
  const [isTestRunning, setIsTestRunning] = useState(false);
  const autoLoadedRef = useRef(false);

  // Auto-load data when widget has existing dataSources on mount/load
  const dataSources = widgetEditorForm.values.widgetConfig?.dataSources;
  useEffect(() => {
    if (
      !autoLoadedRef.current &&
      dataSources?.length > 0 &&
      dataSources.some((s) => s.queryID || s.workflowID) &&
      tenantID
    ) {
      autoLoadedRef.current = true;
      setIsTestRunning(true);
      executeDataSources(dataSources, tenantID)
        .then((results) => {
          if (results) onDataSourceResults?.(results);
        })
        .finally(() => setIsTestRunning(false));
    }
  }, [dataSources, tenantID, onDataSourceResults]);

  // Manual test run / refresh
  const handleTestRun = useCallback(async () => {
    const sources = widgetEditorForm.values.widgetConfig?.dataSources || [];
    if (sources.length === 0) return;

    setIsTestRunning(true);
    try {
      const results = await executeDataSources(sources, tenantID);
      onDataSourceResults?.(results);
    } finally {
      setIsTestRunning(false);
    }
  }, [widgetEditorForm.values.widgetConfig?.dataSources, tenantID, onDataSourceResults]);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      {/* Widget Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="widgetTitle"
          className="text-xs font-medium text-foreground"
        >
          {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="widgetTitle"
          id="widgetTitle"
          className="text-sm"
          placeholder={CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_NAME_FIELD_PLACEHOLDER}
          required={true}
          onChange={widgetEditorForm.handleChange}
          onBlur={widgetEditorForm.handleBlur}
          value={widgetEditorForm.values.widgetTitle}
        />
      </div>

      {/* Widget Type */}
      <div className="space-y-1.5">
        <Label
          htmlFor="widgetType"
          className="text-xs font-medium text-foreground"
        >
          Select widget type
        </Label>
        <Select value={widgetType} onValueChange={(val) => widgetEditorForm.setFieldValue('widgetType', val)}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(WIDGETS_MAP).map((widget) => (
              <SelectItem key={widget.value} value={widget.value}>
                {widget.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show Header toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="showHeader"
          checked={widgetEditorForm.values.widgetConfig?.properties?.showHeader ?? true}
          onCheckedChange={(checked) =>
            widgetEditorForm.setFieldValue('widgetConfig.properties.showHeader', !!checked)
          }
        />
        <Label htmlFor="showHeader" className="text-xs text-muted-foreground cursor-pointer">
          Show widget header (with refresh button)
        </Label>
      </div>

      {/* ═══════════════════════════════════════════
          TABBED EDITOR: Data / Properties / Events
          ═══════════════════════════════════════════ */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
          <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
          <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-3 space-y-3">
          {/* Generic Data Sources Editor */}
          <DataSourcesEditor
            widgetEditorForm={widgetEditorForm}
            dataQueries={dataQueries || []}
            workflows={workflows || []}
            dataSourceResults={dataSourceResults}
            onTestRun={handleTestRun}
            isTestRunning={isTestRunning}
          />
        </TabsContent>

        <TabsContent value="properties" className="mt-3 space-y-3">
          {/* Type-Specific Config Editor (chart options, table columns, etc.) */}
          {ConfigEditorComponent && (
            <ConfigEditorComponent
              widgetEditorForm={widgetEditorForm}
              dataSourceResults={dataSourceResults}
              workflowContext={dataSourceResults}
            />
          )}

          {/* Widget Advanced Options Generic Form */}
          <WidgetAdvancedOptions
            widgetForm={widgetEditorForm}
            parentWidgetType={widgetType}
          />

          {/* Custom Properties Editor */}
          <WidgetPropertiesEditor widgetEditorForm={widgetEditorForm} />
        </TabsContent>

        <TabsContent value="events" className="mt-3">
          <WidgetEventsEditor widgetEditorForm={widgetEditorForm} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
