// audit.middleware.js

const { auditService } = require("./audit.service"); // Adjust path as needed

/** @typedef {import('./audit.type').AuditLogEvent} AuditLogEvent */

// Helper to safely get JSON payload (request or response body)
// Handles truncation and basic filtering
function safeGetPayload(payload) {
  if (payload === undefined || payload === null) {
    return undefined;
  }

  try {
    const payloadString =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    // Define max size to log to prevent excessive database usage
    const MAX_PAYLOAD_SIZE = 2000; // Adjust as needed

    if (payloadString.length > MAX_PAYLOAD_SIZE) {
      return {
        _truncated: payloadString.substring(0, MAX_PAYLOAD_SIZE) + "...",
      };
    }

    // TODO: Implement more sophisticated filtering for sensitive keys
    // Example:
    // if (typeof payload === 'object' && payload !== null) {
    //     const filteredPayload = { ...payload };
    //     const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token']; // Add keys here
    //     sensitiveKeys.forEach(key => {
    //         if (filteredPayload.hasOwnProperty(key)) {
    //             filteredPayload[key] = '[FILTERED]';
    //         }
    //     });
    //     return filteredPayload;
    // }

    // Attempt to parse JSON string back to object for consistent logging
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (e) {
        // If not valid JSON, return the string (truncated if needed)
        return payloadString;
      }
    }

    return payload; // Return object directly if it wasn't a string
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
  if (req.method === "OPTIONS" || req.method === "GET") return next();
  const startTime = Date.now();

  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  // Variable to hold the captured response body
  let capturedResponseBody = undefined;

  // Helper function to capture the body
  const captureBody = (body) => {
    if (body !== undefined) {
      // Store the body - will be processed by safeGetPayload later
      capturedResponseBody = body;
    }
  };

  // Monkey patch res.send
  res.send = function (body) {
    captureBody(body);
    // Use .apply to pass 'this' context and arguments correctly
    return originalSend.apply(this, arguments);
  };

  // Monkey patch res.json
  res.json = function (body) {
    captureBody(body);
    // Use .apply to pass 'this' context and arguments correctly
    return originalJson.apply(this, arguments);
  };

  // Monkey patch res.end
  res.end = function (chunk, encoding, cb) {
    if (chunk) {
      // Attempt to capture chunk if it exists
      // For complex streaming this might only get the last chunk
      captureBody(chunk);
    }
    // Ensure the finish event still fires by calling the original
    // Use .apply to pass 'this' context and arguments correctly
    return originalEnd.apply(this, arguments);
  };

  // Capture request details BEFORE the route handler
  const requestDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip, // Consider using 'x-forwarded-for' if behind a proxy
    headers: { ...req.headers }, // Clone headers (be mindful of size/sensitive data)
    body: safeGetPayload(req.body), // Capture request body if parsed
    // Assuming user and tenant IDs are attached to req by auth middleware
    // userId: req.user?.id,
    // tenantId: req.user?.tenantId,
  };

  // We need to log AFTER the response is finished
  res.on("finish", () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseDetails = {
      statusCode: res.statusCode,
      // Process the captured body here
      body: safeGetPayload(capturedResponseBody),
      headers: res.getHeaders(), // Capture response headers
    };

    /** @type {AuditLogEvent} */
    const logEvent = {
      type: "API_REQUEST",
      subType: req.method, // Use HTTP method as subType
      userID: req.user?.userID ? parseInt(req.user.userID) : null, // Add user ID if available
      tenantID: req?.params?.tenantID ? parseInt(req.params.tenantID) : null, // Add tenant ID if available
      success: res.statusCode >= 200 && res.statusCode < 400, // Consider 4xx as not necessarily failure? Depends on policy.
      metadata: {
        // Map details to metadata field
        request: requestDetails,
        response: responseDetails,
        durationMs: duration,
      },
      error:
        res.statusCode >= 400
          ? { status: res.statusCode /* maybe error message if captured */ }
          : undefined,
      // createdAt is set by default in Prisma
    };

    // Use setImmediate to push the log to the buffer asynchronously
    setImmediate(() => {
      auditService.log(logEvent);
    });
  });

  // Continue to the next middleware/route handler
  next();
};

module.exports = {
  auditLogMiddleware,
};
