const parseRelationship = (relation) => {
  if (!relation) {
    return "";
  }

  const parseRelationshipArg = (fields) => {
    return "[" + fields.join(",") + "]";
  };

  const relationName = relation.name ? `"${relation.name}"` : "";
  const prependRelationFields = relation.name ? ", " : "";
  const relationFields = relation.fields
    ? `${prependRelationFields}fields: ${parseRelationshipArg(
        relation.fields
      )}, `
    : "";
  const relationReferences = relation.references
    ? `references: ${parseRelationshipArg(relation.references)}`
    : "";

  return ` @relation(${relationName}${relationFields}${relationReferences})`;
};

const parseModelFields = (fields) => {
  return fields.map(
    ({
      name,
      type,
      list,
      required,
      isId,
      isUpdatedAt,
      relation,
      default: defaultValue,
      unique: isUnique,
    }) => {
      const array = list ? "[]" : "";
      const optional = list ? "" : required ? "" : "?";
      const id = isId ? " @id" : "";
      const updatedAt = isUpdatedAt ? " @updatedAt" : "";
      const unique = isUnique ? " @unique" : "";
      const default_value = defaultValue ? ` @default(${defaultValue})` : "";
      const relationship = parseRelationship(relation);

      return `    ${name} ${type}${array}${optional}${id}${unique}${relationship}${default_value}${updatedAt}`;
    }
  );
};

const parseModels = (models) => {
  return models.reduce((a, { name, fields }) => {
    return [...a, `model ${name} {`, ...parseModelFields(fields), "}", "", ""];
  }, []);
};

const parseEnumFields = (fields) => {
  return fields.map((field) => `  ${field}`);
};

const parseEnums = (enums) => {
  return enums.reduce((a, { name, fields }) => {
    return [...a, `enum ${name} {`, ...parseEnumFields(fields), "}"];
  }, []);
};

const jsonToPrismaSchema = (jsonSchema) => {
  const prismaSchema = Object.entries(jsonSchema).reduce(
    (a, [type, values]) => {
      if (type === "models") {
        return [...a, ...parseModels(values)];
      }

      if (type === "enums") {
        return [...a, ...parseEnums(values)];
      }

      return a;
    },
    []
  );

  return prismaSchema.join("\n");
};
module.exports = { jsonToPrismaSchema };
