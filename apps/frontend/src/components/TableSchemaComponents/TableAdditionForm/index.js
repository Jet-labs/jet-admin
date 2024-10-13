import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  useTheme,
} from "@mui/material";
import { useState } from "react";

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
  return (
    <Grid container className="!p-3">
      {tableForm.values["columns"].map((columns, index) => {
        return (
          <Grid
            key={`table_form_column_${index}`}
            container
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className="!items-center"
            spacing={1}
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
        );
      })}
    </Grid>
  );
};
export const TableAdditionForm = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const tableAdditionForm = useFormik({
    initialValues: {
      // Basic table properties
      table_name: "test table",
      if_not_exists: false,
      temporary: false,
      unlogged: false,
      global: false,
      local: false,
      of_type: "", // For "OF type_name" syntax

      // Columns
      columns: [
        {
          column_name: "test",
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
    <div className="w-full h-full overflow-y-scroll">
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
      </Grid>
    </div>
  );
};
