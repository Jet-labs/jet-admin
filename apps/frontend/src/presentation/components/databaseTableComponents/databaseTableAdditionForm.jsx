import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";

import { createDatabaseTableAPI } from "../../../data/apis/databaseTable";

import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseTableEditor } from "./databaseTableEditor";
import PropTypes from "prop-types";

import { Button, Spinner } from "@jet-admin/ui";
export const DatabaseTableAdditionForm = ({ tenantID, databaseSchemaName }) => {
  DatabaseTableAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_TABLE_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Create a new database table and define its schema columns.
          </p>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col items-center overflow-y-auto p-4 md:p-6">
        <section className="w-full max-w-2xl">
          <form
            noValidate
            className="space-y-6"
            onSubmit={tableAdditionForm.handleSubmit}
          >
            {tableAdditionForm && (
              <DatabaseTableEditor
                tableEditorForm={tableAdditionForm}
                tenantID={tenantID}
              />
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isAddingDatabaseTable}>
                {isAddingDatabaseTable && <Spinner size={14} />}
                {CONSTANTS.STRINGS.ADD_TABLE_FORM_SUBMIT_BUTTON}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
