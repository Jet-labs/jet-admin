import React from "react";
import "react-js-cron/dist/styles.css";
import { Cron } from "react-js-cron";
import { useState } from "react";
import PropTypes from "prop-types";

export const CronJobScheduler = ({
  key,
  readOnly,
  disabled,
  onError,
  value,
  handleChange,
  customStyle,
}) => {
  CronJobScheduler.propTypes = {
    key: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onError: PropTypes.func,
    value: PropTypes.string,
    handleChange: PropTypes.func,
    customStyle: PropTypes.bool,
  };
  const [humanize, setHumanize] = useState(true);

  return (
    <div className="w-full border border-slate-300 rounded-md">
      {/* Humanize Toggle */}
      <div className="p-3 w-full">
        <label className="flex items-center space-x-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={humanize}
            onChange={(e) => setHumanize(e.target.checked)}
            className="toggle toggle-primary"
          />
          <span className="text-xs text-slate-700">Humanize values</span>
        </label>
      </div>

      {/* Raw Cron Input */}
      <div className="p-3 w-full">
        <span className="text-xs text-slate-700">
          Raw input (Cron job format)
        </span>
        <input
          type="text"
          name="cron-job-scheduler"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
        />
      </div>

      {/* Divider */}
      <div className="my-5 w-full text-center text-xs text-gray-500 border-t border-gray-200 relative">
        <span className="bg-white px-2 absolute -top-2 left-1/2 transform -translate-x-1/2">
          Or
        </span>
      </div>

      {/* Cron UI */}
      <div className="p-3 w-full">
        <Cron
          key={key ? key : "cron-job-scheduler"}
          value={value}
          setValue={(v) => handleChange(v)}
          onError={onError ? onError : null}
          disabled={disabled}
          readOnly={readOnly}
          humanizeLabels={humanize}
          humanizeValue={humanize}
          displayError={false}
          clearButton={true}
          shortcuts={true}
          allowEmpty={true}
          clockFormat={"24-hour-clock"}
          defaultPeriod="day"
          leadingZero={true}
          className={customStyle ? "my-project-cron" : undefined}
          periodicityOnDoubleClick={true}
          mode="multiple"
          allowedDropdowns={[
            "period",
            "months",
            "month-days",
            "week-days",
            "hours",
            "minutes",
          ]}
          allowedPeriods={["year", "month", "week", "day", "hour", "minute"]}
          clearButtonProps={
            customStyle
              ? {
                  type: "default",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};
