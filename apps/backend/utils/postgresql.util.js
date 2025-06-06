const constants = require("../constants");
const Logger = require("./logger");

const postgreSQLParserUtil = {};

postgreSQLParserUtil.generateFilterQuery = (filterModel) => {
  if (!filterModel) return null;
  if (typeof filterModel !== "object" || filterModel === null) {
    console.warn("Invalid filterModel format.");
    return null;
  }

  const operator = Object.keys(filterModel)[0];
  const value = filterModel[operator];

  switch (operator) {
    case "AND":
      return (
        "(" +
        value.map(postgreSQLParserUtil.generateFilterQuery).join(" AND ") +
        ")"
      );
    case "OR":
      return (
        "(" +
        value.map(postgreSQLParserUtil.generateFilterQuery).join(" OR ") +
        ")"
      );
    case "NOT":
      return "NOT (" + postgreSQLParserUtil.generateFilterQuery(value) + ")";
    default:
      // Here, assume the operator is a field name with some filterModel
      const field = `"${operator}"`;
      const filterModelKey = Object.keys(value)[0];
      const filterModelValue = value[filterModelKey];
      const query = constants.TABLE_FILTERS[
        String(filterModelKey).toUpperCase()
      ](field, filterModelValue);
      return query;
  }
};

postgreSQLParserUtil.processDatabaseQuery = ({
  databaseQueryString,
  databaseQueryArgValues,
}) => {
  // Validate input
  if (typeof databaseQueryString !== "string") {
    throw new TypeError(
      "The 'databaseQueryString' parameter must be a string."
    );
  }
  if (databaseQueryArgValues && typeof databaseQueryArgValues !== "object") {
    throw new TypeError(
      "The 'databaseQueryArgValues' parameter must be an object or undefined."
    );
  }

  const paramNames = [];
  const processedQuery = databaseQueryString.replace(
    /\$\{(\w+)\}/g,
    (_, name) => {
      // Ensure the placeholder name is valid
      if (!/^\w+$/.test(name)) {
        throw new Error(`Invalid placeholder name: \${${name}}`);
      }
      paramNames.push(name);
      return `$${paramNames.length}`; // Replace with positional parameter
    }
  );

  // Extract values for placeholders
  const values = paramNames.map((name) => {
    if (
      !databaseQueryArgValues ||
      !Object.prototype.hasOwnProperty.call(databaseQueryArgValues, name)
    ) {
      throw new Error(`Missing value for placeholder: \${${name}}`);
    }
    return databaseQueryArgValues[name];
  });

  return { query: processedQuery, values };
};

const postgreSQLQueryUtil = {};

postgreSQLQueryUtil.getDatabaseMetadataQuery = () => {
  return `SELECT jsonb_agg(result) AS metadata
FROM (
    SELECT
        jsonb_build_object(
            'databaseSchemaName', schema_name,
            'tables', (
                SELECT jsonb_agg(jsonb_build_object(
                    'databaseTableName', table_name,
                    'databaseTableColumns', (
                        SELECT jsonb_agg(jsonb_build_object(
                            'databaseTableColumnName', column_name,
                            'databaseTableColumnType', data_type
                        ))
                        FROM information_schema.columns c
                        WHERE c.table_schema = s.schema_name AND c.table_name = t.table_name
                    )
                ))
                FROM information_schema.tables t
                WHERE t.table_schema = s.schema_name AND t.table_type = 'BASE TABLE' -- Filter for base tables only
            ),
            'views', (
                SELECT jsonb_agg(table_name)
                FROM information_schema.views v
                WHERE v.table_schema = s.schema_name
            ),
            'enums', (
                SELECT jsonb_agg(jsonb_build_object(
                    'enum_name', e.enum_name,
                    'values', e.enum_values
                ))
                FROM (
                    SELECT t.typname AS enum_name,
                           array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = s.schema_name
                    GROUP BY t.typname
                ) e
            )
        ) AS result
    FROM information_schema.schemata s
    WHERE s.schema_name NOT IN ('pg_catalog', 'information_schema')
) subquery;
`;
};

postgreSQLQueryUtil.getDatabaseMetadataForTenantQuery = () => {
  return `SELECT jsonb_agg(result) AS metadata
FROM (
    SELECT
        jsonb_build_object(
            'databaseSchemaName', schema_name,
            'tables', (
                SELECT jsonb_agg(jsonb_build_object(
                    'databaseTableName', table_name
                ))
                FROM information_schema.tables t
                WHERE t.table_schema = s.schema_name AND t.table_type = 'BASE TABLE' -- Filter for base tables only
            ),
            'views', (
                SELECT jsonb_agg(table_name)
                FROM information_schema.views v
                WHERE v.table_schema = s.schema_name
            ),
            'enums', (
                SELECT jsonb_agg(jsonb_build_object(
                    'enum_name', e.enum_name,
                    'values', e.enum_values
                ))
                FROM (
                    SELECT t.typname AS enum_name,
                           array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = s.schema_name
                    GROUP BY t.typname
                ) e
            )
        ) AS result
    FROM information_schema.schemata s
    WHERE s.schema_name NOT IN ('pg_catalog', 'information_schema')
) subquery;
`;
};

postgreSQLQueryUtil.getDatabaseMetadataForAIQuery = () => {
  return `WITH
  -- 1. Get columns, types, defaults, and primary keys using pg_catalog
  all_columns AS (
    SELECT
      n.nspname AS table_schema,
      c.relname AS table_name,
      a.attname AS column_name,
      a.attnum AS ordinal_position,
      CASE
        WHEN t.typname = 'varchar' THEN 'VARCHAR(' || 
          CASE WHEN a.atttypmod - 4 > 0 THEN (a.atttypmod - 4)::text ELSE 'max' END || ')'
        WHEN t.typname = 'bpchar' THEN 'CHAR(' || 
          CASE WHEN a.atttypmod - 4 > 0 THEN (a.atttypmod - 4)::text ELSE '1' END || ')'
        WHEN t.typname IN ('numeric', 'decimal') THEN 
          'NUMERIC(' || 
          ((a.atttypmod - 4) >> 16)::text || ',' || 
          ((a.atttypmod - 4) & 65535)::text || ')'
        WHEN t.typname = 'int4' THEN 'INT'
        WHEN t.typname = 'int8' THEN 'BIGINT'
        WHEN t.typname = 'int2' THEN 'SMALLINT'
        WHEN t.typname = 'timestamp' THEN 'TIMESTAMP'
        WHEN t.typname = 'timestamptz' THEN 'TIMESTAMPTZ'
        WHEN t.typname = 'date' THEN 'DATE'
        WHEN t.typname = 'time' THEN 'TIME'
        WHEN t.typname = 'bool' THEN 'BOOLEAN'
        WHEN t.typname = 'uuid' THEN 'UUID'
        WHEN t.typname = 'jsonb' THEN 'JSONB'
        WHEN t.typname = 'json' THEN 'JSON'
        WHEN t.typname = 'text' THEN 'TEXT'
        ELSE t.typname
      END AS data_type_formatted,
      NOT a.attnotnull AS is_nullable,
      pg_get_expr(ad.adbin, ad.adrelid) AS column_default,
      EXISTS (
        SELECT 1 FROM pg_index i 
        WHERE i.indrelid = c.oid AND a.attnum = ANY(i.indkey) AND i.indisprimary
      ) AS is_primary_key
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_type t ON a.atttypid = t.oid
    LEFT JOIN pg_attrdef ad ON (a.attrelid = ad.adrelid AND a.attnum = ad.adnum)
    WHERE c.relkind IN ('r', 'p') -- Tables and partitioned tables
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND a.attnum > 0
      AND NOT a.attisdropped
  ),
  -- 2. Get UNIQUE and CHECK constraints from pg_constraint
  other_constraints AS (
    SELECT
      n.nspname AS table_schema,
      c.relname AS table_name,
      con.conname AS constraint_name,
      CASE con.contype
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
      END AS constraint_type,
      CASE WHEN con.contype = 'u' THEN
        ARRAY(
          SELECT a.attname
          FROM unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
          JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
          ORDER BY k.ord
        )
      END AS constraint_columns,
      CASE WHEN con.contype = 'c' THEN pg_get_constraintdef(con.oid) END AS check_clause
    FROM pg_constraint con
    JOIN pg_class c ON con.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE con.contype IN ('u', 'c')
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ),
  -- 3. Get FOREIGN KEY relationships using pg_catalog
  foreign_keys AS (
    SELECT
      con.conname AS constraint_name,
      n.nspname AS table_schema,
      c.relname AS table_name,
      ARRAY(
        SELECT a.attname
        FROM unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
        ORDER BY k.ord
      ) AS columns,
      fn.nspname AS foreign_table_schema,
      fc.relname AS foreign_table_name,
      ARRAY(
        SELECT a.attname
        FROM unnest(con.confkey) WITH ORDINALITY AS k(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum
        ORDER BY k.ord
      ) AS foreign_columns
    FROM pg_constraint con
    JOIN pg_class c ON con.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_class fc ON con.confrelid = fc.oid
    JOIN pg_namespace fn ON fc.relnamespace = fn.oid
    WHERE con.contype = 'f'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ),
  -- 4. Get VIEW definitions using pg_catalog
  views_info AS (
    SELECT
      n.nspname AS table_schema,
      c.relname AS view_name,
      pg_get_viewdef(c.oid, true) AS view_definition
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relkind = 'v' -- Views
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  )

-- Combine results into a unified format
SELECT
    'column' AS item_type,
    table_schema AS schema_name,
    table_name AS object_name,
    column_name,
    ordinal_position,
    data_type_formatted AS data_type,
    is_nullable,
    column_default,
    is_primary_key,
    NULL::text AS constraint_name,
    NULL::text AS constraint_type,
    NULL::text[] AS constraint_columns,
    NULL::text AS check_clause,
    NULL::text AS foreign_schema,
    NULL::text AS foreign_table,
    NULL::text[] AS foreign_columns,
    NULL::text AS view_definition
FROM all_columns

UNION ALL

SELECT
    'constraint' AS item_type,
    table_schema,
    table_name,
    NULL, NULL, NULL, NULL, NULL, NULL,
    constraint_name,
    constraint_type,
    constraint_columns,
    check_clause,
    NULL, NULL, NULL, NULL
FROM other_constraints

UNION ALL

SELECT
    'foreign_key' AS item_type,
    table_schema,
    table_name,
    NULL, NULL, NULL, NULL, NULL, NULL,
    constraint_name,
    'FOREIGN KEY'::text,
    columns,
    NULL,
    foreign_table_schema,
    foreign_table_name,
    foreign_columns,
    NULL
FROM foreign_keys

UNION ALL

SELECT
    'view' AS item_type,
    table_schema,
    view_name,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    view_definition
FROM views_info

ORDER BY
  item_type,
  schema_name,
  object_name,
  ordinal_position,      -- Will naturally order columns by position
  constraint_name,       -- Orders constraints/FKs by name
  column_name;   
  `;
};

postgreSQLQueryUtil.getDatabaseTableColumnsQuery = ({
  databaseSchemaName = "public",
  databaseTableName,
}) => {
  // Add double quotes if the schema or table name contains special characters or is case-sensitive
  const quotedSchemaName =
    databaseSchemaName.includes('"') || /[A-Z]/.test(databaseSchemaName)
      ? `'${databaseSchemaName}'`
      : `'${databaseSchemaName}'`;
  const quotedTableName =
    databaseTableName.includes('"') || /[A-Z]/.test(databaseTableName)
      ? `'${databaseTableName}'`
      : `'${databaseTableName}'`;

  return `
    SELECT jsonb_agg(
        jsonb_build_object(
            'databaseTableColumnName', column_name,
            'databaseTableColumnType', data_type,
            'character_maximum_length', character_maximum_length,
            'numeric_precision', numeric_precision,
            'numeric_scale', numeric_scale,
            'is_nullable', is_nullable,
            'column_default', column_default
        )
    ) AS columns
    FROM information_schema.columns
    WHERE table_schema = ${quotedSchemaName}
      AND table_name = ${quotedTableName};
  `;
};

postgreSQLQueryUtil.createDatabaseSchemaQuery = ({ databaseSchemaName }) => {
  return `CREATE SCHEMA "${databaseSchemaName}";`;
};

postgreSQLQueryUtil.getAllDatabaseTables = ({
  databaseSchemaName = "public", // Default to "public" if not provided
}) =>
  `SELECT jsonb_agg(result) AS metadata
FROM (
    SELECT
        jsonb_build_object(
            'databaseTableName', t.table_name,
            'primaryKey', pk_data.primary_key_columns,
            'databaseTableColumns', (
                SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'databaseTableColumnName', c.column_name,
                    'databaseTableColumnType', c.data_type,
                    'isNullable', c.is_nullable,
                    'defaultValue', c.column_default
                ) ORDER BY c.ordinal_position), '[]'::jsonb)
                FROM information_schema.columns c
                WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name
            ),
            'databaseTableConstraints', (
                SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'constraintName', con.constraint_name,
                    'constraintType', con.constraint_type,
                    'databaseTableColumns', (
                        SELECT COALESCE(array_agg(kcu.column_name ORDER BY kcu.ordinal_position), ARRAY[]::TEXT[])
                        FROM information_schema.key_column_usage kcu
                        WHERE kcu.constraint_catalog = con.constraint_catalog
                          AND kcu.constraint_schema = con.constraint_schema
                          AND kcu.constraint_name = con.constraint_name
                          AND kcu.table_schema = t.table_schema -- Correlate with outer table's schema
                          AND kcu.table_name = t.table_name    -- Correlate with outer table's name
                    )
                )), '[]'::jsonb)
                FROM information_schema.table_constraints con
                WHERE con.table_schema = t.table_schema AND con.table_name = t.table_name
            )
        ) AS result
    FROM information_schema.tables t
    LEFT JOIN LATERAL (
        SELECT COALESCE(jsonb_agg(a.attname ORDER BY array_position(i.indkey, a.attnum)), '[]'::jsonb) AS primary_key_columns
        FROM pg_catalog.pg_index i
        JOIN pg_catalog.pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass
          AND i.indisprimary = TRUE
          AND a.attnum > 0 -- Only user-defined columns
          AND NOT a.attisdropped
    ) pk_data ON TRUE
    WHERE t.table_schema = '${databaseSchemaName}'
      AND t.table_type = 'BASE TABLE'
) subquery;
`;

postgreSQLQueryUtil.getDatabaseTableByName = ({
  databaseSchemaName = "public", // Default to "public" if not provided
  databaseTableName,
}) =>
  `SELECT jsonb_agg(result) AS metadata
FROM (
    SELECT
        jsonb_build_object(
            'databaseTableName', table_name,
            'primaryKey', (
                SELECT jsonb_agg(a.attname)
                FROM pg_index i
                JOIN pg_attribute a ON a.attnum = ANY(i.indkey) AND a.attrelid = i.indrelid
                WHERE i.indrelid = ('${databaseSchemaName}' || '.' || quote_ident(t.table_name))::regclass
                  AND i.indisprimary
            ),
            'databaseTableColumns', (
                SELECT jsonb_agg(jsonb_build_object(
                    'databaseTableColumnName', c.column_name,
                    'databaseTableColumnType', c.data_type,
                    'udtName', c.udt_name,
                    'defaultValue', c.column_default,
                    'notNull', c.is_nullable = 'NO',
                    'unique', EXISTS (
                        SELECT 1
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        WHERE tc.constraint_type = 'UNIQUE'
                          AND tc.table_schema = '${databaseSchemaName}'
                          AND tc.table_name = t.table_name
                          AND kcu.column_name = c.column_name
                    ),
                    'primaryKey', EXISTS (
                        SELECT 1
                        FROM pg_index i
                        JOIN pg_attribute a ON a.attnum = ANY(i.indkey) AND a.attrelid = i.indrelid
                        WHERE i.indrelid = ('${databaseSchemaName}' || '.' || quote_ident(t.table_name))::regclass
                          AND i.indisprimary
                          AND a.attname = c.column_name
                    ),
                    'check', (
                        SELECT cc.check_clause
                        FROM information_schema.check_constraints cc
                        JOIN information_schema.constraint_column_usage cu
                          ON cc.constraint_name = cu.constraint_name
                          AND cc.constraint_schema = cu.constraint_schema
                        WHERE cu.table_schema = '${databaseSchemaName}'
                          AND cu.table_name = t.table_name
                          AND cu.column_name = c.column_name
                    )
                ))
                FROM information_schema.columns c
                WHERE c.table_schema = '${databaseSchemaName}' AND c.table_name = t.table_name
            ),
            'databaseTableConstraints', (
                SELECT jsonb_agg(jsonb_build_object(
                    'constraintSchema', con.constraint_schema,
                    'constraintName', con.constraint_name,
                    'constraintType', con.constraint_type,
                    'databaseTableColumns', (
                        SELECT array_agg(k.column_name)
                        FROM information_schema.key_column_usage k
                        WHERE k.constraint_name = con.constraint_name
                          AND k.table_name = t.table_name
                          AND k.table_schema = '${databaseSchemaName}'
                    ),
                    'referencedTable', 
                        CASE WHEN con.constraint_type = 'FOREIGN KEY' THEN
                            (SELECT kcu.table_name
                             FROM information_schema.referential_constraints rc
                             JOIN information_schema.key_column_usage kcu
                                ON rc.unique_constraint_name = kcu.constraint_name
                                AND rc.unique_constraint_schema = kcu.constraint_schema
                             WHERE rc.constraint_name = con.constraint_name
                               AND rc.constraint_schema = con.constraint_schema
                             LIMIT 1)
                        END,
                    'referencedColumns', 
                        CASE WHEN con.constraint_type = 'FOREIGN KEY' THEN
                            (SELECT array_agg(kcu.column_name)
                             FROM information_schema.referential_constraints rc
                             JOIN information_schema.key_column_usage kcu
                                ON rc.unique_constraint_name = kcu.constraint_name
                                AND rc.unique_constraint_schema = kcu.constraint_schema
                             WHERE rc.constraint_name = con.constraint_name
                               AND rc.constraint_schema = con.constraint_schema)
                        END,
                    'onDelete', 
                        CASE WHEN con.constraint_type = 'FOREIGN KEY' THEN
                            (SELECT rc.delete_rule
                             FROM information_schema.referential_constraints rc
                             WHERE rc.constraint_name = con.constraint_name
                               AND rc.constraint_schema = con.constraint_schema
                             LIMIT 1)
                        END,
                    'onUpdate', 
                        CASE WHEN con.constraint_type = 'FOREIGN KEY' THEN
                            (SELECT rc.update_rule
                             FROM information_schema.referential_constraints rc
                             WHERE rc.constraint_name = con.constraint_name
                               AND rc.constraint_schema = con.constraint_schema
                             LIMIT 1)
                        END
                ))
                FROM information_schema.table_constraints con
                WHERE con.table_schema = '${databaseSchemaName}' AND con.table_name = t.table_name
            )
        ) AS result
    FROM information_schema.tables t
    WHERE t.table_schema = '${databaseSchemaName}' AND t.table_name = '${databaseTableName}'
) subquery;`;

postgreSQLQueryUtil.getDatabaseTableRows = ({
  databaseSchemaName = "public", // Default to "public" if not provided
  databaseTableName,
  orderBy,
  filter,
  limit,
  skip,
}) => {
  let _q = "";

  // Safely quote schema and table names to handle case sensitivity
  const tableReference = databaseSchemaName
    ? `"${databaseSchemaName}"."${databaseTableName}"`
    : `"${databaseTableName}"`;

  // Base query with optional filter
  if (filter) {
    _q = `SELECT ctid, * FROM ${tableReference} WHERE ${filter}`;
  } else {
    _q = `SELECT ctid, * FROM ${tableReference}`;
  }

  // Add ORDER BY if provided and valid
  if (orderBy && typeof orderBy === "string" && orderBy.trim() !== "") {
    _q = `${_q} ORDER BY ${orderBy}`;
  }

  // Add LIMIT if provided
  if (limit) {
    _q = `${_q} LIMIT ${limit}`;
  }

  // Add OFFSET if provided
  if (skip) {
    _q = `${_q} OFFSET ${skip}`;
  }

  return _q;
};

postgreSQLQueryUtil.getDatabaseTableStatistics = ({
  databaseSchemaName = "public", // Default to "public" if not provided
  databaseTableName,
  filter,
}) => {
  let _q = "";
  const tableReference = databaseSchemaName
    ? `"${databaseSchemaName}"."${databaseTableName}"`
    : `"${databaseTableName}"`;

  if (filter) {
    _q = `SELECT COUNT(*) FROM ${tableReference} WHERE ${filter}`;
  } else {
    _q = `SELECT COUNT(*) FROM ${tableReference}`;
  }

  return _q;
};

postgreSQLQueryUtil.databaseTableBulkRowUpdate = ({
  databaseSchemaName = "public",
  databaseTableName,
  databaseTableRowData,
}) => {
  const _databaseTableName = `"${databaseSchemaName}"."${databaseTableName}"`;

  // Helper function to properly format values for PostgreSQL
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "NULL";
    }

    // Handle Date objects (convert to ISO and wrap with TIMESTAMP)
    if (value instanceof Date) {
      const isoString = value
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, "");
      return `TIMESTAMP '${isoString}'`;
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }

    // Handle numeric values
    if (typeof value === "number") {
      if (Number.isNaN(value) || !Number.isFinite(value)) {
        throw new Error(`Invalid numeric value for PostgreSQL: ${value}`);
      }
      return value.toString();
    }

    // Handle Buffer (convert to bytea hex format)
    if (Buffer.isBuffer(value)) {
      return `'\\x${value.toString("hex")}'`;
    }

    // Handle arrays (convert to PostgreSQL array format)
    if (Array.isArray(value)) {
      const elements = value.map((element) => formatValue(element)).join(", ");
      return `ARRAY[${elements}]`;
    }

    // Handle JSON objects (convert to JSONB)
    if (typeof value === "object") {
      return `JSONB '${JSON.stringify(value).replace(/'/g, "''")}'`;
    }

    // Handle string values (escape single quotes)
    return `'${value.replace(/'/g, "''")}'`;
  };

  return databaseTableRowData.map(({ data, query }) => {
    const setClause = Object.entries(data)
      .map(([key, value]) => `"${key}" = ${formatValue(value)}`)
      .join(", ");

    return `UPDATE ${_databaseTableName} SET ${setClause} WHERE ${query};`;
  });
};

postgreSQLQueryUtil.databaseTableBulkRowAddition = ({
  databaseSchemaName = "public",
  databaseTableName,
  databaseTableColumns,
  databaseTableRowData,
}) => {
  if (
    !Array.isArray(databaseTableRowData) ||
    databaseTableRowData.length === 0
  ) {
    console.warn("No data provided for insertion.");
    return "-- No data to insert";
  }

  const _databaseTableName = `"${databaseSchemaName}"."${databaseTableName}"`;

  const valuesClause = databaseTableRowData
    .map((row) => {
      if (typeof row !== "object" || row === null) {
        throw new Error("Each row must be an object.");
      }
      return `(${databaseTableColumns
        .map((column) => {
          const columnName = column.databaseTableColumnName;
          const value = row[columnName];
          const notNull = column.notNull;
          const hasDefault = column.defaultValue != null;

          // Handle NULL/undefined values
          if (value === null || value === undefined) {
            if (notNull) {
              // Non-nullable column
              if (hasDefault) {
                return "DEFAULT";
              } else {
                throw new Error(
                  `Non-nullable column '${columnName}' requires a value (no default available).`
                );
              }
            } else {
              return "NULL"; // Nullable column with NULL value
            }
          }

          // Handle non-null values
          if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
          } else if (typeof value === "boolean") {
            return value ? "TRUE" : "FALSE"; // PostgreSQL boolean handling
          } else if (value instanceof Date) {
            return `'${value.toISOString()}'`; // Convert dates to ISO format
          } else if (typeof value === "object" && value !== null) {
            const jsonString = JSON.stringify(value);
            // Escape single quotes within the JSON string for the SQL literal
            const escapedJsonString = jsonString.replace(/'/g, "''");
            // Return the escaped JSON string enclosed in SQL single quotes and cast
            return `'${escapedJsonString}'::json`; // Or ::jsonb if that's the column type
          } else {
            return value;
          }
        })
        .join(", ")})`;
    })
    .join(", ");

  const query = `INSERT INTO ${_databaseTableName} (${databaseTableColumns
    .map((column) => `"${column.databaseTableColumnName}"`)
    .join(", ")}) VALUES ${valuesClause};`;

  console.log("Generated Query:", query);
  return query;
};

postgreSQLQueryUtil.databaseTableBulkRowDelete = ({
  databaseSchemaName = "public", // Default schema is 'public'
  databaseTableName,
  query, // Optional: If not provided, delete all rows
}) => {
  // Validate required inputs
  if (!databaseTableName) {
    throw new Error("Missing required parameter: databaseTableName.");
  }

  // Sanitize schema and table names to prevent SQL injection
  const sanitizedSchemaName = sanitizeIdentifier(databaseSchemaName);
  const sanitizedTableName = sanitizeIdentifier(databaseTableName);

  // Construct the DELETE query
  if (query) {
    // Delete rows based on the provided query
    return `
      DELETE FROM "${sanitizedSchemaName}"."${sanitizedTableName}"
      WHERE ${query};
    `;
  } else {
    // Delete all rows if no query is provided
    return `
      DELETE FROM "${sanitizedSchemaName}"."${sanitizedTableName}";
    `;
  }
};

postgreSQLQueryUtil.databaseTableBulkRowExport = ({
  databaseSchemaName = "public", // Default schema is 'public'
  databaseTableName,
  query, // Optional: If not provided, export all rows
}) => {
  // Validate required inputs
  if (!databaseTableName) {
    throw new Error("Missing required parameter: databaseTableName.");
  }

  // Sanitize schema and table names to prevent SQL injection
  const sanitizedSchemaName = sanitizeIdentifier(databaseSchemaName);
  const sanitizedTableName = sanitizeIdentifier(databaseTableName);

  // Construct the DELETE query
  if (query) {
    // Export rows based on the provided query
    return `
      SELECT * FROM "${sanitizedSchemaName}"."${sanitizedTableName}"
      WHERE ${query};
    `;
  } else {
    // Export all rows if no query is provided
    return `
      SELECT * FROM "${sanitizedSchemaName}"."${sanitizedTableName}";
    `;
  }
};

// Helper function to sanitize identifiers (schema/table names)
function sanitizeIdentifier(identifier) {
  if (!/^[\w\d_]+$/.test(identifier)) {
    throw new Error(
      `Invalid identifier: ${identifier}. Identifiers must only contain alphanumeric characters and underscores.`
    );
  }
  return identifier;
}

postgreSQLQueryUtil.getAllDatabaseTriggers = ({
  databaseSchemaName = "public", // Default schema is "public"
}) => {
  // Sanitize the schema name to prevent SQL injection
  const escapeString = (str) => str.replace(/'/g, "''"); // Escape single quotes
  const sanitizedSchemaName = escapeString(databaseSchemaName);

  return `
    WITH trigger_events AS (
      SELECT
          ns.nspname AS "databaseSchemaName",
          cls.relname AS "databaseTableName",
          tg.tgname AS "databaseTriggerName",
          CASE
              WHEN (tg.tgtype::integer & 1) <> 0 THEN 'BEFORE'
              WHEN (tg.tgtype::integer & 2) <> 0 THEN 'AFTER'
              WHEN (tg.tgtype::integer & 4) <> 0 THEN 'INSTEAD OF'
              ELSE 'UNKNOWN'
          END AS "triggerTiming",
          unnest(array[
              CASE WHEN (tg.tgtype::integer & 16) <> 0 THEN 'INSERT' ELSE NULL END,
              CASE WHEN (tg.tgtype::integer & 32) <> 0 THEN 'DELETE' ELSE NULL END,
              CASE WHEN (tg.tgtype::integer & 64) <> 0 THEN 'UPDATE' ELSE NULL END,
              CASE WHEN (tg.tgtype::integer & 128) <> 0 THEN 'TRUNCATE' ELSE NULL END
          ]) AS "triggerEvent",
          pg_get_triggerdef(tg.oid) AS "triggerDefinition"
      FROM
          pg_trigger tg
          JOIN pg_class cls ON tg.tgrelid = cls.oid
          JOIN pg_namespace ns ON cls.relnamespace = ns.oid
      WHERE
          NOT tg.tgisinternal
          AND ns.nspname = '${sanitizedSchemaName}' -- Filter by schema name
    )
    SELECT
        "databaseSchemaName",
        "databaseTableName",
        "databaseTriggerName",
        "triggerTiming",
        array_agg("triggerEvent") AS "triggerEvents",
        "triggerDefinition"
    FROM
        trigger_events
    GROUP BY
        "databaseSchemaName",
        "databaseTableName",
        "databaseTriggerName",
        "triggerTiming",
        "triggerDefinition";
  `;
};

postgreSQLQueryUtil.getDatabaseTriggerByName = ({
  databaseSchemaName = "public", // Default schema is "public"
  databaseTableName,
  databaseTriggerName,
}) => {
  // Validate inputs to ensure they are provided
  if (!databaseTriggerName) {
    throw new Error("The 'databaseTriggerName' parameter is required.");
  }
  if (!databaseTableName) {
    throw new Error("The 'databaseTableName' parameter is required.");
  }

  // Escape inputs to prevent SQL injection (basic sanitization)
  const escapeString = (str) => str.replace(/'/g, "''"); // Escape single quotes
  const sanitizedSchemaName = escapeString(databaseSchemaName);
  const sanitizedTableName = escapeString(databaseTableName);
  const sanitizedTriggerName = escapeString(databaseTriggerName);

  return `
    SELECT
        ns.nspname AS "databaseSchemaName", -- Schema name
        cls.relname AS "databaseTableName", -- Table name
        tg.tgname AS "databaseTriggerName", -- Trigger name
        CASE
            WHEN tg.tgtype & 2 > 0 THEN 'BEFORE'
            WHEN tg.tgtype & 4 > 0 THEN 'AFTER'
            WHEN tg.tgtype & 8 > 0 THEN 'INSTEAD OF'
            ELSE 'UNKNOWN'
        END AS "triggerTiming", -- BEFORE, AFTER, or INSTEAD OF
        ARRAY[
            CASE WHEN tg.tgtype & 16 > 0 THEN 'INSERT' ELSE NULL END,
            CASE WHEN tg.tgtype & 32 > 0 THEN 'DELETE' ELSE NULL END,
            CASE WHEN tg.tgtype & 64 > 0 THEN 'UPDATE' ELSE NULL END,
            CASE WHEN tg.tgtype & 128 > 0 THEN 'TRUNCATE' ELSE NULL END
        ]::text[] AS "triggerEvents", -- Array of events
        CASE
            WHEN tg.tgtype & 1 > 0 THEN 'ROW'
            ELSE 'STATEMENT'
        END AS "forEach", -- ROW or STATEMENT
        tg.tgqual AS "whenCondition", -- WHEN condition (if any)
        NULL AS "referencingOld", -- Optional alias for OLD rows
        NULL AS "referencingNew", -- Optional alias for NEW rows
        CASE
            WHEN tg.tgtype & 512 > 0 THEN TRUE
            ELSE FALSE
        END AS "deferrable", -- Whether the trigger is DEFERRABLE
        CASE
            WHEN tg.tgtype & 2048 > 0 THEN TRUE
            ELSE FALSE
        END AS "initiallyDeferred" -- Whether the trigger is INITIALLY DEFERRED
    FROM
        pg_trigger tg
        JOIN pg_class cls ON tg.tgrelid = cls.oid -- Table associated with the trigger
        JOIN pg_namespace ns ON cls.relnamespace = ns.oid -- Schema associated with the table
    WHERE
        NOT tg.tgisinternal -- Exclude internal system triggers
        AND tg.tgname = '${sanitizedTriggerName}' -- Inline variable for trigger name
        AND ns.nspname = '${sanitizedSchemaName}' -- Inline variable for schema name
        AND cls.relname = '${sanitizedTableName}'; -- Inline variable for table name
  `;
};

postgreSQLQueryUtil.deleteDatabaseTriggerByName = ({
  databaseSchemaName = "public", // Default schema is "public"
  databaseTableName,
  databaseTriggerName,
}) => {
  // Validate inputs to ensure they are provided
  if (!databaseTableName) {
    throw new Error("The 'databaseTableName' parameter is required.");
  }
  if (!databaseTriggerName) {
    throw new Error("The 'databaseTriggerName' parameter is required.");
  }

  // Escape inputs to prevent SQL injection (basic sanitization)
  const escapeString = (str) => str.replace(/'/g, "''"); // Escape single quotes

  const sanitizedSchemaName = escapeString(databaseSchemaName);
  const sanitizedTableName = escapeString(databaseTableName);
  const sanitizedTriggerName = escapeString(databaseTriggerName);

  return `
    DROP TRIGGER IF EXISTS ${sanitizedTriggerName} ON ${sanitizedSchemaName}.${sanitizedTableName};
  `;
};

postgreSQLQueryUtil.createDatabaseTrigger = ({
  databaseSchemaName = "public", // Default schema is "public"
  databaseTableName,
  databaseTriggerName,
  triggerTiming = "AFTER", // Options: BEFORE, AFTER, INSTEAD OF
  triggerEvents = ["INSERT"], // Array of events: INSERT, UPDATE, DELETE, TRUNCATE
  triggerFunctionName,
  forEach = "ROW", // Options: ROW, STATEMENT
  whenCondition = null, // Optional: Conditional expression for WHEN clause
  referencingOld = null, // Optional: Alias for OLD rows (for INSTEAD OF triggers)
  referencingNew = null, // Optional: Alias for NEW rows (for INSTEAD OF triggers)
  deferrable = false, // Optional: Whether the trigger is DEFERRABLE
  initiallyDeferred = false, // Optional: Whether the trigger is INITIALLY DEFERRED
}) => {
  // Validate trigger timing
  const validTimings = ["BEFORE", "AFTER", "INSTEAD OF"];
  if (!validTimings.includes(triggerTiming.toUpperCase())) {
    throw new Error(
      `Invalid trigger timing: ${triggerTiming}. Valid options are: ${validTimings.join(
        ", "
      )}`
    );
  }

  // Validate trigger events
  const validEvents = ["INSERT", "UPDATE", "DELETE", "TRUNCATE"];
  const invalidEvents = triggerEvents.filter(
    (event) => !validEvents.includes(event.toUpperCase())
  );
  if (invalidEvents.length > 0) {
    throw new Error(
      `Invalid trigger events: ${invalidEvents.join(
        ", "
      )}. Valid options are: ${validEvents.join(", ")}`
    );
  }

  // Format trigger events as a comma-separated string
  const formattedEvents = triggerEvents
    .map((event) => event.toUpperCase())
    .join(" OR ");

  // Build REFERENCING clause (for INSTEAD OF triggers)
  let referencingClause = "";
  if (referencingOld || referencingNew) {
    referencingClause = "REFERENCING ";
    if (referencingOld) referencingClause += `OLD TABLE AS ${referencingOld} `;
    if (referencingNew) referencingClause += `NEW TABLE AS ${referencingNew} `;
  }

  // Build WHEN clause
  let whenClause = "";
  if (whenCondition) {
    whenClause = `WHEN (${whenCondition})`;
  }

  // Build DEFERRABLE clause
  let deferrableClause = "";
  if (deferrable) {
    deferrableClause = "DEFERRABLE";
    if (initiallyDeferred) {
      deferrableClause += " INITIALLY DEFERRED";
    }
  }

  return `
    CREATE TRIGGER ${databaseTriggerName}
    ${triggerTiming.toUpperCase()} ${formattedEvents}
    ON ${databaseSchemaName}.${databaseTableName}
    FOR EACH ${forEach.toUpperCase()}
    ${referencingClause}
    ${whenClause}
    ${deferrableClause}
    EXECUTE FUNCTION ${triggerFunctionName}();
  `.trim();
};

postgreSQLQueryUtil.createDatabaseTableQuery = ({
  databaseSchemaName = "public", // Default schema is 'public'
  databaseTableData,
}) => {
  const {
    databaseTableName,
    ifNotExists,
    temporary,
    unlogged,
    global,
    local,
    ofType,
    databaseTableColumns,
    databaseTableConstraints,
    partiotionBy, // Typo: Should be partitionBy
    partitions,
    inherits,
    storageOptions,
    onCommit,
  } = databaseTableData;

  // Validation: Ensure required fields are present
  if (
    !databaseTableName ||
    !databaseTableColumns ||
    !Array.isArray(databaseTableColumns) ||
    databaseTableColumns.length === 0
  ) {
    throw new Error(
      "Invalid input: 'databaseTableName' and 'databaseTableColumns' are required."
    );
  }

  // Helper function to safely quote identifiers for case sensitivity
  const quoteIdentifier = (identifier) => {
    if (!identifier) return identifier;
    // Quote identifiers that contain special characters, spaces, or are reserved keywords
    const needsQuoting =
      /[^a-zA-Z0-9_]/.test(identifier) ||
      identifier.toUpperCase() !== identifier;
    return needsQuoting ? `"${identifier}"` : identifier;
  };

  // Combine schema name and table name
  const fullTableName = `${quoteIdentifier(
    databaseSchemaName
  )}.${quoteIdentifier(databaseTableName)}`;

  // Initialize the table creation statement
  let sql = "CREATE";

  // Add modifiers for temporary/unlogged tables
  if (temporary) sql += " TEMPORARY";
  if (unlogged) sql += " UNLOGGED";
  if (global) sql += " GLOBAL";
  if (local) sql += " LOCAL";

  // Add table keyword
  sql += " TABLE";

  // Add "IF NOT EXISTS" if the option is checked
  if (ifNotExists) sql += " IF NOT EXISTS";

  // Add fully qualified table name (schema.table)
  sql += ` ${fullTableName}`;

  // Add "OF typeName" if provided
  if (ofType) sql += ` OF ${quoteIdentifier(ofType)}`;

  // Start column definitions
  let columnDefinitions = databaseTableColumns
    .map((column) => {
      if (!column.databaseTableColumnName || !column.databaseTableColumnType) {
        throw new Error(
          `Invalid column definition: Missing 'databaseTableColumnName' or 'databaseTableColumnType'.`
        );
      }
      // Quote column name if necessary
      let colSQL = `${quoteIdentifier(column.databaseTableColumnName)} ${
        column.databaseTableColumnType
      }`;
      // Add constraints for the column
      if (column.notNull) colSQL += " NOT NULL";
      if (column.unique) colSQL += " UNIQUE";
      if (column.primaryKey) colSQL += " PRIMARY KEY";
      if (column.defaultValue) colSQL += ` DEFAULT ${column.defaultValue}`;
      if (column.collation)
        colSQL += ` COLLATE ${quoteIdentifier(column.collation)}`;
      if (column.check) colSQL += ` CHECK(${column.check})`;
      // Add storage option
      if (column.storage && column.storage !== "DEFAULT") {
        colSQL += ` STORAGE ${column.storage}`;
      }
      return colSQL;
    })
    .join(", ");

  sql += ` (${columnDefinitions}`;

  // Add table constraints
  if (
    databaseTableConstraints.primaryKey &&
    databaseTableConstraints.primaryKey.length
  ) {
    sql += `, PRIMARY KEY (${databaseTableConstraints.primaryKey
      .map(quoteIdentifier)
      .join(", ")})`;
  }
  if (
    databaseTableConstraints.unique &&
    databaseTableConstraints.unique.length
  ) {
    databaseTableConstraints.unique.forEach((uniqueColumns) => {
      sql += `, UNIQUE (${uniqueColumns.databaseTableColumns
        .map(quoteIdentifier)
        .join(", ")})`;
    });
  }
  if (databaseTableConstraints.check) {
    sql += `, CHECK (${databaseTableConstraints.check})`;
  }
  if (
    databaseTableConstraints.foreignKeys &&
    databaseTableConstraints.foreignKeys.length
  ) {
    databaseTableConstraints.foreignKeys.forEach((fk) => {
      sql += `, FOREIGN KEY (${fk.databaseTableColumns
        .map(quoteIdentifier)
        .join(", ")}) REFERENCES ${quoteIdentifier(
        fk.constraintSchema
      )}.${quoteIdentifier(fk.referencedTable)}(${fk.referencedColumns
        .map(quoteIdentifier)
        .join(", ")})`;
      // Add ON DELETE and ON UPDATE actions if provided
      if (fk.onDelete) sql += ` ON DELETE ${fk.onDelete}`;
      if (fk.onUpdate) sql += ` ON UPDATE ${fk.onUpdate}`;
    });
  }

  sql += `)`;

  // Add partitioning if provided
  if (partiotionBy) {
    sql += ` PARTITION BY ${partiotionBy}`;
    if (partitions && partitions.length) {
      sql += " (";
      sql += partitions
        .map(
          (partition) =>
            `${quoteIdentifier(partition.column)}${
              partition.expression ? ` USING (${partition.expression})` : ""
            }${partition.opclass ? ` ${partition.opclass}` : ""}${
              partition.collation
                ? ` COLLATE ${quoteIdentifier(partition.collation)}`
                : ""
            }`
        )
        .join(", ");
      sql += ")";
    }
  }

  // Add inheritance if provided
  if (inherits && inherits.length) {
    sql += ` INHERITS (${inherits.map(quoteIdentifier).join(", ")})`;
  }

  // Add storage options
  if (storageOptions?.tablespace) {
    sql += ` TABLESPACE ${quoteIdentifier(storageOptions.tablespace)}`;
  }
  if (
    storageOptions?.storageParameters &&
    storageOptions?.storageParameters.length
  ) {
    sql += ` WITH (${storageOptions.storageParameters.join(", ")})`;
  }
  if (storageOptions?.withoutOids) {
    sql += " WITHOUT OIDS";
  }

  // Add ON COMMIT options for temporary tables
  if (onCommit) {
    sql += ` ON COMMIT ${onCommit}`;
  }

  // End the SQL statement with a semicolon
  sql += ";";

  return sql;
};

postgreSQLQueryUtil.updateDatabaseTableByNameQuery = ({
  databaseSchemaName = "public", // Default schema is 'public'
  currentTableData,
  updatedTableData,
}) => {
  const quoteIdentifier = (identifier) => {
    if (!identifier) return identifier;
    const needsQuoting =
      /[^a-zA-Z0-9_]/.test(identifier) ||
      identifier.toUpperCase() !== identifier;
    return needsQuoting ? `"${identifier}"` : identifier;
  };

  const fullTableName = `${quoteIdentifier(
    databaseSchemaName
  )}.${quoteIdentifier(currentTableData.databaseTableName)}`;

  const sqlStatements = [];

  // Helper to compare columns
  const currentColumnsMap = new Map(
    currentTableData.databaseTableColumns.map((col) => [
      col.databaseTableColumnName,
      col,
    ])
  );
  const updatedColumnsMap = new Map(
    updatedTableData.databaseTableColumns.map((col) => [
      col.databaseTableColumnName,
      col,
    ])
  );

  // Add new columns
  updatedTableData.databaseTableColumns.forEach((updatedColumn) => {
    if (!currentColumnsMap.has(updatedColumn.databaseTableColumnName)) {
      let colSQL = `ALTER TABLE ${fullTableName} ADD COLUMN ${quoteIdentifier(
        updatedColumn.databaseTableColumnName
      )} ${updatedColumn.databaseTableColumnType}`;
      if (updatedColumn.notNull) colSQL += " NOT NULL";
      if (updatedColumn.defaultValue)
        colSQL += ` DEFAULT ${updatedColumn.defaultValue}`;
      if (updatedColumn.collation)
        colSQL += ` COLLATE ${quoteIdentifier(updatedColumn.collation)}`;
      if (updatedColumn.check) colSQL += ` CHECK (${updatedColumn.check})`;
      sqlStatements.push(colSQL);
    }
  });

  // Drop removed columns
  currentTableData.databaseTableColumns.forEach((currentColumn) => {
    if (!updatedColumnsMap.has(currentColumn.databaseTableColumnName)) {
      sqlStatements.push(
        `ALTER TABLE ${fullTableName} DROP COLUMN ${quoteIdentifier(
          currentColumn.databaseTableColumnName
        )}`
      );
    }
  });

  // Modify existing columns
  currentTableData.databaseTableColumns.forEach((currentColumn) => {
    const updatedColumn = updatedColumnsMap.get(
      currentColumn.databaseTableColumnName
    );
    if (updatedColumn) {
      let changes = [];
      if (
        currentColumn.databaseTableColumnType !==
        updatedColumn.databaseTableColumnType
      ) {
        changes.push(`TYPE ${updatedColumn.databaseTableColumnType}`);
      }
      if (currentColumn.notNull !== updatedColumn.notNull) {
        changes.push(updatedColumn.notNull ? "SET NOT NULL" : "DROP NOT NULL");
      }
      if (currentColumn.defaultValue !== updatedColumn.defaultValue) {
        changes.push(
          updatedColumn.defaultValue
            ? `SET DEFAULT ${updatedColumn.defaultValue}`
            : "DROP DEFAULT"
        );
      }
      if (changes.length > 0) {
        sqlStatements.push(
          `ALTER TABLE ${fullTableName} ALTER COLUMN ${quoteIdentifier(
            currentColumn.databaseTableColumnName
          )} ${changes.join(", ")}`
        );
      }
    }
  });

  // Update constraints (e.g., primary key, unique, foreign keys)
  const addConstraintSQL = (constraintType, constraintDef) => {
    sqlStatements.push(
      `ALTER TABLE ${fullTableName} ADD CONSTRAINT ${quoteIdentifier(
        constraintDef.name
      )} ${constraintType} (${constraintDef.columns
        .map(quoteIdentifier)
        .join(", ")})`
    );
  };

  const dropConstraintSQL = (constraintName) => {
    sqlStatements.push(
      `ALTER TABLE ${fullTableName} DROP CONSTRAINT ${quoteIdentifier(
        constraintName
      )}`
    );
  };

  Logger.log("warning", {
    message: "postgreSQLQueryUtil:updateDatabaseTableByNameQuery:primarykey",
    params: {
      currentTableData,
      c: currentTableData.databaseTableConstraints.primaryKey,
      u: updatedTableData.databaseTableConstraints.primaryKey,
    },
  });

  // Compare and update primary key
  if (
    JSON.stringify(currentTableData.databaseTableConstraints.primaryKey) !==
    JSON.stringify(updatedTableData.databaseTableConstraints.primaryKey)
  ) {
    if (currentTableData.databaseTableConstraints.primaryKey?.length) {
      dropConstraintSQL(`${currentTableData.databaseTableName}_pkey`);
    }
    if (updatedTableData.databaseTableConstraints.primaryKey?.length) {
      addConstraintSQL("PRIMARY KEY", {
        name: `${updatedTableData.databaseTableName}_pkey`,
        columns: updatedTableData.databaseTableConstraints.primaryKey,
      });
    }
  }

  // Compare and update unique constraints
  updatedTableData.databaseTableConstraints?.unique?.forEach(
    (uniqueConstraint) => {
      const currentUnique =
        currentTableData.databaseTableConstraints.unique?.find(
          (u) =>
            JSON.stringify(u.databaseTableColumns) ===
            JSON.stringify(uniqueConstraint.databaseTableColumns)
        );
      if (!currentUnique) {
        addConstraintSQL("UNIQUE", {
          name: `${uniqueConstraint.databaseTableColumns.join("_")}_unique`,
          columns: uniqueConstraint.databaseTableColumns,
        });
      }
    }
  );

  currentTableData.databaseTableConstraints?.unique?.forEach(
    (uniqueConstraint) => {
      const updatedUnique =
        updatedTableData.databaseTableConstraints.unique.find(
          (u) => JSON.stringify(u) === JSON.stringify(uniqueConstraint)
        );
      if (!updatedUnique) {
        dropConstraintSQL(`${uniqueConstraint.join("_")}_unique`);
      }
    }
  );

  // Compare and update foreign keys
  updatedTableData.databaseTableConstraints?.foreignKeys?.forEach((fk) => {
    const currentFK =
      currentTableData.databaseTableConstraints.foreignKeys?.find(
        (f) => f.constraintName === fk.constraintName
      );
    if (!currentFK) {
      sqlStatements.push(`
        ALTER TABLE ${fullTableName}
        ADD CONSTRAINT ${quoteIdentifier(fk.constraintName)}
        FOREIGN KEY (${fk.databaseTableColumns.map(quoteIdentifier).join(", ")})
        REFERENCES ${quoteIdentifier(fk.constraintSchema)}.${quoteIdentifier(
        fk.referencedTable
      )}(${fk.referencedColumns.map(quoteIdentifier).join(", ")})
        ${fk.onDelete ? `ON DELETE ${fk.onDelete}` : ""}
        ${fk.onUpdate ? `ON UPDATE ${fk.onUpdate}` : ""}
      `);
    }
  });

  currentTableData.databaseTableConstraints?.foreignKeys?.forEach((fk) => {
    const updatedFK =
      updatedTableData.databaseTableConstraints.foreignKeys.find(
        (f) => f.constraintName === fk.constraintName
      );
    if (!updatedFK) {
      dropConstraintSQL(fk.constraintName);
    }
  });

  Logger.log("warning", {
    message: "postgreSQLQueryUtil:updateDatabaseTableByNameQuery:sqlStatements",
    params: {
      sqlStatements,
    },
  });
  return sqlStatements;
};
/**
 * Generates a SQL query to delete (drop) a database table.
 *
 * @param {Object} options - Configuration object for the drop table query.
 * @param {string} options.databaseSchemaName - The schema name of the table (default: 'public').
 * @param {string} options.databaseTableName - The name of the table to drop.
 * @param {boolean} [options.ifExists=false] - Whether to include "IF EXISTS" to avoid errors if the table doesn't exist.
 * @param {boolean} [options.cascade=false] - Whether to cascade the drop operation to dependent objects.
 * @returns {string} - The generated SQL query to drop the table.
 * @throws {Error} - Throws an error if required fields are missing or invalid.
 */
postgreSQLQueryUtil.deleteDatabaseTableQuery = ({
  databaseSchemaName = "public", // Default schema is 'public'
  databaseTableName,
  ifExists = false,
  cascade = false,
}) => {
  // Validation: Ensure required fields are present
  if (!databaseTableName) {
    throw new Error("Invalid input: 'databaseTableName' is required.");
  }

  // Helper function to safely quote identifiers for case sensitivity
  const quoteIdentifier = (identifier) => {
    if (!identifier) return identifier;
    // Quote identifiers that contain special characters, spaces, or are reserved keywords
    const needsQuoting =
      /[^a-zA-Z0-9_]/.test(identifier) ||
      identifier.toUpperCase() !== identifier;
    return needsQuoting ? `"${identifier}"` : identifier;
  };

  // Combine schema name and table name
  const fullTableName = `${quoteIdentifier(
    databaseSchemaName
  )}.${quoteIdentifier(databaseTableName)}`;

  // Initialize the table deletion statement
  let sql = "DROP TABLE";

  // Add "IF EXISTS" if the option is checked
  if (ifExists) sql += " IF EXISTS";

  // Add fully qualified table name (schema.table)
  sql += ` ${fullTableName}`;

  // Add CASCADE if specified
  if (cascade) sql += " CASCADE";

  // End the SQL statement with a semicolon
  sql += ";";

  return sql;
};

postgreSQLQueryUtil.createTblDatabaseQueriesTable = ({
  databaseSchemaName = "public",
}) => {
  // Properly quote schema name for identifiers
  const quotedSchemaName = `"${databaseSchemaName}"`;

  return `CREATE TABLE ${quotedSchemaName}."_tblDatabaseQueries" (
    databaseQueryID SERIAL NOT NULL PRIMARY KEY,
    createdAt TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabledAt TIMESTAMPTZ(6),
    isDisabled BOOLEAN DEFAULT false,
    databaseQueryTitle VARCHAR NOT NULL DEFAULT 'Untitled',
    databaseQueryDescription VARCHAR,
    databaseQueryData JSON,
    runOnLoad BOOLEAN
);`;
};

postgreSQLQueryUtil.createAutoupdateFunctionOnDatabaseQueriesTable = ({
  databaseSchemaName = "public",
}) => {
  const quotedSchemaName = `"${databaseSchemaName}"`;

  return `CREATE OR REPLACE FUNCTION ${quotedSchemaName}.updateTblDatabaseQueriesUpdatedAtColumn()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;
};

postgreSQLQueryUtil.createAutoupdateTriggerOnDatabaseQueriesTable = ({
  databaseSchemaName = "public",
}) => {
  const quotedSchemaName = `"${databaseSchemaName}"`;

  return `CREATE TRIGGER triggerUpdateTblDatabaseQueriesUpdatedAtColumn
BEFORE UPDATE ON ${quotedSchemaName}."tblDatabaseQueries"
FOR EACH ROW
EXECUTE FUNCTION ${quotedSchemaName}.updateTblDatabaseQueriesUpdatedAtColumn();`;
};

postgreSQLQueryUtil.checkIfTblDatabaseQueriesTableExist = ({
  databaseSchemaName = "public",
}) => {
  // Ensure schema name is properly quoted if it contains spaces or mixed cases
  const quotedSchemaName = `'${databaseSchemaName}'`;

  return `
    -- Check if the table 'tblDatabaseQueries' exists in the schema
    SELECT EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = ${quotedSchemaName}
        AND tablename = 'tblDatabaseQueries'
    ) AS isTableExists;
  `;
};


module.exports = { postgreSQLQueryUtil, postgreSQLParserUtil };
