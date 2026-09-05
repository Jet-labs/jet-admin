import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { Input, Label } from "@jet-admin/ui";

/**
 * Panel for editing per-workflow execution policy (workflowOptions).
 * Resolution order at runtime: node.data > workflowOptions > platform defaults.
 * Every field is optional — empty means "inherit the platform default".
 */
export const WorkflowExecutionPolicyPanel = ({ workflowForm }) => {
  WorkflowExecutionPolicyPanel.propTypes = {
    workflowForm: PropTypes.object.isRequired,
  };

  const policy = workflowForm.values.workflowOptions || {};

  const _setPolicyField = useCallback((field, value) => {
    workflowForm.setFieldValue(`workflowOptions.${field}`, value);
  }, [workflowForm]);

  const _handleTextChange = useCallback((field) => (e) => {
    const raw = e.target.value;
    _setPolicyField(field, raw === "" ? undefined : raw);
  }, [_setPolicyField]);

  const _handleNumberChange = useCallback((field) => (e) => {
    const raw = e.target.value;
    if (raw === "" || raw === undefined || raw === null) {
      _setPolicyField(field, undefined);
      return;
    }
    const num = Number(raw);
    _setPolicyField(field, Number.isFinite(num) ? Math.trunc(num) : undefined);
  }, [_setPolicyField]);

  const _textValue = (field) => policy[field] ?? "";
  const _numberValue = (field) => policy[field] ?? "";

  return (
    <div className="space-y-2">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Execution Policy
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Workflow defaults. Nodes override these; empty uses platform defaults.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Workflow run timeout</Label>
          <Input
            type="text"
            placeholder="7 days"
            size="sm"
            className="w-full text-xs"
            value={_textValue("workflowRunTimeout")}
            onChange={_handleTextChange("workflowRunTimeout")}
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Task timeout</Label>
            <Input
              type="text"
              placeholder="30 seconds"
              size="sm"
              className="w-full text-xs"
              value={_textValue("workflowTaskTimeout")}
              onChange={_handleTextChange("workflowTaskTimeout")}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Human input timeout</Label>
            <Input
              type="text"
              placeholder="24 hours"
              size="sm"
              className="w-full text-xs"
              value={_textValue("humanInLoopTimeout")}
              onChange={_handleTextChange("humanInLoopTimeout")}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Node timeout (s)</Label>
            <Input
              type="number"
              min={1}
              max={3600}
              placeholder="120"
              size="sm"
              className="w-full text-xs"
              value={_numberValue("defaultNodeTimeoutSeconds")}
              onChange={_handleNumberChange("defaultNodeTimeoutSeconds")}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Retries</Label>
            <Input
              type="number"
              min={0}
              max={10}
              placeholder="0"
              size="sm"
              className="w-full text-xs"
              value={_numberValue("defaultRetryLimit")}
              onChange={_handleNumberChange("defaultRetryLimit")}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Label className="text-xs font-medium text-muted-foreground">Retry delay (s)</Label>
            <Input
              type="number"
              min={0}
              max={300}
              placeholder="5"
              size="sm"
              className="w-full text-xs"
              value={_numberValue("defaultRetryDelaySeconds")}
              onChange={_handleNumberChange("defaultRetryDelaySeconds")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
