import React from "react";
import "react-js-cron/dist/styles.css";
import { Cron } from "react-js-cron";
import { useState } from "react";
import PropTypes from "prop-types";
import { Checkbox, Input, Label } from "@jet-admin/ui";


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
    <div className="w-full space-y-4">
      <div className="w-full">
        <label className="flex items-center space-x-3 text-sm font-medium text-foreground">
          <Checkbox
            checked={humanize}
            onCheckedChange={(checked) => setHumanize(checked)}
          />
          <span className="text-xs text-muted-foreground">Humanize values</span>
        </label>
      </div>

      <div className="w-full space-y-1.5">
        <Label htmlFor="cron-job-scheduler">Raw input (Cron job format)</Label>
        <span className="text-xs text-muted-foreground">
          Raw input (Cron job format)
        </span>
        <Input
          type="text"
          name="cron-job-scheduler"
          id="cron-job-scheduler"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="relative my-2 w-full border-t border-dashed border-border text-center text-xs text-muted-foreground">
        <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-background px-2">
          Or
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-md border border-border bg-background p-3 [&_.react-js-cron]:!w-full [&_.react-js-cron-field]:!rounded-md [&_.react-js-cron-field]:!border-border [&_.react-js-cron-field]:!bg-background [&_.react-js-cron-field]:!text-foreground [&_.react-js-cron-field]:!text-xs">
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
