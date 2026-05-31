import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import PropTypes from "prop-types";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { WIDGET_PROCESSORS_MAP } from "@jet-admin/widgets-logic";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import { useWorkflows } from "../../../logic/hooks/useWorkflows";
import { useDataQueries } from "../../../logic/hooks/useDataQueries";

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

export const WidgetConfigEditor = ({
  widgetEditorForm,
  dataSourceResults,
  onDataSourceResults,
  isPageLevelMode = false,
}) => {
  WidgetConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    dataSourceResults: PropTypes.object,
    onDataSourceResults: PropTypes.func,
    isPageLevelMode: PropTypes.bool,
  };

  const { tenantID } = useParams();

  const widgetType = widgetEditorForm.values.widgetType;
  const ConfigEditorComponent = WIDGETS_MAP[widgetType]?.configEditor;

  // Get the data manifest from the builder
  const builder = WIDGET_PROCESSORS_MAP?.[widgetType];
  const dataManifest = builder?.constructor?.dataManifest;

  // Fetch workflows list so chart editors can resolve workflow metadata
  const { workflows } = useWorkflows(tenantID);

  // Extract all referenced page-level data sources from the widget config
  const referencedDataSources = React.useMemo(() => {
    const config = widgetEditorForm.values.widgetConfig;
    if (!config) return [];
    try {
      const configString = JSON.stringify(config);
      const queryMatches = [...configString.matchAll(/queries\.([a-zA-Z0-9_]+)/g)].map(m => ({ alias: m[1], type: "query" }));
      const workflowMatches = [...configString.matchAll(/workflows\.([a-zA-Z0-9_]+)/g)].map(m => ({ alias: m[1], type: "workflow" }));
      
      const unique = [];
      const seen = new Set();
      for (const item of [...queryMatches, ...workflowMatches]) {
        if (!seen.has(item.alias)) {
          seen.add(item.alias);
          unique.push(item);
        }
      }
      return unique;
    } catch (e) {
      return [];
    }
  }, [widgetEditorForm.values.widgetConfig]);

  // Build a properly namespaced state tree from flat dataSourceResults.
  // This mirrors the shape produced by buildAppPageStateTree() at runtime,
  // so intellisense suggestions and path resolution in widget editors
  // use exactly the same paths as the live AppPage runtime.
  //
  // Widgets don't store a `dataSources` config — they contain raw template
  // expressions like {{state.queries.alias.data}}. We use the regex-extracted
  // `referencedDataSources` above to know which aliases are queries vs workflows.
  const previewStateTree = useMemo(() => {
    if (!dataSourceResults) return null;
    const queries = {};
    const workflows = {};

    // Build a lookup of alias → type from the config's template expressions
    const typeByAlias = {};
    for (const ref of referencedDataSources) {
      typeByAlias[ref.alias] = ref.type; // "query" | "workflow"
    }

    // Categorise each result under the correct namespace
    for (const alias of Object.keys(dataSourceResults)) {
      if (typeByAlias[alias] === "workflow") {
        workflows[alias] = dataSourceResults[alias];
      } else {
        // Default to queries (covers explicit "query" type and unknown aliases)
        queries[alias] = dataSourceResults[alias];
      }
    }

    return { queries, workflows, variables: {}, widgets: {}, globals: {} };
  }, [dataSourceResults, referencedDataSources]);

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
          <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
            <Label className="text-xs font-semibold text-foreground">Referenced Page Data Sources</Label>
            <p className="text-[10px] text-muted-foreground leading-normal">
              This widget consumes page-level data sources reactively using expressions like <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">{`{{ state.queries.alias.data }}`}</code> or <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">{`{{ state.workflows.alias.data }}`}</code>.
            </p>
            {referencedDataSources.length === 0 ? (
              <div className="text-xs text-muted-foreground italic border border-dashed rounded-md p-4 text-center bg-background/50">
                No page data sources referenced. Bind data sources using expression syntax in the Properties tab.
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                {referencedDataSources.map(({ alias, type }) => (
                  <div
                    key={alias}
                    className="flex items-center justify-between rounded border border-border/50 bg-background px-2.5 py-1.5 font-mono text-xs text-foreground shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full animate-pulse shrink-0 ${type === 'workflow' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                      <span className="truncate">{type === 'workflow' ? 'workflows' : 'queries'}.{alias}.data</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider px-1.5 py-0.5 bg-muted rounded border border-border">{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="properties" className="mt-3 space-y-3">
          {/* Type-Specific Config Editor (chart options, table columns, etc.) */}
          {ConfigEditorComponent && (
            <ConfigEditorComponent
              widgetEditorForm={widgetEditorForm}
              stateTree={previewStateTree}
              workflowContext={previewStateTree}
              queryResults={previewStateTree}
              workflows={workflows}
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
          <WidgetEventsEditor 
            widgetEditorForm={widgetEditorForm} 
            stateTree={previewStateTree}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
