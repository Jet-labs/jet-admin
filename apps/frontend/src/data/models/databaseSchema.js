import { DatabaseTable } from "./databaseTable";

export class DatabaseSchema {
  constructor({ enums, views, tables, databaseSchemaName }) {
    this.enums = enums;
    this.views = views;
    this.tables = tables ? DatabaseTable.toList(tables) : null;
    this.databaseSchemaName = databaseSchemaName;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DatabaseSchema(item);
      });
    }
  };
}
