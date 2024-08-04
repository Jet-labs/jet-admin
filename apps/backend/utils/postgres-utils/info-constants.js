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
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size,
    column_count,
    row_estimate
    
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
  //   TABLE_SIZE: {
  //     result_type: "array",
  //     raw_query: `SELECT
  //     table_schema || '.' || table_name AS table_full_name,
  //     pg_size_pretty(pg_total_relation_size(table_schema || '.' || table_name)) AS total_size
  // FROM information_schema.tables
  // WHERE table_type = 'BASE TABLE'
  // ORDER BY pg_total_relation_size(table_schema || '.' || table_name) DESC;`,
  //   },
  TABLE_STATS: {
    raw_query: `SELECT 
    schemaname, 
    tablename, 
    attname, 
    null_frac, 
    avg_width, 
    n_distinct, 
    most_common_vals::text AS most_common_vals, 
    most_common_freqs, 
    histogram_bounds::text AS histogram_bounds, 
    correlation 
FROM pg_stats;
`,
    result_type: "array",
  },
};

module.exports = { SCHEMA_INFO_CONSTANTS };
