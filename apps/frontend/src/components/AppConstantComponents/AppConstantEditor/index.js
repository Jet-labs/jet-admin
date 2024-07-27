import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";
import "react-js-cron/dist/styles.css";
import { CodeEditor } from "../../CodeEditorComponent";
export const AppConstantEditor = ({ appConstantForm }) => {
  const theme = useTheme();
  const _handleUpdateAppConstantValue = (value) => {
    appConstantForm?.setFieldValue(
      "pm_app_constant_value",
      typeof value === "string" ? JSON.parse(value) : value
    );
  };
  const _handleUpdateAppConstantInternal = (value) => {
    appConstantForm?.setFieldValue("is_internal", value.target.checked);
  };
  return (
    <Grid container className="!w-full" style={{}}>
      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <span className="!text-xs !font-light">{`Title`}</span>
        <TextField
          required={true}
          fullWidth
          size="small"
          variant="outlined"
          type="text"
          name={"pm_app_constant_title"}
          value={appConstantForm.values.pm_app_constant_title}
          onChange={appConstantForm.handleChange}
          onBlur={appConstantForm.handleBlur}
        />
      </Grid>

      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <FormControlLabel
          control={
            <Checkbox
              checked={appConstantForm.values.is_internal}
              onChange={_handleUpdateAppConstantInternal}
            />
          }
          label="Internal"
        />
      </Grid>

      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <CodeEditor
          code={
            appConstantForm?.values?.pm_app_constant_value
              ? typeof appConstantForm.values.pm_app_constant_value === "object"
                ? JSON.stringify(
                    appConstantForm.values.pm_app_constant_value,
                    null,
                    2
                  )
                : appConstantForm.values.pm_app_constant_value
              : JSON.stringify({})
          }
          setCode={_handleUpdateAppConstantValue}
          height="400px"
        />
      </Grid>
    </Grid>
  );
};
