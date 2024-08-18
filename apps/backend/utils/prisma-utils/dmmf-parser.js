/* eslint-disable @typescript-eslint/restrict-template-expressions */
// import {
//   type ConnectorType,
//   type DataSource,
//   type DMMF,
//   type EnvValue,
//   type GeneratorConfig,
// } from "@prisma/generator-helper";
const { printGeneratorConfig } = require("@prisma/engine-core");
const { DMMF } = require("@prisma/generator-helper");

// export interface Field {
//   kind: DMMF.FieldKind;
//   name: string;
//   isRequired: boolean;
//   isList: boolean;
//   isUnique: boolean;
//   isId: boolean;
//   type: string;
//   dbNames: string[] | null;
//   isGenerated: boolean;
//   hasDefaultValue: boolean;
//   relationFromFields?: any[];
//   relationToFields?: any[];
//   relationOnDelete?: string;
//   relationName?: string;
//   default: boolean | any;
//   isUpdatedAt: boolean;
//   isReadOnly: string;
//   columnName?: string;
// }

// export interface Attribute {
//   isUnique: boolean;
//   isId: boolean;
//   dbNames: string[] | null;
//   relationFromFields?: any[];
//   relationToFields?: any[];
//   relationOnDelete?: string;
//   relationName?: string;
//   isReadOnly: string;
//   default?: boolean | any;
//   isGenerated: boolean;
//   isUpdatedAt: boolean;
//   columnName?: string;
//   comment?: string;
// }

// type AttributeHandler = (value: unknown, kind: DMMF.FieldKind) => string;

const attributeHandlers = {
  default: (value, kind) => {
    if (Array.isArray(value)) {
      if (
        kind === "enum" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        // ex. @default([hi]), enums, numbers, booleans default values should be with out " "
        return `@default(${JSON.stringify(value).replace(/"/g, "")})`;
      }
      // ex. @default(["hi"])
      return `@default(${JSON.stringify(value)})`;
    }
    if (
      kind === "enum" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return `@default(${value})`;
    }
    if (typeof value === "string") {
      return `@default("${value}")`;
    }
    if (typeof value === "object") {
      // ex. { name: 'autoincrement', args: [] } -> @default(autoincrement())
      const defaultObject = value;
      return `@default(${defaultObject.name}(${defaultObject.args}))`;
    }
    return "";
  },
  isId: (value) => (value ? "@id" : ""),
  isUnique: (value) => (value ? "@unique" : ""),
  native: (value) => (value ? `${value}` : ""),
  isUpdatedAt: (value) => (value ? "@updatedAt" : ""),
  dbName: (value) => (value ? `@map("${value}")` : ""),
  columnName: (value) => (value ? `@map("${value}")` : ""),
  comment: (value) => (value ? `//${value}` : ""),
};

function handleAttributes(attributes, kind) {
  const { relationFromFields, relationToFields, relationName } = attributes;

  if (kind === "object" && relationFromFields) {
    return relationFromFields.length > 0
      ? `@relation(name: "${relationName}", fields: [${relationFromFields}], references: [${relationToFields}])`
      : `@relation(name: "${relationName}") ${
          attributes?.comment ? "//" + attributes.comment : ""
        }`;
  }

  return Object.entries(attributes)
    .map(([key, value]) => attributeHandlers[key]?.(value, kind) ?? "")
    .join(" ");
}

function handleFields(fields) {
  return fields
    .map((fields) => {
      const { name, kind, type, isRequired, isList, ...attributes } = fields;
      if (kind === "comment") {
        return `//${name}`;
      }

      const fieldAttributes = handleAttributes(attributes, kind);
      return `${name} ${type}${
        isList ? "[]" : isRequired ? "" : "?"
      } ${fieldAttributes}`;
    })
    .join("\n");
}

function handlePrimaryKey(primaryKeys) {
  if (!primaryKeys || !primaryKeys.fields || primaryKeys.fields.length === 0)
    return "";
  return `@@id([${primaryKeys.fields.join(", ")}])`;
}

function handleUniqueFields(uniqueFields) {
  return uniqueFields.length > 0
    ? uniqueFields
        .map((eachUniqueField) => `@@unique([${eachUniqueField.join(", ")}])`)
        .join("\n")
    : "";
}

function handleDbName(dbName) {
  return dbName ? `@@map("${dbName}")` : "";
}

function handleUrl(envValue) {
  const value = envValue.fromEnvVar
    ? `env("${envValue.fromEnvVar}")`
    : envValue.value;

  return `url = ${value}`;
}

function handleProvider(provider) {
  return `provider = "${provider}"`;
}

function deserializeModel(model) {
  const {
    name,
    uniqueFields,
    dbName,
    primaryKey,
    index,
    startComments = [],
    endComments = [],
  } = model;
  const indexs = index;
  const fields = model.fields;

  const output = `
${startComments.map((c) => "// " + c).join("\n")}

model ${name} {
${handleFields(fields)}
${handleUniqueFields(uniqueFields)}
${handleDbName(dbName)}
${handlePrimaryKey(primaryKey)}
${indexs?.join("\n") || ""}
}

${endComments.map((c) => "// " + c).join("\n")}
`;
  return output;
}

function deserializeDatasource(datasource) {
  const { activeProvider: provider, name, url } = datasource;

  return `
datasource ${name} {
	${handleProvider(provider)}
	${handleUrl(url)}
}`;
}

function deserializeEnum({ name, values, dbName }) {
  const outputValues = values.map(({ name, dbName }) => {
    let result = name;
    if (name !== dbName && dbName) result += `@map("${dbName}")`;
    return result;
  });
  return `
enum ${name} {
	${outputValues.join("\n\t")}
	${handleDbName(dbName || null)}
}`;
}

/**
 *
 * @param {DMMF} models
 * @returns
 */
function dmmfModelsdeserializer(models) {
  return models.map((model) => deserializeModel(model)).join("\n");
}
/**
 *
 * @param {import("@prisma/generator-helper").DataSource} datasources
 * @returns
 */
function datasourcesDeserializer(datasources) {
  return datasources
    .map((datasource) => deserializeDatasource(datasource))
    .join("\n");
}

/**
 *
 * @param {Generator} generators
 * @returns
 */
function generatorsDeserializer(generators) {
  return generators
    .map((generator) => printGeneratorConfig(generator))
    .join("\n");
}

function dmmfEnumsDeserializer(enums) {
  return enums.map((each) => deserializeEnum(each)).join("\n");
}

module.exports = {
  dmmfEnumsDeserializer,
  generatorsDeserializer,
  datasourcesDeserializer,
  dmmfModelsdeserializer,
};
