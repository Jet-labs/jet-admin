// audit.middleware.js

const { auditService } = require("./audit.service");

/** @typedef {import('./audit.type').AuditLogEvent} AuditLogEvent */

const SENSITIVE_PAYLOAD_KEYS = [
  "apikey", "api_key", "apikeyhash",
  "token", "bearertoken", "accesstoken", "refreshtoken",
  "password", "secret", "authorization",
];

function redactPayload(payload, depth = 0) {
  if (payload === undefined || payload === null) return payload;
  if (typeof payload !== "object") return payload;
  if (depth > 10) return "[REDACTED: max depth]";

  if (Array.isArray(payload)) {
    return payload.map((item) => redactPayload(item, depth + 1));
  }

  const redacted = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_PAYLOAD_KEYS.includes(key.toLowerCase())) {
      redacted[key] = "[FILTERED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactPayload(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function safeGetPayload(payload) {
  if (payload === undefined || payload === null) {
    return undefined;
  }

  try {
    let processedPayload = payload;
    if (typeof payload === "string") {
      try {
        processedPayload = JSON.parse(payload);
      } catch (e) {
        processedPayload = payload;
      }
    }

    const filteredPayload = redactPayload(processedPayload);

    const payloadString = typeof filteredPayload === "string"
      ? filteredPayload
      : JSON.stringify(filteredPayload);

    const MAX_PAYLOAD_SIZE = 2000;

    if (payloadString.length > MAX_PAYLOAD_SIZE) {
      return {
        _truncated: payloadString.substring(0, MAX_PAYLOAD_SIZE) + "...",
      };
    }

    return filteredPayload;
  } catch (error) {
    console.error("Error processing payload for logging:", error);
    return { _error: "Failed to process payload" };
  }
}

const auditLogMiddleware = {};

/**
 * Express middleware to capture API request and response details for audit logging.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
auditLogMiddleware.audit = (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  const startTime = Date.now();

  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  let capturedResponseBody = undefined;

  const captureBody = (body) => {
    if (body !== undefined) {
      capturedResponseBody = body;
    }
  };

  res.send = function (body) {
    captureBody(body);
    return originalSend.apply(this, arguments);
  };

  res.json = function (body) {
    captureBody(body);
    return originalJson.apply(this, arguments);
  };

  res.end = function (chunk, encoding, cb) {
    if (chunk) {
      captureBody(chunk);
    }
    return originalEnd.apply(this, arguments);
  };

  const requestHeaders = { ...req.headers };
  delete requestHeaders.authorization;

  const requestDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: requestHeaders,
    body: safeGetPayload(req.body),
  };

  res.on("finish", () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseDetails = {
      statusCode: res.statusCode,
      body: safeGetPayload(capturedResponseBody),
      headers: res.getHeaders(),
    };

    /** @type {AuditLogEvent} */
    const logEvent = {
      type: "API_REQUEST",
      subType: req.method,
      userID: req.user?.userID ? req.user.userID : null,
      tenantID: req?.params?.tenantID ? req.params.tenantID : null,
      success: res.statusCode >= 200 && res.statusCode < 400,
      metadata: {
        request: requestDetails,
        response: responseDetails,
        durationMs: duration,
        authType: req.authContext?.authType || "USER",
        apiKeyID: req.authContext?.apiKey?.apiKeyID || null,
        apiKeyTitle: req.authContext?.apiKey?.apiKeyTitle || null,
      },
      error:
        res.statusCode >= 400
          ? { status: res.statusCode }
          : undefined,
    };

    setImmediate(() => {
      auditService.log(logEvent);
    });
  });

  next();
};

module.exports = {
  auditLogMiddleware,
};
