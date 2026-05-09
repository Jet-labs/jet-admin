import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useWorkflows } from "../../../logic/hooks/useWorkflows";
import { useDataQueries } from "../../../logic/hooks/useDataQueries";
import { useParams } from "react-router-dom";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";

/**
 * Action types available for widget events.
 * Each action type maps to an existing backend execution API.
 */
const ACTION_TYPES = {
  EXECUTE_QUERY: {
    value: "EXECUTE_QUERY",
    label: "Execute Query",
    description: "Run a saved DataQuery",
  },
  TRIGGER_WORKFLOW: {
    value: "TRIGGER_WORKFLOW",
    label: "Trigger Workflow",
    description: "Execute a saved Workflow",
  },
  SHOW_TOAST: {
    value: "SHOW_TOAST",
    label: "Show Toast",
    description: "Display a notification message",
  },
};

/**
 * Supported event types for widgets.
 */
const EVENT_TYPES = [
  { value: "onClick", label: "On Click" },
  { value: "onSubmit", label: "On Submit" },
  { value: "onRowSelect", label: "On Row Select" },
  { value: "onRefresh", label: "On Refresh" },
  { value: "onLoad", label: "On Load" },
];

/**
 * WidgetEventsEditor
 *
 * Handles editing the `widgetConfig.events` section of a widget.
 * Users can add event handlers (onClick, onSubmit, etc.) and
 * configure actions (Execute Query, Trigger Workflow, Show Toast)
 * that fire when those events occur.
 */
export const WidgetEventsEditor = ({ widgetEditorForm }) => {
  WidgetEventsEditor.propTypes = {
    widgetEditorForm: PropTypes.object.isRequired,
  };

  const { tenantID } = useParams();
  const { workflows } = useWorkflows(tenantID);
  const { dataQueries } = useDataQueries(tenantID);

  const events = widgetEditorForm.values.widgetConfig?.events || {};

  // Add a new event handler
  const handleAddEvent = useCallback(
    (eventType) => {
      const currentActions = events[eventType] || [];
      widgetEditorForm.setFieldValue(`widgetConfig.events.${eventType}`, [
        ...currentActions,
        { actionType: "", config: {} },
      ]);
    },
    [events, widgetEditorForm]
  );

  // Remove an action from an event
  const handleRemoveAction = useCallback(
    (eventType, actionIndex) => {
      const currentActions = [...(events[eventType] || [])];
      currentActions.splice(actionIndex, 1);
      if (currentActions.length === 0) {
        // Remove the entire event key if no actions left
        const newEvents = { ...events };
        delete newEvents[eventType];
        widgetEditorForm.setFieldValue("widgetConfig.events", newEvents);
      } else {
        widgetEditorForm.setFieldValue(
          `widgetConfig.events.${eventType}`,
          currentActions
        );
      }
    },
    [events, widgetEditorForm]
  );

  // Update an action's type
  const handleActionTypeChange = useCallback(
    (eventType, actionIndex, actionTypeValue) => {
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].actionType`,
        actionTypeValue
      );
      // Reset config when action type changes
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].config`,
        {}
      );
    },
    [widgetEditorForm]
  );

  // Update an action's config field
  const handleActionConfigChange = useCallback(
    (eventType, actionIndex, configKey, value) => {
      widgetEditorForm.setFieldValue(
        `widgetConfig.events.${eventType}[${actionIndex}].config.${configKey}`,
        value
      );
    },
    [widgetEditorForm]
  );

  // Get the list of event types that don't yet have handlers
  const availableEventTypes = EVENT_TYPES.filter(
    (et) => !events[et.value] || events[et.value].length === 0
  );

  return (
    <div className="space-y-4">
      {/* Existing event handlers */}
      {Object.entries(events).map(([eventType, actions]) => {
        const eventLabel =
          EVENT_TYPES.find((et) => et.value === eventType)?.label || eventType;

        return (
          <div
            key={eventType}
            className="rounded-md border border-border bg-muted/30 p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground">
                {eventLabel}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleAddEvent(eventType)}
              >
                <FiPlus className="mr-1 h-3 w-3" />
                Add Action
              </Button>
            </div>

            {actions.map((action, actionIndex) => (
              <div
                key={actionIndex}
                className="rounded-sm border border-border bg-background p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Action Type Selector */}
                  <Select
                    value={action.actionType || ""}
                    onValueChange={(val) =>
                      handleActionTypeChange(eventType, actionIndex, val)
                    }
                  >
                    <SelectTrigger className="text-xs flex-1">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ACTION_TYPES).map((at) => (
                        <SelectItem key={at.value} value={at.value}>
                          {at.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveAction(eventType, actionIndex)}
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Action-specific config */}
                {action.actionType === ACTION_TYPES.EXECUTE_QUERY.value && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Select Query
                    </Label>
                    <Select
                      value={action.config?.queryID || ""}
                      onValueChange={(val) =>
                        handleActionConfigChange(
                          eventType,
                          actionIndex,
                          "queryID",
                          val
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Choose a query..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dataQueries?.map((q) => (
                          <SelectItem
                            key={q.dataQueryID}
                            value={String(q.dataQueryID)}
                          >
                            {q.dataQueryTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.actionType ===
                  ACTION_TYPES.TRIGGER_WORKFLOW.value && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Select Workflow
                    </Label>
                    <Select
                      value={action.config?.workflowID || ""}
                      onValueChange={(val) =>
                        handleActionConfigChange(
                          eventType,
                          actionIndex,
                          "workflowID",
                          val
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Choose a workflow..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows?.map((w) => (
                          <SelectItem
                            key={w.workflowID}
                            value={String(w.workflowID)}
                          >
                            {w.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.actionType === ACTION_TYPES.SHOW_TOAST.value && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Toast Message
                    </Label>
                    <Input
                      type="text"
                      className="text-xs"
                      placeholder="e.g. Record saved successfully"
                      value={action.config?.message || ""}
                      onChange={(e) =>
                        handleActionConfigChange(
                          eventType,
                          actionIndex,
                          "message",
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {/* Add new event handler */}
      {availableEventTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(val) => handleAddEvent(val)}
          >
            <SelectTrigger className="text-xs flex-1">
              <SelectValue placeholder="Add event handler..." />
            </SelectTrigger>
            <SelectContent>
              {availableEventTypes.map((et) => (
                <SelectItem key={et.value} value={et.value}>
                  {et.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(events).length === 0 && (
        <div className="rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            No event handlers configured. Add an event to connect this widget to
            queries or workflows.
          </p>
        </div>
      )}
    </div>
  );
};
