import { FaDatabase, FaColumns, FaKey, FaLink } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";

export const DatabaseTableStats = ({ databaseTables }) => {
  // Calculate stats
  const totalTables = databaseTables.length;
  const totalColumns = databaseTables.reduce(
    (acc, table) => acc + table.databaseTableColumns?.length || 0,
    0
  );
  const tablesWithPrimaryKeys = databaseTables.filter(
    (table) => table.primaryKey && table.primaryKey.length > 0
  ).length;
  const totalConstraints = databaseTables.reduce(
    (acc, table) => acc + table.databaseTableConstraints?.length || 0,
    0
  );

  return (
    <div className="w-full h-full">
      {/* Header */}
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl border-b border-slate-200 p-3">
        {CONSTANTS.STRINGS.DATABASE_TABLES_STATS_TITLE}
      </h1>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-3">
        {/* Total Tables */}
        <div className="bg-white rounded border border-slate-200 p-4 flex flex-col justify-start items-start space-x-4">
          <div className="flex flex-row justify-start items-center">
            <FaDatabase className="text-lg text-[#646cff]" />
            <p className="text-sm text-slate-500 ml-2">
              {CONSTANTS.STRINGS.DATABASE_TABLES_STATS_TOTAL_TABLES_LABEL}
            </p>
          </div>
          <span className="text-xl font-medium text-slate-800 !ml-0 pl-0 mt-2">
            {totalTables}
          </span>
        </div>
        {/* Total Columns */}
        <div className="bg-white rounded border border-slate-200 p-4 flex flex-col justify-start items-start space-x-4">
          <div className="flex flex-row justify-start items-center">
            <FaColumns className="text-lg text-[#646cff]" />
            <p className="text-sm text-slate-500 ml-2">
              {CONSTANTS.STRINGS.DATABASE_TABLES_STATS_TOTAL_COLUMNS_LABEL}
            </p>
          </div>
          <p className="text-xl font-medium text-slate-800 !ml-0 pl-0 mt-2">
            {totalColumns}
          </p>
        </div>
        {/* Tables with Primary Keys */}
        <div className="bg-white rounded border border-slate-200 p-4 flex flex-col justify-start items-start space-x-4">
          <div className="flex flex-row justify-start items-center">
            <FaKey className="text-lg text-[#646cff]" />
            <p className="text-sm text-slate-500 ml-2">
              {
                CONSTANTS.STRINGS
                  .DATABASE_TABLES_STATS_TABLES_WITH_PRIMARY_KEYS_LABEL
              }
            </p>
          </div>
          <p className="text-xl font-medium text-slate-800 !ml-0 pl-0 mt-2">
            {tablesWithPrimaryKeys}
          </p>
        </div>
        {/* Total Constraints */}
        <div className="bg-white rounded border border-slate-200 p-4 flex flex-col justify-start items-start space-x-4">
          <div className="flex flex-row justify-start items-center">
            <FaLink className="text-lg text-[#646cff]" />
            <p className="text-sm text-slate-500 ml-2">
              {CONSTANTS.STRINGS.DATABASE_TABLES_STATS_TOTAL_CONSTRAINTS_LABEL}
            </p>
          </div>
          <p className="text-xl font-medium text-slate-800 !ml-0 pl-0 mt-2">
            {totalConstraints}
          </p>
        </div>
      </div>
    </div>
  );
};
