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
  InputArgsForm
} from "@jet-admin/ui";


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
  const selectedWorkflow = useMemo(() => {
    return workflows
      ? workflows.find(
          (w) =>
          String(w.workflowID) ===
          String(cronJobEditorForm.values?.workflowID)
        )
      : null;
  }, [workflows, cronJobEditorForm.values]);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cronJobTitle">
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="cronJobTitle"
          id="cronJobTitle"
          className="w-full"
          placeholder={
            CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={cronJobEditorForm.handleChange}
          onBlur={cronJobEditorForm.handleBlur}
          value={cronJobEditorForm.values.cronJobTitle}
        />
      </div>
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
            CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
          onChange={cronJobEditorForm.handleChange}
          onBlur={cronJobEditorForm.handleBlur}
          value={cronJobEditorForm.values.cronJobDescription}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="workflowID">
          Workflow
        </Label>
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
            <SelectValue placeholder="Select workflow" />
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
      </div>
      {selectedWorkflow?.workflowOptions?.args?.length > 0 && (
        <div className="space-y-2">
          <Label>
            Workflow Arguments
          </Label>
          <InputArgsForm
            args={selectedWorkflow.workflowOptions.args}
            values={cronJobEditorForm.values.workflowConfig?.inputArgs || {}}
            onChange={(key, value) =>
              cronJobEditorForm.setFieldValue(
                `workflowConfig.inputArgs.${key}`,
                value
              )
            }
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_SCHEDULE_FIELD_LABEL}
        </Label>
        <CronJobScheduler
          value={cronJobEditorForm.values.cronJobSchedule}
          handleChange={_handleOnScheduleChange}
        />
      </div>
    </div>
  );
};
