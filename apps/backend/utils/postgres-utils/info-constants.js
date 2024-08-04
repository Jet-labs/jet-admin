const SCHEMA_INFO_CONSTANTS = {
  TABLE_INFO: {
    raw_query: `SELECT 
    schemaname AS schema,
    tablename AS table,
    tableowner AS owner,
    tabletype AS type,
    pg_total_relation_size(schemaname || '.' || tablename) AS size,
    column_count,
    row_estimate
FROM (
    SELECT 
        schemaname,
        tablename,
        tableowner,
        tabletype,
        (SELECT COUNT(*) FROM pg_attribute WHERE attrelid = (schemaname || '.' || tablename)::regclass AND attnum > 0 AND NOT attisdropped) AS column_count,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (schemaname || '.' || tablename)::regclass) AS row_estimate
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
) AS table_info;
`,
  },
};

module.exports = { SCHEMA_INFO_CONSTANTS };
