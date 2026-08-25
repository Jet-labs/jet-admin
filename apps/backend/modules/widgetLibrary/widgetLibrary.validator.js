const { z, schemas } = require("../../utils/validation.utils");

const publishWidgetSchema = z.object({
  bundle: z.object({}).passthrough(),
});

const libraryEntryIdParamSchema = z.object({
  libraryEntryID: schemas.uuidSchema,
});

const installWidgetSchema = z.object({}).passthrough();

const listWidgetsQuerySchema = z.object({
  search: z.string().optional(),
}).merge(schemas.paginationSchema).passthrough();

module.exports = {
  publishWidgetSchema,
  libraryEntryIdParamSchema,
  installWidgetSchema,
  listWidgetsQuerySchema,
};
