const { z, schemas } = require("../../utils/validation.utils");

const MARKETPLACE_ITEM_TYPES = ["datasource", "widget", "workflow", "appTemplate"];

const listMarketplaceQuerySchema = z
  .object({
    search: z.string().optional(),
    itemType: z.enum(MARKETPLACE_ITEM_TYPES).optional(),
    category: z.string().optional(),
    includeLegacy: z.enum(["true", "false"]).optional(),
  })
  .merge(schemas.paginationSchema)
  .passthrough();

const marketplaceItemIdParamSchema = z.object({
  itemID: schemas.uuidSchema,
});

const selectedItemKeysSchema = z
  .array(z.string().regex(/^(datasource|dataQuery|widget|workflow|appPage|listener):[0-9a-f-]{36}$/i))
  .min(1)
  .max(500)
  .optional();

const installMarketplaceItemSchema = z
  .object({ selectedItemKeys: selectedItemKeysSchema })
  .passthrough();

const updateMarketplaceItemSchema = z
  .object({
    isVerified: z.boolean().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .passthrough();

module.exports = {
  MARKETPLACE_ITEM_TYPES,
  listMarketplaceQuerySchema,
  marketplaceItemIdParamSchema,
  installMarketplaceItemSchema,
  updateMarketplaceItemSchema,
};
