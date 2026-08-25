const { z, schemas } = require("../../utils/validation.utils");

const FOLDER_ENTITY_TYPES = ["widget", "workflow", "dataQuery", "cronJob", "appPage", "listener"];

const listFoldersQuerySchema = z.object({
  entityType: z.enum(FOLDER_ENTITY_TYPES),
}).passthrough();

const createFolderSchema = z.object({
  entityType: z.enum(FOLDER_ENTITY_TYPES),
  folderTitle: z.string().min(1, "Title is required").max(255),
  parentFolderID: schemas.uuidSchema.optional().nullable(),
}).passthrough();

const updateFolderSchema = z.object({
  folderTitle: z.string().min(1, "Title is required").max(255).optional(),
  parentFolderID: schemas.uuidSchema.optional().nullable(),
}).passthrough();

const folderIdParamSchema = z.object({
  folderID: schemas.uuidSchema,
});

const moveEntitiesSchema = z.object({
  entityType: z.enum(FOLDER_ENTITY_TYPES),
  entityIDs: z.array(schemas.uuidSchema).min(1, "At least one entity ID is required"),
  folderID: schemas.uuidSchema.optional().nullable(),
});

module.exports = {
  FOLDER_ENTITY_TYPES,
  listFoldersQuerySchema,
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
  moveEntitiesSchema,
};
