import { useMemo, useState } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { PostgreSQLUtils } from "../../../utils/postgre";

export const DatabaseTableColumnFilter = ({
  databaseTableName,
  setDatabaseTableColumnFilters,
  databaseTableColumnFilters,
  isDatabaseTableColumnFiltersMenuOpen,
  handleCloseDatabaseTableColumnFiltersMenu,
  databaseTableColumnFilterCombinator,
  setDatabaseTableColumnFilterCombinator,
  databaseTableColumns,
}) => {
  const [filterField, setFilterField] = useState("");
  const [filterOperator, setFilterOperator] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Determine the field type based on the selected filter field
  const fieldType = useMemo(() => {
    if (databaseTableColumns && filterField) {
      return databaseTableColumns.find(
        (fieldModel) => fieldModel.databaseTableColumnName === filterField
      )?.databaseTableColumnType;
    }
    return null;
  }, [databaseTableColumns, filterField]);

  const normalizedFieldType = useMemo(() => {
    return CONSTANTS.POSTGRE_SQL_DATA_TYPES[fieldType]?.normalizedType;
  }, [fieldType]);

  // Handle combinator change (AND/OR)
  const handleChangeCombinator = (e) => {
    setDatabaseTableColumnFilterCombinator(e.target.value);
  };

  // Handle filter field change
  const handleChangeFilterField = (e) => {
    setFilterField(e.target.value);
    setFilterOperator(""); // Reset operator when field changes
    setFilterValue(""); // Reset value when field changes
  };

  // Handle filter operator change
  const handleChangeFilterOperator = (e) => {
    setFilterOperator(e.target.value);
    setFilterValue(""); // Reset value when operator changes
  };

  // Handle filter value change
  const handleFilterValue = (e) => {
    setFilterValue(e.target.value);
  };

  // Add the filter to the list
  const handleAddFilter = (e) => {
    e.preventDefault();
    if (
      filterField &&
      fieldType &&
      filterOperator &&
      filterValue !== null &&
      filterValue !== undefined
    ) {
      const newFilter = {
        field: filterField,
        operator: filterOperator,
        value: PostgreSQLUtils.processFilterValueAccordingToFieldType({
          type: CONSTANTS.POSTGRE_SQL_DATA_TYPES[fieldType].js_type,
          value: filterValue,
        }),
        fieldType,
      };

      setDatabaseTableColumnFilters([...databaseTableColumnFilters, newFilter]);
      handleCloseDatabaseTableColumnFiltersMenu();
    }
  };

  // Render nothing if the menu is not open
  if (!isDatabaseTableColumnFiltersMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2 pl-4">
          <h2 className="text-lg font-medium text-slate-700">Filters</h2>
          <button
            onClick={handleCloseDatabaseTableColumnFiltersMenu}
            className="rounded p-1 font-thin text-slate-700 hover:text-[#646cff] bg-white outline-none focus:outline-none border-0"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Combinator Select */}
            <div className="relative">
              <select
                name="combinator"
                value={databaseTableColumnFilterCombinator}
                onChange={handleChangeCombinator}
                className="w-full appearance-none rounded border p-2.5 pr-8 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>

            {/* Field Select */}
            <div className="relative">
              <select
                name="field"
                value={filterField}
                onChange={handleChangeFilterField}
                className="w-full appearance-none rounded border p-2.5 pr-8 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
              >
                <option value="">Select Field</option>
                {databaseTableColumns?.map((column) => (
                  <option
                    key={column.databaseTableColumnName}
                    value={column.databaseTableColumnName}
                  >
                    {column.databaseTableColumnName}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>

            {/* Operator Select */}
            <div className="relative">
              <select
                name="operator"
                value={filterOperator}
                onChange={handleChangeFilterOperator}
                className="w-full appearance-none rounded border p-2.5 pr-8 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
              >
                <option value="">Select Operator</option>
                {Object.keys(CONSTANTS.TABLE_FILTERS).map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Value Input */}
          {normalizedFieldType && (
            <div className="relative">
              <input
                type={
                  normalizedFieldType === CONSTANTS.DATA_TYPES.DATETIME
                    ? "datetime-local"
                    : "text"
                }
                value={filterValue}
                onChange={handleFilterValue}
                placeholder="Enter value"
                className="w-full rounded border p-2.5 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={handleAddFilter}
            disabled={
              !filterField ||
              !filterOperator ||
              filterValue === null ||
              filterValue === undefined
            }
            className={`flex w-full items-center justify-center rounded border border-[#646cff] bg-white px-4 py-2 text-sm font-medium text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50 ${
              !filterField ||
              !filterOperator ||
              filterValue === null ||
              filterValue === undefined
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};
