const Logger = require("../logger");

const tableQueryUtils = {};

tableQueryUtils.generatePostgresCreateTableSQL = (tableData) => {
  const {
    table_name,
    if_not_exists,
    temporary,
    unlogged,
    global,
    local,
    of_type,
    columns,
    constraints,
    partition_by,
    partitions,
    inherits,
    storage_options,
    on_commit,
  } = tableData;

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
  if (if_not_exists) sql += " IF NOT EXISTS";

  // Add table name
  sql += ` ${table_name}`;

  // Add "OF type_name" if provided
  if (of_type) sql += ` OF ${of_type}`;

  // Start column definitions
  let columnDefinitions = columns
    .map((column) => {
      Logger.log("warning", {
        message: "t",
        params: { t: typeof column.column_name, m: column.column_name },
      });
      let colSQL = column.column_name + " " + column.data_type;

      // Add constraints for the column
      if (column.not_null) colSQL += " NOT NULL";
      if (column.unique) colSQL += " UNIQUE";
      if (column.primary_key) colSQL += " PRIMARY KEY";
      if (column.default) colSQL += ` DEFAULT ${column.default}`;
      if (column.collation) colSQL += ` COLLATE ${column.collation}`;
      if (column.check) colSQL += ` CHECK(${column.check})`;

      // Add storage option
      if (column.storage && column.storage !== "DEFAULT")
        colSQL += ` STORAGE ${column.storage}`;

      return colSQL;
    })
    .join(", ");

  sql += ` (${columnDefinitions}`;

  // Add table constraints
  if (constraints.primary_key.length) {
    sql += `, PRIMARY KEY (${constraints.primary_key.join(", ")})`;
  }
  if (constraints.unique.length) {
    constraints.unique.forEach((uniqueColumns) => {
      sql += `, UNIQUE (${uniqueColumns.join(", ")})`;
    });
  }
  if (constraints.check) {
    sql += `, CHECK (${constraints.check})`;
  }
  if (constraints.foreign_keys.length) {
    constraints.foreign_keys.forEach((fk) => {
      sql += `, FOREIGN KEY (${fk.columns.join(", ")}) REFERENCES ${
        fk.ref_table
      }(${fk.ref_columns.join(", ")})`;

      // Add ON DELETE and ON UPDATE actions if provided
      if (fk.on_delete) sql += ` ON DELETE ${fk.on_delete}`;
      if (fk.on_update) sql += ` ON UPDATE ${fk.on_update}`;
    });
  }

  sql += `)`;

  // Add partitioning if provided
  if (partition_by) {
    sql += ` PARTITION BY ${partition_by}`;
    if (partitions.length) {
      sql += " (";
      sql += partitions
        .map(
          (partition) =>
            `${partition.column} ${
              partition.expression ? `USING (${partition.expression})` : ""
            }${partition.opclass ? ` ${partition.opclass}` : ""}${
              partition.collation ? ` COLLATE ${partition.collation}` : ""
            }`
        )
        .join(", ");
      sql += ")";
    }
  }

  // Add inheritance if provided
  if (inherits.length) {
    sql += ` INHERITS (${inherits.join(", ")})`;
  }

  // Add storage options
  if (storage_options.tablespace) {
    sql += ` TABLESPACE ${storage_options.tablespace}`;
  }
  if (storage_options.storage_parameters.length) {
    sql += ` WITH (${storage_options.storage_parameters.join(", ")})`;
  }

  // Add WITHOUT OIDS if selected
  if (storage_options.without_oids) {
    sql += " WITHOUT OIDS";
  }

  // Add ON COMMIT options for temporary tables
  if (on_commit) {
    sql += ` ON COMMIT ${on_commit}`;
  }

  // End the SQL statement with a semicolon
  sql += ";";

  return sql;
};

tableQueryUtils.getAllTables = (schema) =>
  `SELECT table_name FROM information_schema.tables WHERE table_schema = '${
    schema ? schema : "public"
  }';`;

tableQueryUtils.getAllTableColumns = (schema) => `SELECT json_build_object(
    'tableName', cols.table_name,
    'name', column_name,
    'isRequired', (is_nullable = 'NO'),
    'isList', data_type='ARRAY',
    'isUnique', (SELECT COUNT(*) FROM information_schema.table_constraints tc
                 JOIN information_schema.constraint_column_usage ccu
                 ON ccu.constraint_name = tc.constraint_name
                 WHERE tc.table_name = cols.table_name
                 AND ccu.column_name = cols.column_name
                 AND tc.constraint_type = 'UNIQUE') > 0,
    'isId', (SELECT COUNT(*) FROM information_schema.table_constraints tc
             JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = tc.constraint_name
             WHERE tc.table_name = cols.table_name
             AND ccu.column_name = cols.column_name
             AND tc.constraint_type = 'PRIMARY KEY') > 0,
	'defaultValue', cols.column_default,
    'type', udt_name
  ) AS column_schema
  FROM information_schema.columns cols
  WHERE table_schema = '${schema ? schema : "public"}'
  ORDER BY cols.table_name, cols.ordinal_position;`;
  
tableQueryUtils.getTableColumns = () => `SELECT json_build_object(
    'name', column_name,
    'isRequired', (is_nullable = 'NO'),
    'isList', data_type='ARRAY',
    'isUnique', (SELECT COUNT(*) FROM information_schema.table_constraints tc
                 JOIN information_schema.constraint_column_usage ccu
                 ON ccu.constraint_name = tc.constraint_name
                 WHERE tc.table_name = cols.table_name
                 AND ccu.column_name = cols.column_name
                 AND tc.constraint_type = 'UNIQUE') > 0,
    'isId', (SELECT COUNT(*) FROM information_schema.table_constraints tc
             JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = tc.constraint_name
             WHERE tc.table_name = cols.table_name
             AND ccu.column_name = cols.column_name
             AND tc.constraint_type = 'PRIMARY KEY') > 0,
	'defaultValue', cols.column_default,
    'type', udt_name
) AS column_schema
FROM information_schema.columns cols
WHERE table_name = $1;`;

tableQueryUtils.getTableConstraints = () => `
SELECT json_build_object(
    'constraintName', tc.constraint_name,
    'constraintType', tc.constraint_type,
    'columns', (
        SELECT json_agg(kcu.column_name)
        FROM information_schema.key_column_usage kcu
        WHERE kcu.constraint_name = tc.constraint_name
        AND kcu.table_name = tc.table_name
    ),
    'foreignTable', (
        SELECT ccu.table_name
        FROM information_schema.constraint_column_usage ccu
        WHERE ccu.constraint_name = tc.constraint_name
    ),
    'foreignColumn', (
        SELECT json_agg(ccu.column_name)
        FROM information_schema.constraint_column_usage ccu
        WHERE ccu.constraint_name = tc.constraint_name
    ),
    'checkExpression', (
        SELECT check_clause 
        FROM information_schema.check_constraints cc
        WHERE cc.constraint_name = tc.constraint_name
    )
) AS constraint_schema
FROM information_schema.table_constraints tc
WHERE tc.table_name = $1;
`;

tableQueryUtils.getTablePrimaryKey = () => `SELECT kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_name = kcu.table_name
WHERE tc.constraint_type = 'PRIMARY KEY' 
AND tc.table_name = $1;`;

tableQueryUtils.getRowByID = (tableName, query, authorizedRows) =>
  `SELECT * FROM ${tableName} WHERE ${query} ${
    authorizedRows ? `AND ${authorizedRows}` : ""
  };`;
tableQueryUtils.getRowsByQuery = (tableName, query, authorizedRows) => {
  if (query) {
    return `SELECT * FROM ${tableName} WHERE ${query} ${
      authorizedRows ? `AND ${authorizedRows}` : ""
    };`;
  } else {
    return `SELECT * FROM ${tableName} ${
      authorizedRows ? `WHERE ${authorizedRows}` : ""
    };`;
  }
};

tableQueryUtils.getRows = ({
  tableName,
  authorizedRows,
  orderBy,
  filter,
  limit,
  skip,
}) => {
  let _q = "";
  if (filter && authorizedRows) {
    _q = `SELECT * FROM ${tableName} WHERE ${authorizedRows} AND ${filter}`;
  } else if (authorizedRows) {
    _q = `SELECT * FROM ${tableName} WHERE ${authorizedRows}`;
  } else {
    _q = `SELECT * FROM ${tableName}`;
  }
  if (orderBy) {
    _q = `${_q} ORDER BY ${orderBy}`;
  }
  if (limit) {
    _q = `${_q} LIMIT ${limit}`;
  }
  if (skip) {
    _q = `${_q} OFFSET ${skip}`;
  }
  return _q;
};

tableQueryUtils.getRowCount = ({ tableName, authorizedRows, filter }) => {
  let _q = "";
  if (filter && authorizedRows) {
    _q = `SELECT COUNT(*) FROM ${tableName} WHERE ${authorizedRows} AND ${filter}`;
  } else if (authorizedRows) {
    _q = `SELECT COUNT(*) FROM ${tableName} WHERE ${authorizedRows}`;
  } else {
    _q = `SELECT COUNT(*) FROM ${tableName}`;
  }
  return _q;
};

tableQueryUtils.addRow = (tableName, data) =>
  `INSERT INTO ${tableName} (${Object.keys(data)
    .map((key) => `"${key}"`)
    .join(", ")}) VALUES (${Object.values(data)
    .map((value) => value)
    .join(", ")});`;

tableQueryUtils.updateRowByID = (tableName, data, query, authorizedRows) =>
  `UPDATE ${tableName} SET ${Object.keys(data)
    .map((key) => {
      return `"${key}" = ${data[key]}`;
    })
    .join(",")} WHERE ${query} ${
    authorizedRows ? `AND ${authorizedRows}` : ""
  };`;

tableQueryUtils.deleteRows = (tableName, query, authorizedRows) =>
  `DELETE FROM ${tableName} WHERE ${query} ${
    authorizedRows ? `AND ${authorizedRows}` : ""
  };`;
module.exports = { tableQueryUtils };
