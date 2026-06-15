import React, { useState, useMemo, useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { CronJobScheduler } from "./cronJobScheduler";
import { useInfiniteWorkflows } from "../../../logic/hooks/useWorkflows";
import { getWorkflowByIDAPI } from "../../../data/apis/workflow";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
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

export const CronJobEditor = ({ cronJobEditorForm }) => {
  CronJobEditor.propTypes = {
    cronJobEditorForm: PropTypes.object.isRequired,
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
    loadWorkflowsError,
  } = useInfiniteWorkflows(tenantID, debouncedWorkflowSearch);

  const selectedWorkflowID = cronJobEditorForm.values?.workflowID;
  const { data: selectedWorkflowDetail } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "detail", selectedWorkflowID],
    queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID: selectedWorkflowID }),
    enabled: Boolean(tenantID) && Boolean(selectedWorkflowID),
    refetchOnWindowFocus: false,
  });

  const _handleOnScheduleChange = useCallback(
    (value) => {
      cronJobEditorForm?.setFieldValue("cronJobSchedule", value);
    },
    [cronJobEditorForm]
  );

  const selectedWorkflow = useMemo(
    () =>
      selectedWorkflowDetail ||
      workflows?.find(
        (w) =>
          String(w.workflowID) ===
          String(selectedWorkflowID)
      ) || null,
    [selectedWorkflowDetail, workflows, selectedWorkflowID]
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
          {workflows ? (
            <SearchSelect
              value={
                cronJobEditorForm.values.workflowID
                  ? String(cronJobEditorForm.values.workflowID)
                  : ""
              }
              onChange={(val) =>
                cronJobEditorForm.setFieldValue("workflowID", val)
              }
              options={workflows.map((workflow) => ({
                value: String(workflow.workflowID),
                label: workflow.title,
              }))}
              onSearchChange={setWorkflowSearch}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoadingWorkflows}
              placeholder="Select a workflow…"
            />
          ) : (
            <div className="flex h-8 w-full items-center justify-between rounded-sm border border-input-custom bg-input-custom px-2.5 py-1.5 text-sm text-muted-foreground animate-pulse">
              <span>Loading workflows...</span>
            </div>
          )}
          {touched.workflowID && <FieldError message={errors.workflowID} />}
        </div>

        {selectedWorkflow?.workflowOptions?.inputDefinitions?.length > 0 && (
          <div className="space-y-1.5 pt-1">
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
      <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
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