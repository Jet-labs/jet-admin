import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { parseVegaLiteSpec } from "./chartSpecParser";
import {
  Button,
  Input,
  Label,
  Switch,
} from "@jet-admin/ui";

import { VegaSpecEditor } from "./vegaSpecEditor";
import { ShelfBuilder } from "./shelfBuilder";
import { AlertTriangle, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { TemplateAutocompleteInput } from "@jet-admin/ui";
import { ConfigSection, ConfigField, BindableInput, OptionListEditor } from "../config";

const VEGA_STRINGS = {
  WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
  WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval",
};

export const VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  queryResults,
  stateTree,
}) => {
  const isVegaLite = widgetEditorForm.values.widgetType === 'vega-lite';
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? 'visual' : 'raw');
  // Wrap so {{ state.X }} paths resolve correctly inside the JS sandbox
  const liveStateTree = useMemo(() => stateTree ? { state: stateTree } : null, [stateTree]);
  
  const [showParseWarning, setShowParseWarning] = useState(false);
  const [parseWarningsList, setParseWarningsList] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Handle mode switch
  const handleModeSwitch = (newMode) => {
    if (newMode === currentMode) return;

    if (newMode === 'visual') {
      try {
        const currentSpecText = widgetEditorForm.values.widgetConfig?.vegaSpec;
        if (currentSpecText) {
          const specObj = typeof currentSpecText === 'string'
            ? JSON.parse(currentSpecText)
            : currentSpecText;

          const { success, config, warnings } = parseVegaLiteSpec(specObj);

          if (!success || warnings.length > 0) {
            setParseWarningsList(warnings || ['Could not fully parse custom modifications.']);
            setShowParseWarning(true);
            return;
          } else if (config) {
            widgetEditorForm.setFieldValue('widgetConfig.shelfSpec', config);
          }
        }
      } catch (e) {
        setParseWarningsList([`Invalid JSON: ${e.message}`]);
        setShowParseWarning(true);
        return;
      }
    }

    widgetEditorForm.setFieldValue('widgetConfig.editorMode', newMode);
  };

  const confirmModeSwitch = () => {
    widgetEditorForm.setFieldValue('widgetConfig.editorMode', 'visual');
    setShowParseWarning(false);
  };

  return (
    <>
    <ConfigSection id="vega-chart" title="Chart" description="Visual shelves or raw Vega-Lite/Vega JSON." tab="content">
    <div className="flex flex-col gap-2 w-full">
      {isVegaLite && (
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Visual Editor</span>
          <Switch className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5" checked={currentMode === 'visual'} onCheckedChange={(checked) => handleModeSwitch(checked ? 'visual' : 'raw')} />
        </div>
      )}

      {isVegaLite && (
        <div className="flex flex-col gap-2 w-full">
          {currentMode === 'visual' && !showParseWarning && (
            <ShelfBuilder
              widgetEditorForm={widgetEditorForm}
              queryResults={queryResults}
              stateTree={stateTree}
              liveStateTree={liveStateTree}
            />
          )}
        </div>
      )}

      {showParseWarning && (
        <div className="my-2 shrink-0 rounded border status-warning border px-4 py-2">
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-warning">Cannot fully parse chart config</h4>
              <p className="mb-2 text-warning/85">
                Switching to Visual mode may cause you to lose manual modifications:
              </p>
              <ul className="mb-3 list-disc pl-4 text-warning/85">
                {parseWarningsList.map((w, i) => <li key={i} className="mb-0.5">{w}</li>)}
              </ul>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowParseWarning(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={confirmModeSwitch} className="h-7 text-xs border-warning/40 bg-warning/15 text-warning hover:bg-warning/25">
                  Switch & Overwrite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showParseWarning && currentMode === 'raw' && (
        <VegaSpecEditor
          value={widgetEditorForm.values.widgetConfig?.vegaSpec}
          onChange={(spec) => widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', spec)}
          workflowContext={workflowContext}
        />
      )}
    </div>
    </ConfigSection>

    <ConfigSection id="vega-behavior" title="Chart state & accessibility" tab="behavior">
      <ConfigField label="Accessible description" path="ariaDescription" helper="Announced to screen readers in place of the visual chart.">
        <BindableInput
          value={widgetEditorForm.values.widgetConfig?.ariaDescription || ""}
          onChange={(value) => widgetEditorForm.setFieldValue('widgetConfig.ariaDescription', value)}
          liveStateTree={liveStateTree}
          placeholder="e.g. Revenue by region, Q3"
        />
      </ConfigField>
      <ConfigField label="Loading template" path="isLoading">
        <BindableInput
          value={widgetEditorForm.values.widgetConfig?.isLoading || ""}
          onChange={(value) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', value)}
          liveStateTree={liveStateTree}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
        />
      </ConfigField>
      <ConfigField label="Show data table" path="showDataTable" helper="Adds a collapsible table of the spec's data values.">
        <Switch
          checked={widgetEditorForm.values.widgetConfig?.showDataTable === true}
          onCheckedChange={(value) => widgetEditorForm.setFieldValue('widgetConfig.showDataTable', !!value)}
          aria-label="Show data table"
        />
      </ConfigField>
      <ConfigField label="Annotations" path="annotations" helper="Pin notes over the chart using percentage coordinates.">
        <OptionListEditor
          value={Array.isArray(widgetEditorForm.values.widgetConfig?.annotations) ? widgetEditorForm.values.widgetConfig.annotations : []}
          onChange={(value) => widgetEditorForm.setFieldValue('widgetConfig.annotations', value)}
          labelKey="text"
          valueKey="text"
          itemLabel="Annotation"
          allowDisabled={false}
          showValue={false}
          renderFields={(annotation, index, update, ids) => (
            <>
              <div className="space-y-0.5">
                <label htmlFor={ids.labelId} className="text-[9px] uppercase tracking-wider text-muted-foreground">Text</label>
                <Input id={ids.labelId} value={annotation?.text ?? ""} onChange={(event) => update(index, "text", event.target.value)} className="h-7 text-[11px]" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">X %</label>
                  <Input type="number" min={0} max={100} value={annotation?.x ?? 50} onChange={(event) => update(index, "x", Number(event.target.value))} className="h-7 text-[11px]" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Y %</label>
                  <Input type="number" min={0} max={100} value={annotation?.y ?? 20} onChange={(event) => update(index, "y", Number(event.target.value))} className="h-7 text-[11px]" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Tone</label>
                  <select value={annotation?.tone || "info"} onChange={(event) => update(index, "tone", event.target.value)} className="h-7 w-full rounded border border-input-custom bg-input-custom px-1 text-[11px] text-foreground">
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
            </>
          )}
          getPreview={(annotation) => annotation?.text || "Annotation"}
        />
      </ConfigField>
    </ConfigSection>
    </>
  );
};

VegaConfigEditor.usesConfigKit = true;

VegaConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  queryResults: PropTypes.object,
};
