const { z, schemas } = require("../../utils/validation.utils");
const { applicationDefinitionSchema, applicationKeySchema, applicationSlugSchema, isSafeApplicationJSON, APPLICATION_LIMITS } = require("@jet-admin/application-contracts");

const revision = z.number().int().positive().max(2147483646);
const applicationParams = z.object({ tenantID: schemas.uuidSchema, applicationID: schemas.uuidSchema }).passthrough();
const createApplicationSchema = z.object({
  title: z.string().trim().min(1).max(255), slug: applicationSlugSchema,
  description: z.string().trim().max(4000).optional(),
}).strict();
const saveDraftSchema = z.object({
  expectedRevision: revision,
  definition: z.unknown().refine(value => isSafeApplicationJSON(value) && Buffer.byteLength(JSON.stringify(value)) <= APPLICATION_LIMITS.bytes, "Definition must be safe JSON of at most 256 KiB").pipe(applicationDefinitionSchema),
}).strict();
const linkPageSchema = z.object({
  expectedRevision: revision, assetKey: applicationKeySchema, appPageID: schemas.uuidSchema,
  managementMode: z.enum(["referenced", "managed"]).default("referenced"),
}).strict();
const unlinkAssetSchema = z.object({ expectedRevision: revision }).strict();
const selectPageVersionSchema = z.object({
  expectedRevision: revision,
  pageVersionID: schemas.uuidSchema.nullable(),
}).strict();
const assetParams = applicationParams.extend({ assetKey: applicationKeySchema });
const listApplicationsSchema = schemas.paginationSchema.extend({ search: z.string().trim().max(255).optional() });
const environmentSchema = z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9-]{0,39}$/, "Invalid environment name");
const publishSchema = z.object({ expectedRevision: revision }).strict();
const deploySchema = z.object({ releaseID: schemas.uuidSchema }).strict();
const bindingsSchema = z.object({
  expectedRevision: z.number().int().min(0).optional(),
  bindings: z.record(z.string(), z.string()),
  changeNote: z.string().trim().max(2000).optional(),
}).strict();
const consumerPolicyEntrySchema = z.object({  subjectType: z.enum(["user", "role", "apiKey"]),
  subjectID: schemas.uuidSchema,
  routeID: applicationKeySchema.nullable().optional(),
  actionKey: applicationKeySchema.nullable().optional(),
  allow: z.boolean().default(true),
}).strict();
const consumerPolicySchema = z.object({
  expectedRevision: z.number().int().min(0).default(0),
  enabled: z.boolean(),
  entries: z.array(consumerPolicyEntrySchema).max(200).default([]),
}).strict();
const workflowRunsQuery = z.object({
  environment: environmentSchema.optional().default("production"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
}).strict();
const runtimeExecuteSchema = z.object({
  inputValues: z.record(z.string(), z.unknown()).default({}),
  releaseID: schemas.uuidSchema.optional(),
  routeID: applicationKeySchema.optional(),
}).strict();
const environmentParams = applicationParams.extend({ environment: environmentSchema });
const runtimePageParams = environmentParams.extend({
  pageAssetKey: applicationKeySchema,
});
const runtimeParams = runtimePageParams.extend({
  alias: applicationKeySchema,
});
const runtimeRunParams = runtimeParams.extend({ instanceID: schemas.uuidSchema });
const runtimeRequestParams = runtimeRunParams.extend({ collectionRequestID: schemas.uuidSchema });
const runtimeSubmissionSchema = z.object({ submittedData: z.record(z.string(), z.unknown()) }).strict();
const runtimeListenerSchema = z.object({ releaseID: schemas.uuidSchema, cursor: z.string().min(1).max(2048).optional(), routeID: applicationKeySchema.optional() }).strict();

module.exports = {
  applicationParams, createApplicationSchema, saveDraftSchema, linkPageSchema,
  unlinkAssetSchema, selectPageVersionSchema, assetParams, listApplicationsSchema, environmentSchema,
  publishSchema, deploySchema, bindingsSchema, consumerPolicySchema, workflowRunsQuery, runtimeExecuteSchema,
  environmentParams, runtimePageParams, runtimeParams,
  runtimeRunParams, runtimeRequestParams, runtimeSubmissionSchema, runtimeListenerSchema,
};
