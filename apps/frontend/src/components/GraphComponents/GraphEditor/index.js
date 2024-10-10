import {
  Box,
  Button,
  Checkbox,
  Drawer,
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
import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { SiPostgresql } from "react-icons/si";
import ReactJson from "react-json-view";
import { Link } from "react-router-dom";
import { getAllQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { CollapseComponent } from "../../CollapseComponent";
import { PGSQLQueryBuilder } from "../../QueryComponents/QueryBuilderComponents/PGSQLQueryBuilder";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";
import { ColorPickerComponent } from "../../ColorPickerComponent";

/**
 *
 * @param {object} param0
 * @param {import("formik").FormikConfig} param0.graphForm
 * @returns
 */
export const GraphEditor = ({ pmGraphID, graphForm }) => {
  const theme = useTheme();
  const [isQueryTestingDialogOpen, setIsQueryTestingDialogOpen] =
    useState(false);
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

  const queryMap = queries
    ? queries.reduce(
        (acc, query) => ({ ...acc, [query.pm_query_id]: query }),
        {}
      )
    : {};

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

  const _handleCloseQueryTestingPanel = () => {
    setIsQueryTestingDialogOpen(false);
  };

  return (
    <form onSubmit={graphForm.handleSubmit} className="!pt-1">
      <Grid
        container
        spacing={2}
        className="rounded !p-3 !pr-0"
        // style={{ background: theme.palette.action.selected }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} key={"pm_graph_title"}>
          <FormControl fullWidth size="small" className="">
            <span className="text-xs font-light  !capitalize mb-1">{`Title`}</span>
            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_graph_title"}
              value={graphForm.values.pm_graph_title}
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

        {queries && queries.length > 0 ? (
          graphForm.values["query_array"]?.map((dataset, index) => {
            return (
              <div
                className="!rounded  !mt-3 !ml-3.5 !px-3 !py-3 w-full"
                style={{
                  background: theme.palette.background.secondary,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: theme.palette.divider,
                }}
              >
                <div key={"query_array"} className="!flex justify-end">
                  <IconButton
                    aria-label="delete"
                    color="error"
                    className="!p-0"
                    onClick={() => _handleDeleteDataset(index)}
                  >
                    <FaTimes className="!text-sm" />
                  </IconButton>
                </div>

                {queryMap[dataset.pm_query_id] && (
                  <Drawer
                    anchor={"right"}
                    open={isQueryTestingDialogOpen}
                    onClose={_handleCloseQueryTestingPanel}
                    PaperProps={{
                      style: {
                        backgroundColor: theme.palette.background.default,
                      },
                      sx: {
                        backgroundImage:
                          "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0)) !important",
                      },
                    }}
                  >
                    <div className=" !text-lg !flex flex-row justify-between items-center w-full">
                      <IconButton
                        aria-label="close"
                        onClick={_handleCloseQueryTestingPanel}
                      >
                        <FaTimes className="!text-base" />
                      </IconButton>
                    </div>
                    <PGSQLQueryBuilder
                      value={queryMap[dataset.pm_query_id].pm_query}
                      args={queryMap[dataset.pm_query_id].pm_query_args}
                      runQueryOnRender={false}
                    />
                  </Drawer>
                )}

                {GRAPH_PLUGINS_MAP[
                  graphForm.values["graph_type"]
                ]?.fields?.includes("dataset_title") && (
                  <FormControl fullWidth size="small" className="">
                    <span className="text-xs font-light  !capitalize mb-1">{`Dataset title`}</span>
                    <TextField
                      required={true}
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Dataset title"
                      type="text"
                      name={`query_array_x-${index}`}
                      value={dataset.dataset_title}
                      onBlur={graphForm.handleBlur}
                      onChange={(e) => {
                        _handleUpdateDatasetTitle(index, e.target.value);
                      }}
                    />
                  </FormControl>
                )}
                {queryMap[dataset.pm_query_id] && (
                  <CollapseComponent
                    showButtonText={"Query result metadata"}
                    hideButtonText={"Hide"}
                    containerClass={"mt-2"}
                    content={() => (
                      <Box
                        sx={{ bgcolor: "background.secondary" }}
                        className="!max-h-32 !overflow-y-auto rounded"
                      >
                        <ReactJson
                          src={queryMap[dataset.pm_query_id].pm_query_metadata}
                          theme={
                            localStorage.getItem(
                              LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
                            ) === "dark"
                              ? "google"
                              : "ashes"
                          }
                        />
                      </Box>
                    )}
                  />
                )}

                <FormControl fullWidth size="small" className="!mt-3">
                  <div className="!flex flex-row justify-between w-full">
                    <span className="text-xs font-light  !capitalize mb-1">{`Select query`}</span>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsQueryTestingDialogOpen(true);
                      }}
                      className="!text-xs font-light"
                      sx={{
                        padding: "0px !important",
                        textTransform: "capitalize",
                        minWidth: 0,
                      }}
                    >
                      {LOCAL_CONSTANTS.STRINGS.QUERY_TEST_BUTTON}
                    </Button>
                  </div>
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
                      return (
                        <MenuItem value={query.pm_query_id}>
                          <div className="!flex flex-row justify-start items-center">
                            <SiPostgresql className="!text-lg" />
                            <span className="ml-2">{query.pm_query_title}</span>
                          </div>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
                <Grid container columnSpacing={2} className="!mt-2">
                  {GRAPH_PLUGINS_MAP[
                    graphForm.values["graph_type"]
                  ]?.fields?.includes("label") && (
                    <Grid
                      item
                      xs={6}
                      sm={6}
                      md={6}
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
                            _handleUpdateDatasetLabelAxis(
                              index,
                              e.target.value
                            );
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
                      md={6}
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
                      md={6}
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
                      md={6}
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
                            _handleUpdateDatasetValueAxis(
                              index,
                              e.target.value
                            );
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <FormControl fullWidth size="small" className="!mt-2">
                  <span className="text-xs font-light  !capitalize mb-1">{`color`}</span>

                  <ColorPickerComponent
                    currentColor={dataset.color}
                    onPickColor={(c) => {
                      _handleUpdateDatasetColor(index, c);
                    }}
                  />
                </FormControl>
              </div>
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
          <Button variant="contained" onClick={_handleAddDataset}>
            Add dataset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
