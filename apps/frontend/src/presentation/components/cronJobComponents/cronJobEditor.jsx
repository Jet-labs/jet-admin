import React from "react";
import { useCallback, useMemo } from "react";
import { CONSTANTS } from "../../../constants";
import { CronJobScheduler } from "./cronJobScheduler";
import { useCronJobsState } from "../../../logic/contexts/cronJobsContext";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  InputArgsForm,
  Switch,
} from "@jet-admin/ui";

// ─── Small helper components ─────────────────────────────────────────────────

/** Wraps a form section with a consistent heading + card look. */
function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-destructive">{message}</p>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const CronJobEditor = ({ cronJobEditorForm }) => {
  CronJobEditor.propTypes = {
    cronJobEditorForm: PropTypes.object.isRequired,
  };

  const { workflows } = useCronJobsState();

  const _handleOnScheduleChange = useCallback(
    (value) => {
      cronJobEditorForm?.setFieldValue("cronJobSchedule", value);
    },
    [cronJobEditorForm]
  );

  const selectedWorkflow = useMemo(
    () =>
      workflows?.find(
        (w) =>
          String(w.workflowID) ===
          String(cronJobEditorForm.values?.workflowID)
      ) ?? null,
    [workflows, cronJobEditorForm.values?.workflowID]
  );

  const touched = cronJobEditorForm.touched ?? {};
  const errors = cronJobEditorForm.errors ?? {};

  return (
    <div className="w-full space-y-3">

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <Section title="Identity">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="cronJobTitle">
            {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_LABEL}
            <span className="ml-0.5 text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="cronJobTitle"
            id="cronJobTitle"
            className="w-full"
            placeholder={
              CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
            }
            required
            onChange={cronJobEditorForm.handleChange}
            onBlur={cronJobEditorForm.handleBlur}
            value={cronJobEditorForm.values.cronJobTitle}
          />
          {touched.cronJobTitle && <FieldError message={errors.cronJobTitle} />}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="cronJobDescription">
            {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_DESCRIPTION_FIELD_LABEL}
          </Label>
          <Input
            type="text"
            name="cronJobDescription"
            id="cronJobDescription"
            className="w-full"
            placeholder={
              CONSTANTS.STRINGS
                .CRON_JOB_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
            }
            onChange={cronJobEditorForm.handleChange}
            onBlur={cronJobEditorForm.handleBlur}
            value={cronJobEditorForm.values.cronJobDescription}
          />
        </div>
      </Section>

      {/* ── Workflow ───────────────────────────────────────────────────────── */}
      <Section
        title="Workflow"
        description="Select which workflow this job triggers and supply any required input arguments."
      >
        <div className="space-y-1.5">
          <Label htmlFor="workflowID">Workflow</Label>
          <Select
            value={
              cronJobEditorForm.values.workflowID
                ? String(cronJobEditorForm.values.workflowID)
                : ""
            }
            onValueChange={(val) =>
              cronJobEditorForm.setFieldValue("workflowID", val)
            }
          >
            <SelectTrigger id="workflowID">
              <SelectValue placeholder="Select a workflow…" />
            </SelectTrigger>
            <SelectContent>
              {workflows?.map((workflow) => (
                <SelectItem
                  key={`workflow_item_${workflow.workflowID}`}
                  value={String(workflow.workflowID)}
                >
                  {workflow.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.workflowID && <FieldError message={errors.workflowID} />}
        </div>

        {selectedWorkflow?.workflowOptions?.args?.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <Label>Workflow Arguments</Label>
            <InputArgsForm
              args={selectedWorkflow.workflowOptions.args}
              values={cronJobEditorForm.values.workflowConfig?.inputArgs ?? {}}
              onChange={(key, value) =>
                cronJobEditorForm.setFieldValue(
                  `workflowConfig.inputArgs.${key}`,
                  value
                )
              }
            />
          </div>
        )}
      </Section>

      {/* ── Schedule ──────────────────────────────────────────────────────── */}
      <Section
        title="Schedule"
        description="Configure when this job runs using the visual builder or a raw cron expression."
      >
        <CronJobScheduler
          value={cronJobEditorForm.values.cronJobSchedule}
          handleChange={_handleOnScheduleChange}
        />
      </Section>

      {/* ── Execution settings ────────────────────────────────────────────── */}
      <Section
        title="Execution"
        description="Control retry behaviour and per-run time limits."
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="timeoutSeconds">Timeout (s)</Label>
            <Input
              type="number"
              name="timeoutSeconds"
              id="timeoutSeconds"
              min={1}
              value={cronJobEditorForm.values.timeoutSeconds ?? ""}
              onChange={cronJobEditorForm.handleChange}
              onBlur={cronJobEditorForm.handleBlur}
              placeholder="300"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retryAttempts">Retry Attempts</Label>
            <Input
              type="number"
              name="retryAttempts"
              id="retryAttempts"
              min={0}
              value={cronJobEditorForm.values.retryAttempts ?? ""}
              onChange={cronJobEditorForm.handleChange}
              onBlur={cronJobEditorForm.handleBlur}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retryDelaySeconds">Retry Delay (s)</Label>
            <Input
              type="number"
              name="retryDelaySeconds"
              id="retryDelaySeconds"
              min={0}
              value={cronJobEditorForm.values.retryDelaySeconds ?? ""}
              onChange={cronJobEditorForm.handleChange}
              onBlur={cronJobEditorForm.handleBlur}
              placeholder="60"
            />
          </div>
        </div>
      </Section>

      {/* ── Active toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium leading-none">Active</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Enable or pause scheduled execution of this job.
          </p>
        </div>
        <Switch
          id="isDisabled"
          checked={!cronJobEditorForm.values.isDisabled}
          onCheckedChange={(checked) =>
            cronJobEditorForm.setFieldValue("isDisabled", !checked)
          }
        />
      </div>

    </div>
  );
};