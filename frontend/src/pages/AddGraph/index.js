import { Grid, useTheme } from "@mui/material";
import { useFormik } from "formik";
import React, { useMemo } from "react";
import { FieldComponent } from "../../components/FieldComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { getAllTableFields } from "../../utils/tables";

const GraphBuilderForm = () => {
  const theme = useTheme();
  const { pmUser } = useAuthState();
  const authorizedTables = useMemo(() => {
    if (pmUser) {
      const c = pmUser.extractAuthorizedTables();
      return c;
    } else {
      return null;
    }
  }, [pmUser]);

  // const allColumns = useMemo(() => {
  //   if (pmUser && tableName) {
  //     const u = pmUser;
  //     const c = u.extractAuthorizationForRowAdditionFromPolicyObject(tableName);
  //     if (!c) {
  //       return null;
  //     } else {
  //       return getAllTableFields(dbModel, tableName);
  //     }
  //   } else {
  //     return null;
  //   }
  // }, [pmUser, dbModel, tableName]);

  const graphForm = useFormik({
    initialValues: {
      title: "",
      data_sources: [],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      console.log({ graph: values });
    },
  });

  return (
    <form onSubmit={graphForm.handleSubmit} className="!px-4 !pt-10">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{ background: theme.palette.action.selected }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} key={"title"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
            name={"title"}
            value={graphForm.values["title"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["title"]}
            error={Boolean(graphForm.errors["title"])}
            required={true}
          />
        </Grid>
        {authorizedTables && authorizedTables.length > 0 && (
          <Grid item xs={12} sm={12} md={12} lg={12} key={"data_sources"}>
            <FieldComponent
              type={LOCAL_CONSTANTS.DATA_TYPES.MULTIPLE_SELECT}
              selectOptions={authorizedTables.map((key) => {
                return { label: key, value: key };
              })}
              name={"data_sources"}
              value={graphForm.values["data_sources"]}
              onBlur={graphForm.handleBlur}
              onChange={graphForm.handleChange}
              setFieldValue={graphForm.setFieldValue}
              helperText={graphForm.errors["data_sources"]}
              error={Boolean(graphForm.errors["data_sources"])}
              required={true}
            />
          </Grid>
        )}
      </Grid>
    </form>
  );
};

const AddGraph = () => {
  return (
    <div className="w-full ">
      <Grid container>
        <Grid item lg={5} md={4} className="w-full">
          <GraphBuilderForm />
        </Grid>
        <Grid item lg={7} md={8}></Grid>
      </Grid>
    </div>
  );
};

export default AddGraph;
