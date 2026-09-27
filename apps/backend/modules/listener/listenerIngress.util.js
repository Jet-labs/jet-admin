/**
 * Listener Ingress Info
 * Computes the PUBLIC ingress addresses users must point their external
 * connectors at (and allowlist in their firewalls).
 *
 * Why this exists: webhook traffic must reach the standalone
 * listener-proxy — never the backend API and never the frontend host.
 * The UI used to guess `window.location.hostname:8095`, which is wrong in
 * every real deployment (separate DNS/port for the proxy). Single source
 * of truth is `LISTENER_PROXY_PUBLIC_URL`; dev falls back to localhost +
 * the proxy port.
 */

const environment = require('../../environment');

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

/**
 * Canonical public base URL of the listener-proxy ingress
 * (no trailing slash), e.g. `https://hooks.example.com`.
 */
function getIngressBaseUrl() {
  const configured = stripTrailingSlash(environment.LISTENER_PROXY_PUBLIC_URL);
  if (configured) return configured;
  const port = Number(environment.LISTENER_PROXY_PORT || 8095);
  return `http://localhost:${port}`;
}

/**
 * Exact webhook URLs a third-party connector must call for one listener.
 * Mirrors the routes in @jet-admin/datasources-logic webhook router:
 *   /webhooks/v1/inbound/:tenantID/:pathSuffix  (preferred, when configured)
 *   /webhooks/v1/inbound/:listenerID            (always works)
 */
function getListenerWebhookUrls({ tenantID, listenerID, pathSuffix }) {
  const baseUrl = getIngressBaseUrl();
  const urls = [];
  const suffix = String(pathSuffix || '').replace(/^\//, '');
  if (tenantID && suffix) {
    urls.push({
      label: 'Custom Path Suffix Endpoint URL',
      url: `${baseUrl}/webhooks/v1/inbound/${tenantID}/${suffix}`,
      description: 'Use this URL in third-party webhooks (Stripe, GitHub, Shopify)',
    });
  }
  if (listenerID) {
    urls.push({
      label: 'Direct Listener ID Endpoint URL (Fallback)',
      url: `${baseUrl}/webhooks/v1/inbound/${listenerID}`,
      description: 'Direct reference by unique listener UUID',
    });
  }
  return urls;
}

/**
 * Ingress block attached to listener API responses. `webhookUrls` is only
 * present for webhook listeners; every listener carries the base + health
 * URL so the UI can always show what to allowlist and how to verify it.
 */
function getListenerIngressInfo(listener) {
  const baseUrl = getIngressBaseUrl();
  const info = {
    mode: 'proxy',
    baseUrl,
    healthUrl: `${baseUrl}/health`,
  };
  if (listener && listener.listenerType === 'webhook') {
    info.webhookUrls = getListenerWebhookUrls({
      tenantID: listener.tenantID,
      listenerID: listener.listenerID,
      pathSuffix: listener.listenerConfig && listener.listenerConfig.pathSuffix,
    });
  }
  return info;
}

module.exports = {
  getIngressBaseUrl,
  getListenerWebhookUrls,
  getListenerIngressInfo,
};
