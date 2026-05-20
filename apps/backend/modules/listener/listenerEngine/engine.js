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
 */
const { dataSourceRegistry } = require('@jet-admin/datasources-logic');
const { addListenerEvent } = require('../../../config/queue.config');
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');

const MAX_RETRIES = 10;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;
const HEALTH_CHECK_INTERVAL_MS = 30000;

class ListenerEngine {
  constructor() {
    this.active = new Map();  // listenerID → { handle, instance, listener, state, retryCount, retryTimer }
    this.testScripts = new Map(); // listenerID → Map<sessionID, script>
    this.healthCheckTimer = null;
  }

  setTestScript(listenerID, sessionID, script) {
    if (!sessionID) return;
    
    if (!this.testScripts.has(listenerID)) {
      this.testScripts.set(listenerID, new Map());
    }
    
    const sessionMap = this.testScripts.get(listenerID);

    if (script === undefined || script === null) {
      sessionMap.delete(sessionID);
      if (sessionMap.size === 0) {
        this.testScripts.delete(listenerID);
      }
    } else {
      sessionMap.set(sessionID, { script, lastUpdated: Date.now() });
    }
  }

  clearTestScriptsForSession(sessionID) {
    for (const [listenerID, sessionMap] of this.testScripts.entries()) {
      if (sessionMap.has(sessionID)) {
        sessionMap.delete(sessionID);
        if (sessionMap.size === 0) {
          this.testScripts.delete(listenerID);
        }
      }
    }
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
      const instance = new DataSource(datasource);

      const handle = await instance.subscribe(
        listener.listenerConfig,
        async (rawEvent) => {
          // Emit a test event for live UI debugging
          try {
            const { socketIO } = require('../../../config/socket.io');
            const { ListenerTransformerVm } = require('./listenerTransformerVm');

            // Find all active socket sessions currently testing this listener
            const sessionMap = this.testScripts.get(listener.listenerID);
            
            // If there's no unsaved session overrides, emit globally using the saved script
            if (!sessionMap || sessionMap.size === 0) {
               let transformedEvent = undefined;
               let transformError = null;

               if (listener.transformScript && listener.transformScript.trim()) {
                 const res = ListenerTransformerVm.execute(listener.transformScript, rawEvent);
                 transformedEvent = res.output;
                 transformError = res.error;
               } else {
                 transformedEvent = rawEvent;
               }

               socketIO.emit('listener_test_event', {
                 listenerID: listener.listenerID,
                 rawEvent,
                 transformedEvent,
                 transformError,
                 timestamp: Date.now(),
               });
            } else {
               // If there are specific sessions testing unsaved scripts, execute and emit for each session
               for (const [sessionID, sessionData] of sessionMap.entries()) {
                 let transformedEvent = undefined;
                 let transformError = null;

                 const script = sessionData.script;
                 // Use session-specific script if available, fallback to saved script
                 const effectiveScript = (script && script.trim()) ? script : listener.transformScript;

                 if (effectiveScript && effectiveScript.trim()) {
                   const res = ListenerTransformerVm.execute(effectiveScript, rawEvent);
                   transformedEvent = res.output;
                   transformError = res.error;
                 } else {
                   transformedEvent = rawEvent;
                 }

                 // Emit only to that specific socket session
                 socketIO.to(sessionID).emit('listener_test_event', {
                   listenerID: listener.listenerID,
                   rawEvent,
                   transformedEvent,
                   transformError,
                   timestamp: Date.now(),
                 });
               }
            }
          } catch (e) {
            // Ignore socket errors
          }

          // Don't process inline — enqueue to the pipeline
          try {
            await addListenerEvent({
              listenerID: listener.listenerID,
              tenantID: listener.tenantID,
              rawEvent,
              transformScript: listener.transformScript,
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
      }).catch(() => {});

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
      }).catch(() => {});
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
    // 1. Connection health checks
    for (const [listenerID, entry] of this.active) {
      if (entry.state !== 'running') continue;

      // Check if the datasource instance reports unhealthy
      if (entry.instance && typeof entry.instance.healthCheck === 'function') {
        entry.instance.healthCheck().catch(err => {
          this._handleDisconnect(listenerID, err);
        });
      }
    }

    // 2. Test script cleanup (3 minutes timeout)
    const TIMEOUT_MS = 3 * 60 * 1000;
    const now = Date.now();
    for (const [listenerID, sessionMap] of this.testScripts.entries()) {
      for (const [sessionID, sessionData] of sessionMap.entries()) {
        if (now - sessionData.lastUpdated > TIMEOUT_MS) {
          sessionMap.delete(sessionID);
        }
      }
      if (sessionMap.size === 0) {
        this.testScripts.delete(listenerID);
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
