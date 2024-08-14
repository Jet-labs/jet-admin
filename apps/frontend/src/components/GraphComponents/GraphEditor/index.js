import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { SiPostgresql } from "react-icons/si";
import { Link } from "react-router-dom";
import { getAllQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { GraphDeletionForm } from "../GraphDeletionForm";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";

/**
 *
 * @param {object} param0
 * @param {import("formik").FormikConfig} param0.graphForm
 * @returns
 */
export const GraphEditor = ({ graphID, graphForm }) => {
  const theme = useTheme();

  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _handleAddDataset = () => {
    const newQueryArrayFieldValue = graphForm.values["query_array"];
    graphForm.setFieldValue("query_array", [
      ...newQueryArrayFieldValue,
      { dataset_title: "", color: "#D84545", query: "" },
    ]);
  };
  const _handleUpdateDatasetColor = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].color = value;
    updatedQueryArrayFieldValue[index].backgroundColor = `${value}80`;
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

  const _handleUpdateDatasetLabelAxis = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].label = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleUpdateDatasetTitle = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].dataset_title = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleUpdateDatasetValueAxis = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].value = value;
    graphForm.setFieldValue("query_array", updatedQueryArrayFieldValue);
  };

  const _handleUpdateDatasetQuery = (index, value) => {
    let updatedQueryArrayFieldValue = graphForm.values["query_array"];
    updatedQueryArrayFieldValue[index].pm_query_id = value;
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
          <FormControl fullWidth size="small" className="">
            <span className="text-xs font-light  !capitalize mb-1">{`Title`}</span>
            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"graph_title"}
              value={graphForm.values.graph_title}
              onChange={graphForm.handleChange}
              onBlur={graphForm.handleBlur}
            />
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={12}
          key={"title_display_enabled"}
        >
          <FormControlLabel
            control={
              <Checkbox checked={graphForm.values.title_display_enabled} />
            }
            label="Title visible"
            name="title_display_enabled"
            onChange={graphForm.handleChange}
            onBlur={graphForm.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"legend_position"}>
          <FormControl fullWidth size="small" className="">
            <span className="text-xs font-light  !capitalize mb-1">{`Legend position`}</span>

            <Select
              value={graphForm.values.legend_position}
              onChange={graphForm.handleChange}
              onBlur={graphForm.handleBlur}
              name={"legend_position"}
              required={true}
              size="small"
              fullWidth={false}
            >
              {Object.keys(LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION).map((e) => {
                return (
                  <MenuItem value={LOCAL_CONSTANTS.GRAPH_LEGEND_POSITION[e]}>
                    {e}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"graph_type"}>
          <FormControl fullWidth size="small" className="">
            <span className="text-xs font-light  !capitalize mb-1">{`Graph type`}</span>

            <Select
              value={graphForm.values.graph_type}
              onChange={graphForm.handleChange}
              onBlur={graphForm.handleBlur}
              name={"graph_type"}
              required={true}
              size="small"
              fullWidth={false}
            >
              {Object.keys(GRAPH_PLUGINS_MAP).map((e) => {
                return (
                  <MenuItem value={GRAPH_PLUGINS_MAP[e].value}>
                    {GRAPH_PLUGINS_MAP[e].label}
                  </MenuItem>
                );
              })}
            </Select>
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"refetch_interval"}>
          <FormControl fullWidth size="small" className="">
            <span className="text-xs font-light  !capitalize mb-1">{`Refetch interval (in seconds)`}</span>
            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="number"
              name={"refetch_interval"}
              value={graphForm.values.refetch_interval}
              onChange={graphForm.handleChange}
              onBlur={graphForm.handleBlur}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} key={"query_array"}>
          <Button variant="contained" onClick={_handleAddDataset}>
            Add dataset
          </Button>
        </Grid>

        {queries && queries.length > 0 ? (
          graphForm.values["query_array"]?.map((dataset, index) => {
            return (
              <Grid
                className="!rounded  !mt-3 !ml-3.5 !pr-3 !py-3"
                sx={{
                  background: theme.palette.background.secondary,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: theme.palette.divider,
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
                  {GRAPH_PLUGINS_MAP[
                    graphForm.values["graph_type"]
                  ]?.fields?.includes("dataset_title") && (
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      key={`query_array_dataset_title-${index}`}
                    >
                      <FormControl fullWidth size="small" className="">
                        <span className="text-xs font-light  !capitalize mb-1">{`Dataset title`}</span>
                        <TextField
                          required={true}
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="text"
                          name={`query_array_x-${index}`}
                          value={dataset.dataset_title}
                          onBlur={graphForm.handleBlur}
                          onChange={(e) => {
                            _handleUpdateDatasetTitle(index, e.target.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                  <FormControl fullWidth size="small" className="!mt-3">
                    <span className="text-xs font-light  !capitalize mb-1">{`Select query`}</span>

                    <Select
                      name={`query_array_query-${index}`}
                      value={parseInt(dataset.pm_query_id)}
                      onBlur={graphForm.handleBlur}
                      onChange={(e) => {
                        _handleUpdateDatasetQuery(index, e.target.value);
                      }}
                      required={true}
                      size="small"
                      fullWidth={true}
                    >
                      {queries?.map((query) => {
                        console.log({ query });
                        return (
                          <MenuItem value={query.pm_query_id}>
                            <div className="!flex flex-row justify-start items-center">
                              <SiPostgresql className="!text-lg" />
                              <span className="ml-2">
                                {query.pm_query_title}
                              </span>
                            </div>
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                  </FormControl>
                </Grid>

                {GRAPH_PLUGINS_MAP[
                  graphForm.values["graph_type"]
                ]?.fields?.includes("label") && (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={4}
                    key={`query_array_label-${index}`}
                  >
                    <FormControl fullWidth size="small" className="">
                      <span className="text-xs font-light  !capitalize mb-1">{`label`}</span>
                      <TextField
                        required={true}
                        fullWidth
                        size="small"
                        variant="outlined"
                        type="text"
                        name={`query_array_label-${index}`}
                        value={dataset.label}
                        onBlur={graphForm.handleBlur}
                        onChange={(e) => {
                          _handleUpdateDatasetLabelAxis(index, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}

                {GRAPH_PLUGINS_MAP[
                  graphForm.values["graph_type"]
                ]?.fields?.includes("x_axis") && (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={4}
                    key={`query_array_x-${index}`}
                  >
                    <FormControl fullWidth size="small" className="">
                      <span className="text-xs font-light  !capitalize mb-1">{`x-axis`}</span>
                      <TextField
                        required={true}
                        fullWidth
                        size="small"
                        variant="outlined"
                        type="text"
                        name={`query_array_x-${index}`}
                        value={dataset.x_axis}
                        onBlur={graphForm.handleBlur}
                        onChange={(e) => {
                          _handleUpdateDatasetXAxis(index, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                {GRAPH_PLUGINS_MAP[
                  graphForm.values["graph_type"]
                ]?.fields?.includes("y_axis") && (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={4}
                    key={`query_array_y-${index}`}
                  >
                    <FormControl fullWidth size="small" className="">
                      <span className="text-xs font-light  !capitalize mb-1">{`y-axis`}</span>
                      <TextField
                        required={true}
                        fullWidth
                        size="small"
                        variant="outlined"
                        type="text"
                        name={`query_array_y-${index}`}
                        value={dataset.y_axis}
                        onBlur={graphForm.handleBlur}
                        onChange={(e) => {
                          _handleUpdateDatasetYAxis(index, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}

                {GRAPH_PLUGINS_MAP[
                  graphForm.values["graph_type"]
                ]?.fields?.includes("value") && (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={4}
                    key={`query_array_value-${index}`}
                  >
                    <FormControl fullWidth size="small" className="">
                      <span className="text-xs font-light  !capitalize mb-1">{`value`}</span>
                      <TextField
                        required={true}
                        fullWidth
                        size="small"
                        variant="outlined"
                        type="text"
                        name={`query_array_value-${index}`}
                        value={dataset.value}
                        onBlur={graphForm.handleBlur}
                        onChange={(e) => {
                          _handleUpdateDatasetValueAxis(index, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  key={`query_array_color-${index}`}
                >
                  <FormControl fullWidth size="small" className="">
                    <span className="text-xs font-light  !capitalize mb-1">{`color`}</span>
                    <TextField
                      required={true}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="color"
                      name={`query_array_color-${index}`}
                      value={dataset.color}
                      onBlur={graphForm.handleBlur}
                      onChange={(e) => {
                        _handleUpdateDatasetColor(index, e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            );
          })
        ) : (
          <Grid
            className="!rounded  !mt-3 !ml-3.5 !pr-3 !py-3"
            sx={{
              background: theme.palette.background.default,
            }}
            rowSpacing={2}
            columnSpacing={2}
            container
            xs={12}
            sm={12}
            md={12}
            lg={12}
          >
            <Link
              to={`../../${LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.path()}/${LOCAL_CONSTANTS.ROUTES.ADD_QUERY.path()}`}
            >
              <ListItemButton
                sx={{
                  background: theme.palette.background.default,
                  border: `1px dotted`,
                  borderColor: theme.palette.info.main,
                  borderWidth: 2,
                  marginTop: 1,
                }}
                className="!rounded  !flex !flex-row !justify-between !items-center !w-full"
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  <FaPlus className="!text-sm" />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  primary={`No queries found. Configure queries to add them as datasets of graph`}
                  primaryTypographyProps={{
                    sx: {
                      marginLeft: -2,
                    },
                  }}
                />
              </ListItemButton>
            </Link>
          </Grid>
        )}
        <Grid item xs={12} sm={12} md={12} lg={12} key={"submit"}>
          <Button variant="contained" onClick={_handleSubmit}>
            {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
          </Button>
          {(graphID != null || graphID != undefined) && (
            <GraphDeletionForm graphID={graphID} />
          )}
        </Grid>
      </Grid>
    </form>
  );
};
