const { formatSchema } = require("@prisma/internals");
const {
  datasourcesDeserializer,
  dmmfEnumsDeserializer,
  dmmfModelsdeserializer,
  generatorsDeserializer,
} = require("./util/dmmf-parser");

export const dmmfToSchema = async ({
  dmmf: { models, enums },
  config: { datasources, generators },
}) => {
  const outputSchema = [
    datasourcesDeserializer(datasources),
    generatorsDeserializer(generators),
    dmmfModelsdeserializer(models),
    dmmfEnumsDeserializer(enums),
  ]
    .filter((e) => e)
    .join("\n\n\n");

  return await formatSchema({ schema: outputSchema });
};
