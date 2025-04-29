import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { CONSTANTS } from "../../../constants";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { CircularProgress, Menu, MenuItem } from "@mui/material";
import { MdOutlineVpnKeyOff } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

const PrimaryKeyConstraintSelector = ({ databaseTableColumns,selectedDatabaseTablePrimaryKeys, setSelectedDatabaseTablePrimaryKeys }) => {
  PrimaryKeyConstraintSelector.propTypes = {
    databaseTableColumns: PropTypes.array.isRequired,
    selectedDatabaseTablePrimaryKeys: PropTypes.array.isRequired,
    setSelectedDatabaseTablePrimaryKeys: PropTypes.func.isRequired,
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const _handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsDropdownOpen(true);
  };

  const _handleDropdownClose = () => {
    setAnchorEl(null);
    setIsDropdownOpen(false);
  };

  const toggleColumnInPrimaryKey = (columnName) => {
    const primaryKey = [
      ...selectedDatabaseTablePrimaryKeys,
    ];
    const columnIndex = primaryKey.indexOf(columnName);

    if (columnIndex === -1) {
      primaryKey.push(columnName);
    } else {
      primaryKey.splice(columnIndex, 1);
    }
    setSelectedDatabaseTablePrimaryKeys(primaryKey);
  };

  return (
    <div className="mb-4">
      <span className="block mb-1 text-xs font-medium text-slate-500">
        {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_PRIMARY_KEY_TITLE}
      </span>
      <div className="relative w-full flex flex-col justify-start items-stretch">
        <div className="flex flex-row flex-wrap justify-start items-start gap-2 w-full border p-2 rounded border-[#9a9fff] border-dashed bg-[#f5f5ff]">
          <button
            type="button"
            onClick={_handleDropdownOpen}
            className="inline-flex outline-none hover:outline-none flex-row justify-center items-center bg-slate-50 border text-xs border-slate-300 text-slate-700 rounded focus:border-slate-700 px-2.5 py-1"
          >
            <FaPlus className="h-3 w-3 mr-1" />
            {CONSTANTS.STRINGS.TABLE_EDITOR_FORM_PRIMARY_KEY_COLUMN_LABEL}
          </button>

          {selectedDatabaseTablePrimaryKeys?.map(
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

        <Menu
          id="primary-key-column-menu"
          anchorEl={anchorEl}
          open={isDropdownOpen}
          onClose={_handleDropdownClose}
          MenuListProps={{
            "aria-labelledby": "primary-key-column-button",
          }}
          sx={{
            padding: "0px",
            "& .MuiMenu-list": {
              padding: "0px !important",
            },
          }}
        >
          {databaseTableColumns?.map((column, index) => (
            <MenuItem
              key={column.databaseTableColumnName}
              className="!flex !flex-row !justify-start !items-center !p-1.5 !w-full"
            >
              <input
                type="checkbox"
                id={`pk-option-${index}`}
                value={column.databaseTableColumnName}
                checked={selectedDatabaseTablePrimaryKeys?.includes(
                  column.databaseTableColumnName
                )}
                onChange={() =>
                  toggleColumnInPrimaryKey(column.databaseTableColumnName)
                }
                className="h-4 w-4 text-indigo-600  border-gray-300 rounded"
              />
              <label
                htmlFor={`pk-option-${index}`}
                className="ml-3 block text-sm text-gray-900"
              >
                {column.databaseTableColumnName}
              </label>
            </MenuItem>
          ))}
        </Menu>
      </div>
    </div>
  );
};

export const DatabaseTablePrimaryColumnSelection = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableColumns,
  children,
}) => {
    const [selectedDatabaseTablePrimaryKeys, setSelectedDatabaseTablePrimaryKeys] = useState([])
  const userConfigKey = `${databaseSchemaName}_${databaseTableName}_${CONSTANTS.USER_CONFIG_KEYS.DATABASE_TABLE_CUSTOM_PRIMARY_KEY}`;
  DatabaseTablePrimaryColumnSelection.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    databaseTableColumns: PropTypes.array.isRequired,
  };
  const {
    userConfig,
    isFetchingUserConfig,
    isUpdatingUserConfig,
    getUserConfigError,
  } = useAuthState();

  const { updateUserConfigKey } = useAuthActions();

  const databaseTablePrimaryKey =
    userConfig && userConfig[userConfigKey]
      ? String(userConfig[userConfigKey])
      : null;

  const _handleSetCustomPrimaryKey = (databaseTablePrimaryKey) => {
    updateUserConfigKey({
      tenantID,
      key: userConfigKey,
      value: databaseTablePrimaryKey,
    });
  };
  console.log({ databaseTablePrimaryKey ,databaseTableColumns,getUserConfigError});
  return databaseTablePrimaryKey && databaseTableName ? (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-gray-200 ">
        <div className="w-full  flex flex-col justify-center items-start">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
            {databaseTableName}
          </h1>
          <span className="text-xs text-[#646cff] mt-2">{`Custom primary key: ${databaseTablePrimaryKey}`}</span>
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          {isUpdatingUserConfig ? (
            <CircularProgress size={20} className="!text-[#646cff]" />
          ) : (
            <div>
              <PrimaryKeyConstraintSelector
                databaseTableColumns={databaseTableColumns}
                selectedDatabaseTablePrimaryKeys={
                  selectedDatabaseTablePrimaryKeys
                }
                setSelectedDatabaseTablePrimaryKeys={
                  setSelectedDatabaseTablePrimaryKeys
                }
              />
              <button
                className=""
                onClick={() =>
                  _handleSetCustomPrimaryKey(selectedDatabaseTablePrimaryKeys)
                }
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  ) : (
    <ReactQueryLoadingErrorWrapper
      isLoading={isFetchingUserConfig}
      error={getUserConfigError}
    >
      <div className="h-full w-full flex justify-center items-center p-6">
        <div className="bg-white p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#646cff]/10 p-4 rounded-full">
              <MdOutlineVpnKeyOff className="text-[#646cff] text-4xl" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {CONSTANTS.STRINGS.DATABASE_TABLE_NO_PRIMARY_KEY_TITLE}
          </h2>
          <p className="text-slate-600 mb-6">
            {CONSTANTS.STRINGS.DATABASE_TABLE_NO_PRIMARY_KEY_DESCRIPTION}
          </p>
          <div className="flex flex-row justify-center items-center gap-2">
            {isUpdatingUserConfig ? (
              <CircularProgress size={20} className="!text-[#646cff]" />
            ) : (
              <div>
                <PrimaryKeyConstraintSelector
                  databaseTableColumns={databaseTableColumns}
                  selectedDatabaseTablePrimaryKeys={
                    selectedDatabaseTablePrimaryKeys
                  }
                  setSelectedDatabaseTablePrimaryKeys={
                    setSelectedDatabaseTablePrimaryKeys
                  }
                />
                <button
                  className=""
                  onClick={() =>
                    _handleSetCustomPrimaryKey(selectedDatabaseTablePrimaryKeys)
                  }
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
