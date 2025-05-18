/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { AuditLog } from "../models/auditLog";

export const getAuditLogsAPI = async ({ tenantID, page, pageSize }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.AUDIT_LOG.getAuditLogsAPI(tenantID, page, pageSize);
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
