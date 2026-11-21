import DataSource from "../datasource.js";
import { Logger } from "../../utils/logger.js";
import { webhookRouter } from "./router.js";
import { normalizeAllowedMethods } from "./methods.js";

export default class WebhookDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("Webhook is a listener-only datasource.");
  }

  /**
   * Register this listener's inbound route on the shared WebhookRouter.
   *
   * Route keys (in priority order):
   *   tenant:<tenantID>:<pathSuffix>  — if listenerConfig.pathSuffix is set
   *   id:<listenerID>                 — always registered as fallback
   *
   * @param {object} listenerConfig  - listener-level config (pathSuffix, allowedMethods, authType, …)
   * @param {Function} onEvent       - callback(rawEvent) invoked by the engine
   * @returns {{ routeKeys: string[] }} handle passed to unsubscribe()
   */
  async subscribe(listenerConfig, onEvent) {
    const dsOptions = this.config?.datasourceOptions || {};
    const mergedOptions = { ...dsOptions, ...listenerConfig };

    const listenerID = listenerConfig?.listenerID || this.config?.datasourceID;
    const tenantID = listenerConfig?.tenantID;
    const pathSuffix = listenerConfig?.pathSuffix?.replace(/^\//, "");

    const routeKeys = [];

    // Build the route handler — shared between both keys
    const handler = (req, res) => this._handleRequest(req, res, mergedOptions, listenerID, onEvent);

    // Key 1: tenantID + pathSuffix (preferred, human-readable URL)
    if (tenantID && pathSuffix) {
      const key = `tenant:${tenantID}:${pathSuffix}`;
      webhookRouter.register(key, handler);
      routeKeys.push(key);
    }

    // Key 2: bare listenerID (fallback)
    if (listenerID) {
      const key = `id:${listenerID}`;
      webhookRouter.register(key, handler);
      routeKeys.push(key);
    }

    Logger.log("info", {
      message: "webhook:subscribe:registered",
      params: { listenerID, routeKeys },
    });

    return { routeKeys };
  }

  /**
   * Deregister this listener's routes from the shared WebhookRouter.
   * @param {{ routeKeys: string[] }} handle
   */
  async unsubscribe(handle) {
    if (!handle?.routeKeys) return;

    for (const key of handle.routeKeys) {
      webhookRouter.deregister(key);
    }

    Logger.log("info", {
      message: "webhook:unsubscribe",
      params: { datasourceID: this.config?.datasourceID, routeKeys: handle.routeKeys },
    });
  }

  // ─── Internal request handler ────────────────────────────────────────────────

  async _handleRequest(req, res, options, listenerID, onEvent) {
    const requestMethod = req.method.toUpperCase();

    try {
      // 1. Validate HTTP method. The API has historically accepted both a
      // string ("POST") and an array (["POST"]); normalize either shape so a
      // saved array does not throw inside the request handler.
      const allowedMethods = normalizeAllowedMethods(options.allowedMethods);
      if (!allowedMethods.includes("ANY") && !allowedMethods.includes(requestMethod)) {
        Logger.log("warning", {
          message: "webhook:methodNotAllowed",
          params: { listenerID, requestMethod, allowedMethods },
        });
        return res.status(405).json({
          success: false,
          error: `Method '${requestMethod}' not allowed. Configured allowed methods: '${allowedMethods.join(", ")}'.`,
        });
      }

      // 2. Validate authentication
      const authType = options.authType || "none";

      if (authType === "basic") {
        const authHeader = req.headers["authorization"] || "";
        if (!authHeader.startsWith("Basic ")) {
          res.setHeader("WWW-Authenticate", 'Basic realm="Webhook"');
          return res.status(401).json({ success: false, error: "Missing Basic Authentication header." });
        }
        const [incomingUsername, incomingPassword] = Buffer.from(authHeader.split(" ")[1], "base64")
          .toString("utf-8")
          .split(":");
        if (incomingUsername !== (options.username || "") || incomingPassword !== (options.password || "")) {
          return res.status(401).json({ success: false, error: "Invalid Basic Auth username or password." });
        }

      } else if (authType === "bearer") {
        const authHeader = req.headers["authorization"] || "";
        if (!authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ success: false, error: "Missing Bearer Authentication token." });
        }
        if (authHeader.split(" ")[1] !== (options.bearerToken || "")) {
          return res.status(401).json({ success: false, error: "Invalid Bearer token." });
        }

      } else if (authType === "header") {
        const headerName = (options.authHeaderName || "x-api-key").toLowerCase();
        if (!req.headers[headerName] || req.headers[headerName] !== (options.authSecret || "")) {
          return res.status(401).json({ success: false, error: `Invalid or missing '${headerName}' header.` });
        }

      } else if (authType === "query_param") {
        const paramName = options.authHeaderName || "api_key";
        if (!req.query[paramName] || req.query[paramName] !== (options.authSecret || "")) {
          return res.status(401).json({ success: false, error: `Invalid or missing '${paramName}' query parameter.` });
        }
      }

      // 3. Construct raw event and fire onEvent (engine handles queue + socket streaming)
      const rawEvent = {
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        url: req.originalUrl,
        params: req.params,
        timestamp: new Date().toISOString(),
      };

      // A successful HTTP response means durable acceptance, not merely that
      // an asynchronous enqueue was started. Senders can retry a 503.
      await onEvent(rawEvent);

      // 4. Send configured response
      const responseStatus = options.responseStatusCode || 200;
      let responseBody = options.responseBody;

      if (!responseBody) {
        responseBody = { success: true, message: "Webhook event received successfully.", listenerID };
      } else if (typeof responseBody === "string") {
        try {
          responseBody = JSON.parse(responseBody);
        } catch {
          res.setHeader("Content-Type", "text/plain");
          return res.status(responseStatus).send(responseBody);
        }
      }

      return res.status(responseStatus).json(responseBody);

    } catch (error) {
      Logger.log("error", {
        message: "webhook:handleRequest:error",
        params: { listenerID, error: error.message },
      });
      return res.status(503).json({ success: false, error: "Webhook could not be accepted. Please retry." });
    }
  }
}
