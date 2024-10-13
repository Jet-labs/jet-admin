import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Tab,
  Tabs,
  TextField,
  useTheme,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { getAllTables, getTableColumns } from "../../../api/tables";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
export const TableGeneralDetailsBuilder = ({ tableForm }) => {
  return (
    <Grid container xl={6} lg={6} md={12} sm={12} xs={12} className="!p-3">
      <FormControl fullWidth size="small" className="">
        <span className="text-xs font-light  !capitalize mb-1">{`Table name`}</span>
        <TextField
          required={true}
          fullWidth
          size="small"
          variant="outlined"
          type="text"
          name={"table_name"}
          value={tableForm.values["table_name"]}
          onChange={tableForm.handleChange}
          onBlur={tableForm.handleBlur}
        />
        {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={tableForm.values["if_not_exists"]}
            onChange={(value) => {
              tableForm?.setFieldValue("if_not_exists", value.target.checked);
            }}
          />
        }
        label={"Create table if not exists"}
      />
    </Grid>
  );
};
export const TableColumnBuilder = ({ tableForm }) => {
  const theme = useTheme();
  const _handleAddColumn = () => {
    tableForm.setFieldValue("columns", [
      ...tableForm.values.columns,
      {
        column_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
        data_type: "",
        storage: "DEFAULT",
        collation: "",
        default: "",
        not_null: true,
        unique: false,
        primary_key: false,
        check: "",
      },
    ]);
  };
  const _handleDeleteColumn = (index) => {
    const _d = structuredClone(tableForm.values.columns);
    _d.splice(index, 1);
    tableForm.setFieldValue("columns", [..._d]);
  };
  return (
    <Grid container className="!p-3">
      {tableForm.values["columns"].map((columns, index) => {
        return (
          <div
            className={`flex flex-row justify-start border rounded  w-full !ml-0 ${
              index === 0 ? "!mt-1" : "!mt-3"
            }`}
            style={{ borderColor: theme.palette.divider }}
          >
            <Grid
              key={`table_form_column_${index}`}
              container
              xl={12}
              lg={12}
              md={12}
              sm={12}
              xs={12}
              spacing={1}
              className="!p-3 !pb-1"
            >
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Column name"
                    type="text"
                    name={`columns[${index}].column_name`}
                    value={tableForm.values.columns[index]["column_name"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["column_name"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <Select
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="text"
                    placeholder="Data type"
                    name={`columns[${index}].data_type`}
                    value={tableForm.values.columns[index]["data_type"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["data_type"]}
                  >
                    {Object.keys(LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES)?.map(
                      (type) => {
                        return (
                          <MenuItem
                            value={
                              LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].value
                            }
                          >
                            {LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <Select
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="text"
                    placeholder="Data type"
                    name={`columns[${index}].storage`}
                    value={tableForm.values.columns[index]["storage"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["storage"]}
                  >
                    {["PLAIN", "EXTERNAL", "EXTENDED", "MAIN", "DEFAULT"].map(
                      (storage) => {
                        return <MenuItem value={storage}>{storage}</MenuItem>;
                      }
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Default value"
                    type="text"
                    name={`columns[${index}].default`}
                    value={tableForm.values.columns[index]["default"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["default"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Check expression"
                    type="text"
                    name={`columns[${index}].check`}
                    value={tableForm.values.columns[index]["check"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["check"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["unique"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].unique`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Unique"}
                />
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["primary_key"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].primary_key`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Primary key"}
                />
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["not_null"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].not_null`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Create table if not exists"}
                />
              </Grid>
            </Grid>
            <div
              className=" rounded-e"
              style={{ background: theme.palette.background.paper }}
            >
              <IconButton
                size="small"
                onClick={() => _handleDeleteColumn(index)}
              >
                <MdDeleteOutline className="!text-xl !text-red-700"></MdDeleteOutline>
              </IconButton>
            </div>
          </div>
        );
      })}
      <Button variant="outlined" className="!mt-3" onClick={_handleAddColumn}>
        <FaPlus className="!mr-1" />
        {LOCAL_CONSTANTS.STRINGS.TABLE_COLUMN_ADDITION_PAGE_TITLE}
      </Button>
    </Grid>
  );
};
const ForeignKeyRenderer = ({
  tableForm,
  tables,
  index,
  handleDeleteForeignKeyCostraint,
}) => {
  const theme = useTheme();
  const {
    isLoading: isLoadingTableColumns,
    data: tableColumns,
    error: loadTableColumnsError,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_COLUMNS(
        tableForm.values["constraints"]["foreign_keys"][index]?.ref_table
      ),
    ],
    queryFn: () =>
      getTableColumns({
        tableName:
          tableForm.values["constraints"]["foreign_keys"][index]?.ref_table,
      }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });
  return (
    <div
      className={`flex flex-row justify-start border rounded  w-full !ml-0 ${
        index === 0 ? "!mt-1" : "!mt-3"
      }`}
      style={{ borderColor: theme.palette.divider }}
    >
      <Grid container className="!p-3" columnSpacing={2}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-0">
            <span className="text-xs font-light  !capitalize mb-1">{`Columns`}</span>
            <Select
              multiple
              value={
                tableForm.values["constraints"]["foreign_keys"][index].columns
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              name={`constraints.foreign_keys[${index}].columns`}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .columns
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      className="!rounded"
                      size="small"
                      key={value}
                      label={value}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {tableForm.values.columns?.map((column) => (
                <MenuItem
                  key={column.column_name}
                  value={column.column_name}
                  // style={getStyles(name, personName, theme)}
                >
                  {column.column_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Reference table`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].ref_table`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].ref_table
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .ref_table
              }
            >
              {tables?.map((table) => {
                return <MenuItem value={table}>{table}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Reference columns`}</span>
            <Select
              multiple
              value={
                tableForm.values["constraints"]["foreign_keys"][index]
                  .ref_columns
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              name={`constraints.foreign_keys[${index}].ref_columns`}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .ref_columns
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      className="!rounded"
                      size="small"
                      key={value}
                      label={value}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {tableColumns?.map((column) => (
                <MenuItem
                  key={column.name}
                  value={column.name}
                  // style={getStyles(name, personName, theme)}
                >
                  {column.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`On delete`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].on_delete`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].on_delete
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .on_delete
              }
            >
              {["NO ACTION", "RESTRICT", "CASCADE"]?.map((action) => {
                return <MenuItem value={action}>{action}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`On update`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].on_update`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].on_update
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .on_update
              }
            >
              {["NO ACTION", "RESTRICT", "CASCADE"]?.map((action) => {
                return <MenuItem value={action}>{action}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <div
        className=" rounded-e"
        style={{ background: theme.palette.background.paper }}
      >
        <IconButton
          size="small"
          onClick={() => handleDeleteForeignKeyCostraint(index)}
        >
          <MdDeleteOutline className="!text-xl !text-red-700"></MdDeleteOutline>
        </IconButton>
      </div>
    </div>
  );
};
export const TableConstraintBuilder = ({ tables, tableForm }) => {
  const theme = useTheme();
  const _handleAddForeignKeyCostraint = () => {
    tableForm.setFieldValue("constraints.foreign_keys", [
      ...tableForm.values["constraints"]["foreign_keys"],
      {
        columns: [],
        ref_table: "",
        ref_columns: [],
        on_delete: "",
        on_update: "",
      },
    ]);
  };
  const _handleDeleteForeignKeyCostraint = (index) => {
    const _d = structuredClone(tableForm.values["constraints"]["foreign_keys"]);
    _d.splice(index, 1);
    tableForm.setFieldValue("constraints.foreign_keys", [..._d]);
  };

  return (
    <Grid container className="!p-3">
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Primary keys`}</span>
          <Select
            multiple
            value={tableForm.values["constraints"]["primary_key"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            name={`constraints.primary_key`}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            error={tableForm.errors?.["constraints"]?.["primary_key"]}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    className="!rounded"
                    size="small"
                    key={value}
                    label={value}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {tableForm.values.columns?.map((column) => (
              <MenuItem
                key={column.column_name}
                value={column.column_name}
                // style={getStyles(name, personName, theme)}
              >
                {column.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Unique keys`}</span>
          <Select
            multiple
            value={tableForm.values["constraints"]["unique"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            name={`constraints.unique`}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            error={tableForm.errors?.["constraints"]?.["unique"]}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    className="!rounded"
                    size="small"
                    key={value}
                    label={value}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {tableForm.values.columns?.map((column) => (
              <MenuItem
                key={column.column_name}
                value={column.column_name}
                // style={getStyles(name, personName, theme)}
              >
                {column.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Check constraint`}</span>
          <TextField
            required={true}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Check constraint expression..."
            type="text"
            name={`constraints.check`}
            value={tableForm.values["constraints"]["check"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            error={tableForm.errors?.["constraints"]?.["check"]}
          />
          {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Exclude constraint`}</span>
          <TextField
            required={true}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Exclude constraint..."
            type="text"
            name={`constraints.exclude`}
            value={tableForm.values["constraints"]["exclude"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            error={tableForm.errors?.["constraints"]?.["exclude"]}
          />
          {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
        </FormControl>
      </Grid>
      <span className="text-xs font-light  !capitalize mt-3">{`Foreign keys`}</span>
      {tableForm.values["constraints"]["foreign_keys"].map((_, index) => {
        return (
          <ForeignKeyRenderer
            index={index}
            tables={tables}
            tableForm={tableForm}
            handleDeleteForeignKeyCostraint={_handleDeleteForeignKeyCostraint}
          />
        );
      })}
      <Button
        variant="outlined"
        className="!mt-3"
        onClick={_handleAddForeignKeyCostraint}
      >
        <FaPlus className="!mr-1" />
        {LOCAL_CONSTANTS.STRINGS.TABLE_FOREIGN_KEY_ADDITION_PAGE_TITLE}
      </Button>
    </Grid>
  );
};
export const TableAdditionForm = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const {
    isLoading: isLoadingTables,
    data: tables,
    error: loadTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLES],
    queryFn: () => getAllTables(),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });

  const tableAdditionForm = useFormik({
    initialValues: {
      // Basic table properties
      table_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
      if_not_exists: false,
      temporary: false,
      unlogged: false,
      global: false,
      local: false,
      of_type: "", // For "OF type_name" syntax

      // Columns
      columns: [
        {
          column_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
          data_type: "",
          storage: "DEFAULT", // Can be 'PLAIN', 'EXTERNAL', 'EXTENDED', 'MAIN', or 'DEFAULT'
          collation: "", // Collation for the column
          default: "", // Default value
          not_null: true, // NOT NULL constraint
          unique: false, // UNIQUE constraint
          primary_key: false, // PRIMARY KEY constraint
          check: "", // Check expression
        },
      ],

      // Table Constraints
      constraints: {
        primary_key: [], // Array of column names for primary key
        unique: [], // Array of column names for unique constraint
        check: "", // Check constraint expression
        foreign_keys: [
          {
            columns: [], // Array of columns involved in foreign key
            ref_table: "", // Referenced table
            ref_columns: [], // Referenced columns
            on_delete: "", // ON DELETE action
            on_update: "", // ON UPDATE action
          },
        ],
        exclude: "", // Exclude constraint expression
      },

      // Partitioning
      partition_by: "", // 'RANGE', 'LIST', 'HASH'
      partitions: [
        {
          column: "", // Column for partitioning
          expression: "", // Expression for partitioning
          opclass: "", // Operator class for partitioning
          collation: "", // Collation for partitioning
        },
      ],

      // Inheritance
      inherits: [], // Array of parent tables

      // Storage Options
      storage_options: {
        tablespace: "", // Tablespace for the table
        storage_parameters: [], // Array of storage parameters
        without_oids: false, // Whether to use WITHOUT OIDS
      },

      // On Commit options for temporary tables
      on_commit: "", // 'PRESERVE ROWS', 'DELETE ROWS', 'DROP'
    },
  });

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };
  return (
    <div className="w-full h-full overflow-y-auto">
      <div
        className="flex flex-row items-center justify-between p-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.TABLE_ADDITION_PAGE_TITLE}
          </span>
          {/* {graphData && (
            <span
              className="text-xs font-thin text-start text-slate-300"
              style={{ color: theme.palette.text.secondary }}
            >{`${graphData.pm_graph_title} | Graph ID : ${graphData.pm_graph_id}`}</span>
          )} */}
        </div>
        <div>
          <Button
            variant="contained"
            // onClick={_handleSubmit}
            // disabled={isUpdatingGraph}
          >
            {LOCAL_CONSTANTS.STRINGS.SUBMIT_BUTTON_TEXT}
          </Button>
          {/* {(id != null || id != undefined) && <GraphDeletionForm id={id} />} */}
        </div>
      </div>
      <Grid container className="!mt-3">
        <Tabs
          value={tab}
          onChange={_handleTabChange}
          style={{
            background: theme.palette.background.default,
            marginTop: 20,
          }}
        >
          <Tab label="General" />
          <Tab label="Columns" />
          <Tab label="Constraints" />
        </Tabs>
        <Divider style={{ width: "100%" }} />
        {tab === 0 && (
          <TableGeneralDetailsBuilder tableForm={tableAdditionForm} />
        )}
        {tab === 1 && <TableColumnBuilder tableForm={tableAdditionForm} />}
        {tab === 2 && (
          <TableConstraintBuilder
            tables={tables}
            tableForm={tableAdditionForm}
          />
        )}
      </Grid>
    </div>
  );
};
