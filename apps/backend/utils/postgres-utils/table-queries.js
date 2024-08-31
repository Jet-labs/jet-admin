const tableQueryUtils = {};

tableQueryUtils.getAllTables = (schema) =>
  `SELECT table_name FROM information_schema.tables WHERE table_schema = '${
    schema ? schema : "public"
  }';`;
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
tableQueryUtils.getRowsByQuery = (tableName, query, authorizedRows) =>
  `SELECT * FROM ${tableName} WHERE ${query} ${
    authorizedRows ? `AND ${authorizedRows}` : ""
  };`;

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
