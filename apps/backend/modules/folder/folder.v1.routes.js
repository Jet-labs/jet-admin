/**
 * Folder API Routes (v1)
 *
 * GET    /folders        — list folders for an entityType
 * POST   /folders        — create a folder
 * PATCH  /folders/:id    — rename / move a folder
 * DELETE /folders/:id    — delete a folder (children promoted, items un-filed)
 * POST   /folders/move   — move entities into a folder (or root via folderID:null)
 */
const express = require("express");
const { folderController } = require("./folder.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  listFoldersQuerySchema,
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
  moveEntitiesSchema,
  FOLDER_ENTITY_TYPES,
} = require("./folder.validator");
const { P } = require("../../config/permissions");

// Maps each entity type to the req key used by the authorize middleware so
// moving entities requires update permission on the entity itself.
const MOVE_REQ_KEY_BY_TYPE = {
  widget: "widgetIDs",
  workflow: "workflowIDs",
  dataQuery: "dataQueryIDs",
  cronJob: "cronJobIDs",
  appPage: "appPageIDs",
  listener: "listenerIDs",
};

/**
 * Middleware that exposes body.entityType/entityIDs as req.<reqKey> arrays
 * so authorize() can verify per-entity update permissions.
 */
const resolveMoveTargets = (req, res, next) => {
  const { entityType, entityIDs } = req.body || {};
  const reqKey = MOVE_REQ_KEY_BY_TYPE[entityType];
  if (reqKey && Array.isArray(entityIDs) && entityIDs.length > 0) {
    req[reqKey] = entityIDs;
  }
  next();
};

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validate(listFoldersQuerySchema, "query"),
  authMiddleware.authorize(P.folder.list),
  folderController.getAllFolders
);

router.post(
  "/",
  validate(createFolderSchema, "body"),
  authMiddleware.authorize(P.folder.create),
  folderController.createFolder
);

router.post(
  "/move",
  validate(moveEntitiesSchema, "body"),
  resolveMoveTargets,
  authMiddleware.authorize([
    P.folder.update,
    ...FOLDER_ENTITY_TYPES.map((type) => ({
      permission: P[
        {
          widget: "widget",
          workflow: "workflow",
          dataQuery: "dataquery",
          cronJob: "cronjob",
          appPage: "appPage",
          listener: "listener",
        }[type]
      ].update,
      reqKey: MOVE_REQ_KEY_BY_TYPE[type],
      skipIfMissing: true,
    })),
  ]),
  folderController.moveEntitiesToFolder
);

router.patch(
  "/:folderID",
  validateAll({
    params: folderIdParamSchema,
    body: updateFolderSchema,
  }),
  authMiddleware.authorize({ ...P.folder.update, paramKey: "folderID" }),
  folderController.updateFolder
);

router.delete(
  "/:folderID",
  validate(folderIdParamSchema, "params"),
  authMiddleware.authorize(P.folder.delete),
  folderController.deleteFolder
);

module.exports = router;
