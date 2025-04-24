
import { CircularProgress } from "@mui/material";
import { FaGear } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import React from "react";

export const DatabaseTableStatistics = ({
  tenantID,
  databaseSchemaName,
  isLoadingDatabaseTableStatistics,
  databaseTableName,
  altTableName,
  databaseTableRowCount,
}) => {
  DatabaseTableStatistics.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    isLoadingDatabaseTableStatistics: PropTypes.bool.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    altTableName: PropTypes.string,
    databaseTableRowCount: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const _navigateToTableUpdate = () => {
    navigate(
      CONSTANTS.ROUTES.UPDATE_DATABASE_TABLE_BY_NAME.path(
        tenantID,
        databaseSchemaName,
        databaseTableName
      )
    );
  };
  return isLoadingDatabaseTableStatistics ? (
    <div
      className={`w-full h-full !overflow-y-auto !overflow-x-auto flex justify-center items-center`}
    >
      <CircularProgress />
    </div>
  ) : (
    <div className=" flex flex-col justify-start items-start">
      <div className="!flex !flex-row justify-start items-center">
        <span className="!text-xl !font-bold text-slate-700">
          {altTableName ? altTableName : `${databaseTableName}`}
        </span>
      </div>
      <div className="!flex !flex-row justify-start items-center">
        <span className="!text-sm !font-normal !text-slate-500">{`Total records : ${databaseTableRowCount}`}</span>
        <button
          onClick={_navigateToTableUpdate}
          className="bg-transparent  rounded text-xs inline-flex items-center ml-2 p-1"
        >
          {/* <span className="text-xs text-slate-500">Settings</span> */}

          <FaGear className="text-xs text-slate-500" />
        </button>
      </div>
    </div>
  );
};
