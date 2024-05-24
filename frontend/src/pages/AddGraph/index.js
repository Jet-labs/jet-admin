import { Button, Grid, useTheme } from "@mui/material";
import { useFormik } from "formik";
import React, { useMemo } from "react";
import { FieldComponent } from "../../components/FieldComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { LineGraphComponent } from "../../components/LineGraphComponent";

const GraphBuilderPreview = ({
  graphType,
  legendPosition,
  legendDisplay,
  graphTitle,
}) => {
  const theme = useTheme();
  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: legendPosition
            ? legendPosition
            : LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
        },
        title: {
          display: Boolean(legendDisplay),
          text: graphTitle
            ? graphTitle
            : LOCAL_CONSTANTS.STRINGS.UNTITLED_CHART_TITLE,
        },
      },
    };
  }, [legendPosition, legendDisplay, graphTitle]);
  return (
    <div className="!pt-10">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{ background: theme.palette.action.selected }}
      >
        {options && <LineGraphComponent options={options} />}
      </Grid>
    </div>
  );
};

/**
 *
 * @param {object} param0
 * @param {import("formik").FormikConfig} param0.graphForm
 * @returns
 */
const GraphBuilderForm = ({ graphForm }) => {
  const theme = useTheme();

  const _handleAddDataset = () => {
    const newQueryArrayFieldValue = graphForm.values["query_array"];
    graphForm.setFieldValue("query_array", [
      ...newQueryArrayFieldValue,
      { dataset_title: "", query: {} },
    ]);
    console.log(graphForm.values["query_array"]);
  };

  const _handleUpdateDatasetLabel = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].dataset_title = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  console.log({ values: graphForm.values["query_array"] });

  return (
    <form onSubmit={graphForm.handleSubmit} className="!pt-3">
      <Grid
        container
        spacing={2}
        className="rounded !p-3"
        // style={{ background: theme.palette.action.selected }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} key={"graph_title"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
            name={"graph_title"}
            value={graphForm.values["graph_title"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["graph_title"]}
            error={Boolean(graphForm.errors["graph_title"])}
            required={true}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} key={"legend_enabled"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
            name={"legend_enabled"}
            value={graphForm.values["legend_enabled"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["legend_enabled"]}
            error={Boolean(graphForm.errors["legend_enabled"])}
            required={true}
            customMapping={null}
            jsonMode={"code"}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} key={"legend_position"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.SINGLE_SELECT}
            selectOptions={Object.keys(
              LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION
            ).map((e) => {
              return {
                label: e,
                value: LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION[e],
              };
            })}
            name={"legend_position"}
            value={graphForm.values["legend_position"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["legend_position"]}
            error={Boolean(graphForm.errors["legend_position"])}
            required={true}
            customMapping={null}
            jsonMode={"code"}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"graph_type"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.SINGLE_SELECT}
            selectOptions={Object.keys(LOCAL_CONSTANTS.GRAPH_TYPES).map((e) => {
              return LOCAL_CONSTANTS.GRAPH_TYPES[e];
            })}
            name={"graph_type"}
            value={graphForm.values["graph_type"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["graph_type"]}
            error={Boolean(graphForm.errors["graph_type"])}
            required={true}
            customMapping={null}
            jsonMode={"code"}
          />
        </Grid>
        {LOCAL_CONSTANTS.GRAPH_TYPES[
          graphForm.values["graph_type"]
        ]?.fields?.includes("x_axis") && (
          <Grid item xs={12} sm={12} md={6} lg={6} key={"x_axis"}>
            <FieldComponent
              type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
              name={"x_axis"}
              value={graphForm.values["x_axis"]}
              onBlur={graphForm.handleBlur}
              onChange={graphForm.handleChange}
              setFieldValue={graphForm.setFieldValue}
              helperText={graphForm.errors["x_axis"]}
              error={Boolean(graphForm.errors["x_axis"])}
              required={true}
            />
          </Grid>
        )}
        {LOCAL_CONSTANTS.GRAPH_TYPES[
          graphForm.values["graph_type"]
        ]?.fields?.includes("y_axis") && (
          <Grid item xs={12} sm={12} md={6} lg={6} key={"y_axis"}>
            <FieldComponent
              type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
              name={"y_axis"}
              value={graphForm.values["y_axis"]}
              onBlur={graphForm.handleBlur}
              onChange={graphForm.handleChange}
              setFieldValue={graphForm.setFieldValue}
              helperText={graphForm.errors["y_axis"]}
              error={Boolean(graphForm.errors["y_axis"])}
              required={true}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={12} md={12} lg={12} key={"query_array"}>
          <Button variant="contained" onClick={_handleAddDataset}>
            Add dataset
          </Button>
        </Grid>

        {graphForm.values["query_array"]?.map((dataset, index) => {
          return (
            <>
              <Grid item xs={12} sm={12} md={12} lg={12} key={"query_array"}>
                <FieldComponent
                  type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                  name={`query_array-${index}-label`}
                  value={dataset.label}
                  onBlur={graphForm.handleBlur}
                  onChange={(e) => {
                    _handleUpdateDatasetLabel(index, e.target.value);
                  }}
                  required={true}
                  customMapping={null}
                />
              </Grid>
            </>
          );
        })}
      </Grid>
    </form>
  );
};

const AddGraph = () => {
  const graphForm = useFormik({
    initialValues: {
      graph_type: LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value,
      legend_enabled: true,
      legend_position: LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION.TOP,
      graph_title: "",
      x_axis: "",
      y_axis: "",
      query_array: [{ dataset_title: "", query: {} }],
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
    <div className="w-full">
      <Grid container spacing={1} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphBuilderForm graphForm={graphForm} />
        </Grid>
        <Grid item lg={7} md={8} className="w-full">
          <GraphBuilderPreview
            legendPosition={graphForm.values["legend_position"]}
            legendDisplay={graphForm.values["legend_enabled"]}
            graphTitle={graphForm.values["graph_title"]}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default AddGraph;
