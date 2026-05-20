/**
 * Listener Service
 * Business logic for CRUD operations on listeners and their actions.
 * Also handles hot-reload integration with the ConnectionManager.
 */
const { prisma } = require('../../config/prisma.config');
const { listenerEngine } = require('./listenerEngine/engine');
const Logger = require('../../utils/logger');

const listenerService = {

  // ─── Listener CRUD ────────────────────────────────────────────────────────

  async getAllListeners({ tenantID }) {
    Logger.log("info", {
      message: "listenerService:getAllListeners:params",
      params: { tenantID },
    });
    try {
      const listeners = await prisma.tblListeners.findMany({
        where: { tenantID },
        include: {
          tblListenerActions: { orderBy: { orderIndex: 'asc' } },
          tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      Logger.log("success", {
        message: "listenerService:getAllListeners:success",
        params: { count: listeners.length },
      });
      return listeners;
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

  async createListener({ tenantID, data }) {
    Logger.log("info", {
      message: "listenerService:createListener:params",
      params: { tenantID, data },
    });
    try {
      const listener = await prisma.tblListeners.create({
        data: {
          tenantID,
          datasourceID: data.datasourceID,
          listenerTitle: data.listenerTitle,
          listenerDescription: data.listenerDescription || null,
          listenerType: data.listenerType,
          listenerConfig: data.listenerConfig || {},
          transformScript: data.transformScript || null,
          status: data.status || 'inactive',
          endpointPath: data.endpointPath || null,
        },
        include: {
          tblListenerActions: { orderBy: { orderIndex: 'asc' } },
          tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
        },
      });

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
      });
      if (!existing) return null;

      const listener = await prisma.tblListeners.update({
        where: { listenerID },
        data: {
          listenerTitle: data.listenerTitle ?? existing.listenerTitle,
          listenerDescription: data.listenerDescription !== undefined ? data.listenerDescription : existing.listenerDescription,
          listenerConfig: data.listenerConfig ?? existing.listenerConfig,
          transformScript: data.transformScript !== undefined ? data.transformScript : existing.transformScript,
          status: data.status ?? existing.status,
          endpointPath: data.endpointPath !== undefined ? data.endpointPath : existing.endpointPath,
          updatedAt: new Date(),
        },
        include: {
          tblListenerActions: { orderBy: { orderIndex: 'asc' } },
          tblDatasources: { select: { datasourceID: true, datasourceTitle: true, datasourceType: true } },
        },
      });

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

  async cloneListener({ tenantID, listenerID }) {
    Logger.log("info", {
      message: "listenerService:cloneListener:params",
      params: { tenantID, listenerID },
    });
    try {
      const existing = await prisma.tblListeners.findFirst({
        where: { listenerID, tenantID },
        include: { tblListenerActions: { orderBy: { orderIndex: 'asc' } } },
      });
      if (!existing) throw new Error("Listener not found");

      const newListener = await prisma.$transaction(async (tx) => {
        const created = await tx.tblListeners.create({
          data: {
            tenantID,
            datasourceID: existing.datasourceID,
            listenerTitle: existing.listenerTitle + " (Copy)",
            listenerDescription: existing.listenerDescription,
            listenerType: existing.listenerType,
            listenerConfig: existing.listenerConfig,
            transformScript: existing.transformScript,
            status: "inactive",
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

      const action = await prisma.tblListenerActions.update({
        where: { actionID },
        data: {
          actionType: data.actionType,
          actionConfig: data.actionConfig,
          isEnabled: data.isEnabled,
          orderIndex: data.orderIndex,
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

  // ─── Status & Testing ───────────────────────────────────────────────────

  getConnectionStatus() {
    return listenerEngine.getStatus();
  },

  updateTestScript(listenerID, sessionID, transformScript) {
    listenerEngine.setTestScript(listenerID, sessionID, transformScript);
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

module.exports = { listenerService };
