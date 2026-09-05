/**
 * Temporal Client Singleton
 * Manages gRPC connection to Temporal server.
 * Supports local dev (plaintext localhost:7233), TLS/mTLS for cloud/prod via env.
 *
 * Env overrides:
 *   TEMPORAL_ADDRESS   — default localhost:7233
 *   TEMPORAL_NAMESPACE — default 'default'
 *   TEMPORAL_API_KEY   — Cloud API key (if present, uses TLS)
 *   TEMPORAL_TLS_CERT / TEMPORAL_TLS_KEY — mTLS (optional)
 */
const { ADDRESS, NAMESPACE } = require('./config');
const Logger = require('../../../utils/logger');

let _client = null;
let _connection = null;

/**
 * Lazy-init Temporal Connection (gRPC).
 * Injects TLS if env indicates cloud/prod.
 */
async function getTemporalConnection() {
  if (_connection) return _connection;

  // Dynamic import to avoid hard crash when SDK not installed (native mode)
  let Connection;
  try {
    ({ Connection } = require('@temporalio/client'));
  } catch (e) {
    throw new Error(
      '@temporalio/client not installed. Run `npm install @temporalio/client @temporalio/worker @temporalio/workflow @temporalio/activity` in apps/backend'
    );
  }

  const opts = { address: ADDRESS };

  // TLS for Temporal Cloud / secured cluster
  const hasTLS =
    !!process.env.TEMPORAL_TLS_CERT ||
    !!process.env.TEMPORAL_API_KEY ||
    process.env.TEMPORAL_TLS === 'true';

  if (hasTLS) {
    const fs = require('fs');
    const tls = {};
    if (process.env.TEMPORAL_TLS_CERT) {
      tls.clientCertPair = {
        crt: fs.readFileSync(process.env.TEMPORAL_TLS_CERT),
        key: fs.readFileSync(process.env.TEMPORAL_TLS_KEY),
      };
    }
    // API key auth (Cloud)
    if (process.env.TEMPORAL_API_KEY) {
      opts.apiKey = process.env.TEMPORAL_API_KEY;
      tls.serverNameOverride = process.env.TEMPORAL_TLS_SERVER_NAME;
      tls.serverRootCACertificate = process.env.TEMPORAL_TLS_CA
        ? fs.readFileSync(process.env.TEMPORAL_TLS_CA)
        : undefined;
    }
    opts.tls = tls;
  }

  Logger.log('info', {
    message: 'temporal:getConnection:connecting',
    params: { address: ADDRESS, namespace: NAMESPACE, hasTLS },
  });

  _connection = await Connection.connect(opts);

  Logger.log('success', { message: 'temporal:connection:established', params: { address: ADDRESS } });

  return _connection;
}

/**
 * Get singleton Temporal Client.
 * @returns {Promise<import('@temporalio/client').Client>}
 */
async function getTemporalClient() {
  if (_client) return _client;

  const connection = await getTemporalConnection();
  const { Client } = require('@temporalio/client');

  _client = new Client({
    connection,
    namespace: NAMESPACE,
  });

  return _client;
}

/**
 * Close connection (used in shutdown).
 */
async function closeTemporalClient() {
  try {
    if (_connection) {
      await _connection.close();
    }
  } catch (_) {
    // ignore
  } finally {
    _client = null;
    _connection = null;
  }
}

/**
 * Health check — lightweight describeNamespace.
 */
async function isTemporalHealthy() {
  try {
    const client = await getTemporalClient();
    // list via connection — cheap check
    await client.workflowService.getSystemInfo({});
    return true;
  } catch (e) {
    Logger.log('warning', { message: 'temporal:health:unhealthy', params: { error: e.message } });
    return false;
  }
}

module.exports = {
  getTemporalClient,
  getTemporalConnection,
  closeTemporalClient,
  isTemporalHealthy,
};
