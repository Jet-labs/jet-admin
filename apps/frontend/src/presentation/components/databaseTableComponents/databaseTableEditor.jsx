import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { getDatabaseMetadataAPI } from "../../../data/apis/database";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
const MultipleColumnSelectDropdownForForeignKeyConstraint = ({
  tableEditorForm,
  fkIndex,
}) => {
  MultipleColumnSelectDropdownForForeignKeyConstraint.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
    fkIndex: PropTypes.number.isRequired,
  };
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const _handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
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
    <div ref={dropdownRef} className="relative w-full flex flex-col justify-start items-stretch">
      {/* Dropdown Trigger */}
      <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-primary/20 border-dashed bg-primary/5">
        <Button
          type="button"
          variant="outline" size="sm"
          onClick={_handleDropdownToggle}
          className="inline-flex items-center"
        >
          <FaPlus className="h-3 w-3 mr-1" />
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_FOREIGN_KEY_COLUMN_LABEL}
        </Button>

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
      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {tableEditorForm.values.databaseTableColumns.map((column, index) => (
            <div
              key={column.databaseTableColumnName}
              className="flex flex-row justify-start items-center p-1.5 w-full hover:bg-gray-50"
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
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor={`option-${index}`}
                className="ml-3 block text-sm text-gray-900"
              >
                {column.databaseTableColumnName}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MultipleRefColumnSelectDropdownForForeignKeyConstraint = ({
  tableEditorForm,
  fkIndex,
  referencedTable,
}) => {
  MultipleRefColumnSelectDropdownForForeignKeyConstraint.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
    fkIndex: PropTypes.number.isRequired,
    referencedTable: PropTypes.object.isRequired,
  };
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const _handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
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
    <div ref={dropdownRef} className="relative w-full flex flex-col justify-start items-stretch">
      {/* Dropdown Trigger */}
      <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-primary/20 border-dashed bg-primary/5">
        <Button
          type="button"
          variant="outline" size="sm"
          onClick={_handleDropdownToggle}
          className="inline-flex items-center"
        >
          <FaPlus className="h-3 w-3 mr-1" />
          {
            CONSTANTS.STRINGS
              .TABLE_EDITOR_FORM_FOREIGN_KEY_REFERENCE_COLUMN_LABEL
          }
        </Button>

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
      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {referencedTable.databaseTableColumns.map((column, index) => (
            <div
              key={column.databaseTableColumnName}
              className="flex flex-row justify-start items-center p-1.5 w-full hover:bg-gray-50"
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
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor={`option-${index}`}
                className="ml-3 block text-sm text-gray-900"
              >
                {column.databaseTableColumnName}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PrimaryKeyConstraintSelector = ({ tableEditorForm }) => {
  PrimaryKeyConstraintSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const _handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };



  const toggleColumnInPrimaryKey = (columnName) => {
    const primaryKey = [
      ...tableEditorForm.values.databaseTableConstraints.primaryKey,
    ];
    const columnIndex = primaryKey.indexOf(columnName);

    if (columnIndex === -1) {
      primaryKey.push(columnName);
    } else {
      primaryKey.splice(columnIndex, 1);
    }

    tableEditorForm.setFieldValue(
      "databaseTableConstraints.primaryKey",
      primaryKey
    );
  };

  return (
    <div className="mb-4">
      <span className="block mb-1 text-xs font-medium text-slate-500">
        {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_PRIMARY_KEY_TITLE}
      </span>
      <div ref={dropdownRef} className="relative w-full flex flex-col justify-start items-stretch">
        <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-primary/20 border-dashed bg-primary/5">
          <Button
            type="button"
            variant="outline" size="sm"
            onClick={_handleDropdownToggle}
            className="inline-flex items-center"
          >
            <FaPlus className="h-3 w-3 mr-1" />
            {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_PRIMARY_KEY_COLUMN_LABEL}
          </Button>

          {tableEditorForm.values.databaseTableConstraints.primaryKey?.map(
            (column, index) => (
              <span
                key={index}
                className="text-xs text-slate-700 border bg-white px-2 py-1 border-slate-300 rounded"
              >
                {column}
              </span>
            )
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
            {tableEditorForm.values.databaseTableColumns.map((column, index) => (
              <div
                key={column.databaseTableColumnName}
                className="flex flex-row justify-start items-center p-1.5 w-full hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`pk-option-${index}`}
                  value={column.databaseTableColumnName}
                  checked={tableEditorForm.values.databaseTableConstraints.primaryKey.includes(
                    column.databaseTableColumnName
                  )}
                  onChange={() =>
                    toggleColumnInPrimaryKey(column.databaseTableColumnName)
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`pk-option-${index}`}
                  className="ml-3 block text-sm text-gray-900"
                >
                  {column.databaseTableColumnName}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UniqueConstraintSelector = ({ tableEditorForm }) => {
  UniqueConstraintSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeConstraintIndex, setActiveConstraintIndex] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setActiveConstraintIndex(null);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const _handleDropdownToggle = (index) => {
    if (isDropdownOpen && activeConstraintIndex === index) {
      setIsDropdownOpen(false);
      setActiveConstraintIndex(null);
    } else {
      setIsDropdownOpen(true);
      setActiveConstraintIndex(index);
    }
  };



  const _handleAddConstraint = () => {
    const newConstraints = [
      ...tableEditorForm.values.databaseTableConstraints.unique,
      { constraintName: `unique_${Date.now()}`, databaseTableColumns: [] },
    ];
    tableEditorForm.setFieldValue(
      "databaseTableConstraints.unique",
      newConstraints
    );
  };

  const _handleDeleteConstraint = (index) => {
    const newConstraints =
      tableEditorForm.values.databaseTableConstraints.unique.filter(
        (_, i) => i !== index
      );
    tableEditorForm.setFieldValue(
      "databaseTableConstraints.unique",
      newConstraints
    );
  };

  const toggleColumnInUniqueConstraint = (constraintIndex, columnName) => {
    const constraints = [
      ...tableEditorForm.values.databaseTableConstraints.unique,
    ];
    const constraint = constraints[constraintIndex];
    const columnIndex = constraint.databaseTableColumns.indexOf(columnName);

    if (columnIndex === -1) {
      constraint.databaseTableColumns.push(columnName);
    } else {
      constraint.databaseTableColumns.splice(columnIndex, 1);
    }

    tableEditorForm.setFieldValue(
      "databaseTableConstraints.unique",
      constraints
    );
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="block mb-1 text-xs font-medium text-slate-500">
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_UNIQUE_TITLE}
        </span>
      </div>

      {tableEditorForm.values.databaseTableConstraints.unique.map(
        (constraint, index) => (
          <div
            key={index}
            className={`rounded w-full ml-0 flex flex-row justify-start items-start ${
              index === 0 ? "mt-1" : "mt-3"
            }`}
          >
            <div className="flex w-full flex-wrap gap-2 p-2 rounded border border-primary/20 border-dashed bg-primary/5 mr-2">
              <Button
                type="button"
                variant="outline" size="sm"
                onClick={() => _handleDropdownToggle(index)}
                className="inline-flex items-center"
              >
                <FaPlus className="h-3 w-3 mr-1" />
                {
                  CONSTANTS.STRINGS
                    .TABLE_EDITOR_FORM_ADD_UNIQUE_CONSTRAINT_COLUMN_LABEL
                }
              </Button>

              {constraint?.databaseTableColumns?.map((column, colIndex) => (
                <span
                  key={colIndex}
                  className="text-xs text-slate-700 border bg-white px-2 py-1 border-slate-300 rounded"
                >
                  {column}
                </span>
              ))}
            </div>
            <div className="col-span-1 flex items-center flex-row justify-end">
              <Button
                type="button"
                variant="destructive-ghost" size="icon"
                onClick={() => _handleDeleteConstraint(index)}
              >
                <FaTimes className="text-sm" />
              </Button>
            </div>

            {isDropdownOpen && activeConstraintIndex === index && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                {tableEditorForm.values.databaseTableColumns.map((column) => (
                  <div
                    key={column.databaseTableColumnName}
                    className="flex flex-row justify-start items-center p-1.5 w-full hover:bg-gray-50"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={constraint.databaseTableColumns.includes(
                          column.databaseTableColumnName
                        )}
                        onChange={() =>
                          toggleColumnInUniqueConstraint(
                            index,
                            column.databaseTableColumnName
                          )
                        }
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {column.databaseTableColumnName}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
      <div className=" w-full flex flex-row justify-end items-center mt-2">
        <Button
          type="button"
          variant="ghost" size="sm"
          onClick={_handleAddConstraint}
          className="text-primary"
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_UNIQUE_CONSTRAINT_BUTTON}
        </Button>
      </div>
    </div>
  );
};

const ForeignKeyConstraintSelector = ({
  tableEditorForm,
  databaseMetadata,
}) => {
  ForeignKeyConstraintSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
    databaseMetadata: PropTypes.object.isRequired,
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
    <div className="mt-6">
      {tableEditorForm.values.databaseTableConstraints.foreignKeys?.length >
        0 && (
        <span className="block mb-1 text-xs font-medium text-slate-500">
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_FOREIGN_KEY_TITLE}
        </span>
      )}
      {tableEditorForm.values.databaseTableConstraints.foreignKeys.map(
        (foreignKey, index) => {
          const selectedSchema = databaseMetadata?.schemas?.find((schema) => {
            return (
              schema.databaseSchemaName ==
              tableEditorForm.values.databaseTableConstraints.foreignKeys[index]
                .constraintSchema
            );
          });
          const selectedRefTable = selectedSchema?.tables?.find((table) => {
            return (
              table.databaseTableName ==
              tableEditorForm.values.databaseTableConstraints.foreignKeys[index]
                .referencedTable
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
                  <Input
                    type="text"
                    id={`databaseTableConstraints.foreignKeys[${index}].constraintName`}
                    name={`databaseTableConstraints.foreignKeys[${index}].constraintName`}
                    placeholder={
                      CONSTANTS.STRINGS.TABLE_EDITOR_FORM_FOREIGN_KEY_NAME_LABEL
                    }
                    value={
                      tableEditorForm.values.databaseTableConstraints
                        .foreignKeys[index].constraintName
                    }
                    onChange={tableEditorForm.handleChange}
                    onBlur={tableEditorForm.handleBlur}
                    className="h-8 text-xs"
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
                  <Button
                    type="button"
                    variant="destructive-ghost" size="icon"
                    onClick={() => _handleDeleteForeignKey(index)}
                  >
                    <FaTimes className="text-sm" />
                  </Button>
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
                  <Select value={
                      tableEditorForm.values.databaseTableConstraints
                        .foreignKeys[index].constraintSchema
                    } onValueChange={(val) => tableEditorForm.setFieldValue(`databaseTableConstraints.foreignKeys[${index}].constraintSchema`, val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
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
                      </SelectItem>
                    {databaseMetadata?.schemas?.map((schema) => (
                      <SelectItem
                        key={schema.databaseSchemaName}
                        value={schema.databaseSchemaName}
                        className="text-xs"
                      >
                        {schema.databaseSchemaName}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
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
                    <Select value={
                        tableEditorForm.values.databaseTableConstraints
                          .foreignKeys[index].referencedTable
                      } onValueChange={(val) => tableEditorForm.setFieldValue(`databaseTableConstraints.foreignKeys[${index}].referencedTable`, val)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
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
                        </SelectItem>
                      {selectedSchema?.tables?.map((table) => (
                        <SelectItem
                          key={table.databaseTableName}
                          value={table.databaseTableName}
                          className="text-xs"
                        >
                          {table.databaseTableName}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
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
                  <Select value={
                      tableEditorForm.values.databaseTableConstraints
                        .foreignKeys[index].onDelete
                    } onValueChange={(val) => tableEditorForm.setFieldValue(`databaseTableConstraints.foreignKeys[${index}].onDelete`, val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
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
                      </SelectItem>
                    {CONSTANTS.TABLE_FOREIGN_KEY_ACTIONS.map((action) => (
                      <SelectItem key={action} value={action} className="text-xs">
                        {action}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
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
                  <Select value={
                      tableEditorForm.values.databaseTableConstraints
                        .foreignKeys[index].onUpdate
                    } onValueChange={(val) => tableEditorForm.setFieldValue(`databaseTableConstraints.foreignKeys[${index}].onUpdate`, val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
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
                      </SelectItem>
                    {CONSTANTS.TABLE_FOREIGN_KEY_ACTIONS.map((action) => (
                      <SelectItem key={action} value={action} className="text-xs">
                        {action}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
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
        <Button
          type="button"
          variant="ghost" size="sm"
          onClick={_handleAddForeignKey}
          className="text-primary"
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_FOREIGN_KEY_BUTTON}
        </Button>
      </div>
    </div>
  );
};

const ExcludeConstraintSelector = ({ tableEditorForm }) => {
  ExcludeConstraintSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
  };
  return (
    <div className="mb-4">
      <span className="block mb-1 text-xs font-medium text-slate-500">
        {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_EXCLUDE_TITLE}
      </span>
      <div className="w-full">
        <Input
          type="text"
          id="databaseTableConstraints.exclude"
          name="databaseTableConstraints.exclude"
          placeholder={CONSTANTS.STRINGS.TABLE_EDITOR_FORM_EXCLUDE_PLACEHOLDER}
          value={tableEditorForm.values.databaseTableConstraints.exclude}
          onChange={tableEditorForm.handleChange}
          onBlur={tableEditorForm.handleBlur}
          className="h-8 text-xs"
        />
        {tableEditorForm.errors?.databaseTableConstraints?.exclude && (
          <span className="text-red-500 text-xs">
            {tableEditorForm.errors.databaseTableConstraints.exclude}
          </span>
        )}
      </div>
    </div>
  );
};

const ColumnSelector = ({ tableEditorForm }) => {
  ColumnSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
  };

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
  return (
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
                <Input
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
                <Select value={
                    tableEditorForm.values.databaseTableColumns[index]
                      .databaseTableColumnType
                  } onValueChange={(val) => tableEditorForm.setFieldValue(`databaseTableColumns[${index}].databaseTableColumnType`, val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CONSTANTS.POSTGRE_SQL_DATA_TYPES).map((type) => (
                      <SelectItem
                      key={type}
                      value={CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                      className="text-xs"
                    >
                      {CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                      </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
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
                <Input
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
                  className="h-8 text-xs"
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
                <Input
                  type="text"
                  id={`databaseTableColumns[${index}].check`}
                  name={`databaseTableColumns[${index}].check`}
                  placeholder={
                    CONSTANTS.STRINGS.TABLE_EDITOR_FORM_COLUMN_CHECK_PLACEHOLDER
                  }
                  value={
                    tableEditorForm.values.databaseTableColumns[index].check
                  }
                  onChange={tableEditorForm.handleChange}
                  onBlur={tableEditorForm.handleBlur}
                  className="h-8 text-xs"
                />
                {tableEditorForm.errors?.databaseTableColumns?.[index]
                  ?.check && (
                  <span className="text-red-500 text-xs">
                    {tableEditorForm.errors.databaseTableColumns[index].check}
                  </span>
                )}
              </div>
              <div className="col-span-1 flex items-center flex-row justify-end">
                <Button
                  type="button"
                  variant="destructive-ghost" size="icon"
                  onClick={() => _handleDeleteColumn(index)}
                >
                  <FaTimes className="text-sm" />
                </Button>
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
                  className="mr-2 accent-primary"
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
                  className="mr-2 accent-primary"
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
                  className="mr-2  accent-primary"
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
        <Button
          type="button"
          variant="ghost" size="sm"
          onClick={_handleAddColumn}
          className="text-primary"
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_ADD_COLUMN_BUTTON}
        </Button>
      </div>
    </div>
  );
};

const CheckConstraintSelector = ({ tableEditorForm }) => {
  CheckConstraintSelector.propTypes = {
    tableEditorForm: PropTypes.object.isRequired,
  };
  return (
    <div className="mb-4">
      <span className="block mb-1 text-xs font-medium text-slate-500">
        {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_CHECK_TITLE || "Check Constraint"}
      </span>
      <div className="w-full">
        <Input
          type="text"
          id="databaseTableConstraints.check"
          name="databaseTableConstraints.check"
          placeholder={CONSTANTS.STRINGS.TABLE_EDITOR_FORM_CHECK_PLACEHOLDER}
          value={tableEditorForm.values.databaseTableConstraints.check}
          onChange={tableEditorForm.handleChange}
          onBlur={tableEditorForm.handleBlur}
          className="h-8 text-xs"
        />
        {tableEditorForm.errors?.databaseTableConstraints?.check && (
          <span className="text-red-500 text-xs">
            {tableEditorForm.errors.databaseTableConstraints.check}
          </span>
        )}
      </div>
    </div>
  );
};

export const DatabaseTableEditor = ({ tenantID, tableEditorForm }) => {
  DatabaseTableEditor.propTypes = {
    tenantID: PropTypes.number.isRequired,
    tableEditorForm: PropTypes.object.isRequired,
  };
  const {
    isLoading: isLoadingDatabaseMetadata,
    isFetching: isFetchingDatabaseMetadata,
    isRefetching: isRefetchingDatabaseMetadata,
    data: databaseMetadata,
    error: databaseMetadataError,
    refetch: refetchDatabaseMetadata,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="h-full">
        <label
          htmlFor="databaseTableName"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <Input
          type="databaseTableName"
          name="databaseTableName"
          id="databaseTableName"
          className="h-8 text-sm"
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
          className="mr-2 w-4 h-4 text-white bg-transparent border-white rounded  accent-primary"
        />
        <label
          htmlFor="ifNotExists"
          className="text-xs font-medium text-slate-500 "
        >
          {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_IF_NOT_EXIST_FIELD_LABEL}
        </label>
      </div>

      <ColumnSelector tableEditorForm={tableEditorForm} />

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseMetadata}
        isFetching={isFetchingDatabaseMetadata}
        isRefetching={isRefetchingDatabaseMetadata}
        error={databaseMetadataError}
        refetch={refetchDatabaseMetadata}
      >
        {databaseMetadata && databaseMetadata.schemas?.length > 0 && (
          <ForeignKeyConstraintSelector
            tableEditorForm={tableEditorForm}
            databaseMetadata={databaseMetadata}
          />
        )}
      </ReactQueryLoadingErrorWrapper>

      {/* Table Constraints Section */}
      <div className="mt-6">
        {/* Unique Constraint */}
        <UniqueConstraintSelector tableEditorForm={tableEditorForm} />

        {/* Primary Key Constraint */}
        <PrimaryKeyConstraintSelector tableEditorForm={tableEditorForm} />
        {/* Check Constraint */}

        {/* Exclude Constraint */}
        <ExcludeConstraintSelector tableEditorForm={tableEditorForm} />

        {/* Check Constraint */}
        <CheckConstraintSelector tableEditorForm={tableEditorForm} />
      </div>
    </>
  );
};
