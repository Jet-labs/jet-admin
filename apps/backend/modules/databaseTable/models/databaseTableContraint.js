class DatabaseTableConstraint {
  constructor({
    constraintName,
    constraintSchema,
    constraintType,
    databaseTableName,
    databaseTableColumns,
    referencedTable,
    referencedColumns,
    onUpdate,
    onDelete,
  }) {
    this.constraintName = constraintName;
    this.constraintSchema = constraintSchema;
    this.constraintType = constraintType;
    this.databaseTableName = databaseTableName;
    this.databaseTableColumns = databaseTableColumns; // Array of column names
    this.referencedTable = referencedTable; // For FOREIGN KEY
    this.referencedColumns = referencedColumns; // For FOREIGN KEY
    this.onUpdate = onUpdate; // For FOREIGN KEY (e.g., CASCADE)
    this.onDelete = onDelete; // For FOREIGN KEY (e.g., SET NULL)
  }

  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DatabaseTableConstraint(item);
      });
    }
  };
}

module.exports = {DatabaseTableConstraint}
