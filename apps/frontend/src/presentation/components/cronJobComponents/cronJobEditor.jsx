import React, { useState, useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { CronJobScheduler } from "./cronJobScheduler";
import { useInfiniteWorkflows } from "../../../logic/hooks/useWorkflows";
import { useDebounce } from "@uidotdev/usehooks";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  SearchSelect,
  InputValuesForm,
  Switch,
  Section,
} from "@jet-admin/ui";

// ─── Small helper components ─────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-destructive">{message}</p>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const CronJobEditor = ({ cronJobEditorForm, initialWorkflow }) => {
  CronJobEditor.propTypes = {
    cronJobEditorForm: PropTypes.object.isRequired,
    // Pre-fetched workflow object (from the parent) so the select input shows
    // the correct name on first render without any Formik timing dependency.
    initialWorkflow: PropTypes.object,
  };

  const { tenantID } = useParams();
  const [workflowSearch, setWorkflowSearch] = useState("");
  const debouncedWorkflowSearch = useDebounce(workflowSearch, 300);

  const {
    workflows,
    isLoadingWorkflows,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteWorkflows(tenantID, debouncedWorkflowSearch);

  const selectedWorkflowID = cronJobEditorForm.values?.workflowID;

  const _handleOnScheduleChange = useCallback(
    (value) => {
      cronJobEditorForm?.setFieldValue("cronJobSchedule", value);
    },
    [cronJobEditorForm]
  );

  // Build the options list. If the initially-selected workflow was passed as a
  // prop (fetched at parent level), inject it at the front when it isn't
  // already present in the current page of paginated results — guaranteeing
  // SearchSelect can always find it via strict equality.
  const workflowOptions = (() => {
    const pagedOptions = (workflows ?? []).map((w) => ({
      value: String(w.workflowID),
      label: w.title,
    }));

    // Only inject when initialWorkflow has a valid, non-null workflowID and
    // title (guards against stale broken Workflow objects where all fields are
    // undefined, which would inject {value:"undefined", label:undefined}).
    const detailID = initialWorkflow?.workflowID;
    const detailTitle = initialWorkflow?.title;

    if (
      detailID != null &&
      detailTitle &&
      !pagedOptions.find((o) => o.value === String(detailID))
    ) {
      return [{ value: String(detailID), label: detailTitle }, ...pagedOptions];
    }

    return pagedOptions;
  })();

  // Visual fallback label shown while options are still loading. Prefer the
  // injected workflow, fall back to a match in the already-loaded page.
  const selectedLabel =
    initialWorkflow?.workflowID != null
      ? initialWorkflow.title
      : (workflows ?? []).find(
          (w) => String(w.workflowID) === String(selectedWorkflowID)
        )?.title;

  // The workflow to use for the Arguments sub-form.
  const selectedWorkflow =
    initialWorkflow ||
    (workflows ?? []).find(
      (w) => String(w.workflowID) === String(selectedWorkflowID)
    ) ||
    null;

  const touched = cronJobEditorForm.touched ?? {};
  const errors = cronJobEditorForm.errors ?? {};

  return (
    <div className="w-full space-y-2">

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <Section title="Identity">
        {/* Title */}
        <div className="space-y-1">
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
        <div className="space-y-1">
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
        <div className="space-y-1">
          <Label htmlFor="workflowID">Workflow</Label>
          <SearchSelect
            value={cronJobEditorForm.values.workflowID || ""}
            onChange={(val) =>
              cronJobEditorForm.setFieldValue("workflowID", val)
            }
            options={workflowOptions}
            selectedLabel={selectedLabel}
            onSearchChange={setWorkflowSearch}
            onLoadMore={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoadingWorkflows}
            placeholder="Select a workflow…"
          />
          {touched.workflowID && <FieldError message={errors.workflowID} />}
        </div>

        {selectedWorkflow?.workflowOptions?.inputDefinitions?.length > 0 && (
          <div className="space-y-1 p-2 border rounded">
            <Label>Workflow Arguments</Label>
            <InputValuesForm
              inputDefinitions={selectedWorkflow.workflowOptions.inputDefinitions}
              values={cronJobEditorForm.values.workflowConfig?.inputValues ?? {}}
              onChange={(key, value) =>
                cronJobEditorForm.setFieldValue(
                  `workflowConfig.inputValues.${key}`,
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
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
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
          <div className="space-y-1">
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
          <div className="space-y-1">
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
      <div className="flex items-center justify-between rounded border border-border bg-card p-2">
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