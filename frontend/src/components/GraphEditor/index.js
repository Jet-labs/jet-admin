import { Button, Grid, IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";
import { FieldComponent } from "../FieldComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { FaTimes } from "react-icons/fa";
import { GraphDeletionForm } from "../GraphDeletionForm";

/**
 *
 * @param {object} param0
 * @param {import("formik").FormikConfig} param0.graphForm
 * @returns
 */
export const GraphEditor = ({ graphID, graphForm, deleteGraph }) => {
  const theme = useTheme();

  const _handleAddDataset = () => {
    const newQueryArrayFieldValue = graphForm.values["query_array"];
    graphForm.setFieldValue("query_array", [
      ...newQueryArrayFieldValue,
      { dataset_title: "", color: "#D84545", query: "" },
    ]);
  };

  const _handleUpdateDatasetLabel = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].dataset_title = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };
  const _handleUpdateDatasetColor = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].color = value;
    updatedQueryArrayFieldValue[index].backgroundColor = `${value}80`;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };
  const _handleUpdateDatasetFill = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].fill = value;

    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };
  const _handleUpdateDatasetXAxis = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].x_axis = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };
  const _handleUpdateDatasetYAxis = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].y_axis = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleUpdateDatasetQuery = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].query = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleDeleteDataset = (index) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue.splice(index, 1);
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleSubmit = () => {
    graphForm.handleSubmit();
  };

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
        <Grid item xs={12} sm={12} md={6} lg={6} key={"title_display_enabled"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
            name={"title_display_enabled"}
            value={graphForm.values["title_display_enabled"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["title_display_enabled"]}
            error={Boolean(graphForm.errors["title_display_enabled"])}
            required={true}
            customMapping={null}
            language={"json"}
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
            language={"json"}
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
            language={"json"}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} key={"query_array"}>
          <Button variant="contained" onClick={_handleAddDataset}>
            Add dataset
          </Button>
        </Grid>

        {graphForm.values["query_array"]?.map((dataset, index) => {
          return (
            <Grid
              className="!rounded  !mt-3 !ml-3.5 !pr-3 !py-3"
              sx={{
                background: theme.palette.action.selected,
              }}
              rowSpacing={2}
              columnSpacing={2}
              container
              xs={12}
              sm={12}
              md={12}
              lg={12}
            >
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={"query_array"}
                className="!flex justify-end !-mt-3"
              >
                <IconButton
                  aria-label="delete"
                  color="error"
                  className="!p-0"
                  onClick={() => _handleDeleteDataset(index)}
                >
                  <FaTimes className="!text-sm" />
                </IconButton>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={`query_array_title-${index}`}
              >
                <FieldComponent
                  type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                  name={`query_array_title-${index}`}
                  value={dataset.dataset_title}
                  onBlur={graphForm.handleBlur}
                  onChange={(e) => {
                    _handleUpdateDatasetLabel(index, e.target.value);
                  }}
                  required={true}
                  customMapping={null}
                />
              </Grid>

              {LOCAL_CONSTANTS.GRAPH_TYPES[
                graphForm.values["graph_type"]
              ]?.fields?.includes("x_axis") && (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  key={`query_array_x-${index}`}
                >
                  <FieldComponent
                    type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                    name={`query_array_x-${index}`}
                    value={dataset.x_axis}
                    onBlur={graphForm.handleBlur}
                    onChange={(e) => {
                      _handleUpdateDatasetXAxis(index, e.target.value);
                    }}
                    setFieldValue={(name, value) => {
                      _handleUpdateDatasetXAxis(
                        parseInt(String(name).split("-")[1]),
                        value
                      );
                    }}
                    required={true}
                  />
                </Grid>
              )}
              {LOCAL_CONSTANTS.GRAPH_TYPES[
                graphForm.values["graph_type"]
              ]?.fields?.includes("y_axis") && (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  key={`query_array_y-${index}`}
                >
                  <FieldComponent
                    type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                    name={`query_array_y-${index}`}
                    value={dataset.y_axis}
                    onBlur={graphForm.handleBlur}
                    onChange={(e) => {
                      _handleUpdateDatasetYAxis(index, e.target.value);
                    }}
                    setFieldValue={(name, value) => {
                      _handleUpdateDatasetYAxis(
                        parseInt(String(name).split("-")[1]),
                        value
                      );
                    }}
                    required={true}
                  />
                </Grid>
              )}

              {LOCAL_CONSTANTS.GRAPH_TYPES[
                graphForm.values["fill"]
              ]?.fields?.includes("y_axis") && (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  key={`query_array_fill-${index}`}
                >
                  <FieldComponent
                    type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
                    name={`query_array_fill-${index}`}
                    value={dataset.fill}
                    onBlur={graphForm.handleBlur}
                    onChange={(e) => {
                      _handleUpdateDatasetFill(index, e.target.value);
                    }}
                    setFieldValue={(name, value) => {
                      _handleUpdateDatasetFill(
                        parseInt(String(name).split("-")[1]),
                        value
                      );
                    }}
                    required={true}
                    customMapping={null}
                  />
                </Grid>
              )}

              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={`query_array_color-${index}`}
              >
                <FieldComponent
                  type={LOCAL_CONSTANTS.DATA_TYPES.COLOR}
                  name={`query_array_color-${index}`}
                  value={dataset.color}
                  onBlur={graphForm.handleBlur}
                  onChange={(e) => {
                    _handleUpdateDatasetColor(index, e.target.value);
                  }}
                  setFieldValue={(name, value) => {
                    _handleUpdateDatasetColor(
                      parseInt(String(name).split("-")[1]),
                      value
                    );
                  }}
                  required={true}
                  customMapping={null}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={`query_array_query-${index}`}
              >
                <FieldComponent
                  type={LOCAL_CONSTANTS.DATA_TYPES.CODE}
                  name={`query_array_query-${index}`}
                  value={dataset.query}
                  onBlur={graphForm.handleBlur}
                  onChange={(e) => {
                    _handleUpdateDatasetQuery(index, e.target.value);
                  }}
                  setFieldValue={(name, value) => {
                    _handleUpdateDatasetQuery(
                      parseInt(String(name).split("-")[1]),
                      value
                    );
                  }}
                  required={true}
                  language={"sql"}
                  customMapping={null}
                />
              </Grid>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={12} md={12} lg={12} key={"submit"}>
          <Button variant="contained" onClick={_handleSubmit}>
            Submit
          </Button>
          <GraphDeletionForm graphID={graphID} />
        </Grid>
      </Grid>
    </form>
  );
};
