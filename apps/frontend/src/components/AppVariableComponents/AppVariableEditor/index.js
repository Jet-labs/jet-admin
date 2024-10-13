import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";
import "react-js-cron/dist/styles.css";
import { CodeEditor } from "../../CodeEditorComponent";
import { LOCAL_CONSTANTS } from "../../../constants";
export const AppVariableEditor = ({ appVariableForm }) => {
  const theme = useTheme();
  const _handleUpdateAppVariableValue = (value) => {
    appVariableForm?.setFieldValue(
      "pm_app_variable_value",
      typeof value === "string" ? JSON.parse(value) : value
    );
  };
  const _handleUpdateAppVariableInternal = (value) => {
    appVariableForm?.setFieldValue("is_internal", value.target.checked);
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
          name={"pm_app_variable_title"}
          value={appVariableForm.values.pm_app_variable_title}
          onChange={appVariableForm.handleChange}
          onBlur={appVariableForm.handleBlur}
        />
      </Grid>

      <Grid item sx={12} md={12} lg={12} className="!px-3">
        {" "}
        <Alert
          sx={{
            background: theme.palette.background.info,
            color: theme.palette.info.main,

            "& .MuiAlert-message": {
              marginTop: 0.2,
            },
          }}
          severity="info"
          className="!py-0 !text-xs"
        >
          {
            LOCAL_CONSTANTS.STRINGS
              .APP_VARIABLES_INTERNAL_CONSTANTS_RECOMMENDATION
          }
        </Alert>
      </Grid>
      <Grid item sx={12} md={12} lg={12} className="!px-3">
        <FormControlLabel
          control={
            <Checkbox
              checked={appVariableForm.values.is_internal}
              onChange={_handleUpdateAppVariableInternal}
            />
          }
          label={
            LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_FORM_INTERNAL_FIELD_LABEL
          }
        />
      </Grid>
      <Grid item sx={12} md={12} lg={12} className="!p-3">
        <CodeEditor
          code={
            appVariableForm?.values?.pm_app_variable_value
              ? typeof appVariableForm.values.pm_app_variable_value === "object"
                ? JSON.stringify(
                    appVariableForm.values.pm_app_variable_value,
                    null,
                    2
                  )
                : appVariableForm.values.pm_app_variable_value
              : JSON.stringify({})
          }
          setCode={_handleUpdateAppVariableValue}
          height="400px"
        />
      </Grid>
    </Grid>
  );
};
