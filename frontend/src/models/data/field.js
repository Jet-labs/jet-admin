export class Field {
  constructor({
    kind,
    name,
    isRequired,
    isList,
    isUnique,
    isId,
    isReadOnly,
    isGenerated,
    isUpdatedAt,
    type,
    dbName,
    hasDefaultValue,

    relationFromFields,
    relationToFields,
    relationOnDelete,
    relationName,
    documentation,
  }) {
    this.kind = kind;
    this.name = name;
    this.isRequired = isRequired;
    this.isList = isList;
    this.isUnique = isUnique;
    this.isId = isId;
    this.isReadOnly = isReadOnly;
    this.isGenerated = isGenerated;
    this.isUpdatedAt = isUpdatedAt;
    this.type = type;
    this.dbName = dbName;
    this.hasDefaultValue = hasDefaultValue;

    this.relationFromFields = relationFromFields;
    this.relationToFields = relationToFields;
    this.relationOnDelete = relationOnDelete;
    this.relationName = relationName;
    this.documentation = documentation;
  }
}
