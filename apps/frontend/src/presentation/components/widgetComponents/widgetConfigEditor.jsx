import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import PropTypes from "prop-types";

import {
  WIDGETS_MAP,
  WidgetEditorContext,
  WidgetConfigShell,
  WidgetStyleSection,
  WidgetAccessibilitySection,
  ConfigSection,
  ConfigField,
} from "@jet-admin/widgets-ui";
import { WIDGET_PROCESSORS_MAP } from "@jet-admin/widgets-logic";
import { getWidgetDescriptor } from "@jet-admin/widget-types";
import { uploadWidgetFileAPI } from "../../../data/apis/widget";
import { WidgetAdvancedOptions } from "./widgetAdvancedOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@jet-admin/ui";

import { WidgetPropertiesEditor } from "./widgetPropertiesEditor";
import { WidgetEventsEditor } from "./widgetEventsEditor";

/**
 * WidgetConfigEditor
 *
 * Shared shell owner: identity header, settings search, four tabs, modified
 * tracking/undo, then the type-specific editor. Data sources and events stay
 * in the app layer and are passed into the shell as slots, so widgets-ui never
 * imports app APIs.
 */
export const WidgetConfigEditor = ({
  widgetEditorForm,
  dataSourceResults,
  appPageEditorForm,
  widgetID = null,
}) => {
  WidgetConfigEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
    dataSourceResults: PropTypes.object,
    onDataSourceResults: PropTypes.func,
    appPageEditorForm: PropTypes.object,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  const { tenantID } = useParams();

  const widgetType = widgetEditorForm.values.widgetType;
  const widgetMeta = WIDGETS_MAP[widgetType];
  const ConfigEditorComponent = widgetMeta?.configEditor;
  const usesConfigKit = !!ConfigEditorComponent?.usesConfigKit;

  // Get the data manifest from the builder
  const builder = WIDGET_PROCESSORS_MAP?.[widgetType];
  const dataManifest = builder?.constructor?.dataManifest;
  void dataManifest;

  // Extract all referenced page-level data sources from the widget config
  const referencedDataSources = useMemo(() => {
    const config = widgetEditorForm.values.widgetConfig;
    if (!config) return [];
    try {
      const configString = JSON.stringify(config);
      const queryMatches = [...configString.matchAll(/queries\.([a-zA-Z0-9_]+)/g)].map((m) => ({ alias: m[1], type: "query" }));
      const workflowMatches = [...configString.matchAll(/workflows\.([a-zA-Z0-9_]+)/g)].map((m) => ({ alias: m[1], type: "workflow" }));

      const unique = [];
      const seen = new Set();
      for (const item of [...queryMatches, ...workflowMatches]) {
        if (!seen.has(item.alias)) {
          seen.add(item.alias);
          unique.push(item);
        }
      }
      return unique;
    } catch {
      return [];
    }
  }, [widgetEditorForm.values.widgetConfig]);

  const previewStateTree = dataSourceResults;

  const handleUploadFile = React.useCallback(async (file) => {
    return await uploadWidgetFileAPI({ tenantID, file });
  }, [tenantID]);

  const widgetEditorContextValue = React.useMemo(
    () => ({
      tenantID,
      fileUpload: {
        uploadFile: handleUploadFile,
      },
      apiProxy: {
        post: async () => {
          throw new Error("apiProxy is not fully supported for widgets yet");
        },
      },
    }),
    [tenantID, handleUploadFile]
  );

  const defaultConfig = useMemo(() => {
    const descriptorDefaults = getWidgetDescriptor(widgetType)?.defaults || {};
    const sampleConfig = widgetMeta?.sampleConfig || {};
    return {
      ...descriptorDefaults,
      ...sampleConfig,
      properties: {
        showHeader: true,
        density: "comfortable",
        ...(sampleConfig.properties || {}),
      },
    };
  }, [widgetType, widgetMeta]);

  const dataPanel = (
    <ConfigSection
      id="shared-content-data"
      title="Page data sources"
      description="This widget consumes page-level queries/workflows through expressions."
      tab="content"
      keywords="data source query workflow binding state queries"
    >
      <p className="text-[11px] leading-normal text-muted-foreground">
        Reference data with{" "}
        <code className="rounded-control border border-border bg-muted px-1 py-0.5 font-mono text-[10px] text-primary">
          {"{{ state.queries.alias.data }}"}
        </code>{" "}
        or{" "}
        <code className="rounded-control border border-border bg-muted px-1 py-0.5 font-mono text-[10px] text-primary">
          {"{{ state.workflows.alias.data }}"}
        </code>
        . Edit the page data sources once in the page Data tab.
      </p>
      {referencedDataSources.length === 0 ? (
        <div className="rounded-control border border-dashed border-border bg-background/50 p-3 text-center text-[11px] text-muted-foreground">
          No page data sources referenced yet. Add a binding in the widget settings below.
        </div>
      ) : (
        <div className="space-y-1">
          {referencedDataSources.map(({ alias, type }) => (
            <div
              key={`${type}-${alias}`}
              className="flex items-center justify-between rounded-control border border-border/60 bg-background px-2 py-1.5 font-mono text-[11px] text-foreground"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={type === "workflow" ? "h-2 w-2 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-success"} aria-hidden="true" />
                <span className="truncate">{type === "workflow" ? "workflows" : "queries"}.{alias}.data</span>
              </div>
              <span className="rounded-control border border-border bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {type}
              </span>
            </div>
          ))}
        </div>
      )}
    </ConfigSection>
  );

  const typePanel = (
    <ConfigSection
      id="shared-content-type"
      title="Widget type"
      description="Changing the type swaps the settings below but keeps the shared data, events and style."
      tab="content"
      keywords="type kind widget picker"
    >
      <ConfigField label="Type" htmlFor="widget-type-select">
        <Select value={widgetType ? String(widgetType) : undefined} onValueChange={(val) => widgetEditorForm.setFieldValue("widgetType", val)}>
          <SelectTrigger id="widget-type-select" className="text-xs">
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
      </ConfigField>
    </ConfigSection>
  );

  const headerPanel = (
    <ConfigSection
      id="shared-style-header"
      title="Header"
      description="The page chrome around this widget."
      tab="style"
      keywords="header title show hide refresh"
    >
      <ConfigField
        label="Show widget header"
        path="properties.showHeader"
        defaultValue={true}
        inline
        htmlFor="show-widget-header"
        helper="Includes the widget title and refresh action."
      >
        <Switch
          id="show-widget-header"
          checked={widgetEditorForm.values.widgetConfig?.properties?.showHeader ?? true}
          onCheckedChange={(checked) => widgetEditorForm.setFieldValue("widgetConfig.properties.showHeader", !!checked)}
        />
      </ConfigField>
      <p className="text-[10px] leading-snug text-muted-foreground">
        Header text uses the widget name above. The ID chip is copyable for bindings.
      </p>
    </ConfigSection>
  );

  const behaviorPanel = (
    <ConfigSection
      id="shared-behavior-events"
      title="Events & actions"
      description="Run page actions when this widget changes or is clicked."
      tab="behavior"
      keywords="events actions click change submit workflow query toast navigate"
    >
      <WidgetEventsEditor
        widgetEditorForm={widgetEditorForm}
        stateTree={previewStateTree}
        appPageEditorForm={appPageEditorForm}
      />
    </ConfigSection>
  );

  const advancedPanel = (
    <>
      <WidgetAccessibilitySection />
      <WidgetAdvancedOptions widgetForm={widgetEditorForm} parentWidgetType={widgetType} />
      <WidgetPropertiesEditor widgetEditorForm={widgetEditorForm} />
    </>
  );

  return (
    <WidgetConfigShell
      widgetType={widgetType}
      widgetLabel={widgetMeta?.label}
      widgetIcon={widgetMeta?.icon}
      widgetID={widgetID}
      widgetEditorForm={widgetEditorForm}
      defaultConfig={defaultConfig}
      slots={{
        content: (
          <>
            {typePanel}
            {dataPanel}
          </>
        ),
        style: (
          <>
            {headerPanel}
            <WidgetStyleSection widgetType={widgetType} />
          </>
        ),
        behavior: behaviorPanel,
        advanced: advancedPanel,
      }}
      allowEmptySearchState={usesConfigKit}
    >
      {ConfigEditorComponent ? (
        usesConfigKit ? (
          <WidgetEditorContext.Provider value={widgetEditorContextValue}>
            <ConfigEditorComponent
              widgetEditorForm={widgetEditorForm}
              stateTree={previewStateTree}
              workflowContext={previewStateTree}
              queryResults={previewStateTree}
            />
          </WidgetEditorContext.Provider>
        ) : (
          <ConfigSection
            id={`legacy-${widgetType}`}
            title={`${widgetMeta?.label || "Widget"} settings`}
            description="Search inside this section is limited until this editor moves to the shared kit."
            tab="content"
            keywords={`${widgetMeta?.label || ""} ${Object.keys(widgetMeta?.sampleConfig || {}).join(" ")}`}
          >
            <WidgetEditorContext.Provider value={widgetEditorContextValue}>
              <ConfigEditorComponent
                widgetEditorForm={widgetEditorForm}
                stateTree={previewStateTree}
                workflowContext={previewStateTree}
                queryResults={previewStateTree}
              />
            </WidgetEditorContext.Provider>
          </ConfigSection>
        )
      ) : (
        <ConfigSection id="shared-content-missing" title="Unsupported widget type" tab="content">
          <p className="text-xs text-muted-foreground">
            This widget type has no configuration editor. Choose a supported type above.
          </p>
        </ConfigSection>
      )}
    </WidgetConfigShell>
  );
};

export default WidgetConfigEditor;
