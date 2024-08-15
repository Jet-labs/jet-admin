import "react-js-cron/dist/styles.css";
import { Cron } from "react-js-cron";
import { useState } from "react";
import {
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
export const CronJobScheduler = ({
  key,
  readOnly,
  disabled,
  onError,
  value,
  handleChange,
  showRawInput,
  customStyle,
}) => {
  const [clockFormat, setClockFormat] = useState("24-hour-clock");
  const [humanize, setHumanize] = useState(true);
  const theme = useTheme();
  return (
    <Grid
      container
      className="!w-full"
      style={{
        borderColor: theme.palette.divider,
        borderWidth: 1,
        borderRadius: 4,
      }}
    >
      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <FormControlLabel
          control={
            <Switch
              checked={humanize}
              onChange={(e, checked) => {
                setHumanize(checked);
              }}
            />
          }
          label="Humanize values"
        />
      </Grid>
      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <span className="!text-xs !font-light">{`Raw input (Cron job format)`}</span>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          type="text"
          name={"cron-job-scheduler"}
          value={value}
          className="!mt-1"
          onChange={(e) => handleChange(e.target.value)}
        />
      </Grid>
      <Divider className="!w-full !my-5">Or</Divider>
      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <Cron
          key={key ? key : "cron-job-scheduler"}
          value={value}
          setValue={(v) => {
            handleChange(v);
          }}
          onError={onError ? onError : null}
          disabled={disabled}
          readOnly={readOnly}
          humanizeLabels={humanize}
          humanizeValue={humanize}
          displayError={false}
          clearButton={true}
          shortcuts={true}
          allowEmpty={true}
          clockFormat={clockFormat ? clockFormat : "24-hour-clock"}
          defaultPeriod={"day"}
          leadingZero={true}
          className={customStyle ? "my-project-cron" : undefined}
          periodicityOnDoubleClick={true}
          mode={"multiple"}
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
      </Grid>
    </Grid>
  );
};
