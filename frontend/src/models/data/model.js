import { Field } from "./field";

export class Model {
  /**
   *
   * @param {object} param0
   * @param {String} param0.name
   * @param {String} param0.dbName
   * @param {Array<Field>} param0.fields
   * @param {Array<object>} param0.uniqueFields
   * @param {Array<object>} param0.uniqueIndexes
   * @param {String} param0.documentation
   * @param {String} param0.primaryKey
   * @param {Boolean} param0.isGenerated
   */
  constructor({
    name,
    dbName,
    fields,
    uniqueFields,
    uniqueIndexes,
    documentation,
    primaryKey,
    isGenerated,
  }) {
    this.name = name;
    this.dbName = dbName;
    this.fields = fields;
    this.uniqueFields = uniqueFields;
    this.uniqueIndexes = uniqueIndexes;
    this.documentation = documentation;
    this.primaryKey = primaryKey;
    this.isGenerated = isGenerated;
  }
}
