import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  FaChevronDown,
  FaTimes,
  FaPlus,
  FaTrash,
  FaLayerGroup,
} from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { PostgreSQLUtils } from "../../../utils/postgre";
import PropTypes from "prop-types";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
// Operator definitions based on field types
const OPERATORS_BY_TYPE = {
  string: [
    { value: "=", label: "Equals", requiresValue: true },
    { value: "!=", label: "Not Equals", requiresValue: true },
    { value: "LIKE", label: "Contains", requiresValue: true },
    { value: "NOT LIKE", label: "Not Contains", requiresValue: true },
    {
      value: "ILIKE",
      label: "Contains (case-insensitive)",
      requiresValue: true,
    },
    { value: "STARTS_WITH", label: "Starts With", requiresValue: true },
    { value: "ENDS_WITH", label: "Ends With", requiresValue: true },
    { value: "IN", label: "In", requiresValue: true, multiValue: true },
    { value: "NOT IN", label: "Not In", requiresValue: true, multiValue: true },
    { value: "IS NULL", label: "Is Empty", requiresValue: false },
    { value: "IS NOT NULL", label: "Is Not Empty", requiresValue: false },
  ],
  number: [
    { value: "=", label: "Equals", requiresValue: true },
    { value: "!=", label: "Not Equals", requiresValue: true },
    { value: ">", label: "Greater Than", requiresValue: true },
    { value: ">=", label: "Greater or Equal", requiresValue: true },
    { value: "<", label: "Less Than", requiresValue: true },
    { value: "<=", label: "Less or Equal", requiresValue: true },
    {
      value: "BETWEEN",
      label: "Between",
      requiresValue: true,
      rangeValue: true,
    },
    { value: "IN", label: "In", requiresValue: true, multiValue: true },
    { value: "NOT IN", label: "Not In", requiresValue: true, multiValue: true },
    { value: "IS NULL", label: "Is Empty", requiresValue: false },
    { value: "IS NOT NULL", label: "Is Not Empty", requiresValue: false },
  ],
  boolean: [
    { value: "=", label: "Equals", requiresValue: true },
    { value: "IS NULL", label: "Is Empty", requiresValue: false },
    { value: "IS NOT NULL", label: "Is Not Empty", requiresValue: false },
  ],
  datetime: [
    { value: "=", label: "Equals", requiresValue: true },
    { value: "!=", label: "Not Equals", requiresValue: true },
    { value: ">", label: "After", requiresValue: true },
    { value: ">=", label: "On or After", requiresValue: true },
    { value: "<", label: "Before", requiresValue: true },
    { value: "<=", label: "On or Before", requiresValue: true },
    {
      value: "BETWEEN",
      label: "Between",
      requiresValue: true,
      rangeValue: true,
    },
    { value: "IS NULL", label: "Is Empty", requiresValue: false },
    { value: "IS NOT NULL", label: "Is Not Empty", requiresValue: false },
  ],
  json: [
    { value: "=", label: "Equals", requiresValue: true },
    { value: "!=", label: "Not Equals", requiresValue: true },
    { value: "@>", label: "Contains", requiresValue: true },
    { value: "<@", label: "Contained By", requiresValue: true },
    { value: "?", label: "Has Key", requiresValue: true },
    { value: "IS NULL", label: "Is Empty", requiresValue: false },
    { value: "IS NOT NULL", label: "Is Not Empty", requiresValue: false },
  ],
};

// Filter Rule Component
const FilterRule = ({
  rule,
  index,
  onUpdate,
  onRemove,
  databaseTableColumns,
}) => {
  const fieldType = useMemo(() => {
    if (databaseTableColumns && rule.field) {
      return databaseTableColumns.find(
        (col) => col.databaseTableColumnName === rule.field
      )?.databaseTableColumnType;
    }
    return null;
  }, [databaseTableColumns, rule.field]);

  const normalizedFieldType = useMemo(() => {
    return (
      CONSTANTS.POSTGRE_SQL_DATA_TYPES[fieldType]?.normalizedType || "string"
    );
  }, [fieldType]);

  const availableOperators = useMemo(() => {
    return OPERATORS_BY_TYPE[normalizedFieldType] || OPERATORS_BY_TYPE.string;
  }, [normalizedFieldType]);

  const selectedOperator = useMemo(() => {
    return availableOperators.find((op) => op.value === rule.operator);
  }, [availableOperators, rule.operator]);

  const handleFieldChange = (val) => {
    onUpdate(index, {
      ...rule,
      field: val,
      operator: "",
      value: "",
    });
  };

  const handleOperatorChange = (val) => {
    const operatorDef = availableOperators.find(
      (op) => op.value === val
    );

    onUpdate(index, {
      ...rule,
      operator: val,
      value: operatorDef?.requiresValue ? rule.value : null,
    });
  };

  const handleValueChange = (value) => {
    onUpdate(index, { ...rule, value });
  };

  const renderValueInput = () => {
    if (!selectedOperator?.requiresValue) return null;

    // Multi-value input (for IN, NOT IN)
    if (selectedOperator.multiValue) {
      return (
        <Input
          type="text"
          value={Array.isArray(rule.value) ? rule.value.join(", ") : rule.value}
          onChange={(e) => {
            const values = e.target.value.split(",").map((v) => v.trim());
            handleValueChange(values);
          }}
          placeholder="Enter values separated by commas"
          className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
        />
      );
    }

    // Range input (for BETWEEN)
    if (selectedOperator.rangeValue) {
      const [min = "", max = ""] = Array.isArray(rule.value)
        ? rule.value
        : ["", ""];
      return (
        <div className="flex gap-2">
          <Input
            type={
              normalizedFieldType === CONSTANTS.DATA_TYPES.DATETIME
                ? "datetime-local"
                : normalizedFieldType === CONSTANTS.DATA_TYPES.NUMBER
                  ? "number"
                  : "text"
            }
            value={min}
            onChange={(e) => handleValueChange([e.target.value, max])}
            placeholder="Min"
            className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
          />
          <span className="flex items-center text-gray-500">and</span>
          <Input
            type={
              normalizedFieldType === CONSTANTS.DATA_TYPES.DATETIME
                ? "datetime-local"
                : normalizedFieldType === CONSTANTS.DATA_TYPES.NUMBER
                  ? "number"
                  : "text"
            }
            value={max}
            onChange={(e) => handleValueChange([min, e.target.value])}
            placeholder="Max"
            className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
          />
        </div>
      );
    }

    // Boolean input
    if (normalizedFieldType === CONSTANTS.DATA_TYPES.BOOLEAN) {
      return (
        <Select value={rule.value != null ? String(rule.value) : ""} onValueChange={(val) => handleValueChange(val === "true")}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Number input
    if (normalizedFieldType === CONSTANTS.DATA_TYPES.NUMBER) {
      return (
        <Input
          type="number"
          value={rule.value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Enter number"
          className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
        />
      );
    }

    // DateTime input
    if (normalizedFieldType === CONSTANTS.DATA_TYPES.DATETIME) {
      return (
        <Input
          type="datetime-local"
          value={rule.value}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
        />
      );
    }

    // Default text input
    return (
      <Input
        type="text"
        value={rule.value}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Enter value"
        className="w-full rounded border p-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white outline-none"
      />
    );
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Field Select */}
        <div className="relative">
          <Select value={rule.field} onValueChange={handleFieldChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select Field" />
            </SelectTrigger>
            <SelectContent>
              {databaseTableColumns?.map((column) => (
                <SelectItem
                key={column.databaseTableColumnName}
                value={column.databaseTableColumnName}
              >
                {column.databaseTableColumnName}
                </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator Select */}
        <div className="relative">
          <Select value={rule.operator} onValueChange={handleOperatorChange} disabled={!rule.field}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select Operator" />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                {op.label}
                </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remove Button */}
        <Button
          onClick={() => onRemove(index)}
          variant="destructive-ghost" className="gap-2"
        >
          <FaTrash className="h-3 w-3" />
          <span className="hidden md:inline">Remove</span>
        </Button>
      </div>

      {/* Value Input */}
      {rule.field && rule.operator && selectedOperator?.requiresValue && (
        <div className="w-full">{renderValueInput()}</div>
      )}
    </div>
  );
};

FilterRule.propTypes = {
  rule: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  databaseTableColumns: PropTypes.array.isRequired,
};

// Filter Group Component (supports nesting)
const FilterGroup = ({
  group,
  groupIndex,
  onUpdate,
  onRemove,
  databaseTableColumns,
  isRoot = false,
}) => {
  const handleCombinatorChange = (val) => {
    onUpdate(groupIndex, { ...group, combinator: val });
  };

  const handleAddRule = () => {
    const newRule = { field: "", operator: "", value: "" };
    onUpdate(groupIndex, {
      ...group,
      rules: [...(group.rules || []), newRule],
    });
  };

  const handleAddGroup = () => {
    const newGroup = {
      combinator: "AND",
      rules: [{ field: "", operator: "", value: "" }],
    };
    onUpdate(groupIndex, {
      ...group,
      rules: [...(group.rules || []), newGroup],
    });
  };

  const handleUpdateRule = (ruleIndex, updatedRule) => {
    const newRules = [...(group.rules || [])];
    newRules[ruleIndex] = updatedRule;
    onUpdate(groupIndex, { ...group, rules: newRules });
  };

  const handleRemoveRule = (ruleIndex) => {
    const newRules = (group.rules || []).filter((_, i) => i !== ruleIndex);
    if (newRules.length === 0 && !isRoot) {
      onRemove(groupIndex);
    } else {
      onUpdate(groupIndex, { ...group, rules: newRules });
    }
  };

  return (
    <div
      className={`space-y-3 ${!isRoot ? "p-3 bg-blue-50 rounded border-2 border-blue-200" : ""
        }`}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isRoot && <FaLayerGroup className="text-blue-500" />}
          <div className="relative">
            <Select value={group.combinator} onValueChange={handleCombinatorChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <FaChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-gray-400" />
          </div>
          <span className="text-sm text-gray-600">
            {isRoot ? "Match" : ""} {group.combinator === "AND" ? "all" : "any"}{" "}
            of the following:
          </span>
        </div>
        {!isRoot && (
          <Button
            onClick={() => onRemove(groupIndex)}
            variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-100"
          >
            <FaTimes className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Rules and Nested Groups */}
      <div className="space-y-2">
        {(group.rules || []).map((rule, index) => {
          // Check if it's a nested group
          if (rule.combinator !== undefined) {
            return (
              <FilterGroup
                key={index}
                group={rule}
                groupIndex={index}
                onUpdate={handleUpdateRule}
                onRemove={handleRemoveRule}
                databaseTableColumns={databaseTableColumns}
                isRoot={false}
              />
            );
          }
          // It's a regular rule
          return (
            <FilterRule
              key={index}
              rule={rule}
              index={index}
              onUpdate={handleUpdateRule}
              onRemove={handleRemoveRule}
              databaseTableColumns={databaseTableColumns}
            />
          );
        })}
      </div>

      {/* Add Rule/Group Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleAddRule}
          variant="primary-outline" size="sm" className="gap-2"
        >
          <FaPlus className="h-3 w-3" />
          Add Rule
        </Button>
        <Button
          onClick={handleAddGroup}
          variant="primary-outline" size="sm" className="gap-2"
        >
          <FaLayerGroup className="h-3 w-3" />
          Add Group
        </Button>
      </div>
    </div>
  );
};

FilterGroup.propTypes = {
  group: PropTypes.object.isRequired,
  groupIndex: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  databaseTableColumns: PropTypes.array.isRequired,
  isRoot: PropTypes.bool,
};

// Main Filter Component
export const DatabaseTableColumnFilter = ({
  setDatabaseTableColumnFilters,
  databaseTableColumnFilters,
  isDatabaseTableColumnFiltersMenuOpen,
  handleCloseDatabaseTableColumnFiltersMenu,
  databaseTableColumns,
}) => {
  // Convert flat filter array to nested structure

  const convertFlatToNested = useCallback((flatFilters, defaultCombinator) => {
    if (!flatFilters || flatFilters.length === 0) {
      return {
        combinator: defaultCombinator || "AND",
        rules: [{ field: "", operator: "", value: "" }],
      };
    }
    const stack = [
      {
        combinator: defaultCombinator || "AND",
        rules: [],
      },
    ];
    let currentLevel = stack[0];
    flatFilters.forEach((filter) => {
      if (filter.groupStart) {
        // Start new nested group
        const newGroup = {
          combinator: "AND",
          rules: [],
        };
        currentLevel.rules.push(newGroup);
        stack.push(newGroup);
        currentLevel = newGroup;
      } else if (filter.groupEnd) {
        // Close current group
        if (stack.length > 1) {
          stack.pop();
          currentLevel = stack[stack.length - 1];
        }
      } else if (filter.combinator) {
        // Set combinator for current level
        currentLevel.combinator = filter.combinator;
      } else if (filter.field) {
        // Add regular filter rule
        currentLevel.rules.push({
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
          fieldType: filter.fieldType,
        });
      }
    });
    // If root has no rules, add an empty one
    if (stack[0].rules.length === 0) {
      stack[0].rules.push({ field: "", operator: "", value: "" });
    }
    return stack[0];
  }, []);
  // Initialize filter structure with nested support
  const [filterStructure, setFilterStructure] = useState(() =>
    convertFlatToNested(
      databaseTableColumnFilters
    )
  );
  // Update filter structure when props change
  useEffect(() => {
    if (isDatabaseTableColumnFiltersMenuOpen) {
      setFilterStructure(
        convertFlatToNested(
          databaseTableColumnFilters
        )
      );
    }
  }, [
    isDatabaseTableColumnFiltersMenuOpen,
    databaseTableColumnFilters,
    convertFlatToNested,
  ]);

  const handleUpdateGroup = useCallback((groupIndex, updatedGroup) => {
    setFilterStructure(updatedGroup);
  }, []);

  const handleRemoveGroup = useCallback(() => {
    // Root group cannot be removed, only reset
    setFilterStructure({
      combinator: "AND",
      rules: [{ field: "", operator: "", value: "" }],
    });
  }, []);

  const validateRule = (rule) => {
    if (!rule.field || !rule.operator) return false;

    const normalizedType =
      CONSTANTS.POSTGRE_SQL_DATA_TYPES[
        databaseTableColumns.find(
          (col) => col.databaseTableColumnName === rule.field
        )?.databaseTableColumnType
      ]?.normalizedType || "string";

    const operatorDef = (
      OPERATORS_BY_TYPE[normalizedType] || OPERATORS_BY_TYPE.string
    ).find((op) => op.value === rule.operator);

    if (!operatorDef?.requiresValue) return true;

    if (operatorDef.multiValue || operatorDef.rangeValue) {
      return (
        Array.isArray(rule.value) &&
        rule.value.length > 0 &&
        rule.value.every((v) => v !== "")
      );
    }

    return rule.value !== "" && rule.value !== null && rule.value !== undefined;
  };

  const validateFilterStructure = (structure) => {
    if (!structure.rules || structure.rules.length === 0) return false;

    return structure.rules.every((rule) => {
      if (rule.combinator !== undefined && rule.rules !== undefined) {
        // It's a nested group
        return validateFilterStructure(rule);
      }
      // It's a rule
      return validateRule(rule);
    });
  };

  const processFilterValue = (rule) => {
    const fieldType = databaseTableColumns.find(
      (col) => col.databaseTableColumnName === rule.field
    )?.databaseTableColumnType;

    const jsType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[fieldType]?.js_type;

    if (Array.isArray(rule.value)) {
      return rule.value.map((v) =>
        PostgreSQLUtils.processFilterValueAccordingToFieldType({
          type: jsType,
          value: v,
        })
      );
    }

    return PostgreSQLUtils.processFilterValueAccordingToFieldType({
      type: jsType,
      value: rule.value,
    });
  };

  const convertToFilterArray = (structure) => {
    const filters = [];

    const processGroup = (group, parentCombinator = null) => {
      console.log("processGroup", group, parentCombinator);
      group.rules.forEach((rule, index) => {
        if (rule.combinator !== undefined && rule.rules !== undefined) {
          // Nested group
          if (index > 0 || parentCombinator) {
            filters.push({ combinator: group.combinator });
          }
          filters.push({ groupStart: true });
          processGroup(rule, group.combinator);
          filters.push({ groupEnd: true });
        } else {
          // Regular rule
          if (index > 0) {
            filters.push({ combinator: group.combinator });
          } else if (parentCombinator) {
            filters.push({ combinator: parentCombinator });
          }

          const fieldType = databaseTableColumns.find(
            (col) => col.databaseTableColumnName === rule.field
          )?.databaseTableColumnType;

          filters.push({
            field: rule.field,
            operator: rule.operator,
            value: processFilterValue(rule),
            fieldType,
          });
        }
      });
    };

    processGroup(structure);
    return filters;
  };

  const handleApplyFilters = () => {
    if (validateFilterStructure(filterStructure)) {
      const processedFilters = convertToFilterArray(filterStructure);
      setDatabaseTableColumnFilters(processedFilters);
      handleCloseDatabaseTableColumnFiltersMenu();
    }
  };

  const handleClearAll = () => {
    setFilterStructure({
      combinator: "AND",
      rules: [{ field: "", operator: "", value: "" }],
    });
  };

  const isValid = useMemo(
    () => validateFilterStructure(filterStructure),
    [filterStructure]
  );

  if (!isDatabaseTableColumnFiltersMenuOpen) return null;

  // console.log({ "filterStructure": filterStructure, "processedFilters": convertToFilterArray(filterStructure) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Advanced Filters
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Create complex filter conditions with groups and nested logic
            </p>
          </div>
          <Button
            onClick={handleCloseDatabaseTableColumnFiltersMenu}
            variant="ghost" size="icon" className="h-6 w-6"
          >
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <FilterGroup
            group={filterStructure}
            groupIndex={0}
            onUpdate={handleUpdateGroup}
            onRemove={handleRemoveGroup}
            databaseTableColumns={databaseTableColumns}
            isRoot={true}
          />

          {/* Filter Preview */}
          {/* {isValid && (
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Filter Preview:
              </h3>
              <pre className="text-xs text-slate-600 overflow-x-auto">
                {JSON.stringify(filterStructure, null, 2)}
              </pre>
            </div>
          )} */}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex gap-2">
          <Button
            onClick={handleClearAll}
            variant="destructive-ghost"
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="default"
            disabled={!isValid}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

DatabaseTableColumnFilter.propTypes = {
  setDatabaseTableColumnFilters: PropTypes.func.isRequired,
  databaseTableColumnFilters: PropTypes.array.isRequired,
  isDatabaseTableColumnFiltersMenuOpen: PropTypes.bool.isRequired,
  handleCloseDatabaseTableColumnFiltersMenu: PropTypes.func.isRequired,
  databaseTableColumns: PropTypes.array.isRequired,
};
