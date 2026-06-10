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

const VEGA_STRINGS = {
  WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
  WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval",
};

export const VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  selectedWorkflow,
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

  const resolvedSelectedWorkflow = selectedWorkflow || (workflows && widgetEditorForm.values.workflowID
    ? workflows.find(w => String(w.workflowID) === String(widgetEditorForm.values.workflowID))
    : null);

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
    <div className="flex flex-col gap-3 w-full">
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
              workflows={workflows}
              queryResults={queryResults}
              stateTree={stateTree}
              liveStateTree={liveStateTree}
            />
          )}
        </div>
      )}

      {showParseWarning && (
        <div className="my-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Cannot fully parse chart config</h4>
              <p className="mb-2 text-amber-800 dark:text-amber-300">
                Switching to Visual mode may cause you to lose manual modifications:
              </p>
              <ul className="mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300">
                {parseWarningsList.map((w, i) => <li key={i} className="mb-0.5">{w}</li>)}
              </ul>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowParseWarning(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={confirmModeSwitch} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-foreground dark:bg-amber-700 dark:hover:bg-amber-600">
                  Switch & Overwrite
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showParseWarning && currentMode === 'raw' && (
        <div className="min-h-[300px] flex-1 overflow-auto rounded-md border border-border bg-background">
          <VegaSpecEditor
            value={widgetEditorForm.values.widgetConfig?.vegaSpec}
            onChange={(spec) => widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', spec)}
            workflowContext={workflowContext}
            workflow={resolvedSelectedWorkflow}
          />
        </div>
      )}

      {/* Is Loading Template */}
      <div className="space-y-1.5 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={widgetEditorForm.values.widgetConfig?.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

VegaConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
  selectedWorkflow: PropTypes.object,
  queryResults: PropTypes.object,
};
