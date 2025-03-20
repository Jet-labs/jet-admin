import { DatabaseSchema } from "./databaseSchema";

export class DatabaseMetadata {
  constructor({ metadata }) {
    this.metadata = metadata;
    this.schemas = DatabaseSchema.toList(metadata);
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DatabaseMetadata(item);
      });
    }
  };
}
