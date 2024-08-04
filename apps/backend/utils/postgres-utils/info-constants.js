const SCHEMA_INFO_CONSTANTS = {
  TABLE_INFO: {
    result_type: "array",
    raw_query: `WITH primary_keys AS (
    SELECT
        conrelid AS table_id,
        array_agg(attname) AS primary_key_columns
    FROM
        pg_constraint
        JOIN pg_attribute ON attnum = ANY(conkey)
    WHERE
        contype = 'p'
    GROUP BY conrelid
)
SELECT 
    schemaname AS schema,
    tablename AS table,
    tableowner AS owner,
    pg_total_relation_size(schemaname || '.' || tablename) AS size,
    column_count,
    row_estimate,
    COALESCE(array_to_string(primary_keys.primary_key_columns, ', '), 'No Primary Key') AS primary_key
FROM (
    SELECT 
        schemaname,
        tablename,
        tableowner,
        (SELECT COUNT(*) FROM pg_attribute WHERE attrelid = (schemaname || '.' || tablename)::regclass AND attnum > 0 AND NOT attisdropped) AS column_count,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (schemaname || '.' || tablename)::regclass) AS row_estimate,
        (schemaname || '.' || tablename)::regclass AS table_id
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
) AS table_info
LEFT JOIN primary_keys ON table_info.table_id = primary_keys.table_id;

`,
  },
};

module.exports = { SCHEMA_INFO_CONSTANTS };
