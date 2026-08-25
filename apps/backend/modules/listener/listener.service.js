/**
 * Listener Service
 * Business logic for CRUD operations on listeners and their actions.
 * Also handles hot-reload integration with the ConnectionManager.
 */
const { prisma } = require('../../config/prisma.config');
const { listenerEngine } = require('./listenerEngine/engine');
const Logger = require('../../utils/logger');
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");

const listenerService = {

  // ─── Listener CRUD ────────────────────────────────────────────────────────

  async getAllListeners({ tenantID, search, page, pageSize, folderID }) {
    Logger.log("info", {
      message: "listenerService:getAllListeners:params",
      params: { tenantID, search, page, pageSize },
    });
    try {
      const where = { tenantID };

      if (folderID) {
        where.folderID = folderID;
      }

      if (search) {
        where.OR = [
          {
            listenerTitle: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            listenerDescription: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            listenerType: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      const findManyOptions = {
        where,
        include: {
          tblListenerActions: { orderBy: { orderIndex: 'asc' } },
          tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
        },
        orderBy: { createdAt: 'desc' },
      };

      if (page && pageSize) {
        findManyOptions.skip = (page - 1) * pageSize;
        findManyOptions.take = pageSize;
      }

      const [listeners, totalCount] = await Promise.all([
        prisma.tblListeners.findMany(findManyOptions),
        prisma.tblListeners.count({ where }),
      ]);

      for (const listener of listeners) {
        const transformAction = listener.tblListenerActions?.find(a => a.actionType === 'transform');
        listener.transformScript = transformAction?.actionConfig?.script || null;
      }

      Logger.log("success", {
        message: "listenerService:getAllListeners:success",
        params: { count: listeners.length, totalCount },
      });

      return {
        listeners,
        totalCount,
        page: page || 1,
        pageSize: pageSize || listeners.length,
        totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
      };
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:getAllListeners:error",
        params: { error, tenantID },
      });
      throw error;
    }
  },

  async getListenerByID({ tenantID, listenerID }) {
    Logger.log("info", {
      message: "listenerService:getListenerByID:params",
      params: { tenantID, listenerID },
    });
    try {
      const listener = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
        include: {
          tblListenerActions: { orderBy: { orderIndex: 'asc' } },
          tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
        },
      });

      if (listener) {
        const transformAction = listener.tblListenerActions?.find(a => a.actionType === 'transform');
        listener.transformScript = transformAction?.actionConfig?.script || null;
      }

      Logger.log("success", {
        message: "listenerService:getListenerByID:success",
        params: { found: !!listener },
      });
      return listener;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:getListenerByID:error",
        params: { error, listenerID },
      });
      throw error;
    }
  },

  async createListener({ tenantID, userID, data, authContext }) {
    Logger.log("info", {
      message: "listenerService:createListener:params",
      params: { tenantID, userID, data, authContext },
    });
    try {
      const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
      const finalCreatorID = creatorID || userID;
      if (!finalCreatorID && !createdByApiKeyID) {
        throw new Error("Creator ID or Created By API Key ID is required");
      }
      const listener = await prisma.$transaction(async (tx) => {
        const created = await tx.tblListeners.create({
          data: {
            tenantID,
            datasourceID: data.datasourceID,
            listenerTitle: data.listenerTitle,
            listenerDescription: data.listenerDescription || null,
            listenerType: data.listenerType,
            listenerConfig: data.listenerConfig || {},
            status: data.status || 'inactive',
            endpointPath: data.endpointPath || null,
            creatorID: finalCreatorID,
            createdByApiKeyID,
          },
          include: {
            tblListenerActions: { orderBy: { orderIndex: 'asc' } },
            tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
          },
        });

        if (data.transformScript && data.transformScript.trim()) {
          const action = await tx.tblListenerActions.create({
            data: {
              listenerID: created.listenerID,
              actionType: 'transform',
              actionConfig: { script: data.transformScript },
              orderIndex: 0,
              isEnabled: true
            }
          });
          created.tblListenerActions.push(action);
          created.transformScript = data.transformScript;
        }

        return created;
      });

      await grantCreatorAccess(tenantID, "listener", listener.listenerID, authContext, creatorID || userID);

      Logger.log('success', {
        message: 'listenerService:createListener:success',
        params: { listenerID: listener.listenerID, type: listener.listenerType },
      });

      // If created as active, start it
      if (listener.status === 'active') {
        await listenerEngine.startOne(listener);
      }

      return listener;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:createListener:error",
        params: { error, tenantID },
      });
      throw error;
    }
  },

  async updateListener({ tenantID, listenerID, data }) {
    Logger.log("info", {
      message: "listenerService:updateListener:params",
      params: { tenantID, listenerID, data },
    });
    try {
      const existing = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
        include: { tblListenerActions: true }
      });
      if (!existing) return null;

      const listener = await prisma.$transaction(async (tx) => {
        if (data.transformScript !== undefined) {
          const existingTransformAction = existing.tblListenerActions?.find(a => a.actionType === 'transform');
          if (existingTransformAction) {
            await tx.tblListenerActions.update({
              where: { actionID: existingTransformAction.actionID },
              data: {
                actionConfig: {
                  ...existingTransformAction.actionConfig,
                  script: data.transformScript
                }
              }
            });
          } else if (data.transformScript && data.transformScript.trim()) {
            // Shift existing actions
            await tx.tblListenerActions.updateMany({
              where: { listenerID },
              data: { orderIndex: { increment: 1 } }
            });

            // Create new transform action
            await tx.tblListenerActions.create({
              data: {
                listenerID,
                actionType: 'transform',
                actionConfig: { script: data.transformScript },
                orderIndex: 0,
                isEnabled: true
              }
            });
          }
        }

        return await tx.tblListeners.update({
          where: { listenerID },
          data: {
            listenerTitle: data.listenerTitle ?? existing.listenerTitle,
            listenerDescription: data.listenerDescription !== undefined ? data.listenerDescription : existing.listenerDescription,
            listenerConfig: data.listenerConfig ?? existing.listenerConfig,
            status: data.status ?? existing.status,
            endpointPath: data.endpointPath !== undefined ? data.endpointPath : existing.endpointPath,
            updatedAt: new Date(),
          },
          include: {
            tblListenerActions: { orderBy: { orderIndex: 'asc' } },
            tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
          },
        });
      });

      const transformAction = listener.tblListenerActions?.find(a => a.actionType === 'transform');
      listener.transformScript = transformAction?.actionConfig?.script || null;

      Logger.log("success", {
        message: "listenerService:updateListener:success",
        params: { listenerID },
      });

      // Hot-reload: restart if config changed and listener is active
      if (listener.status === 'active') {
        await listenerEngine.restartOne(listenerID);
      } else {
        // If set to inactive, stop it
        await listenerEngine.stopOne(listenerID);
      }

      return listener;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:updateListener:error",
        params: { error, listenerID },
      });
      throw error;
    }
  },

  async deleteListener({ tenantID, listenerID }) {
    Logger.log("info", {
      message: "listenerService:deleteListener:params",
      params: { tenantID, listenerID },
    });
    try {
      const existing = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
      });
      if (!existing) return null;

      // Stop the listener if active
      await listenerEngine.stopOne(listenerID);

      // CASCADE will delete actions and events
      await prisma.tblListeners.delete({
        where: { listenerID },
      });

      await removePoliciesForResource(tenantID, `listener:${listenerID}`);

      Logger.log('success', {
        message: 'listenerService:deleteListener:success',
        params: { listenerID },
      });

      return { listenerID };
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:deleteListener:error",
        params: { error, listenerID },
      });
      throw error;
    }
  },

  // ─── Clone ────────────────────────────────────────────────────────────

  async cloneListener({ tenantID, listenerID, userID, authContext }) {
    Logger.log("info", {
      message: "listenerService:cloneListener:params",
      params: { tenantID, listenerID, userID, authContext },
    });
    try {
      const existing = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
        include: { tblListenerActions: { orderBy: { orderIndex: 'asc' } } },
      });
      if (!existing) throw new Error("Listener not found");

      const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
      const finalCreatorID = creatorID || userID;
      if (!finalCreatorID && !createdByApiKeyID) {
        throw new Error("Creator ID or Created By API Key ID is required");
      }
      const newListener = await prisma.$transaction(async (tx) => {
        const created = await tx.tblListeners.create({
          data: {
            tenantID,
            datasourceID: existing.datasourceID,
            listenerTitle: existing.listenerTitle + " (Copy)",
            listenerDescription: existing.listenerDescription,
            listenerType: existing.listenerType,
            listenerConfig: existing.listenerConfig,
            status: "inactive",
            creatorID: finalCreatorID,
            createdByApiKeyID,
          },
        });

        // Clone actions
        if (existing.tblListenerActions?.length) {
          await tx.tblListenerActions.createMany({
            data: existing.tblListenerActions.map((a) => ({
              listenerID: created.listenerID,
              actionType: a.actionType,
              actionConfig: a.actionConfig,
              isEnabled: a.isEnabled,
              orderIndex: a.orderIndex,
            })),
          });
        }

        return created;
      });

      await grantCreatorAccess(tenantID, "listener", newListener.listenerID, authContext, finalCreatorID);

      Logger.log("success", {
        message: "listenerService:cloneListener:success",
        params: { listenerID, newListenerID: newListener.listenerID },
      });
      return newListener;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:cloneListener:error",
        params: { error, listenerID },
      });
      throw error;
    }
  },

  // ─── Listener Actions CRUD ──────────────────────────────────────────────

  async addAction({ tenantID, listenerID, data }) {
    Logger.log("info", {
      message: "listenerService:addAction:params",
      params: { tenantID, listenerID, data },
    });
    try {
      const listener = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
      });
      if (!listener) return null;

      const action = await prisma.tblListenerActions.create({
        data: {
          listenerID,
          actionType: data.actionType,
          actionConfig: data.actionConfig || {},
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
          orderIndex: data.orderIndex || 0,
        },
      });

      Logger.log("success", {
        message: "listenerService:addAction:success",
        params: { actionID: action.actionID },
      });

      if (listener.status === 'active') {
        await listenerEngine.restartOne(listenerID);
      }

      return action;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:addAction:error",
        params: { error, listenerID },
      });
      throw error;
    }
  },

  async updateAction({ tenantID, listenerID, actionID, data }) {
    Logger.log("info", {
      message: "listenerService:updateAction:params",
      params: { tenantID, listenerID, actionID, data },
    });
    try {
      const listener = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
      });
      if (!listener) return null;

      // Verify the action belongs to this listener
      const existingAction = await prisma.tblListenerActions.findFirst({
        where: { actionID, listenerID },
      });
      if (!existingAction) return null;

      const action = await prisma.tblListenerActions.update({
        where: { actionID },
        data: {
          ...(data.actionType !== undefined && { actionType: data.actionType }),
          ...(data.actionConfig !== undefined && { actionConfig: data.actionConfig }),
          ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
          ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        },
      });

      Logger.log("success", {
        message: "listenerService:updateAction:success",
        params: { actionID },
      });

      if (listener.status === 'active') {
        await listenerEngine.restartOne(listenerID);
      }

      return action;
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:updateAction:error",
        params: { error, actionID },
      });
      throw error;
    }
  },

  async deleteAction({ tenantID, listenerID, actionID }) {
    Logger.log("info", {
      message: "listenerService:deleteAction:params",
      params: { tenantID, listenerID, actionID },
    });
    try {
      const listener = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
      });
      if (!listener) return null;

      // Verify the action belongs to this listener
      const existingAction = await prisma.tblListenerActions.findFirst({
        where: { actionID, listenerID },
      });
      if (!existingAction) return null;

      await prisma.tblListenerActions.delete({
        where: { actionID },
      });

      Logger.log("success", {
        message: "listenerService:deleteAction:success",
        params: { actionID },
      });

      if (listener.status === 'active') {
        await listenerEngine.restartOne(listenerID);
      }

      return { actionID };
    } catch (error) {
      Logger.log("error", {
        message: "listenerService:deleteAction:error",
        params: { error, actionID },
      });
      throw error;
    }
  },

  // ─── Lifecycle controls ─────────────────────────────────────────────────

  async activateListener({ tenantID, listenerID }) {
    return this.updateListener({ tenantID, listenerID, data: { status: 'active' } });
  },

  async deactivateListener({ tenantID, listenerID }) {
    return this.updateListener({ tenantID, listenerID, data: { status: 'inactive' } });
  },

  // ─── Status ─────────────────────────────────────────────────────────────

  getConnectionStatus() {
    return listenerEngine.getStatus();
  },

  // ─── Boot (called from startup.js) ──────────────────────────────────────

  async startAllServerListeners() {
    Logger.log("info", { message: "listenerService:startAllServerListeners:init" });
    try {
      await listenerEngine.startAll();
      Logger.log("success", { message: "listenerService:startAllServerListeners:done" });
    } catch (error) {
      Logger.log("error", { message: "listenerService:startAllServerListeners:error", params: { error } });
    }
  },

  async stopAllServerListeners() {
    Logger.log("info", { message: "listenerService:stopAllServerListeners:init" });
    try {
      await listenerEngine.stopAll();
      Logger.log("success", { message: "listenerService:stopAllServerListeners:done" });
    } catch (error) {
      Logger.log("error", { message: "listenerService:stopAllServerListeners:error", params: { error } });
    }
  },
};

// ─── Schema Introspection ────────────────────────────────────────────────────

/** @type {Record<string, object>|null} — in-process singleton */
let _datasourceListenerConfigSchemas = null;

async function loadDatasourceListenerConfigSchemas() {
  if (_datasourceListenerConfigSchemas) return _datasourceListenerConfigSchemas;
  const mod = await import('@jet-admin/datasource-types');
  _datasourceListenerConfigSchemas = mod.DATASOURCE_LISTENER_CONFIG_SCHEMAS;
  return _datasourceListenerConfigSchemas;
}

/**
 * Returns listener config schemas, keyed by datasourceType.
 * If datasourceType is supplied, returns only the schema for that type.
 *
 * @param {object} param0
 * @param {string|undefined} param0.datasourceType
 * @returns {Promise<Record<string, object>|object>}
 */
listenerService.getListenerSchemas = async function({ datasourceType } = {}) {
  const all = await loadDatasourceListenerConfigSchemas();
  if (datasourceType) {
    const schema = all[datasourceType];
    if (!schema) {
      throw Object.assign(new Error(`No listener schema found for datasourceType: '${datasourceType}'`), { code: 'SCHEMA_NOT_FOUND' });
    }
    return { [datasourceType]: schema };
  }
  return all;
};

module.exports = { listenerService };
