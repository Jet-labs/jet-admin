const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
/** @typedef {import('./audit.type').AuditLogEvent} AuditLogEvent */

const logBuffer = [];
let flushTimer = null;
let isFlushing = false; // Prevent multiple concurrent flushes

const BUFFER_SIZE = 50;
const FLUSH_INTERVAL_MS = 5000; // Flush every 5 seconds

const auditService = {};

/**
 *
 * @param {*} param0
 * @param {number} param0.tenantID
 * @param {number} param0.skip
 * @param {number} param0.take
 * @param {string|undefined} param0.dateFrom - ISO date string for start of range (inclusive)
 * @param {string|undefined} param0.dateTo   - ISO date string for end of range (inclusive)
 * @returns
 */
auditService.getAuditLogsByTenantID = async ({ tenantID, skip, take, dateFrom, dateTo }) => {
  try {
    Logger.log("info", {
      message: "auditService:getAuditLogsByTenantID:params",
      params: { tenantID, skip, take },
    });

    const dateFilter =
      dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {};

    const where = { tenantID, ...dateFilter };

    const auditLogs = await prisma.tblAuditLogs.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        tblUsers: {
          select: {
            userID: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tblAPIKeys: {
          select: {
            apiKeyID: true,
            apiKeyTitle: true,
            apiKeyPrefix: true,
          },
        },
      },
    });
    const auditLogsCount = await prisma.tblAuditLogs.count({ where });

    Logger.log("info", {
      message: "auditService:getAuditLogsByTenantID:auditLogs",
      auditLogs,
      auditLogsCount,
    });

    return { auditLogs, auditLogsCount };
  } catch (error) {
    Logger.log("error", {
      message: "auditService:getAuditLogsByTenantID:catch-1",
      params: { error },
    });
    throw error;
  }
};

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

/** Escape a value for CSV – wraps in quotes when needed. */
const _csvCell = (val) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Fetches ALL audit logs matching the filter (no pagination) and returns
 * a CSV-formatted string ready to be streamed to the client.
 *
 * @param {object} param0
 * @param {number}          param0.tenantID
 * @param {string|undefined} param0.dateFrom - ISO date string (inclusive start)
 * @param {string|undefined} param0.dateTo   - ISO date string (inclusive end)
 * @returns {Promise<string>} CSV string
 */
auditService.exportAuditLogsCSV = async ({ tenantID, dateFrom, dateTo }) => {
  try {
    Logger.log("info", {
      message: "auditService:exportAuditLogsCSV:params",
      params: { tenantID, dateFrom, dateTo },
    });

    const dateFilter =
      dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {};

    const rows = await prisma.tblAuditLogs.findMany({
      where: { tenantID: parseInt(tenantID), ...dateFilter },
      orderBy: { createdAt: "desc" },
      include: {
        tblUsers: {
          select: { userID: true, firstName: true, lastName: true, email: true },
        },
        tblAPIKeys: {
          select: { apiKeyID: true, apiKeyTitle: true, apiKeyPrefix: true },
        },
      },
    });

    const headers = [
      "Log ID",
      "User",
      "Email",
      "API Key",
      "Type",
      "Sub Type",
      "Success",
      "Created At",
    ];

    const csvLines = [
      headers.join(","),
      ...rows.map((r) => {
        const name = r.tblUsers
          ? [r.tblUsers.firstName, r.tblUsers.lastName].filter(Boolean).join(" ")
          : "";
        const email = r.tblUsers?.email ?? "";
        const apiKey =
          r.tblAPIKeys?.apiKeyTitle ||
          r.tblAPIKeys?.apiKeyPrefix ||
          "";
        return [
          _csvCell(r.auditLogID),
          _csvCell(name),
          _csvCell(email),
          _csvCell(apiKey),
          _csvCell(r.type),
          _csvCell(r.subType),
          _csvCell(r.success),
          _csvCell(r.createdAt ? r.createdAt.toISOString() : ""),
        ].join(",");
      }),
    ];

    return csvLines.join("\n");
  } catch (error) {
    Logger.log("error", {
      message: "auditService:exportAuditLogsCSV:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 * @param {AuditLogEvent} event - The audit log event to buffer.
 */
auditService.log = (event) => {
  if (
    !event ||
    typeof event.type !== "string" ||
    typeof event.success !== "boolean"
  ) {
    Logger.log("error", {
      message: "auditService:log:invalidEvent",
      params: { event },
    });
    return;
  }
  logBuffer.push(event);
  Logger.log("info", {
    message: "auditService:log:addedToBuffer",
    params: { logBufferLength: logBuffer.length },
  });
  if (logBuffer.length >= BUFFER_SIZE) {
    setImmediate(auditService.flushBuffer);
  }
};

/**
 * @returns {Promise<void>}
 */
auditService.flushBuffer = async () => {
  if (isFlushing || logBuffer.length === 0) {
    return; // Already flushing or nothing to flush
  }

  isFlushing = true;
  // Take all logs from the buffer atomically
  const logsToWrite = logBuffer.splice(0, logBuffer.length);

  try {
    // Map buffered events structure to Prisma tblAuditLogs model structure
    const dataToCreate = logsToWrite.map((log) => ({
      // auditLogID is auto-generated by the database
      userID: log.userID || null, // Use null for optional fields if undefined
      tenantID: log.tenantID || null, // Use null for optional fields if undefined
      apiKeyID: log.apiKeyID || null, // FK to tblAPIKeys – which API key was used
      type: log.type,
      subType: log.subType || null, // Use null for optional fields if undefined
      success: log.success,
      // createdAt defaults to now() in Prisma, unless provided in log.createdAt
      // If you want to use the event's timestamp, uncomment the line below and adjust Prisma schema:
      // createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
      metadata: log.metadata || null, // Use null for optional fields if undefined
      error: log.error || null, // Use null for optional fields if undefined
    }));

    if (dataToCreate.length > 0) {
      await prisma.tblAuditLogs.createMany({
        data: dataToCreate,
        skipDuplicates: true, // Optional: depending on your needs
      });
    }
  } catch (error) {
    Logger.log("error", {
      message: "auditService:flushBuffer:catch-1",
      params: { error },
    });
  } finally {
    isFlushing = false;
  }
};

/**
 * Starts the background timer for flushing the buffer periodically.
 */
auditService.startFlusher = () => {
  if (flushTimer === null) {
    flushTimer = setInterval(() => {
      // Use setImmediate to ensure the timer callback doesn't block the main loop
      // if the flush operation takes some time.
      setImmediate(auditService.flushBuffer);
    }, FLUSH_INTERVAL_MS);
    Logger.log("info", {
      message: "auditService:startFlusher:started",
      params: { FLUSH_INTERVAL_MS, BUFFER_SIZE },
    });
  }
};

/**
 * @returns {Promise<void>}
 */
auditService.stopFlusher = async () => {
  if (flushTimer !== null) {
    clearInterval(flushTimer);
    flushTimer = null;
    Logger.log("info", {
      message: "auditService:stopFlusher:stopped",
    });
  }
  // Attempt one last flush for any remaining logs in the buffer
  await auditService.flushBuffer();
  Logger.log("info", {
    message: "auditService:stopFlusher:finalFlushComplete",
  });
};

module.exports = {
  auditService,
};
