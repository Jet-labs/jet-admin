export class DatabaseTableColumn {
  constructor({
    udtName,
    databaseTableColumnName,
    isID,
    isList,
    defaultValue,
    notNull,
    unique,
    primaryKey,
    check,
  }) {
    this.databaseTableColumnType = udtName;
    this.databaseTableColumnName = databaseTableColumnName;
    this.isID = isID;
    this.isList = isList;
    this.defaultValue = defaultValue;
    this.notNull = Boolean(notNull);
    this.unique = Boolean(unique);
    this.primaryKey = Boolean(primaryKey);
    this.check = check;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DatabaseTableColumn(item);
      });
    }
  };
}
