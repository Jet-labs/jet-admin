/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { AuditLog } from "../models/auditLog";

export const getAuditLogsAPI = async ({ tenantID, page, pageSize, dateFrom, dateTo }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.AUDIT_LOG.getAuditLogsAPI(tenantID, page, pageSize, dateFrom, dateTo);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return {
          auditLogs: AuditLog.toList(response.data.auditLogs),
          nextPage: response.data.nextPage,
          auditLogsCount: response.data.auditLogsCount,
        };
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Triggers a server-side CSV export download for ALL audit logs matching the
 * given date range. The server generates the CSV and streams it back; the
 * browser saves it as a file without exposing the bearer token in the URL.
 *
 * @param {{ tenantID: number, dateFrom?: string, dateTo?: string }} param0
 */
export const exportAuditLogsCSVAPI = async ({ tenantID, dateFrom, dateTo }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.AUDIT_LOG.exportAuditLogsAPI(tenantID, dateFrom, dateTo);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;

    const response = await axios.get(url, {
      headers: { authorization: `Bearer ${bearerToken}` },
      responseType: "blob",
    });

    // Derive filename from Content-Disposition header or generate a fallback
    const disposition = response.headers["content-disposition"] ?? "";
    const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const filename = filenameMatch
      ? filenameMatch[1]
      : `audit-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;

    const blobUrl = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw error;
  }
};
