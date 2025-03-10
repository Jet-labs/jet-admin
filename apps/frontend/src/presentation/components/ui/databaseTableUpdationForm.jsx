import { CircularProgress, Menu, MenuItem } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseMetadataAPI,
} from "../../../data/apis/database";
import {
  getDatabaseTableByNameAPI,
  updateDatabaseTableByNameAPI,
} from "../../../data/apis/databaseTable";
import { displayError, displaySuccess } from "../../../utils/notification";
import * as Yup from "yup";
import { DatabaseTableDeletionForm } from "./databaseTableDeletionForm";
import { DatabaseTableEditor } from "./databaseTableEditor";

const tableUpdationFormValidationSchema = Yup.object().shape({
  databaseTableName: Yup.string().required("Table name is required"),
  databaseTableColumns: Yup.array().of(
    Yup.object().shape({
      databaseTableColumnName: Yup.string().required("Column name is required"),
      databaseTableColumnType: Yup.string().required("Data type is required"),
    })
  ),
  databaseTableConstraints: Yup.object().shape({
    foreignKeys: Yup.array().of(
      Yup.object().shape({
        referencedTable: Yup.string().required("Reference table is required"),
        referencedColumns: Yup.array().min(
          1,
          "At least one reference column required"
        ),
      })
    ),
  }),
});

const MultipleColumnSelectDropdownForForeignKeyConstraint = ({
  tableUpdationForm,
  fkIndex,
}) => {
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Toggle dropdown visibility
  const _handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsDropdownOpen(true);
  };

  const _handleDropdownClose = () => {
    setAnchorEl(null);
    setIsDropdownOpen(false);
  };

  // Handle toggling column selection in foreign key constraint
  const toggleColumnInForeignKey = (fkIndex, databaseTableColumnName) => {
    const foreignKeys = [
      ...tableUpdationForm.values.databaseTableConstraints.foreignKeys,
    ];
    const columnIndex = foreignKeys[fkIndex].databaseTableColumns.indexOf(
      databaseTableColumnName
    );

    if (columnIndex === -1) {
      // Add the column if it's not already present
      foreignKeys[fkIndex].databaseTableColumns = [
        ...foreignKeys[fkIndex].databaseTableColumns,
        databaseTableColumnName,
      ];
    } else {
      // Remove the column if it's already present
      foreignKeys[fkIndex].databaseTableColumns = foreignKeys[
        fkIndex
      ].databaseTableColumns.filter((col) => col !== databaseTableColumnName);
    }

    tableUpdationForm.setFieldValue(
      "databaseTableConstraints.foreignKeys",
      foreignKeys
    );
  };

  return (
    <div className="relative w-full flex flex-col justify-start items-stretch">
      {/* Dropdown Trigger */}
      <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-[#9a9fff] border-dashed bg-[#f5f5ff]">
        <button
          type="button"
          onClick={_handleDropdownOpen}
          className="inline-flex outline-none hover:outline-none flex-row justify-center items-center bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 px-2.5 py-1"
        >
          <FaPlus className="h-3 w-3 mr-1" />
          {CONSTANTS.STRINGS.UPDATE_TABLE_FORM_FOREIGN_KEY_COLUMN_LABEL}
        </button>

        {/* Display selected databaseTableColumns */}
        {tableUpdationForm.values.databaseTableConstraints.foreignKeys[
          fkIndex
        ].databaseTableColumns?.map((column, index) => (
          <span
            key={index}
            className="text-xs text-slate-700 border bg-white px-2 py-1 border-slate-300 rounded"
          >
            {column}
          </span>
        ))}
      </div>

      {/* Dropdown Menu */}
      <Menu
        id="foreign-key-column-menu"
        anchorEl={anchorEl}
        open={isDropdownOpen}
        onClose={_handleDropdownClose}
        MenuListProps={{
          "aria-labelledby": "foreign-key-column-button",
        }}
        sx={{
          padding: "0px",
          "& .MuiMenu-list": {
            padding: "0px !important",
          },
        }}
      >
        {tableUpdationForm.values.databaseTableColumns.map((column, index) => (
          <MenuItem
            key={column.databaseTableColumnName}
            className="!flex !flex-row !justify-start !items-center !p-1.5 !w-full"
          >
            <input
              type="checkbox"
              id={`option-${index}`}
              value={column.databaseTableColumnName}
              checked={tableUpdationForm.values.databaseTableConstraints.foreignKeys[
                fkIndex
              ].databaseTableColumns.includes(column.databaseTableColumnName)}
              onChange={() =>
                toggleColumnInForeignKey(
                  fkIndex,
                  column.databaseTableColumnName
                )
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`option-${index}`}
              className="ml-3 block text-sm text-gray-900"
            >
              {column.databaseTableColumnName}
            </label>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

const MultipleRefColumnSelectDropdownForForeignKeyConstraint = ({
  tableUpdationForm,
  fkIndex,
  referencedTable,
}) => {
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Toggle dropdown visibility
  const _handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsDropdownOpen(true);
  };

  const _handleDropdownClose = () => {
    setAnchorEl(null);
    setIsDropdownOpen(false);
  };

  // Handle toggling column selection in foreign key constraint
  const toggleRefColumnInForeignKey = (fkIndex, databaseTableColumnName) => {
    const foreignKeys = [
      ...tableUpdationForm.values.databaseTableConstraints.foreignKeys,
    ];
    const columnIndex = foreignKeys[fkIndex].referencedColumns.indexOf(
      databaseTableColumnName
    );

    if (columnIndex === -1) {
      // Add the column if it's not already present
      foreignKeys[fkIndex].referencedColumns = [
        ...foreignKeys[fkIndex].referencedColumns,
        databaseTableColumnName,
      ];
    } else {
      // Remove the column if it's already present
      foreignKeys[fkIndex].referencedColumns = foreignKeys[
        fkIndex
      ].referencedColumns.filter((col) => col !== databaseTableColumnName);
    }

    tableUpdationForm.setFieldValue(
      "databaseTableConstraints.foreignKeys",
      foreignKeys
    );
  };

  return (
    <div className="relative w-full flex flex-col justify-start items-stretch">
      {/* Dropdown Trigger */}
      <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-[#9a9fff] border-dashed bg-[#f5f5ff]">
        <button
          type="button"
          onClick={_handleDropdownOpen}
          className="inline-flex outline-none hover:outline-none flex-row justify-center items-center bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 px-2.5 py-1"
        >
          <FaPlus className="h-3 w-3 mr-1" />
          {
            CONSTANTS.STRINGS
              .UPDATE_TABLE_FORM_FOREIGN_KEY_REFERENCE_COLUMN_LABEL
          }
        </button>

        {/* Display selected databaseTableColumns */}
        {tableUpdationForm.values.databaseTableConstraints.foreignKeys[
          fkIndex
        ].referencedColumns?.map((column, index) => (
          <span
            key={index}
            className="text-xs text-slate-700 border bg-white px-2 py-1 border-slate-300 rounded"
          >
            {column}
          </span>
        ))}
      </div>

      {/* Dropdown Menu */}
      <Menu
        id="foreign-key-column-menu"
        anchorEl={anchorEl}
        open={isDropdownOpen}
        onClose={_handleDropdownClose}
        MenuListProps={{
          "aria-labelledby": "foreign-key-column-button",
        }}
        sx={{
          padding: "0px",
          "& .MuiMenu-list": {
            padding: "0px !important",
          },
        }}
      >
        {referencedTable.databaseTableColumns.map((column, index) => (
          <MenuItem
            key={column.databaseTableColumnName}
            className="!flex !flex-row !justify-start !items-center !p-1.5 !w-full"
          >
            <input
              type="checkbox"
              id={`option-${index}`}
              value={column.databaseTableColumnName}
              checked={tableUpdationForm.values.databaseTableConstraints.foreignKeys[
                fkIndex
              ].referencedColumns.includes(column.databaseTableColumnName)}
              onChange={() =>
                toggleRefColumnInForeignKey(
                  fkIndex,
                  column.databaseTableColumnName
                )
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`option-${index}`}
              className="ml-3 block text-sm text-gray-900"
            >
              {column.databaseTableColumnName}
            </label>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export const DatabaseTableUpdationForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingDatabaseMetadata,
    isFetching: isFetchingDatabaseMetadata,
    isRefetching: isRefetchingDatabaseMetadata,
    data: databaseMetadata,
    error: databaseMetadataError,
    refetch: refetchDatabaseMetadata,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: parseInt(tenantID) }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseTable,
    data: databaseTable,
    error: loadDatabaseTableError,
    isFetching: isFetchingDatabaseTable,
    isRefetching: isRefetechingDatabaseTable,
    refetch: refetchDatabaseTable,
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

  console.log({ databaseTable });

  const {
    isPending: isAddingDatabaseTable,
    isSuccess: isAddingDatabaseTableSuccess,
    isError: isAddingDatabaseTableError,
    error: addTableError,
    mutate: addTable,
  } = useMutation({
    mutationFn: (data) => {
      return updateDatabaseTableByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
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
    validationSchema: tableUpdationFormValidationSchema,
    onSubmit: (values) => {
      addTable(values);
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
    }
  }, [databaseTable]);

  const _handleAddColumn = () => {
    tableUpdationForm.setFieldValue("databaseTableColumns", [
      ...tableUpdationForm.values.databaseTableColumns,
      {
        databaseTableColumnName: CONSTANTS.STRINGS.UNTITLED,
        databaseTableColumnType: CONSTANTS.POSTGRE_SQL_DATA_TYPES.serial.name,
        storage: "DEFAULT",
        collation: "",
        defaultValue: "",
        notNull: true,
        unique: false,
        primaryKey: false,
        check: "",
      },
    ]);
  };

  const _handleDeleteColumn = (index) => {
    const _d = structuredClone(tableUpdationForm.values.databaseTableColumns);
    _d.splice(index, 1);
    tableUpdationForm.setFieldValue("databaseTableColumns", [..._d]);
  };

  const _handleAddForeignKey = () => {
    tableUpdationForm.setFieldValue("databaseTableConstraints.foreignKeys", [
      ...tableUpdationForm.values.databaseTableConstraints.foreignKeys,
      {
        constraintName: "",
        constraintSchema: "",
        databaseTableColumns: [], // Array of databaseTableColumns involved in foreign key
        referencedTable: "", // Referenced table
        referencedColumns: [], // Referenced databaseTableColumns
        onDelete: "", // ON DELETE action
        onUpdate: "", // ON UPDATE action
      },
    ]);
  };

  const _handleDeleteForeignKey = (index) => {
    const _d = structuredClone(
      tableUpdationForm.values.databaseTableConstraints.foreignKeys
    );
    _d.splice(index, 1);
    tableUpdationForm.setFieldValue("databaseTableConstraints.foreignKeys", [
      ..._d,
    ]);
  };

  return (
    <section class="max-w-3xl w-full ">
      <h1 class="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl border-b border-slate-200 p-3">
        {CONSTANTS.STRINGS.UPDATE_TABLE_FORM_TITLE}
      </h1>
      <form
        class="space-y-3 md:space-y-4 p-3 "
        onSubmit={tableUpdationForm.handleSubmit}
      >
        {tableUpdationForm && (
          <DatabaseTableEditor
            tenantID={tenantID}
            tableEditorForm={tableUpdationForm}
          />
        )}
        <div className="w-full flex flex-row justify-end">
          <DatabaseTableDeletionForm
            tenantID={tenantID}
            databaseSchemaName={databaseSchemaName}
            databaseTableName={databaseTableName}
          />
          <button
            type="submit"
            disabled={isAddingDatabaseTable}
            class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
          >
            {isAddingDatabaseTable && (
              <CircularProgress
                className="!text-xs !mr-3"
                size={20}
                color="white"
              />
            )}
            {CONSTANTS.STRINGS.UPDATE_TABLE_FORM_SUBMIT_BUTTON}
          </button>
        </div>
      </form>
    </section>
  );
};
