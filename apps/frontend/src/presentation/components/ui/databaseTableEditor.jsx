import { Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import {
    getDatabaseMetadataAPI,
} from "../../../data/apis/database";

const MultipleColumnSelectDropdownForForeignKeyConstraint = ({
  tableEditorForm,
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
      ...tableEditorForm.values.databaseTableConstraints.foreignKeys,
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

    tableEditorForm.setFieldValue(
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
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_FOREIGN_KEY_COLUMN_LABEL}
        </button>

        {/* Display selected databaseTableColumns */}
        {tableEditorForm.values.databaseTableConstraints.foreignKeys[
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
        {tableEditorForm.values.databaseTableColumns.map((column, index) => (
          <MenuItem
            key={column.databaseTableColumnName}
            className="!flex !flex-row !justify-start !items-center !p-1.5 !w-full"
          >
            <input
              type="checkbox"
              id={`option-${index}`}
              value={column.databaseTableColumnName}
              checked={tableEditorForm.values.databaseTableConstraints.foreignKeys[
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
  tableEditorForm,
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
      ...tableEditorForm.values.databaseTableConstraints.foreignKeys,
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

    tableEditorForm.setFieldValue(
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
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_FOREIGN_KEY_REFERENCE_COLUMN_LABEL}
        </button>

        {/* Display selected databaseTableColumns */}
        {tableEditorForm.values.databaseTableConstraints.foreignKeys[
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
              checked={tableEditorForm.values.databaseTableConstraints.foreignKeys[
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

export const DatabaseTableEditor = ({ tenantID,tableEditorForm }) => {
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

  const _handleAddColumn = () => {
    tableEditorForm.setFieldValue("databaseTableColumns", [
      ...tableEditorForm.values.databaseTableColumns,
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
    const _d = structuredClone(tableEditorForm.values.databaseTableColumns);
    _d.splice(index, 1);
    tableEditorForm.setFieldValue("databaseTableColumns", [..._d]);
  };

  const _handleAddForeignKey = () => {
    tableEditorForm.setFieldValue("databaseTableConstraints.foreignKeys", [
      ...tableEditorForm.values.databaseTableConstraints.foreignKeys,
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
      tableEditorForm.values.databaseTableConstraints.foreignKeys
    );
    _d.splice(index, 1);
    tableEditorForm.setFieldValue("databaseTableConstraints.foreignKeys", [
      ..._d,
    ]);
  };

  return (
    <>
      <div>
        <label
          for="databaseTableName"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="databaseTableName"
          name="databaseTableName"
          id="databaseTableName"
          class=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
          placeholder={
            CONSTANTS.STRINGS.TABLE_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={tableEditorForm.handleChange}
          onBlur={tableEditorForm.handleBlur}
          value={tableEditorForm.values.databaseTableName}
        />
      </div>
      <div className="flex flex-row justify-start items-center">
        <input
          id="ifNotExists"
          type="checkbox"
          checked={tableEditorForm.values["ifNotExists"]}
          onChange={(e) => {
            tableEditorForm?.setFieldValue("ifNotExists", e.target.checked);
          }}
          className="mr-2 w-4 h-4 text-white bg-transparent border-white rounded focus:ring-white focus:ring-2 accent-[#646cff]"
        />
        <label
          htmlFor="ifNotExists"
          className="text-xs font-medium text-slate-500 "
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_IF_NOT_EXIST_FIELD_LABEL}
        </label>
      </div>
      <div>
        {tableEditorForm.values.databaseTableColumns?.length > 0 && (
          <span className="block mb-1 text-xs font-medium text-slate-500">
            {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_COLUMN_TITLE}
          </span>
        )}
        {tableEditorForm.values.databaseTableColumns.map((column, index) => {
          return (
            <div
              key={`table_form_column_${index}`}
              className={`border rounded w-full ml-0 ${
                index === 0 ? "mt-1" : "mt-3"
              }`}
            >
              <div className="grid grid-cols-5 gap-2 p-2">
                {/* Column Name */}
                <div className="col-span-1">
                  <input
                    required
                    type="text"
                    id={`databaseTableColumns[${index}].databaseTableColumnName`}
                    name={`databaseTableColumns[${index}].databaseTableColumnName`}
                    placeholder={
                      CONSTANTS.STRINGS.TABLE_EDITOR_FORM_COLUMN_NAME_LABEL
                    }
                    value={
                      tableEditorForm.values.databaseTableColumns[index]
                        .databaseTableColumnName
                    }
                    onChange={tableEditorForm.handleChange}
                    onBlur={tableEditorForm.handleBlur}
                    className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5  h-8"
                  />
                  {tableEditorForm.errors?.databaseTableColumns?.[index]
                    ?.databaseTableColumnName && (
                    <span className="text-red-500 text-xs">
                      {
                        tableEditorForm.errors.databaseTableColumns[index]
                          .databaseTableColumnName
                      }
                    </span>
                  )}
                </div>
                {/* Data Type */}
                <div className="col-span-1">
                  <select
                    required
                    id={`databaseTableColumns[${index}].databaseTableColumnType`}
                    name={`databaseTableColumns[${index}].databaseTableColumnType`}
                    value={
                      tableEditorForm.values.databaseTableColumns[index]
                        .databaseTableColumnType
                    }
                    onChange={tableEditorForm.handleChange}
                    onBlur={tableEditorForm.handleBlur}
                    className="bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                  >
                    {Object.keys(CONSTANTS.POSTGRE_SQL_DATA_TYPES).map(
                      (type) => (
                        <option
                          key={type}
                          value={CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                          className="text-xs"
                        >
                          {CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                        </option>
                      )
                    )}
                  </select>
                  {tableEditorForm.errors?.databaseTableColumns?.[index]
                    ?.databaseTableColumnType && (
                    <span className="text-red-500 text-xs">
                      {
                        tableEditorForm.errors.databaseTableColumns[index]
                          .databaseTableColumnType
                      }
                    </span>
                  )}
                </div>

                {/* Default Value */}
                <div className="col-span-1">
                  <input
                    type="text"
                    id={`databaseTableColumns[${index}].defaultValue`}
                    name={`databaseTableColumns[${index}].defaultValue`}
                    placeholder={
                      CONSTANTS.STRINGS
                        .TABLE_EDITOR_FORM_COLUMN_DEFAULT_PLACEHOLDER
                    }
                    value={
                      tableEditorForm.values.databaseTableColumns[index]
                        .defaultValue
                    }
                    onChange={tableEditorForm.handleChange}
                    onBlur={tableEditorForm.handleBlur}
                    className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                  />
                  {tableEditorForm.errors?.databaseTableColumns?.[index]
                    ?.defaultValue && (
                    <span className="text-red-500 text-xs">
                      {
                        tableEditorForm.errors.databaseTableColumns[index]
                          .defaultValue
                      }
                    </span>
                  )}
                </div>
                {/* Check Expression */}
                <div className="col-span-1">
                  <input
                    type="text"
                    id={`databaseTableColumns[${index}].check`}
                    name={`databaseTableColumns[${index}].check`}
                    placeholder={
                      CONSTANTS.STRINGS
                        .TABLE_EDITOR_FORM_COLUMN_CHECK_PLACEHOLDER
                    }
                    value={
                      tableEditorForm.values.databaseTableColumns[index].check
                    }
                    onChange={tableEditorForm.handleChange}
                    onBlur={tableEditorForm.handleBlur}
                    className="placeholder:text-slate-400 bg-slate-50 text-xs border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                  />
                  {tableEditorForm.errors?.databaseTableColumns?.[index]
                    ?.check && (
                    <span className="text-red-500 text-xs">
                      {tableEditorForm.errors.databaseTableColumns[index].check}
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex items-center flex-row justify-end">
                  <button
                    type="button"
                    onClick={() => _handleDeleteColumn(index)}
                    className="hover:text-red-400  bg-white p-1 text-slate-700 border-0 hover:border-0"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                {/* Unique Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    id={`databaseTableColumns[${index}].unique`}
                    name={`databaseTableColumns[${index}].unique`}
                    checked={
                      tableEditorForm.values.databaseTableColumns[index].unique
                    }
                    onChange={(e) =>
                      tableEditorForm.setFieldValue(
                        `databaseTableColumns[${index}].unique`,
                        e.target.checked
                      )
                    }
                    className="mr-2 accent-[#646cff]"
                  />
                  <label
                    htmlFor={`databaseTableColumns[${index}].unique`}
                    className="text-xs text-slate-500"
                  >
                    {
                      CONSTANTS.STRINGS
                        .TABLE_EDITOR_FORM_COLUMN_UNIQUE_CHECK_LABEL
                    }
                  </label>
                </div>
                {/* Primary Key Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    id={`databaseTableColumns[${index}].primaryKey`}
                    name={`databaseTableColumns[${index}].primaryKey`}
                    checked={
                      tableEditorForm.values.databaseTableColumns[index]
                        .primaryKey
                    }
                    onChange={(e) =>
                      tableEditorForm.setFieldValue(
                        `databaseTableColumns[${index}].primaryKey`,
                        e.target.checked
                      )
                    }
                    className="mr-2 accent-[#646cff]"
                  />
                  <label
                    htmlFor={`databaseTableColumns[${index}].primaryKey`}
                    className="text-xs text-slate-500"
                  >
                    {
                      CONSTANTS.STRINGS
                        .TABLE_EDITOR_FORM_COLUMN_PRIMARY_CHECK_LABEL
                    }
                  </label>
                </div>
                {/* Not NULL Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    id={`databaseTableColumns[${index}].notNull`}
                    name={`databaseTableColumns[${index}].notNull`}
                    checked={
                      tableEditorForm.values.databaseTableColumns[index].notNull
                    }
                    onChange={(e) =>
                      tableEditorForm.setFieldValue(
                        `databaseTableColumns[${index}].notNull`,
                        e.target.checked
                      )
                    }
                    className="mr-2  accent-[#646cff]"
                  />
                  <label
                    htmlFor={`databaseTableColumns[${index}].notNull`}
                    className="text-xs text-slate-500"
                  >
                    {
                      CONSTANTS.STRINGS
                        .TABLE_EDITOR_FORM_COLUMN_NOT_NULL_CHECK_LABEL
                    }
                  </label>
                </div>
              </div>
            </div>
          );
        })}
        <div className=" w-full flex flex-row justify-end items-center mt-2">
          <button
            onClick={_handleAddColumn}
            type="button"
            class="flex flex-row justify-center items-center px-0 py-1  text-xs font-medium text-center bg-white text-[#646cff]  rounded  focus:ring-4 focus:outline-none border-0  "
          >
            {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_COLUMN_BUTTON}
          </button>
        </div>
      </div>

      {databaseMetadata && databaseMetadata.schemas?.length > 0 && (
        <div className="mt-6">
          {tableEditorForm.values.databaseTableConstraints.foreignKeys?.length >
            0 && (
            <span className="block mb-1 text-xs font-medium text-slate-500">
              {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_FOREIGN_KEY_TITLE}
            </span>
          )}
          {tableEditorForm.values.databaseTableConstraints.foreignKeys.map(
            (foreignKey, index) => {
              const selectedSchema = databaseMetadata?.schemas?.find(
                (schema) => {
                  return (
                    schema.databaseSchemaName ==
                    tableEditorForm.values.databaseTableConstraints.foreignKeys[
                      index
                    ].constraintSchema
                  );
                }
              );
              const selectedRefTable = selectedSchema?.tables?.find((table) => {
                return (
                  table.databaseTableName ==
                  tableEditorForm.values.databaseTableConstraints.foreignKeys[
                    index
                  ].referencedTable
                );
              });
              return (
                <div
                  key={`table_form_foreignKey_${index}`}
                  className={`border rounded w-full ml-0 ${
                    index === 0 ? "mt-1" : "mt-3"
                  }`}
                >
                  <div className="grid grid-cols-5 gap-2 p-2">
                    {/* Column Name */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        id={`databaseTableConstraints.foreignKeys[${index}].constraintName`}
                        name={`databaseTableConstraints.foreignKeys[${index}].constraintName`}
                        placeholder={
                          CONSTANTS.STRINGS
                            .TABLE_EDITOR_FORM_FOREIGN_KEY_NAME_LABEL
                        }
                        value={
                          tableEditorForm.values.databaseTableConstraints
                            .foreignKeys[index].constraintName
                        }
                        onChange={tableEditorForm.handleChange}
                        onBlur={tableEditorForm.handleBlur}
                        className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5  h-8"
                      />
                      {tableEditorForm.errors?.databaseTableConstraints
                        ?.foreignKeys?.[index]?.constraintName && (
                        <span className="text-red-500 text-xs">
                          {
                            tableEditorForm.errors.databaseTableConstraints
                              .foreignKeys[index].constraintName
                          }
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center flex-row justify-end">
                      <button
                        type="button"
                        onClick={() => _handleDeleteForeignKey(index)}
                        className="hover:text-red-400  bg-white p-1 text-slate-700 border-0 hover:border-0"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>

                    <div className="col-span-5">
                      <MultipleColumnSelectDropdownForForeignKeyConstraint
                        tableEditorForm={tableEditorForm}
                        fkIndex={index}
                      />
                      {tableEditorForm.errors?.databaseTableConstraints
                        ?.foreignKeys?.[index]?.constraintSchema && (
                        <span className="text-red-500 text-xs">
                          {
                            tableEditorForm.errors?.databaseTableConstraints
                              ?.foreignKeys?.[index]?.constraintSchema
                          }
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <select
                        required
                        id={`databaseTableConstraints.foreignKeys[${index}].constraintSchema`}
                        name={`databaseTableConstraints.foreignKeys[${index}].constraintSchema`}
                        value={
                          tableEditorForm.values.databaseTableConstraints
                            .foreignKeys[index].constraintSchema
                        }
                        onChange={tableEditorForm.handleChange}
                        onBlur={tableEditorForm.handleBlur}
                        className="bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                      >
                        <option
                          key={
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_SCHEMA_LABEL
                          }
                          // value={schema.databaseSchemaName}
                          className="text-xs"
                        >
                          {
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_SCHEMA_LABEL
                          }
                        </option>
                        {databaseMetadata?.schemas?.map((schema) => (
                          <option
                            key={schema.databaseSchemaName}
                            value={schema.databaseSchemaName}
                            className="text-xs"
                          >
                            {schema.databaseSchemaName}
                          </option>
                        ))}
                      </select>
                      {tableEditorForm.errors?.databaseTableConstraints
                        ?.foreignKeys?.[index]?.constraintSchema && (
                        <span className="text-red-500 text-xs">
                          {
                            tableEditorForm.errors?.databaseTableConstraints
                              ?.foreignKeys?.[index]?.constraintSchema
                          }
                        </span>
                      )}
                    </div>
                    {
                      <div className="col-span-4">
                        <select
                          required
                          id={`databaseTableConstraints.foreignKeys[${index}].referencedTable`}
                          name={`databaseTableConstraints.foreignKeys[${index}].referencedTable`}
                          value={
                            tableEditorForm.values.databaseTableConstraints
                              .foreignKeys[index].referencedTable
                          }
                          onChange={tableEditorForm.handleChange}
                          onBlur={tableEditorForm.handleBlur}
                          className="bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                        >
                          <option
                            key={
                              CONSTANTS.STRINGS
                                .TABLE_EDITOR_FORM_FOREIGN_KEY_REFERENCE_TABLE_PLACEHOLDER
                            }
                            className="text-xs"
                          >
                            {
                              CONSTANTS.STRINGS
                                .TABLE_EDITOR_FORM_FOREIGN_KEY_REFERENCE_TABLE_PLACEHOLDER
                            }
                          </option>
                          {selectedSchema?.tables?.map((table) => (
                            <option
                              key={table.databaseTableName}
                              value={table.databaseTableName}
                              className="text-xs"
                            >
                              {table.databaseTableName}
                            </option>
                          ))}
                        </select>
                        {tableEditorForm.errors?.databaseTableConstraints
                          ?.foreignKeys?.[index]?.referencedTable && (
                          <span className="text-red-500 text-xs">
                            {
                              tableEditorForm.errors?.databaseTableConstraints
                                ?.foreignKeys?.[index]?.referencedTable
                            }
                          </span>
                        )}
                      </div>
                    }
                    {selectedRefTable && (
                      <div className="col-span-5">
                        <MultipleRefColumnSelectDropdownForForeignKeyConstraint
                          tableEditorForm={tableEditorForm}
                          fkIndex={index}
                          referencedTable={selectedRefTable}
                        />
                        {tableEditorForm.errors?.databaseTableConstraints
                          ?.foreignKeys?.[index]?.constraintSchema && (
                          <span className="text-red-500 text-xs">
                            {
                              tableEditorForm.errors?.databaseTableConstraints
                                ?.foreignKeys?.[index]?.constraintSchema
                            }
                          </span>
                        )}
                      </div>
                    )}
                    <div className="col-span-1">
                      <select
                        required
                        id={`databaseTableConstraints.foreignKeys[${index}].onDelete`}
                        name={`databaseTableConstraints.foreignKeys[${index}].onDelete`}
                        value={
                          tableEditorForm.values.databaseTableConstraints
                            .foreignKeys[index].onDelete
                        }
                        onChange={tableEditorForm.handleChange}
                        onBlur={tableEditorForm.handleBlur}
                        className="bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                      >
                        <option
                          key={
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_ON_DELETE_LABEL
                          }
                          className="text-xs"
                        >
                          {
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_ON_DELETE_LABEL
                          }
                        </option>
                        {CONSTANTS.TABLE_FOREIGN_KEY_ACTIONS.map((action) => (
                          <option
                            key={action}
                            value={action}
                            className="text-xs"
                          >
                            {action}
                          </option>
                        ))}
                      </select>
                      {tableEditorForm.errors?.databaseTableConstraints
                        ?.foreignKeys?.[index]?.onDelete && (
                        <span className="text-red-500 text-xs">
                          {
                            tableEditorForm.errors?.databaseTableConstraints
                              ?.foreignKeys?.[index]?.onDelete
                          }
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <select
                        required
                        id={`databaseTableConstraints.foreignKeys[${index}].onUpdate`}
                        name={`databaseTableConstraints.foreignKeys[${index}].onUpdate`}
                        value={
                          tableEditorForm.values.databaseTableConstraints
                            .foreignKeys[index].onUpdate
                        }
                        onChange={tableEditorForm.handleChange}
                        onBlur={tableEditorForm.handleBlur}
                        className="bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 block w-full px-2.5 h-8"
                      >
                        <option
                          key={
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_ON_UPDATE_LABEL
                          }
                          className="text-xs"
                        >
                          {
                            CONSTANTS.STRINGS
                              .TABLE_EDITOR_FORM_FOREIGN_KEY_ON_UPDATE_LABEL
                          }
                        </option>
                        {CONSTANTS.TABLE_FOREIGN_KEY_ACTIONS.map((action) => (
                          <option
                            key={action}
                            value={action}
                            className="text-xs"
                          >
                            {action}
                          </option>
                        ))}
                      </select>
                      {tableEditorForm.errors?.databaseTableConstraints
                        ?.foreignKeys?.[index]?.onUpdate && (
                        <span className="text-red-500 text-xs">
                          {
                            tableEditorForm.errors?.databaseTableConstraints
                              ?.foreignKeys?.[index]?.onUpdate
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
          <div className=" w-full flex flex-row justify-end items-center mt-2">
            <button
              type="button"
              onClick={_handleAddForeignKey}
              class="flex flex-row justify-center items-center px-0 py-1  text-xs font-medium text-center bg-white text-[#646cff]  rounded  focus:ring-4 focus:outline-none border-0  "
            >
              {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_FOREIGN_KEY_BUTTON}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
