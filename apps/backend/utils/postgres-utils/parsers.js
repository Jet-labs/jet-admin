const constants = require("../../constants");

const parseTriggerDefinition = (triggerDefinition) => {
  // Extract trigger name
  const triggerNameMatch = triggerDefinition.match(/CREATE TRIGGER (\w+)/);

  // Extract schema and table name
  const schemaTableMatch = triggerDefinition.match(/ON (\w+)\.(\w+)/);
  const tableNameMatch = triggerDefinition.match(/ON (\w+)/);

  // Extract timing (BEFORE, AFTER, INSTEAD OF)
  const timingMatch = triggerDefinition.match(/(BEFORE|AFTER|INSTEAD OF)/);

  // Extract events (INSERT, UPDATE, DELETE, TRUNCATE)
  const eventsMatch = triggerDefinition.match(
    /(INSERT|UPDATE|DELETE|TRUNCATE)/g
  );

  // Extract condition if present
  const conditionMatch = triggerDefinition.match(/WHEN\s*\((.+)\)/);

  // Extract function name and arguments
  const functionMatch = triggerDefinition.match(
    /EXECUTE FUNCTION (\w+)\(([^)]*)\)/
  );

  // Parse extracted values
  const trigger_name = triggerNameMatch ? triggerNameMatch[1] : null;
  const schema_name = schemaTableMatch ? schemaTableMatch[1] : "public"; // Default schema is 'public'
  const trigger_table_name = schemaTableMatch
    ? schemaTableMatch[2]
    : tableNameMatch
    ? tableNameMatch[1]
    : null;
  const trigger_timing = timingMatch ? timingMatch[1] : null;
  const trigger_events = eventsMatch ? [...new Set(eventsMatch)] : []; // Remove duplicates
  const trigger_condition = conditionMatch ? conditionMatch[1] : null;
  const trigger_function_name = functionMatch ? functionMatch[1] : null;

  // Extract and trim function arguments
  const function_args = functionMatch
    ? functionMatch[2].split(",").map((arg) => arg.trim())
    : [];

  // Separate the trigger channel from the function arguments
  const trigger_channel =
    function_args.length > 1
      ? function_args[function_args.length - 1].trim()
      : null;

  return {
    trigger_name,
    schema_name,
    trigger_table_name,
    trigger_timing,
    trigger_events,
    trigger_condition,
    trigger_function_name,
    trigger_function_args: function_args,
    trigger_channel: trigger_channel
      ? String(trigger_channel).substring(1, trigger_channel.length - 1)
      : null, // Specific parsing for the channel
  };
};

const generateFilterQuery = (filterModel) => {
  if (!filterModel) return null;
  if (typeof filterModel !== "object" || filterModel === null) {
    console.warn("Invalid filterModel format.");
    return null;
  }

  const operator = Object.keys(filterModel)[0];
  const value = filterModel[operator];

  switch (operator) {
    case "AND":
      return "(" + value.map(generateFilterQuery).join(" AND ") + ")";
    case "OR":
      return "(" + value.map(generateFilterQuery).join(" OR ") + ")";
    case "NOT":
      return "NOT (" + generateFilterQuery(value) + ")";
    default:
      // Here, assume the operator is a field name with some filterModel
      const field = operator;
      const filterModelKey = Object.keys(value)[0];
      const filterModelValue = value[filterModelKey];
      const query = constants.TABLE_FILTERS[
        String(filterModelKey).toUpperCase()
      ](field, filterModelValue);
      return query;
  }
};

module.exports = {
  parseTriggerDefinition,
  generateFilterQuery,
};
