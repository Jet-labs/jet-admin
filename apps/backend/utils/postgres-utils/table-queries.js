const tableQueryUtils = {};

tableQueryUtils.getTableColumns = () => `SELECT json_build_object(
    'name', column_name,
    'isRequired', (is_nullable = 'NO'),
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
    'type', data_type
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

tableQueryUtils.getRowByID = (tableName, authorizedRows) =>
  `SELECT * FROM ${tableName} WHERE ${authorizedRows};`;

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
  console.log({ _q });
  return _q;
};

module.exports = { tableQueryUtils };
