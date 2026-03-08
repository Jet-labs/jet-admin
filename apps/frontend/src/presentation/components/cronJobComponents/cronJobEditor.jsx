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
} from "@jet-admin/ui";


export const CronJobEditor = ({ cronJobEditorForm }) => {
  CronJobEditor.propTypes = {
    cronJobEditorForm: PropTypes.object.isRequired,
  };
  const { dataQueries } = useCronJobsState();
  const _handleOnScheduleChange = useCallback(
    (value) => {
      cronJobEditorForm?.setFieldValue("cronJobSchedule", value);
    },
    [cronJobEditorForm]
  );
  const selectedQuery = useMemo(() => {
    return dataQueries
      ? dataQueries.find(
          (q) =>
          q.dataQueryID ==
          cronJobEditorForm.values?.dataQueryID
        )
      : null;
  }, [dataQueries, cronJobEditorForm.values]);

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
        <Label htmlFor="dataQueryID">
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_QUERY_ID_FIELD_LABEL}
        </Label>
        <Select
          value={
            cronJobEditorForm.values.dataQueryID
              ? String(cronJobEditorForm.values.dataQueryID)
              : ""
          }
          onValueChange={(val) =>
            cronJobEditorForm.setFieldValue("dataQueryID", val ? Number(val) : null)
          }
        >
          <SelectTrigger id="dataQueryID">
            <SelectValue placeholder="Select query dataset" />
          </SelectTrigger>
          <SelectContent>
            {dataQueries?.map((dataQuery) => (
              <SelectItem
              key={`database_query_item_${dataQuery.dataQueryID}`}
                value={String(dataQuery.dataQueryID)}
              >
                {dataQuery.dataQueryTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedQuery?.dataQueryOptions?.args?.length > 0 && (
        <div className="space-y-2">
          <Label>
            {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_QUERY_ARGUMENTS_LABEL}
          </Label>
          <div className="space-y-2">
            {selectedQuery.dataQueryOptions.args.map((arg) => {
              const argName = arg.key;
              const key = `dataQueryArgValues.${argName}`;
              return (
                <div key={key}>
                  <Input
                    type="text"
                    name={key}
                    required={true}
                    id={key}
                    className="w-full"
                    placeholder={`Value for ${argName}`}
                    value={
                      cronJobEditorForm.values.dataQueryArgValues?.[argName] ||
                      ""
                    }
                    onChange={cronJobEditorForm.handleChange}
                    onBlur={cronJobEditorForm.handleBlur}
                  />
                </div>
              );
            })}
          </div>
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
