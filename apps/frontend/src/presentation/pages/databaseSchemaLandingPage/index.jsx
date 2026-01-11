import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  FaBolt,
  FaCode,
  FaDatabase,
  FaEye,
  FaPlus,
  FaSearch,
  FaTable,
  FaTerminal,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getDatabaseMetadataBySchemaAPI } from "../../../data/apis/database";
import { extractError } from "../../../utils/error";
import { CircularProgress } from "@mui/material";
import { CONSTANTS } from "../../../constants";

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

const DatabaseSchemaLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: schemaMetadata,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["databaseSchemaMetadata", tenantID, databaseSchemaName],
    queryFn: () =>
      getDatabaseMetadataBySchemaAPI({ tenantID, databaseSchemaName }),
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
          <strong className="font-bold">Error loading schema metadata: </strong>
          <span className="block sm:inline">{extractError(error)}</span>
        </div>
      </div>
    );
  }

  const tableCount = schemaMetadata?.tables?.length || 0;
  const viewCount = schemaMetadata?.views?.length || 0;
  const triggerCount = schemaMetadata?.triggers?.length || 0;

  // Filter tables based on search
  const allTables = schemaMetadata?.tables || [];
  const filteredTables = searchQuery
    ? allTables.filter((table) =>
      (table.databaseTableName || table).toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allTables.slice(0, 8);

  return (
    <div className="bg-gray-50 h-full w-full p-3 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white rounded border border-slate-200 p-4 mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
              <FaDatabase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-700">
                {databaseSchemaName}
              </h1>
              <p className="text-gray-500 text-sm">Schema Overview</p>
            </div>
          </div>
          <button
            onClick={() => navigate(CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID))}
            className="flex items-center gap-2 rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
          >
            <FaTerminal size={12} />
            Run SQL Query
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <StatCard
          title="Tables"
          count={tableCount}
          icon={<FaTable className="text-blue-500" />}
          iconBgClass="bg-blue-100"
          subtext="Active Tables"
          onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.path(tenantID, databaseSchemaName))}
        />
        <StatCard
          title="Views"
          count={viewCount}
          icon={<FaEye className="text-purple-500" />}
          iconBgClass="bg-purple-100"
          subtext="Database Views"
          onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATABASE_VIEWS.path(tenantID, databaseSchemaName))}
        />
        <StatCard
          title="Triggers"
          count={triggerCount}
          icon={<FaBolt className="text-amber-500" />}
          iconBgClass="bg-amber-100"
          subtext="Event Triggers"
          onClick={() => navigate(CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGERS.path(tenantID, databaseSchemaName))}
        />
        <StatCard
          title="Functions"
          count="--"
          icon={<FaCode className="text-emerald-500" />}
          iconBgClass="bg-emerald-100"
          subtext="SQL Functions"
          onClick={() => navigate(CONSTANTS.ROUTES.VIEW_FUNCTIONS.path(tenantID, databaseSchemaName))}
        />
        <StatCard
          title="Procedures"
          count="--"
          icon={<FaTerminal className="text-rose-500" />}
          iconBgClass="bg-rose-100"
          subtext="Stored Procs"
          onClick={() => navigate(CONSTANTS.ROUTES.VIEW_STORED_PROCEDURES.path(tenantID, databaseSchemaName))}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <QuickActionCard
              title="New Table"
              description="Create a table visually"
              icon={<FaPlus size={20} className="text-[#646cff]" />}
              iconBgClass="bg-[#646cff]/10"
              onClick={() => navigate(CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(tenantID, databaseSchemaName))}
            />
            <QuickActionCard
              title="Raw SQL"
              description="Execute custom queries"
              icon={<FaCode size={20} className="text-emerald-500" />}
              iconBgClass="bg-emerald-100"
              onClick={() => navigate(CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID))}
            />
            <QuickActionCard
              title="New View"
              description="Create a database view"
              icon={<FaEye size={20} className="text-purple-500" />}
              iconBgClass="bg-purple-100"
              onClick={() => { }}
            />
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-white rounded border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-slate-700">
                Tables
              </h2>
              <button
                className="text-xs bg-[#646cff]/10 rounded px-3 py-1.5 text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none font-medium"
                onClick={() => {
                  navigate(CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.path(tenantID, databaseSchemaName));
                }}
              >
                View All
              </button>
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
          <div className="flex-1 overflow-y-auto p-2 max-h-[280px]">
            {filteredTables.length > 0 ? (
              <ul className="space-y-1">
                {filteredTables.map((table, index) => (
                  <li key={index} className="bg-white">
                    <button
                      onClick={() => navigate(`tables/${table.databaseTableName}`)}
                      className="bg-white w-full text-left flex items-center p-2 rounded hover:bg-[#646cff]/10 transition-colors group outline-none border-none "
                    >
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-400 group-hover:text-[#646cff] group-hover:bg-[#646cff]/10 transition-colors mr-2 flex items-center justify-center">
                        <FaTable size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">
                          {table.databaseTableName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {table.databaseTableColumns?.length || 0} columns
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 text-sm py-8">
                {searchQuery ? "No tables found" : "No tables in this schema"}
              </div>
            )}
          </div>
          {allTables.length > 8 && !searchQuery && (
            <div className="p-2 border-t border-slate-200 bg-white">
              <p className="text-xs text-gray-500 text-center">
                Showing 8 of {allTables.length} tables
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaLandingPage;
