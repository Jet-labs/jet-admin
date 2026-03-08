import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { getDatabaseMetadataAPI } from "../../../data/apis/database";
import {
  getDatabaseTableByNameAPI,
  updateDatabaseTableByNameAPI,
} from "../../../data/apis/databaseTable";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseTableDeletionForm } from "./databaseTableDeletionForm";
import { DatabaseTableEditor } from "./databaseTableEditor";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Spinner } from "@jet-admin/ui";
export const DatabaseTableUpdationForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  DatabaseTableUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();

  const { isLoading: isLoadingDatabaseMetadata } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseTable,
    data: databaseTable,
    error: loadDatabaseTableError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_META(
        tenantID,
        databaseSchemaName,
        databaseTableName
      ),
    ],
    queryFn: () =>
      getDatabaseTableByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      }),
    refetchOnWindowFocus: false,
  });


  const { isPending: isUpdatingDatabaseTable, mutate: updateTable } = useMutation({
    mutationFn: (data) => {
      return updateDatabaseTableByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.UPDATE_TABLE_SUCCESS_TOAST);
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

  const tableUpdationForm = useFormik({
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
    validationSchema: formValidations.tableUpdationFormValidationSchema,
    onSubmit: (values) => {
      updateTable(values);
    },
  });

  // Use useEffect to update Formik values when databaseTable is fetched
  useEffect(() => {
    if (databaseTable) {
      // Update Formik form values with the fetched databaseTable data

      tableUpdationForm.setFieldValue(
        "databaseTableName",
        databaseTable.databaseTableName || CONSTANTS.STRINGS.UNTITLED
      );

      // Update databaseTableColumns
      const updatedColumns =
        databaseTable.databaseTableColumns?.map((column) => ({
          databaseTableColumnName:
            column.databaseTableColumnName || CONSTANTS.STRINGS.UNTITLED,
          databaseTableColumnType:
            column.databaseTableColumnType ||
            CONSTANTS.POSTGRE_SQL_DATA_TYPES.serial.name,
          defaultValue: column.defaultValue || "",
          notNull: column.notNull !== undefined ? column.notNull : true,
          unique: column.unique !== undefined ? column.unique : false,
          primaryKey:
            column.primaryKey !== undefined ? column.primaryKey : false,
          check: column.check || "",
        })) || [];
      tableUpdationForm.setFieldValue("databaseTableColumns", updatedColumns);

      // Update foreign keys in databaseTableConstraints
      const updatedForeignKeys =
        databaseTable.databaseTableConstraints
          ?.filter((constraint) => constraint.constraintType === "FOREIGN KEY")
          .map((constraint) => ({
            constraintName: constraint.constraintName || "",
            constraintSchema: constraint.constraintSchema || "",
            databaseTableColumns: constraint.databaseTableColumns || [],
            referencedTable: constraint.referencedTable || "",
            referencedColumns: constraint.referencedColumns || [],
            onDelete: constraint.onDelete || "",
            onUpdate: constraint.onUpdate || "",
          })) || [];

      tableUpdationForm.setFieldValue(
        "databaseTableConstraints.foreignKeys",
        updatedForeignKeys
      );
      const updatedUniqueConstraints =
        databaseTable.databaseTableConstraints
          ?.filter((constraint) => constraint.constraintType === "UNIQUE")
          .map((constraint) => ({
            constraintName: constraint.constraintName || "",
            databaseTableColumns: constraint.databaseTableColumns || [],
          })) || [];

      tableUpdationForm.setFieldValue(
        "databaseTableConstraints.unique",
        updatedUniqueConstraints
      );
      tableUpdationForm.setFieldValue(
        "databaseTableConstraints.exclude",
        databaseTable.databaseTableConstraints?.exclude || ""
      );
      tableUpdationForm.setFieldValue(
        "databaseTableConstraints.check",
        databaseTable.databaseTableConstraints?.check || ""
      );
      const updatedPrimaryKey =
        databaseTable.databaseTableConstraints
          ?.filter((constraint) => constraint.constraintType === "PRIMARY KEY")
          .map((constraint) => constraint.databaseTableColumns)
          .flat() || [];
      tableUpdationForm.setFieldValue(
        "databaseTableConstraints.primaryKey",
        updatedPrimaryKey
      );
    }
  }, [databaseTable]);

  return (
    <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-8">
      <section className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          {CONSTANTS.STRINGS.UPDATE_TABLE_FORM_TITLE}
        </h1>
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingDatabaseTable || isLoadingDatabaseMetadata}
          error={loadDatabaseTableError}
        >
          <form
            className="space-y-3 md:space-y-4"
            onSubmit={tableUpdationForm.handleSubmit}
          >
            {tableUpdationForm && (
              <DatabaseTableEditor
                tenantID={tenantID}
                tableEditorForm={tableUpdationForm}
              />
            )}
            <div className="w-full flex flex-row items-center justify-end gap-3">
              <DatabaseTableDeletionForm
                tenantID={tenantID}
                databaseSchemaName={databaseSchemaName}
                databaseTableName={databaseTableName}
              />
              <Button
                type="submit"
                disabled={isUpdatingDatabaseTable}
              >
                {isUpdatingDatabaseTable ? (
                  <>
                    <Spinner className="mr-2" size={16} />
                    {CONSTANTS.STRINGS.UPDATING || "Updating..."}
                  </>
                ) : (
                  CONSTANTS.STRINGS.UPDATE_TABLE_FORM_SUBMIT_BUTTON
                )}
              </Button>
            </div>
          </form>
        </ReactQueryLoadingErrorWrapper>
      </section>
    </div>
  );
};
