import React from "react";
import { useCallback, useMemo } from "react";
import { CONSTANTS } from "../../../constants";
import { CronJobScheduler } from "./cronJobScheduler";
import { useCronJobsState } from "../../../logic/contexts/cronJobsContext";
import PropTypes from "prop-types";

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
            parseInt(q.dataQueryID) ===
            parseInt(cronJobEditorForm.values?.dataQueryID || 0)
        )
      : null;
  }, [dataQueries, cronJobEditorForm.values]);

  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2">
      <div>
        <label
          htmlFor="cronJobTitle"
          className="block mb-1 text-xs font-medium text-slate-500"
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
        <label
          htmlFor="cronJobTitle"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_QUERY_ID_FIELD_LABEL}
        </label>
        <select
          name={`dataQueryID`}
          id={`dataQueryID`}
          value={cronJobEditorForm.values.dataQueryID || ""}
          onChange={cronJobEditorForm.handleChange}
          onBlur={cronJobEditorForm.handleBlur}
          className={`placeholder:text-slate-400 text-xs bg-slate-50 border ${"border-slate-300"} text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full py-1 px-1.5`}
        >
          <option value="" disabled selected>
            Select query dataset
          </option>
          {dataQueries?.map((dataQuery) => (
            <option
              key={`database_query_item_${dataQuery.dataQueryID}`}
              value={dataQuery.dataQueryID}
            >
              {dataQuery.dataQueryTitle}
            </option>
          ))}
        </select>
      </div>
      {selectedQuery?.dataQueryOptions?.dataQueryArgs?.length > 0 && (
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-500">
            {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_QUERY_ARGUMENTS_LABEL}
          </label>
          <div className="space-y-2">
            {selectedQuery.dataQueryOptions.dataQueryArgs.map((arg) => {
              const argName = arg.replace(/[{}]/g, "");
              const key = `dataQueryArgValues.${argName}`;
              return (
                <div key={key}>
                  <input
                    type="text"
                    name={key}
                    required={true}
                    id={key}
                    className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
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
      <div>
        <label className="block mb-1 text-xs font-medium text-slate-500">
          {CONSTANTS.STRINGS.CRON_JOB_EDITOR_FORM_SCHEDULE_FIELD_LABEL}
        </label>
        <CronJobScheduler
          value={cronJobEditorForm.values.cronJobSchedule}
          handleChange={_handleOnScheduleChange}
        />
      </div>
    </div>
  );
};
