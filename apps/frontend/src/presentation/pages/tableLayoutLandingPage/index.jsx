import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  FaColumns,
  FaEdit,
  FaEye,
  FaKey,
  FaLink,
  FaPlus,
  FaSearch,
  FaTable,
  FaTerminal,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getAllDatabaseTablesAPI } from "../../../data/apis/databaseTable";
import { CONSTANTS } from "../../../constants";
import { CircularProgress } from "@mui/material";
import { extractError } from "../../../utils/error";

const StatCard = ({ title, count, icon, iconBgClass, subtext, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff] transition-colors"
  >
    <div className="flex justify-between items-center mb-3">
      <div
        className={`w-10 h-10 rounded flex items-center justify-center ${iconBgClass}`}
      >
        {icon}
      </div>
      <span className="text-2xl font-bold text-slate-700">{count}</span>
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-700 mb-0.5">{title}</h3>
      {subtext && <p className="text-gray-500 text-xs">{subtext}</p>}
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon, onClick, iconBgClass }) => (
  <div
    onClick={onClick}
    className="bg-white rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff] transition-colors flex flex-col items-center text-center"
  >
    <div
      className={`w-12 h-12 rounded flex items-center justify-center mb-3 ${iconBgClass}`}
    >
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-gray-500 text-xs">{description}</p>
  </div>
);

const TableLayoutLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: tables,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["databaseTables", tenantID, databaseSchemaName],
    queryFn: () =>
      getAllDatabaseTablesAPI({ tenantID, databaseSchemaName }),
    enabled: !!tenantID && !!databaseSchemaName,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress size={24} className="!text-[#646cff]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <strong className="font-bold">Error loading tables: </strong>
          <span className="block sm:inline">{extractError(error)}</span>
        </div>
      </div>
    );
  }

  const tableCount = tables?.length || 0;
  const totalColumns = tables?.reduce(
    (acc, table) => acc + (table.databaseTableColumns?.length || 0),
    0
  ) || 0;
  const tablesWithPrimaryKey = tables?.filter(
    (table) => table.primaryKey && table.primaryKey.length > 0
  ).length || 0;
  const totalConstraints = tables?.reduce(
    (acc, table) => acc + (table.databaseTableConstraints?.length || 0),
    0
  ) || 0;

  // Filter tables based on search
  const allTables = tables || [];
  const filteredTables = searchQuery
    ? allTables.filter((table) =>
      table.databaseTableName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allTables;

  return (
    <div className="bg-gray-50 h-full w-full p-3 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white rounded border border-slate-200 p-4 mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
              <FaTable size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-700">
                Database Tables
              </h1>
              <p className="text-gray-500 text-sm">
                {databaseSchemaName} schema • {tableCount} tables
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(tenantID, databaseSchemaName))}
              className="flex items-center gap-2 rounded bg-[#646cff] px-3 py-1.5 text-sm text-white hover:bg-[#5558dd] focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
            >
              <FaPlus size={12} />
              New Table
            </button>
            <button
              onClick={() => navigate(CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID))}
              className="flex items-center gap-2 rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
            >
              <FaTerminal size={12} />
              SQL Editor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          title="Total Tables"
          count={tableCount}
          icon={<FaTable className="text-blue-500" />}
          iconBgClass="bg-blue-100"
          subtext={`${databaseSchemaName} schema`}
        />
        <StatCard
          title="Total Columns"
          count={totalColumns}
          icon={<FaColumns className="text-purple-500" />}
          iconBgClass="bg-purple-100"
          subtext="Across all tables"
        />
        <StatCard
          title="Primary Keys"
          count={tablesWithPrimaryKey}
          icon={<FaKey className="text-amber-500" />}
          iconBgClass="bg-amber-100"
          subtext="Tables with PK"
        />
        <StatCard
          title="Constraints"
          count={totalConstraints}
          icon={<FaLink className="text-emerald-500" />}
          iconBgClass="bg-emerald-100"
          subtext="Total constraints"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded border border-slate-200 p-4 mb-3">
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionCard
            title="New Table"
            description="Create a new table"
            icon={<FaPlus size={20} className="text-[#646cff]" />}
            iconBgClass="bg-[#646cff]/10"
            onClick={() => navigate(CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(tenantID, databaseSchemaName))}
          />
          <QuickActionCard
            title="SQL Editor"
            description="Run custom queries"
            icon={<FaTerminal size={20} className="text-emerald-500" />}
            iconBgClass="bg-emerald-100"
            onClick={() => navigate(CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID))}
          />
          <QuickActionCard
            title="View Schema"
            description="Schema overview"
            icon={<FaEye size={20} className="text-purple-500" />}
            iconBgClass="bg-purple-100"
            onClick={() => navigate(CONSTANTS.ROUTES.VIEW_SCHEMA.path(tenantID, databaseSchemaName))}
          />
          <QuickActionCard
            title="Triggers"
            description="Manage triggers"
            icon={<FaLink size={20} className="text-amber-500" />}
            iconBgClass="bg-amber-100"
            onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGERS.path(tenantID, databaseSchemaName))}
          />
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-slate-700">
              All Tables ({tableCount})
            </h2>
          </div>
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-[#646cff]/50 focus:border-[#646cff] transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          {filteredTables.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {filteredTables.map((table, index) => (
                <li key={index} className="bg-white">
                  <button
                    onClick={() =>
                      navigate(
                        CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.path(
                          tenantID,
                          databaseSchemaName,
                          table.databaseTableName
                        )
                      )
                    }
                    className="bg-white w-full text-left flex items-center p-3 hover:bg-[#646cff]/5 transition-colors group outline-none border-none"
                  >
                    <div className="w-10 h-10 rounded bg-slate-100 text-slate-400 group-hover:text-[#646cff] group-hover:bg-[#646cff]/10 transition-colors mr-3 flex items-center justify-center">
                      <FaTable size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">
                        {table.databaseTableName}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FaColumns size={10} />
                          {table.databaseTableColumns?.length || 0} columns
                        </span>
                        {table.primaryKey && table.primaryKey.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <FaKey size={10} />
                            PK
                          </span>
                        )}
                        {table.databaseTableConstraints?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FaLink size={10} />
                            {table.databaseTableConstraints.length} constraints
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            CONSTANTS.ROUTES.UPDATE_DATABASE_TABLE_BY_NAME.path(
                              tenantID,
                              databaseSchemaName,
                              table.databaseTableName
                            )
                          );
                        }}
                        className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-[#646cff]"
                        title="Edit table"
                      >
                        <FaEdit size={14} />
                      </button>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 text-sm py-12">
              {searchQuery ? (
                <div>
                  <FaSearch className="mx-auto mb-2 text-2xl text-gray-300" />
                  <p>No tables found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <FaTable className="mx-auto mb-2 text-2xl text-gray-300" />
                  <p>No tables in this schema</p>
                  <button
                    onClick={() =>
                      navigate(
                        CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(
                          tenantID,
                          databaseSchemaName
                        )
                      )
                    }
                    className="mt-3 text-[#646cff] hover:underline text-sm"
                  >
                    Create your first table
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {filteredTables.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Showing {filteredTables.length} of {tableCount} tables
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableLayoutLandingPage;
