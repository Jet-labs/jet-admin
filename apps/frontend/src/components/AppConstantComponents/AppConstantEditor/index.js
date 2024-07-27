import { Grid, TextField, useTheme } from "@mui/material";
import "react-js-cron/dist/styles.css";
import { CodeEditor } from "../../CodeEditorComponent";
export const AppConstantEditor = ({ appConstantID, appConstantForm }) => {
  const theme = useTheme();
  const _handleUpdateAppConstantValue = (value) => {
    appConstantForm?.setFieldValue("pm_app_constant_value", value);
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
        <CodeEditor
          code={
            appConstantForm?.values?.pm_app_constant_value
              ? appConstantForm.values.pm_app_constant_value
              : {}
          }
          setCode={_handleUpdateAppConstantValue}
          height="600px"
        />
      </Grid>
    </Grid>
  );
};
