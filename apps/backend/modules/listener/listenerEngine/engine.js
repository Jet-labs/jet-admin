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
const environment = require('../../../environment');


const MAX_RETRIES = 10;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;
const HEALTH_CHECK_INTERVAL_MS = 30000;

class ListenerEngine {
  constructor() {
    this.active = new Map();  // listenerID → { handle, instance, listener, state, retryCount, retryTimer }
    this.starting = new Set(); // listener IDs currently inside subscribe()
    this.generations = new Map(); // invalidates pending subscribe/reload callbacks
    this.healthCheckTimer = null;
    this.eventPublisherFactory = null;
  }

  setEventPublisherFactory(factory) {
    if (factory !== null && typeof factory !== 'function') throw new Error('An event publisher factory must be a function');
    this.eventPublisherFactory = factory;
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

      // Note: the shared webhook ingress is now served by the main Express app
      // (mounted at /webhooks in index.js) — no separate HTTP server needed.

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

    // Don't double-start. `starting` closes the race where two concurrent
    // syncSubscriptions calls both pass the active-check before subscribe()
    // resolves.
    if (this.active.has(listenerID) || this.starting.has(listenerID)) {
      Logger.log('warning', {
        message: 'ListenerEngine:startOne:alreadyActive',
        params: { listenerID, starting: this.starting.has(listenerID) },
      });
      return;
    }
    this.starting.add(listenerID);
    const generation = { listener };
    this.generations.set(listenerID, generation);
    const isCurrent = () => this.generations.get(listenerID) === generation;

    try {
      const publishEvent = this.eventPublisherFactory ? await this.eventPublisherFactory(listener) : addListenerEvent;
      if (!isCurrent()) return;
      const datasource = listener.tblDatasources;
      if (!datasource) {
        throw new Error(`Missing datasource for listener ${listenerID}`);
      }

      // tblDatasources.datasourceOptions is stored encrypted (see encryptOptions
      // in datasource.service). The query path decrypts in defaultDatasourceFetcher
      // (authorizedProxy); the listener path must do the same — otherwise every
      // subscribe() only sees the { __encrypted, iv, data, authTag } envelope and
      // fails with "endpoint/host is required".
      const datasourceForEngine = {
        ...datasource,
        datasourceOptions: decryptDatasourceOptions(datasource.datasourceOptions),
      };

      const DataSource = dataSourceRegistry.getDataSource(datasourceForEngine.datasourceType);
      const instance = new DataSource(datasourceForEngine, {
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
        { ...listener.listenerConfig, listenerID: listener.listenerID, tenantID: listener.tenantID },
        async (rawEvent) => {
          if (!isCurrent()) throw new Error('Listener subscription is no longer current');
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
            await publishEvent({
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
            throw enqueueErr; // webhook must not acknowledge an event we lost
          }
        }
      );

      if (!isCurrent()) {
        await instance.unsubscribe(handle);
        return;
      }

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
        data: { lastError: null },
      }).catch((dbErr) => Logger.log('warning', {
        message: 'ListenerEngine:startOne:dbStatusUpdateFailed',
        params: { listenerID, error: dbErr.message },
      }));

      Logger.log('success', {
        message: 'ListenerEngine:startOne:success',
        params: { listenerID, type: listener.listenerType },
      });

    } catch (error) {
      if (!isCurrent()) return;
      Logger.log('error', {
        message: 'ListenerEngine:startOne:error',
        params: { listenerID, error: error.message },
      });

      // Record observation without changing the user's activation intent.
      await prisma.tblListeners.update({
        where: { listenerID },
        data: { lastError: error.message },
      }).catch((dbErr) => Logger.log('warning', {
        message: 'ListenerEngine:startOne:dbErrorStatusUpdateFailed',
        params: { listenerID, error: dbErr.message },
      }));
    } finally {
      if (isCurrent()) {
        this.starting.delete(listenerID);
        if (!this.active.has(listenerID)) this.generations.delete(listenerID);
      }
    }
  }

  // ─── Stop a single listener ─────────────────────────────────────────────────

  async stopOne(listenerID) {
    this.generations.delete(listenerID);
    this.starting.delete(listenerID);
    const entry = this.active.get(listenerID);
    if (!entry) return;
    // Remove synchronously: slow cleanup must not delete a newer subscription.
    this.active.delete(listenerID);

    try {
      // Clear any pending retry
      if (entry.retryTimer) {
        clearTimeout(entry.retryTimer);
      }

      // Unsubscribe via datasource
      if (entry.instance && typeof entry.instance.unsubscribe === 'function') {
        await entry.instance.unsubscribe(entry.handle);
      }


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
    }
  }

  // ─── Restart (hot reload on CRUD) ───────────────────────────────────────────

  async restartOne(listenerID) {
    const stopping = this.stopOne(listenerID);
    const generation = {};
    this.generations.set(listenerID, generation);
    await stopping;

    try {
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

      if (this.generations.get(listenerID) === generation && listener && listener.status === 'active') {
        await this.startOne(listener);
      }
    } finally {
      if (this.generations.get(listenerID) === generation) this.generations.delete(listenerID);
    }
  }

  // ─── Stop all (graceful shutdown) ───────────────────────────────────────────

  async stopAll() {
    Logger.log('info', { message: 'ListenerEngine:stopAll:init' });

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Note: webhook ingress is served by the main Express app — nothing to stop here.

    const ids = [...new Set([...this.active.keys(), ...this.starting, ...this.generations.keys()])];
    for (const listenerID of ids) {
      await this.stopOne(listenerID);
    }

    Logger.log('success', { message: 'ListenerEngine:stopAll:done' });
  }

  // ─── Reconnection (fault tolerance) ─────────────────────────────────────────


  async _handleDisconnect(listenerID, error) {
    const entry = this.active.get(listenerID);
    if (!entry) return;
    if (entry.retryTimer || entry.state === 'error') return;

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
      entry.retryTimer = null;
      if (this.active.get(listenerID) !== entry) return;
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
      // Plugin-owned recovery (MQTT/SSE/NATS/WebSocket) must not be raced by
      // an engine restart loop; only the plugin decides when it is dead.
      if (entry.instance?.recoveryMode === 'plugin') continue;

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
    for (const listenerID of this.starting) {
      const listener = this.generations.get(listenerID)?.listener;
      statuses[listenerID] = { state: 'connecting', type: listener?.listenerType, retryCount: 0, title: listener?.listenerTitle };
    }
    for (const [listenerID, entry] of this.active) {
      const transport = typeof entry.instance?.getConnectionState === 'function'
        ? entry.instance.getConnectionState()
        : undefined;
      statuses[listenerID] = {
        state: entry.state,
        type: entry.listener.listenerType,
        retryCount: entry.retryCount,
        title: entry.listener.listenerTitle,
        ...(transport ? { transport } : {}),
      };
    }
    return statuses;
  }
}

// Singleton
const listenerEngine = new ListenerEngine();

/**
 * Decrypt a stored datasourceOptions value.
 * Plain (never-encrypted) objects pass through untouched; the
 * { __encrypted, iv, data, authTag } envelope is decrypted via the
 * vault encryption key. Throws on undecryptable envelopes so the
 * listener lands in `error` status with a clear message instead of
 * failing later with "endpoint/host is required".
 */
function decryptDatasourceOptions(options) {
  if (!options || typeof options !== 'object' || !options.__encrypted) {
    return options || {};
  }
  try {
    const { decrypt } = require('../../../utils/encryption.util');
    return JSON.parse(
      decrypt({ iv: options.iv, data: options.data, authTag: options.authTag })
    );
  } catch (err) {
    Logger.log('error', {
      message: 'ListenerEngine:decryptOptions:failed',
      params: { error: err.message },
    });
    throw new Error(`Unable to decrypt datasource options: ${err.message}`);
  }
}

module.exports = { listenerEngine };
