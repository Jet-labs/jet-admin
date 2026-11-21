const { z, schemas } = require("../../utils/validation.utils");

const MARKETPLACE_ITEM_TYPES = ["datasource", "widget", "workflow", "appTemplate"];

const listMarketplaceQuerySchema = z
  .object({
    search: z.string().optional(),
    itemType: z.enum(MARKETPLACE_ITEM_TYPES).optional(),
    category: z.string().optional(),
  })
  .merge(schemas.paginationSchema)
  .passthrough();

const marketplaceItemIdParamSchema = z.object({
  itemID: schemas.uuidSchema,
});

const installMarketplaceItemSchema = z.object({}).passthrough();

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
