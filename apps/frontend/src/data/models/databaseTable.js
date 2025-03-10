import { DatabaseTableColumn } from "./databaseTableColumn";
import { DatabaseTableConstraint } from "./databaseTableContraint";

export class DatabaseTable {
  constructor({
    databaseTableColumns,
    databaseTableConstraints,
    databaseTableName,
    primaryKey,
  }) {
    this.databaseTableColumns = databaseTableColumns
      ? DatabaseTableColumn.toList(databaseTableColumns)
      : null;
    this.databaseTableConstraints = databaseTableConstraints
      ? DatabaseTableConstraint.toList(databaseTableConstraints)
      : null;
    this.databaseTableName = databaseTableName;
    this.primaryKey = primaryKey ? Array.from(primaryKey) : null;
    try {
      this.columnForeignKeyMap = this.mapColumnsToForeignKeys();
    } catch (e) {
      // console.log(e);
    }
  }

  /**
   * Maps databaseTableColumns to their related foreign keys.
   * @returns {Map<string, Array<DatabaseTableConstraint>>} A map where the key is the column name,
   *         and the value is an array of related foreign key constraints.
   */
  mapColumnsToForeignKeys() {
    const columnForeignKeyMap = new Map();

    // Initialize the map with all databaseTableColumns
    this.databaseTableColumns.forEach((column) => {
      columnForeignKeyMap.set(column.databaseTableColumnName, []);
    });

    // Process each constraint to find foreign keys
    this.databaseTableConstraints.forEach((constraint) => {
      if (constraint.constraintType === "FOREIGN KEY") {
        // Handle single-column or composite foreign keys
        constraint.databaseTableColumns?.forEach((databaseTableColumnName) => {
          if (columnForeignKeyMap.has(databaseTableColumnName)) {
            columnForeignKeyMap.get(databaseTableColumnName).push(constraint);
          }
        });
      }
    });

    return columnForeignKeyMap;
  }

  /**
   * Retrieves the foreign key constraints for a given column.
   * @param {string} databaseTableColumnName - The name of the column.
   * @returns {Array<DatabaseTableConstraint>} An array of foreign key constraints involving the column.
   */
  getForeignKeysForColumn(databaseTableColumnName) {
    return this.columnForeignKeyMap.get(databaseTableColumnName) || [];
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DatabaseTable(item);
      });
    }
  };
}
