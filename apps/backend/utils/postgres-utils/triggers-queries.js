const replaceTriggerNameInQuery = (query, oldTriggerName, newTriggerName) => {
  const regexPattern = new RegExp(`\\b${oldTriggerName}\\b`, "gi");
  const updatedQuery = query.replace(regexPattern, newTriggerName);
  return updatedQuery;
};

const generateCreateChannelQuery = ({ channelName }) => {
  return `CREATE OR REPLACE FUNCTION pm_notify_${channelName}()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('${channelName}', row_to_json(NEW)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;
};

const generateCreateTriggerQuery = ({
  schemaName,
  pmTriggerName,
  pmTriggerTableName,
  pmTriggerTiming,
  pmTriggerEvents,
  pmTriggerChannelName,
  pmTriggerMethod,
  pmTriggerCondition,
}) => `CREATE TRIGGER ${pmTriggerName}
${pmTriggerTiming} ${pmTriggerEvents.join(" OR ")} ON ${
  schemaName ? schemaName + "." : "public."
}${pmTriggerTableName}
${pmTriggerCondition ? `WHEN (${pmTriggerCondition})` : ""}
${pmTriggerMethod} //FOR EACH ROW
EXECUTE FUNCTION pm_trigger_notify_event(
    '${pmTriggerEvents.join(", ")}',
    '${pmTriggerChannelName}'
);
`;
/**
 *
 * @returns
 */
const getAllTriggersFromDBQuery = () => {
  return `SELECT
        ns.nspname AS schema_name,
        cls.relname AS table_name,
        tg.tgname AS trigger_name,
        CASE
            WHEN (tg.tgtype::integer & 1) <> 0 THEN 'BEFORE'
            WHEN (tg.tgtype::integer & 2) <> 0 THEN 'AFTER'
            WHEN (tg.tgtype::integer & 4) <> 0 THEN 'INSTEAD OF'
            ELSE 'UNKNOWN'
        END AS timing,
        array_agg(CASE
            WHEN (tg.tgtype::integer & 16) <> 0 THEN 'INSERT'
            WHEN (tg.tgtype::integer & 32) <> 0 THEN 'DELETE'
            WHEN (tg.tgtype::integer & 64) <> 0 THEN 'UPDATE'
            WHEN (tg.tgtype::integer & 128) <> 0 THEN 'TRUNCATE'
            ELSE 'UNKNOWN'
        END) AS events,
        tg.tgargs AS trigger_args,
        pg_get_triggerdef(tg.oid) AS trigger_definition
    FROM
        pg_trigger tg
        JOIN pg_class cls ON tg.tgrelid = cls.oid
        JOIN pg_namespace ns ON cls.relnamespace = ns.oid
    WHERE
        NOT tg.tgisinternal
    GROUP BY
        ns.nspname, cls.relname, tg.tgname, tg.tgtype, tg.tgargs, tg.oid;`;
};

const getTriggerByName = () => {
  return `
    SELECT
        ns.nspname AS schema_name,
        cls.relname AS table_name,
        tg.tgname AS trigger_name,
        CASE
            WHEN (tg.tgtype::integer & 1) <> 0 THEN 'BEFORE'
            WHEN (tg.tgtype::integer & 2) <> 0 THEN 'AFTER'
            WHEN (tg.tgtype::integer & 4) <> 0 THEN 'INSTEAD OF'
            ELSE 'UNKNOWN'
        END AS timing,
        array_agg(CASE
            WHEN (tg.tgtype::integer & 16) <> 0 THEN 'INSERT'
            WHEN (tg.tgtype::integer & 32) <> 0 THEN 'DELETE'
            WHEN (tg.tgtype::integer & 64) <> 0 THEN 'UPDATE'
            WHEN (tg.tgtype::integer & 128) <> 0 THEN 'TRUNCATE'
            ELSE 'UNKNOWN'
        END) AS events,
        tg.tgargs AS trigger_args,
        pg_get_triggerdef(tg.oid) AS trigger_definition
    FROM
        pg_trigger tg
        JOIN pg_class cls ON tg.tgrelid = cls.oid
        JOIN pg_namespace ns ON cls.relnamespace = ns.oid
    WHERE
        NOT tg.tgisinternal
        AND tg.tgname = $1
        AND cls.relname = $2
    GROUP BY
        ns.nspname, cls.relname, tg.tgname, tg.tgtype, tg.tgargs, tg.oid;
`;
};

const deleteTriggerByName = ({ triggerName, tableName, schema }) => {
  return `DROP TRIGGER IF EXISTS ${triggerName} ON ${
    schema || public
  }.${tableName};
`;
};

module.exports = {
  replaceTriggerNameInQuery,
  generateCreateTriggerQuery,
  generateCreateChannelQuery,
  getAllTriggersFromDBQuery,
  getTriggerByName,
  deleteTriggerByName,
};
