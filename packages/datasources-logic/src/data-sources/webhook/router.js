/**
 * WebhookRouter — Shared Route Registry (Singleton)
 *
 * All active webhook listeners register/deregister their inbound HTTP handler here.
 * The ListenerEngine starts a single http.Server backed by this router's Express app
 * and tears it down on shutdown.
 *
 * NOTE: this app is mounted at /webhooks by the backend (index.js), so the
 * routes below are relative to that mount point. Full public paths:
 *   1. tenantID + pathSuffix  → /webhooks/v1/inbound/:tenantID/:pathSuffix
 *   2. listenerID             → /webhooks/v1/inbound/:listenerID
 * (Defining the /webhooks prefix here as well would double it to
 * /webhooks/webhooks/... and every inbound call would 404.)
 *
 * Each registered handler is a plain function:  (req, res) => void
 * The handler is responsible for auth validation, calling onEvent(), and responding.
 */

import express from "express";

class WebhookRouter {
  constructor() {
    /** @type {Map<string, Function>} routeKey → handler(req, res) */
    this._handlers = new Map();

    this._app = express();
    this._app.use(express.json({ limit: "10mb" }));
    this._app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    this._app.use(express.raw({ type: "*/*", limit: "10mb" }));

    this._app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        service: "webhook-receiver",
        activeListeners: this._handlers.size,
        timestamp: new Date(),
      });
    });

    // Route: tenantID + pathSuffix (relative to the /webhooks mount point)
    this._app.all("/v1/inbound/:tenantID/:pathSuffix", (req, res) => {
      const { tenantID, pathSuffix } = req.params;
      const key = `tenant:${tenantID}:${pathSuffix.replace(/^\//, "")}`;
      const handler = this._handlers.get(key);
      if (handler) {
        handler(req, res);
      } else {
        res.status(404).json({ success: false, error: "Webhook listener not found or inactive." });
      }
    });

    // Route: bare listenerID (relative to the /webhooks mount point)
    this._app.all("/v1/inbound/:listenerID", (req, res) => {
      const { listenerID } = req.params;
      const key = `id:${listenerID}`;
      const handler = this._handlers.get(key);
      if (handler) {
        handler(req, res);
      } else {
        res.status(404).json({ success: false, error: "Webhook listener not found or inactive." });
      }
    });
  }

  /**
   * Register a webhook listener's request handler.
   * @param {string} routeKey  - Opaque key returned by WebhookDataSource.subscribe()
   * @param {Function} handler - (req, res) => void
   */
  register(routeKey, handler) {
    this._handlers.set(routeKey, handler);
  }

  /**
   * Remove a webhook listener's request handler.
   * @param {string} routeKey
   */
  deregister(routeKey) {
    this._handlers.delete(routeKey);
  }

  /**
   * The underlying Express application — passed to http.createServer() by the engine.
   */
  getApp() {
    return this._app;
  }

  /**
   * Number of currently registered listeners.
   */
  get size() {
    return this._handlers.size;
  }
}

// Singleton — shared across all WebhookDataSource instances in the same process
export const webhookRouter = new WebhookRouter();
