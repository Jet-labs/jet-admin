import { Button, Divider, Grid, Tab, Tabs, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { getAllTables } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { TableConstraintBuilder } from "../TableConstraintBuilder";
import { TableColumnBuilder } from "../TableColumnBuilder";
import { TableGeneralDetailsBuilder } from "../TableGeneralDetailsBuilder";
import { generatePostgresCreateTableSQL } from "../../../utils/postgresUtils/tables";
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
