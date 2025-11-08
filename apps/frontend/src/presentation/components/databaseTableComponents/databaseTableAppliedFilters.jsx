import React, { useMemo } from "react";
import {
    FaTimes,
    FaFilter,
    FaEdit,
    FaTrash,
    FaLayerGroup,
} from "react-icons/fa";
import PropTypes from "prop-types";

/**
 * Applied Filters Display Component
 * Shows active filters as beautiful chips at the top of the table
 */
export const AppliedFilters = ({
    databaseTableColumnFilters,
    databaseTableColumnFilterCombinator,
    onRemoveFilter,
    onClearAllFilters,
    onEditFilters,
    debouncedSearchTerm,
    onClearSearch,
}) => {
    // Parse filter structure from flat array
    const filterStructure = useMemo(() => {
        if (!databaseTableColumnFilters || databaseTableColumnFilters.length === 0) {
            return null;
        }

        const structure = {
            combinator: databaseTableColumnFilterCombinator || "AND",
            groups: [],
            currentGroup: { filters: [], combinator: "AND" },
            depth: 0,
        };

        const stack = [{ filters: [], combinator: databaseTableColumnFilterCombinator || "AND" }];
        let currentLevel = stack[0];

        databaseTableColumnFilters.forEach((filter, index) => {
            if (filter.groupStart) {
                const newLevel = { filters: [], combinator: "AND", isGroup: true };
                currentLevel.filters.push(newLevel);
                stack.push(newLevel);
                currentLevel = newLevel;
            } else if (filter.groupEnd) {
                stack.pop();
                currentLevel = stack[stack.length - 1];
            } else if (filter.combinator) {
                currentLevel.combinator = filter.combinator;
            } else if (filter.field) {
                currentLevel.filters.push({ ...filter, index });
            }
        });

        return stack[0];
    }, [databaseTableColumnFilters, databaseTableColumnFilterCombinator]);

    // Format operator display
    const formatOperator = (operator) => {
        const operatorLabels = {
            eq: "equals",
            ne: "not equals",
            gt: "greater than",
            gte: "greater or equal",
            lt: "less than",
            lte: "less or equal",
            like: "contains",
            nlike: "not contains",
            ilike: "contains",
            nilike: "not contains",
            in: "in",
            nin: "not in",
            null: "is empty",
            nnull: "is not empty",
            between: "between",
            contains: "contains",
            hasKey: "has key",
        };
        return operatorLabels[operator] || operator;
    };

    // Format value display
    const formatValue = (value, operator) => {
        if (operator === "null" || operator === "nnull") return "";
        if (value === null || value === undefined) return "";

        if (Array.isArray(value)) {
            if (operator === "between") {
                return `${value[0]} and ${value[1]}`;
            }
            return value.length > 3
                ? `${value.slice(0, 3).join(", ")}... (+${value.length - 3} more)`
                : value.join(", ");
        }

        if (typeof value === "string" && value.length > 50) {
            return `${value.substring(0, 50)}...`;
        }

        return String(value);
    };

    // Render individual filter chip
    const FilterChip = ({ filter, onRemove }) => {
        const formattedValue = formatValue(filter.value, filter.operator);

        return (
            <div
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800 transition-all hover:bg-blue-100 hover:border-blue-300 group"
                style={{ animation: "slideIn 0.2s ease-out" }}
            >
                <span className="font-medium">{filter.field}</span>
                <span className="text-blue-400">•</span>
                <span className="text-[#646cff]">{formatOperator(filter.operator)}</span>
                {formattedValue && (
                    <>
                        <span className="text-blue-400">•</span>
                        <span className="font-semibold max-w-[200px] truncate" title={String(filter.value)}>
                            {formattedValue}
                        </span>
                    </>
                )}
                <button
                    onClick={() => onRemove(filter.index)}
                    className="ml-1 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                    title="Remove filter"
                >
                    <FaTimes className="h-3 w-3" />
                </button>
            </div>
        );
    };

    // Render filter group (for nested filters)
    const FilterGroup = ({ group, depth = 0 }) => {
        if (!group.filters || group.filters.length === 0) return null;

        return (
            <div
                className={`inline-flex flex-wrap items-center gap-2 ${depth > 0 ? "px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg" : ""
                    }`}
            >
                {depth > 0 && (
                    <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
                        <FaLayerGroup className="h-3 w-3" />
                        <span>GROUP</span>
                    </div>
                )}

                {group.filters.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                {group.combinator}
                            </span>
                        )}
                        {item.isGroup ? (
                            <FilterGroup group={item} depth={depth + 1} />
                        ) : (
                            <FilterChip filter={item} onRemove={onRemoveFilter} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Search term chip
    const SearchChip = () => {
        if (!debouncedSearchTerm) return null;

        return (
            <div
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-800 transition-all hover:bg-green-100 hover:border-green-300"
                style={{ animation: "slideIn 0.2s ease-out" }}
            >
                <FaFilter className="h-3 w-3" />
                <span className="font-medium">Search:</span>
                <span className="font-semibold">{debouncedSearchTerm}</span>
                <button
                    onClick={onClearSearch}
                    className="ml-1 p-0.5 rounded-full hover:bg-green-200 transition-colors"
                    title="Clear search"
                >
                    <FaTimes className="h-3 w-3" />
                </button>
            </div>
        );
    };

    const hasFilters = filterStructure?.filters?.length > 0;
    const hasSearch = !!debouncedSearchTerm;

    if (!hasFilters && !hasSearch) return null;

    return (
        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaFilter className="h-4 w-4" />
                        <span className="text-sm font-semibold">Active Filters:</span>
                    </div>

                    {/* Search Chip */}
                    {hasSearch && <SearchChip />}

                    {/* Filter Chips */}
                    {hasFilters && (
                        <>
                            {hasSearch && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                    AND
                                </span>
                            )}
                            <FilterGroup group={filterStructure} />
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="ml-auto flex items-center gap-2">
                        {onEditFilters && (
                            <button
                                onClick={onEditFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#646cff] hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit filters"
                            >
                                <FaEdit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                            </button>
                        )}

                        {(hasFilters || hasSearch) && (
                            <button
                                onClick={onClearAllFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Clear all filters"
                            >
                                <FaTrash className="h-3.5 w-3.5" />
                                <span>Clear All</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Count Summary */}
                {(hasFilters || hasSearch) && (
                    <div className="mt-2 text-xs text-gray-500">
                        Showing filtered results
                        {hasFilters && ` • ${filterStructure.filters.filter(f => !f.isGroup).length} filter${filterStructure.filters.filter(f => !f.isGroup).length !== 1 ? 's' : ''} applied`}
                        {hasSearch && ` • Searching for "${debouncedSearchTerm}"`}
                    </div>
                )}
            </div>

            {/* CSS Animation */}
            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

AppliedFilters.propTypes = {
    databaseTableColumnFilters: PropTypes.array,
    databaseTableColumnFilterCombinator: PropTypes.string,
    onRemoveFilter: PropTypes.func.isRequired,
    onClearAllFilters: PropTypes.func.isRequired,
    onEditFilters: PropTypes.func,
    debouncedSearchTerm: PropTypes.string,
    onClearSearch: PropTypes.func,
};

// Compact version for smaller spaces
export const AppliedFiltersCompact = ({
    databaseTableColumnFilters,
    debouncedSearchTerm,
    onClearAllFilters,
    onEditFilters,
}) => {
    const filterCount = databaseTableColumnFilters?.filter(
        (f) => f.field && !f.groupStart && !f.groupEnd && !f.combinator
    ).length || 0;

    const hasFilters = filterCount > 0;
    const hasSearch = !!debouncedSearchTerm;

    if (!hasFilters && !hasSearch) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#646cff]/10  rounded text-sm border border-transparent">
            <FaFilter className="h-4 w-4 text-[#646cff]" />
            <div className="flex items-center gap-2">
                {hasFilters && (
                    <span className="font-medium text-[#646cff] text-sm">
                        {filterCount} filter{filterCount !== 1 ? "s" : ""}
                    </span>
                )}
                {hasFilters && hasSearch && (
                    <span className="text-[#646cff]">•</span>
                )}
                {hasSearch && (
                    <span className="font-medium text-[#646cff] text-sm">
                        Search: "{debouncedSearchTerm.substring(0, 20)}
                        {debouncedSearchTerm.length > 20 ? "..." : ""}"
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 ml-2">
                {onEditFilters && (
                    <button
                        onClick={onEditFilters}
                        className="p-0 me-1 text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors bg-transparent outline-none hover:outline-none border-0 hover:border-0"
                        title="Edit filters"
                    >
                        <FaEdit className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={onClearAllFilters}
                    className="p-0 text-red-400 hover:bg-red-100 rounded transition-colors outline-none hover:outline-none border-0 hover:border-0 bg-transparent "
                    title="Clear all"
                >
                    <FaTimes className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

AppliedFiltersCompact.propTypes = {
    databaseTableColumnFilters: PropTypes.array,
    debouncedSearchTerm: PropTypes.string,
    onClearAllFilters: PropTypes.func.isRequired,
    onEditFilters: PropTypes.func,
};

// Alternative: Badge style with dropdown
export const AppliedFiltersBadge = ({
    databaseTableColumnFilters,
    debouncedSearchTerm,
    onClearAllFilters,
    onEditFilters,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const filterCount = databaseTableColumnFilters?.filter(
        (f) => f.field && !f.groupStart && !f.groupEnd && !f.combinator
    ).length || 0;

    const hasFilters = filterCount > 0;
    const hasSearch = !!debouncedSearchTerm;
    const totalCount = filterCount + (hasSearch ? 1 : 0);

    if (!hasFilters && !hasSearch) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#646cff] text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
                <FaFilter className="h-3.5 w-3.5" />
                <span>{totalCount} Active</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {isExpanded ? "−" : "+"}
                </span>
            </button>

            {isExpanded && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsExpanded(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 z-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Active Filters</h3>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    <FaTimes className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                            {hasSearch && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-green-600 font-medium mb-1">
                                                SEARCH TERM
                                            </div>
                                            <div className="text-sm font-semibold text-green-800">
                                                {debouncedSearchTerm}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {databaseTableColumnFilters
                                ?.filter((f) => f.field)
                                .map((filter, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-[#646cff] font-medium mb-1">
                                                    {filter.field}
                                                </div>
                                                <div className="text-sm text-gray-800">
                                                    <span className="font-medium">
                                                        {formatOperator(filter.operator)}
                                                    </span>
                                                    {filter.value && (
                                                        <span className="ml-1 font-semibold">
                                                            {formatValue(filter.value, filter.operator)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                            {onEditFilters && (
                                <button
                                    onClick={() => {
                                        onEditFilters();
                                        setIsExpanded(false);
                                    }}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-[#646cff] bg-white border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Edit Filters
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onClearAllFilters();
                                    setIsExpanded(false);
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    function formatOperator(operator) {
        const operatorLabels = {
            eq: "equals",
            ne: "not equals",
            gt: ">",
            gte: "≥",
            lt: "<",
            lte: "≤",
            like: "contains",
            ilike: "contains",
            in: "in",
            nin: "not in",
            null: "is empty",
            nnull: "is not empty",
        };
        return operatorLabels[operator] || operator;
    }

    function formatValue(value, operator) {
        if (operator === "null" || operator === "nnull") return "";
        if (Array.isArray(value)) {
            return value.join(", ");
        }
        return String(value);
    }
};

AppliedFiltersBadge.propTypes = {
    databaseTableColumnFilters: PropTypes.array,
    debouncedSearchTerm: PropTypes.string,
    onClearAllFilters: PropTypes.func.isRequired,
    onEditFilters: PropTypes.func,
};