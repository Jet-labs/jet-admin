/**
 * Folder Service
 * CRUD + tree + entity moves for the per-entityType folder system.
 *
 * Folders are scoped to (tenantID, entityType). A folder tree is shared by
 * all items of one entityType; different entityTypes never mix.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { grantCreatorAccess } = require("../../config/casbin.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");

// Prisma model + PK field per folder-organizable entity type. The casbin
// resource names mirror those used by the owning modules' services.
const ENTITY_CONFIG = {
  widget: {
    model: "tblWidgets",
    idField: "widgetID",
    resource: "widget",
    updatePermission: "widget:update",
  },
  workflow: {
    model: "tblWorkflows",
    idField: "workflowID",
    resource: "workflow",
    updatePermission: "workflow:update",
  },
  dataQuery: {
    model: "tblDataQueries",
    idField: "dataQueryID",
    resource: "dataquery",
    updatePermission: "dataquery:update",
  },
  cronJob: {
    model: "tblCronJobs",
    idField: "cronJobID",
    resource: "cronjob",
    updatePermission: "cronjob:update",
  },
  appPage: {
    model: "tblAppPages",
    idField: "appPageID",
    resource: "appPage",
    updatePermission: "apppage:update",
  },
  listener: {
    model: "tblListeners",
    idField: "listenerID",
    resource: "listener",
    updatePermission: "listener:update",
  },
};

const folderService = {};

async function getFolder({ tenantID, folderID }) {
  return prisma.tblFolders.findFirst({ where: { folderID, tenantID } });
}

/**
 * Returns true if `candidateParentID` is a descendant of `folderID`
 * (or equal to it) within the same tenant — used for cycle prevention.
 */
async function isDescendant({ tenantID, folderID, candidateParentID }) {
  let cursor = candidateParentID;
  const visited = new Set();
  while (cursor && !visited.has(cursor)) {
    if (cursor === folderID) return true;
    visited.add(cursor);
    const row = await prisma.tblFolders.findUnique({
      where: { folderID: cursor },
      select: { parentFolderID: true, tenantID: true },
    });
    if (!row || row.tenantID !== tenantID) break;
    cursor = row.parentFolderID;
  }
  return false;
}

folderService.listFolders = async ({ tenantID, entityType }) => {
  Logger.log("info", {
    message: "folderService:listFolders:params",
    params: { tenantID, entityType },
  });
  try {
    const folders = await prisma.tblFolders.findMany({
      where: { tenantID, entityType },
      orderBy: [{ createdAt: "asc" }],
    });
    Logger.log("success", {
      message: "folderService:listFolders:success",
      params: { tenantID, count: folders.length },
    });
    return folders;
  } catch (error) {
    Logger.log("error", {
      message: "folderService:listFolders:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

folderService.createFolder = async ({ tenantID, userID, authContext, data }) => {
  Logger.log("info", {
    message: "folderService:createFolder:params",
    params: { tenantID, userID, data, authContext },
  });
  try {
    if (data.parentFolderID) {
      const parent = await getFolder({ tenantID, folderID: data.parentFolderID });
      if (!parent || parent.entityType !== data.entityType) {
        throw new Error("Parent folder not found for this entity type.");
      }
    }

    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;

    const folder = await prisma.tblFolders.create({
      data: {
        tenantID,
        entityType: data.entityType,
        folderTitle: data.folderTitle,
        parentFolderID: data.parentFolderID ?? null,
        creatorID: finalCreatorID,
      },
    });

    await grantCreatorAccess(tenantID, "folder", folder.folderID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "folderService:createFolder:success",
      params: { tenantID, folderID: folder.folderID },
    });
    return folder;
  } catch (error) {
    Logger.log("error", {
      message: "folderService:createFolder:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

folderService.updateFolder = async ({ tenantID, folderID, data }) => {
  Logger.log("info", {
    message: "folderService:updateFolder:params",
    params: { tenantID, folderID, data },
  });
  try {
    const existing = await getFolder({ tenantID, folderID });
    if (!existing) throw new Error("Folder not found.");

    if (data.parentFolderID !== undefined && data.parentFolderID !== null) {
      const parent = await getFolder({ tenantID, folderID: data.parentFolderID });
      if (!parent || parent.entityType !== existing.entityType) {
        throw new Error("Target parent folder not found for this entity type.");
      }
      if (await isDescendant({ tenantID, folderID, candidateParentID: data.parentFolderID })) {
        throw new Error("Cannot move a folder into itself or one of its descendants.");
      }
    }

    const updated = await prisma.tblFolders.update({
      where: { folderID },
      data: {
        ...(data.folderTitle !== undefined ? { folderTitle: data.folderTitle } : {}),
        ...(data.parentFolderID !== undefined ? { parentFolderID: data.parentFolderID } : {}),
        updatedAt: new Date(),
      },
    });

    Logger.log("success", {
      message: "folderService:updateFolder:success",
      params: { tenantID, folderID },
    });
    return updated;
  } catch (error) {
    Logger.log("error", {
      message: "folderService:updateFolder:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

folderService.deleteFolder = async ({ tenantID, folderID }) => {
  Logger.log("info", {
    message: "folderService:deleteFolder:params",
    params: { tenantID, folderID },
  });
  try {
    const existing = await getFolder({ tenantID, folderID });
    if (!existing) throw new Error("Folder not found.");

    // Promote child folders to the deleted folder's grandparent so the rest
    // of the tree stays intact. Entities inside are un-filed automatically
    // via the ON DELETE SET NULL foreign keys.
    await prisma.$transaction(async (tx) => {
      await tx.tblFolders.updateMany({
        where: { parentFolderID: folderID, tenantID },
        data: { parentFolderID: existing.parentFolderID ?? null },
      });
      await tx.tblFolders.delete({ where: { folderID } });
    });

    Logger.log("success", {
      message: "folderService:deleteFolder:success",
      params: { tenantID, folderID },
    });
    return { folderID };
  } catch (error) {
    Logger.log("error", {
      message: "folderService:deleteFolder:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

folderService.moveEntitiesToFolder = async ({ tenantID, entityType, entityIDs, folderID }) => {
  Logger.log("info", {
    message: "folderService:moveEntitiesToFolder:params",
    params: { tenantID, entityType, count: entityIDs.length, folderID },
  });
  try {
    const config = ENTITY_CONFIG[entityType];
    if (!config) throw new Error(`Unsupported entity type: ${entityType}`);

    if (folderID) {
      const target = await getFolder({ tenantID, folderID });
      if (!target || target.entityType !== entityType) {
        throw new Error("Target folder not found for this entity type.");
      }
    }

    const result = await prisma[config.model].updateMany({
      where: {
        [config.idField]: { in: entityIDs },
        tenantID,
      },
      data: { folderID: folderID ?? null },
    });

    Logger.log("success", {
      message: "folderService:moveEntitiesToFolder:success",
      params: { tenantID, moved: result.count },
    });
    return { moved: result.count };
  } catch (error) {
    Logger.log("error", {
      message: "folderService:moveEntitiesToFolder:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

module.exports = { folderService, ENTITY_CONFIG };
