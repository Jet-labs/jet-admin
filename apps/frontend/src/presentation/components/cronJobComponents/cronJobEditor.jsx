import { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { CronJobScheduler } from "./cronJobScheduler";
import { useCronJobsState } from "../../../logic/contexts/cronJobsContext";

export const CronJobEditor = ({
  tenantID,
  cronJobEditorForm,
  isLoadingCronJobEditorForm,
}) => {
  const { databaseQueries } = useCronJobsState();
  const _handleOnScheduleChange = useCallback(
    (value) => {
      cronJobEditorForm?.setFieldValue("cronJobSchedule", value);
    },
    [cronJobEditorForm]
  );
  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2">
      <div>
        <label
          for="cronJobTitle"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="cronJobTitle"
          id="cronJobTitle"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={cronJobEditorForm.handleChange}
          onBlur={cronJobEditorForm.handleBlur}
          value={cronJobEditorForm.values.cronJobTitle}
        />
      </div>
      <div>
        <select
          name={`databaseQueryID`}
          id={`databaseQueryID`}
          value={cronJobEditorForm.values.databaseQueryID || ""}
          onChange={cronJobEditorForm.handleChange}
          onBlur={cronJobEditorForm.handleBlur}
          className={`placeholder:text-slate-400 text-xs bg-slate-50 border ${
            "border-slate-300"
          } text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full py-1 px-1.5`}
        >
          <option value="" disabled selected>
            Select query dataset
          </option>
          {databaseQueries?.map((databaseQuery) => (
            <option
              key={`database_query_item_${databaseQuery.databaseQueryID}`}
              value={databaseQuery.databaseQueryID}
            >
              {databaseQuery.databaseQueryTitle}
            </option>
          ))}
        </select>
        
      </div>
      <CronJobScheduler
        value={cronJobEditorForm.values.cronJobSchedule}
        handleChange={_handleOnScheduleChange}
      />
    </div>
  );
};
