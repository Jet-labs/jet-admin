/**
 * Listener Connection Manager
 * Singleton that manages the lifecycle of all active listeners.
 *
 * Responsibilities:
 *  - Boot: load all active listeners, establish connections via datasource.subscribe()
 *  - Hot reload: stop/start on CRUD operations
 *  - Fault tolerance: exponential backoff reconnection
 *  - Health checks: periodic status reporting
 *
 * All event processing is delegated to the pipeline queue — this class
 * only handles connection lifecycle and event ingestion.
 *
 * Test event streaming uses Socket.IO rooms: clients join
 * `listener_test:<listenerID>` to receive live event previews.
 * The engine uses the saved transform script from the pipeline actions
 * (no session-specific overrides).
 */
const { dataSourceRegistry } = require('@jet-admin/datasources-logic');
const { addListenerEvent } = require('../../../config/queue.config');
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');
const { vaultService } = require('../../vault/vault.service');

const MAX_RETRIES = 10;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;
const HEALTH_CHECK_INTERVAL_MS = 30000;

class ListenerEngine {
  constructor() {
    this.active = new Map();  // listenerID → { handle, instance, listener, state, retryCount, retryTimer }
    this.healthCheckTimer = null;
  }

  // ─── Boot ───────────────────────────────────────────────────────────────────

  async startAll() {
    Logger.log('info', { message: 'ListenerEngine:startAll:init' });

    try {
      const listeners = await prisma.tblListeners.findMany({
        where: { status: 'active' },
        include: {
          tblDatasources: true,
          tblListenerActions: {
            where: { isEnabled: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      Logger.log('info', {
        message: 'ListenerEngine:startAll:found',
        params: { count: listeners.length },
      });

      for (const listener of listeners) {
        await this.startOne(listener);
      }

      // Start periodic health check
      this.healthCheckTimer = setInterval(() => this._healthCheck(), HEALTH_CHECK_INTERVAL_MS);

      Logger.log('success', { message: 'ListenerEngine:startAll:done' });
    } catch (error) {
      Logger.log('error', {
        message: 'ListenerEngine:startAll:error',
        params: { error: error.message },
      });
    }
  }

  // ─── Start a single listener ────────────────────────────────────────────────

  async startOne(listener) {
    const { listenerID } = listener;

    // Don't double-start
    if (this.active.has(listenerID)) {
      Logger.log('warning', {
        message: 'ListenerEngine:startOne:alreadyActive',
        params: { listenerID },
      });
      return;
    }

    try {
      const datasource = listener.tblDatasources;
      if (!datasource) {
        throw new Error(`Missing datasource for listener ${listenerID}`);
      }

      const DataSource = dataSourceRegistry.getDataSource(datasource.datasourceType);
      const instance = new DataSource(datasource, {
        getCredential: async (vaultCredentialID) => {
          return await vaultService.getCredential({
            tenantID: listener.tenantID,
            vaultCredentialID,
          });
        },
        getGoogleClientConfig: () => {
          return vaultService.getGoogleClientConfig();
        },
      });

      const handle = await instance.subscribe(
        listener.listenerConfig,
        async (rawEvent) => {
          // Emit a test event to clients who joined the listener's test room
          try {
            const { socketIO } = require('../../../config/socket.io');
            const { ListenerTransformerVm } = require('./listenerTransformerVm');

            // Check if any clients are in the test room for this listener
            const testRoom = `listener_test:${listener.listenerID}`;
            const room = socketIO.sockets.adapter.rooms.get(testRoom);

            if (room && room.size > 0) {
              // Find active saved transform script from actions list
              const transformAction = listener.tblListenerActions?.find(a => a.actionType === 'transform' && a.isEnabled);
              const savedScript = transformAction?.actionConfig?.script;

              let transformedEvent = undefined;
              let transformError = null;

              if (savedScript && savedScript.trim()) {
                const res = ListenerTransformerVm.execute(savedScript, rawEvent);
                transformedEvent = res.output;
                transformError = res.error;
              } else {
                transformedEvent = rawEvent;
              }

              socketIO.to(testRoom).emit('listener_test_event', {
                listenerID: listener.listenerID,
                rawEvent,
                transformedEvent,
                transformError,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            // Ignore socket errors — don't let test emission block event processing
          }

          // Don't process inline — enqueue to the pipeline
          try {
            await addListenerEvent({
              listenerID: listener.listenerID,
              tenantID: listener.tenantID,
              rawEvent,
              actions: listener.tblListenerActions,
            });
          } catch (enqueueErr) {
            Logger.log('error', {
              message: 'ListenerEngine:enqueueError',
              params: { listenerID, error: enqueueErr.message },
            });
          }
        }
      );

      this.active.set(listenerID, {
        handle,
        instance,
        listener,
        state: 'running',
        retryCount: 0,
        retryTimer: null,
      });

      // Clear any previous error status
      await prisma.tblListeners.update({
        where: { listenerID },
        data: { status: 'active', lastError: null },
      }).catch((dbErr) => Logger.log('warning', {
        message: 'ListenerEngine:startOne:dbStatusUpdateFailed',
        params: { listenerID, error: dbErr.message },
      }));

      Logger.log('success', {
        message: 'ListenerEngine:startOne:success',
        params: { listenerID, type: listener.listenerType },
      });

    } catch (error) {
      Logger.log('error', {
        message: 'ListenerEngine:startOne:error',
        params: { listenerID, error: error.message },
      });

      // Mark as error in DB
      await prisma.tblListeners.update({
        where: { listenerID },
        data: { status: 'error', lastError: error.message },
      }).catch((dbErr) => Logger.log('warning', {
        message: 'ListenerEngine:startOne:dbErrorStatusUpdateFailed',
        params: { listenerID, error: dbErr.message },
      }));
    }
  }

  // ─── Stop a single listener ─────────────────────────────────────────────────

  async stopOne(listenerID) {
    const entry = this.active.get(listenerID);
    if (!entry) return;

    try {
      // Clear any pending retry
      if (entry.retryTimer) {
        clearTimeout(entry.retryTimer);
      }

      // Unsubscribe via datasource
      if (entry.instance && typeof entry.instance.unsubscribe === 'function') {
        await entry.instance.unsubscribe(entry.handle);
      }

      this.active.delete(listenerID);

      Logger.log('info', {
        message: 'ListenerEngine:stopOne:success',
        params: { listenerID },
      });
    } catch (error) {
      Logger.log('error', {
        message: 'ListenerEngine:stopOne:error',
        params: { listenerID, error: error.message },
      });
      // Force remove from active map even on error
      this.active.delete(listenerID);
    }
  }

  // ─── Restart (hot reload on CRUD) ───────────────────────────────────────────

  async restartOne(listenerID) {
    await this.stopOne(listenerID);

    // Fetch fresh data from DB
    const listener = await prisma.tblListeners.findUnique({
      where: { listenerID },
      include: {
        tblDatasources: true,
        tblListenerActions: {
          where: { isEnabled: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (listener && listener.status === 'active') {
      await this.startOne(listener);
    }
  }

  // ─── Stop all (graceful shutdown) ───────────────────────────────────────────

  async stopAll() {
    Logger.log('info', { message: 'ListenerEngine:stopAll:init' });

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    const ids = [...this.active.keys()];
    for (const listenerID of ids) {
      await this.stopOne(listenerID);
    }

    Logger.log('success', { message: 'ListenerEngine:stopAll:done' });
  }

  // ─── Reconnection (fault tolerance) ─────────────────────────────────────────

  async _handleDisconnect(listenerID, error) {
    const entry = this.active.get(listenerID);
    if (!entry) return;

    entry.retryCount++;
    entry.state = 'reconnecting';

    Logger.log('warning', {
      message: 'ListenerEngine:disconnected',
      params: { listenerID, error: error?.message, retryCount: entry.retryCount },
    });

    if (entry.retryCount > MAX_RETRIES) {
      entry.state = 'error';
      this.active.delete(listenerID);

      await prisma.tblListeners.update({
        where: { listenerID },
        data: {
          status: 'error',
          lastError: `Max retries exceeded: ${error?.message}`,
        },
      }).catch(() => {});

      Logger.log('error', {
        message: 'ListenerEngine:maxRetriesExceeded',
        params: { listenerID },
      });
      return;
    }

    // Exponential backoff
    const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, entry.retryCount), MAX_RETRY_DELAY_MS);

    entry.retryTimer = setTimeout(async () => {
      Logger.log('info', {
        message: 'ListenerEngine:retrying',
        params: { listenerID, attempt: entry.retryCount },
      });
      await this.restartOne(listenerID);
    }, delay);
  }

  // ─── Health check ───────────────────────────────────────────────────────────

  _healthCheck() {
    for (const [listenerID, entry] of this.active) {
      if (entry.state !== 'running') continue;

      // Check if the datasource instance reports unhealthy
      if (entry.instance && typeof entry.instance.healthCheck === 'function') {
        entry.instance.healthCheck().catch(err => {
          this._handleDisconnect(listenerID, err);
        });
      }
    }
  }

  // ─── Status reporting ───────────────────────────────────────────────────────

  getStatus() {
    const statuses = {};
    for (const [listenerID, entry] of this.active) {
      statuses[listenerID] = {
        state: entry.state,
        type: entry.listener.listenerType,
        retryCount: entry.retryCount,
        title: entry.listener.listenerTitle,
      };
    }
    return statuses;
  }
}

// Singleton
const listenerEngine = new ListenerEngine();

module.exports = { listenerEngine };
