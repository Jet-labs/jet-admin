import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";

import { createDatabaseTableAPI } from "../../../data/apis/databaseTable";

import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseTableEditor } from "./databaseTableEditor";
import PropTypes from "prop-types";

export const DatabaseTableAdditionForm = ({ tenantID, databaseSchemaName }) => {
  DatabaseTableAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();

  const { isPending: isAddingDatabaseTable, mutate: addTable } = useMutation({
    mutationFn: (data) => {
      return createDatabaseTableAPI({
        tenantID,
        databaseSchemaName,
        databaseTableData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_TABLE_SUCCESS_TOAST);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES(
          tenantID,
          databaseSchemaName
        ),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const tableAdditionForm = useFormik({
    initialValues: {
      // Basic table properties
      databaseTableName: CONSTANTS.STRINGS.UNTITLED,
      ifNotExists: false,

      // Columns
      databaseTableColumns: [
        {
          databaseTableColumnName: CONSTANTS.STRINGS.UNTITLED,
          databaseTableColumnType: CONSTANTS.POSTGRE_SQL_DATA_TYPES.serial.name,
          storage: "DEFAULT", // Can be 'PLAIN', 'EXTERNAL', 'EXTENDED', 'MAIN', or 'DEFAULT'
          collation: "", // Collation for the column
          defaultValue: "", // Default value
          notNull: true, // NOT NULL constraint
          unique: false, // UNIQUE constraint
          primaryKey: false, // PRIMARY KEY constraint
          check: "", // Check expression
        },
      ],

      // Table Constraints
      databaseTableConstraints: {
        primaryKey: [], // Array of column names for primary key
        unique: [], // Array of column names for unique constraint
        check: "", // Check constraint expression
        foreignKeys: [
          // {
          //   constraintName: "",
          //   constraintSchema: "",
          //   databaseTableColumns: [], // Array of databaseTableColumns involved in foreign key
          //   referencedTable: "", // Referenced table
          //   referencedColumns: [], // Referenced databaseTableColumns
          //   onDelete: "", // ON DELETE action
          //   onUpdate: "", // ON UPDATE action
          // },
        ],
        exclude: "", // Exclude constraint expression
      },
    },
    validationSchema: formValidations.tableAdditionFormValidationSchema,
    onSubmit: (values) => {
      addTable(values);
    },
  });

  return (
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl border-b border-slate-200 p-3">
        {CONSTANTS.STRINGS.ADD_TABLE_FORM_TITLE}
      </h1>
      <form
        className="space-y-3 md:space-y-4 p-3"
        onSubmit={tableAdditionForm.handleSubmit}
      >
        {tableAdditionForm && (
          <DatabaseTableEditor
            tableEditorForm={tableAdditionForm}
            tenantID={tenantID}
          />
        )}
        <div className="w-full flex flex-row justify-end">
          <button
            type="submit"
            disabled={isAddingDatabaseTable}
            className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
          >
            {isAddingDatabaseTable && (
              <CircularProgress
                className="!text-xs !mr-3"
                size={20}
                color="white"
              />
            )}
            {CONSTANTS.STRINGS.ADD_TABLE_FORM_SUBMIT_BUTTON}
          </button>
        </div>
      </form>
      <div className="w-full h-full overflow-y-auto"></div>
    </section>
  );
};
