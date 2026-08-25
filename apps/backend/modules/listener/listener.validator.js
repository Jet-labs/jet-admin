const { z, schemas } = require("../../utils/validation.utils");

const createListenerSchema = z.object({
  datasourceID: schemas.uuidSchema,
  listenerTitle: z.string().min(1, "Title is required").max(255),
  listenerDescription: z.string().optional(),
  listenerType: z.string().min(1, "Type is required"),
  listenerConfig: z.object({}).passthrough().optional(),
}).passthrough();

const updateListenerSchema = z.object({
  listenerTitle: z.string().min(1, "Title is required").max(255).optional(),
  listenerDescription: z.string().optional(),
  listenerType: z.string().optional(),
  listenerConfig: z.object({}).passthrough().optional(),
  status: z.string().optional(),
}).passthrough();

const addListenerActionSchema = z.object({
  actionType: z.string().min(1, "Action type is required"),
  actionConfig: z.object({}).passthrough(),
  isEnabled: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
}).passthrough();

const updateListenerActionSchema = z.object({
  actionType: z.string().optional(),
  actionConfig: z.object({}).passthrough().optional(),
  isEnabled: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
}).passthrough();

const listListenersQuerySchema = z.object({
  search: z.string().optional(),
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.explorerPaginationSchema).passthrough();

const listenerIdParamSchema = z.object({
  listenerID: schemas.uuidSchema,
});

module.exports = {
  createListenerSchema,
  updateListenerSchema,
  addListenerActionSchema,
  updateListenerActionSchema,
  listListenersQuerySchema,
  listenerIdParamSchema,
};
