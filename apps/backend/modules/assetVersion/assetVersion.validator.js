const { z, schemas } = require("../../utils/validation.utils");
const { ASSET_TYPES } = require("./assetVersion.service");

const assetTypeSchema = z.enum(Object.keys(ASSET_TYPES));
const params = z.object({
  tenantID: schemas.uuidSchema,
  assetType: assetTypeSchema,
  assetID: schemas.uuidSchema,
}).passthrough();
const versionParams = params.extend({ versionID: schemas.uuidSchema }).passthrough();
const listQuery = schemas.paginationSchema;
const createBody = z.object({ changeNote: z.string().trim().max(2000).optional() }).strict();
const diffQuery = z.object({ againstVersionID: schemas.uuidSchema.optional() }).strict();
const restoreBody = z.object({ expectedUpdatedAt: z.string().datetime().optional() }).strict();

module.exports = { assetVersionParams: params, assetVersionVersionParams: versionParams, assetVersionListQuery: listQuery, assetVersionCreateBody: createBody, assetVersionDiffQuery: diffQuery, assetVersionRestoreBody: restoreBody };
